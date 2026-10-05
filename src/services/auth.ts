import { UserAccount, UserRole } from '@/types';
import { StorageService } from './storage';

const AUTH_STORAGE_KEYS = {
  USERS: 'itftms_accounts_list_2026',
  CURRENT_USER: 'itftms_current_authenticated_user_2026',
};

export const DEFAULT_ACCOUNTS: UserAccount[] = [
  {
    id: 'USR-BTC-SUBIN',
    username: 'subin',
    password: '123',
    fullName: 'SU BIN',
    role: 'ORGANIZER',
    email: 'subin@itftms.vn',
    phone: '0908 123 456',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    createdAt: '2026-09-01T08:00:00.000Z',
  },
  {
    id: 'USR-BTC-THANHCONG',
    username: 'thanhcong',
    password: '123',
    fullName: 'Thành Công',
    role: 'ORGANIZER',
    email: 'thanhcong@itftms.vn',
    phone: '0909 654 321',
    avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
    createdAt: '2026-09-01T08:30:00.000Z',
  },
];

export class AuthService {
  private static get isClient(): boolean {
    return typeof window !== 'undefined';
  }

  /**
   * Lấy danh sách toàn bộ tài khoản người dùng và tự động đồng bộ tài khoản BTC
   */
  static getAllUsers(): UserAccount[] {
    if (!this.isClient) return DEFAULT_ACCOUNTS;
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEYS.USERS);
      if (!stored) {
        localStorage.setItem(AUTH_STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_ACCOUNTS));
        return DEFAULT_ACCOUNTS;
      }
      let parsed: UserAccount[] = JSON.parse(stored);

      // Loại bỏ các tài khoản mẫu cũ (admin, btc ThS An, referee, captain, sinhvien) theo yêu cầu người dùng
      const DEMO_USERNAMES = ['btc', 'referee', 'captain', 'admin', 'sinhvien'];
      const DEMO_IDS = ['USR-BTC-01', 'USR-REF-01', 'USR-CAP-01', 'USR-ADM-01', 'USR-STU-01'];
      const filtered = parsed.filter(
        (u) => !DEMO_USERNAMES.includes(u.username.toLowerCase()) && !DEMO_IDS.includes(u.id)
      );

      let hasChanges = filtered.length !== parsed.length;
      parsed = filtered;

      // Đảm bảo 2 tài khoản BTC chính thức luôn có mặt
      for (const def of DEFAULT_ACCOUNTS) {
        const exists = parsed.some(
          (u) =>
            u.username.toLowerCase() === def.username.toLowerCase() ||
            u.id === def.id ||
            u.fullName.toLowerCase() === def.fullName.toLowerCase()
        );
        if (!exists) {
          parsed.unshift(def);
          hasChanges = true;
        }
      }
      if (hasChanges) {
        localStorage.setItem(AUTH_STORAGE_KEYS.USERS, JSON.stringify(parsed));
      }
      return parsed;
    } catch {
      return DEFAULT_ACCOUNTS;
    }
  }

  /**
   * Lưu danh sách tài khoản
   */
  static saveUsers(users: UserAccount[]): void {
    if (!this.isClient) return;
    try {
      localStorage.setItem(AUTH_STORAGE_KEYS.USERS, JSON.stringify(users));
    } catch (e) {
      console.error('Error saving users to localStorage:', e);
    }
  }

  /**
   * Tự động sinh tên đăng nhập chuẩn từ tên viết tắt hoặc ID đội bóng
   */
  static generateCaptainUsername(shortNameOrId: string): string {
    const clean = shortNameOrId
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '');
    return `captain_${clean || 'team'}`;
  }

  /**
   * Tạo hoặc cập nhật tài khoản Đội Trưởng cho một Đội bóng khi BTC tạo đội mới
   */
  static createCaptainAccountForTeam(
    team: { id: string; name: string; shortName: string; captainName?: string; email?: string; phoneNumber?: string },
    customUsername?: string,
    customPassword?: string
  ): UserAccount {
    const users = this.getAllUsers();
    const rawUsername = (customUsername || this.generateCaptainUsername(team.shortName || team.id)).toLowerCase().trim();
    const username = rawUsername || this.generateCaptainUsername(team.id);
    const password = (customPassword || '123').trim() || '123';

    // Tìm xem đã có tài khoản gắn với teamId này chưa
    const existingIndex = users.findIndex(
      (u) => u.teamId === team.id || u.username.toLowerCase() === username
    );

    const captainAccount: UserAccount = {
      id: existingIndex >= 0 ? users[existingIndex].id : `USR-CAP-${team.id}`,
      username,
      password,
      fullName: team.captainName?.trim() || `Đội trưởng ${team.name}`,
      role: 'TEAM_MANAGER',
      email: team.email || `${username}@itftms.vn`,
      phone: team.phoneNumber || '',
      teamId: team.id,
      teamName: team.name,
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`,
      createdAt: existingIndex >= 0 ? users[existingIndex].createdAt : new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      users[existingIndex] = { ...users[existingIndex], ...captainAccount };
    } else {
      users.push(captainAccount);
    }

    this.saveUsers(users);

    StorageService.logAction(
      'HỆ THỐNG',
      'ORGANIZER',
      'TỰ ĐỘNG TẠO TÀI KHOẢN ĐỘI TRƯỞNG',
      team.name,
      `Tự động tạo tài khoản @${captainAccount.username} cho Đội trưởng đội ${team.name} (Mật khẩu: ${password}).`
    );

    return captainAccount;
  }

  /**
   * Đồng bộ tài khoản Đội Trưởng cho toàn bộ danh sách đội bóng trong giải
   */
  static syncCaptainAccountsForTeams(
    teams: { id: string; name: string; shortName: string; captainName?: string; email?: string; phoneNumber?: string }[]
  ): void {
    if (!this.isClient || !teams || teams.length === 0) return;
    const users = this.getAllUsers();
    let hasChanges = false;

    for (const team of teams) {
      const hasAccount = users.some(
        (u) => u.role === 'TEAM_MANAGER' && (u.teamId === team.id || u.teamName === team.name)
      );
      if (!hasAccount) {
        const username = this.generateCaptainUsername(team.shortName || team.id);
        const newCap: UserAccount = {
          id: `USR-CAP-${team.id}`,
          username,
          password: '123',
          fullName: team.captainName?.trim() || `Đội trưởng ${team.name}`,
          role: 'TEAM_MANAGER',
          email: team.email || `${username}@itftms.vn`,
          phone: team.phoneNumber || '',
          teamId: team.id,
          teamName: team.name,
          avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`,
          createdAt: new Date().toISOString(),
        };
        users.push(newCap);
        hasChanges = true;
      }
    }

    if (hasChanges) {
      this.saveUsers(users);
    }
  }

  /**
   * Lấy thông tin tài khoản Đội Trưởng của một đội bóng
   */
  static getCaptainAccountForTeam(teamId: string): UserAccount | undefined {
    const users = this.getAllUsers();
    return users.find((u) => u.role === 'TEAM_MANAGER' && u.teamId === teamId);
  }

  /**
   * Dọn dẹp phiên tự động đăng nhập cũ trước đây (chỉ chạy 1 lần khi cập nhật)
   */
  static clearLegacyAutoLogin(): void {
    if (!this.isClient) return;
    try {
      const isCleaned = localStorage.getItem('itftms_autologin_disabled_v2');
      if (!isCleaned) {
        localStorage.removeItem(AUTH_STORAGE_KEYS.CURRENT_USER);
        localStorage.removeItem('itftms_current_role_2026');
        localStorage.setItem('itftms_autologin_disabled_v2', 'true');
      }
    } catch {}
  }

  /**
   * Lấy tài khoản đang đăng nhập hiện tại.
   * KHÔNG tự động đăng nhập - người dùng vào trang với trạng thái chưa đăng nhập.
   */
  static getCurrentUser(): UserAccount | null {
    if (!this.isClient) return null;
    this.clearLegacyAutoLogin();
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEYS.CURRENT_USER);
      if (!stored) {
        return null;
      }
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }

  /**
   * Đặt tài khoản đang đăng nhập hiện tại
   */
  static setCurrentUser(user: UserAccount | null): void {
    if (!this.isClient) return;
    try {
      if (user) {
        localStorage.setItem(AUTH_STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
        StorageService.setCurrentRole(user.role);
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEYS.CURRENT_USER);
        StorageService.setCurrentRole('STUDENT');
      }
    } catch (e) {
      console.error('Error setting current user:', e);
    }
  }

  /**
   * Đăng nhập bằng username/email/fullName + mật khẩu
   * Hỗ trợ gõ linh hoạt tiếng Việt hoặc không dấu (vd: SU BIN, subin, Thành Công, thanhcong)
   */
  static login(identifier: string, password: string): { success: boolean; user?: UserAccount; error?: string } {
    const rawId = identifier.trim();
    const cleanId = rawId.toLowerCase();
    const cleanPass = password.trim();

    if (!cleanId || !cleanPass) {
      return { success: false, error: 'Vui lòng nhập tài khoản/email và mật khẩu!' };
    }

    const normalize = (s: string) =>
      s
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[\s\-_]+/g, '');

    const normTarget = normalize(rawId);

    const users = this.getAllUsers();
    const found = users.find((u) => {
      const isMatch =
        u.username.toLowerCase() === cleanId ||
        u.email.toLowerCase() === cleanId ||
        normalize(u.username) === normTarget ||
        normalize(u.fullName) === normTarget ||
        normalize(u.fullName).includes(normTarget);
      return isMatch && u.password === cleanPass;
    });

    if (!found) {
      return { success: false, error: 'Tên đăng nhập hoặc mật khẩu không chính xác!' };
    }

    this.setCurrentUser(found);

    // Ghi audit log
    StorageService.logAction(
      found.fullName,
      found.role,
      'ĐĂNG NHẬP HỆ THỐNG',
      'Xác thực người dùng',
      `Tài khoản @${found.username} (${found.fullName}) đăng nhập thành công với vai trò ${found.role}.`
    );

    return { success: true, user: found };
  }

  /**
   * Đăng ký tài khoản mới
   */
  static register(data: {
    fullName: string;
    username: string;
    email: string;
    password: string;
    role: UserRole;
    studentId?: string;
    class?: string;
    teamName?: string;
    phone?: string;
  }): { success: boolean; user?: UserAccount; error?: string } {
    const cleanUsername = data.username.trim().toLowerCase();
    const cleanEmail = data.email.trim().toLowerCase();

    if (!data.fullName || !cleanUsername || !cleanEmail || !data.password) {
      return { success: false, error: 'Vui lòng điền đầy đủ các thông tin bắt buộc!' };
    }

    const users = this.getAllUsers();
    if (users.some((u) => u.username.toLowerCase() === cleanUsername)) {
      return { success: false, error: `Tên tài khoản "${data.username}" đã tồn tại. Vui lòng chọn tên khác!` };
    }

    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: `Email "${data.email}" đã được đăng ký trong hệ thống!` };
    }

    const newUser: UserAccount = {
      id: `USR-${Date.now()}`,
      username: cleanUsername,
      password: data.password,
      fullName: data.fullName.trim(),
      role: data.role || 'STUDENT',
      email: cleanEmail,
      phone: data.phone || '',
      studentId: data.studentId || '',
      class: data.class || '',
      teamName: data.teamName || '',
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanUsername}`,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    this.saveUsers(users);
    this.setCurrentUser(newUser);

    StorageService.logAction(
      newUser.fullName,
      newUser.role,
      'ĐĂNG KÝ TÀI KHOẢN MỚI',
      'Đăng ký tài khoản',
      `Người dùng mới @${newUser.username} (${newUser.fullName}) đã tạo tài khoản với vai trò ${newUser.role}.`
    );

    return { success: true, user: newUser };
  }

  /**
   * Đăng nhập nhanh 1-Click theo vai trò để kiểm thử tức thì
   */
  static quickLogin(role: UserRole): UserAccount {
    const defaultForRole = DEFAULT_ACCOUNTS.find((a) => a.role === role) || DEFAULT_ACCOUNTS[0];
    this.setCurrentUser(defaultForRole);

    StorageService.logAction(
      defaultForRole.fullName,
      defaultForRole.role,
      'ĐĂNG NHẬP NHANH (QUICK LOGIN)',
      'Chuyển phiên làm việc',
      `Đăng nhập nhanh với quyền ${defaultForRole.role} (@${defaultForRole.username})`
    );

    return defaultForRole;
  }

  /**
   * Đăng xuất khỏi hệ thống
   */
  static logout(): void {
    const user = this.getCurrentUser();
    if (user) {
      StorageService.logAction(
        user.fullName,
        user.role,
        'ĐĂNG XUẤT',
        'Phiên làm việc',
        `Tài khoản @${user.username} đã đăng xuất khỏi hệ thống.`
      );
    }
    this.setCurrentUser(null);
  }
}
