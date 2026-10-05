import { UserAccount, UserRole, Team } from '@/types';
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
    const raw = (shortNameOrId || '').toLowerCase().trim();
    const unPrefixed = raw.replace(/^captain_+/, '');
    const clean = unPrefixed
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
    const rawUsername = (customUsername || this.generateCaptainUsername(team.shortName || team.name || team.id)).toLowerCase().trim();
    const username = rawUsername || this.generateCaptainUsername(team.id);
    const password = (customPassword || '123').trim() || '123';

    // Tìm xem đã có tài khoản gắn với teamId hoặc username này chưa
    const existingIndex = users.findIndex(
      (u) => (u.teamId && u.teamId === team.id) || u.username.toLowerCase() === username
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
      const existing = users.find(
        (u) => u.role === 'TEAM_MANAGER' && (u.teamId === team.id || (u.teamName && u.teamName.toLowerCase().trim() === team.name.toLowerCase().trim()))
      );
      const targetUsername = this.generateCaptainUsername(team.shortName || team.name || team.id);

      if (existing) {
        let modified = false;
        if (existing.teamId !== team.id) {
          existing.teamId = team.id;
          modified = true;
        }
        if (existing.teamName !== team.name) {
          existing.teamName = team.name;
          modified = true;
        }
        if (!existing.password) {
          existing.password = '123';
          modified = true;
        }
        if (team.captainName && (!existing.fullName || existing.fullName.startsWith('Đội trưởng'))) {
          existing.fullName = team.captainName.trim();
          modified = true;
        }
        if (modified) hasChanges = true;
      } else {
        const newCap: UserAccount = {
          id: `USR-CAP-${team.id}`,
          username: targetUsername,
          password: '123',
          fullName: team.captainName?.trim() || `Đội trưởng ${team.name}`,
          role: 'TEAM_MANAGER',
          email: team.email || `${targetUsername}@itftms.vn`,
          phone: team.phoneNumber || '',
          teamId: team.id,
          teamName: team.name,
          avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${targetUsername}`,
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
    let found = users.find((u) => u.role === 'TEAM_MANAGER' && u.teamId === teamId);
    if (!found) {
      try {
        const teams = StorageService.getTeams();
        const team = teams.find((t) => t.id === teamId);
        if (team) {
          this.syncCaptainAccountsForTeams(teams);
          const reloaded = this.getAllUsers();
          found = reloaded.find((u) => u.role === 'TEAM_MANAGER' && u.teamId === teamId);
        }
      } catch {}
    }
    return found;
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
   * Đăng nhập bằng username/email/fullName/tên đội + mật khẩu
   * Hỗ trợ gõ linh hoạt tiếng Việt hoặc không dấu, tự động bỏ ký tự '@'
   */
  static login(identifier: string, password: string): { success: boolean; user?: UserAccount; error?: string } {
    const rawId = (identifier || '').trim();
    const cleanPass = (password || '').trim();

    if (!rawId || !cleanPass) {
      return { success: false, error: 'Vui lòng nhập tài khoản/email/tên đội và mật khẩu!' };
    }

    // Bỏ ký tự '@' nếu người dùng gõ hoặc copy @captain_...
    const strippedId = rawId.replace(/^@+/, '').trim();
    const cleanId = strippedId.toLowerCase();

    // Lấy phần tên cốt lõi sau khi loại bỏ tiền tố captain
    const idWithoutCaptain = strippedId.replace(/^captain[_.\s-]*/i, '').trim();

    const normalize = (s: string) =>
      (s || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[@\s\-_.]+/g, '');

    const normTarget = normalize(strippedId);
    const normCore = normalize(idWithoutCaptain);
    const isCaptainIntent = cleanId.startsWith('captain') || rawId.toLowerCase().includes('captain');

    // Lấy danh sách đội bóng với cơ chế dự phòng an toàn
    let teams: Team[] = [];
    try {
      teams = StorageService.getTeams();
      if ((!teams || teams.length === 0) && typeof window !== 'undefined') {
        const raw = localStorage.getItem('itftms_teams_list_2026');
        if (raw) {
          teams = JSON.parse(raw);
        }
      }
      if (teams && teams.length > 0) {
        this.syncCaptainAccountsForTeams(teams);
      }
    } catch {}

    const users = this.getAllUsers();

    // 1. Tìm trong danh sách tài khoản hiện có
    let found = users.find((u) => {
      const uNorm = normalize(u.username);
      const uCore = uNorm.replace(/^captain/, '');

      // a. Khớp theo username hoặc email
      const matchUsername =
        u.username.toLowerCase() === cleanId ||
        uNorm === normTarget ||
        (normCore && (uCore === normCore || uNorm === `captain${normCore}` || u.username.toLowerCase() === `captain_${normCore}`));
      const matchEmail = u.email.toLowerCase() === cleanId;

      // b. Khớp theo họ tên người dùng
      const matchFullName =
        normalize(u.fullName) === normTarget ||
        (normCore && normalize(u.fullName) === normCore) ||
        (normCore && normalize(u.fullName).includes(normCore));

      // c. Khớp thông tin Đội trưởng
      let matchCaptainInfo = false;
      if (u.role === 'TEAM_MANAGER') {
        const matchTeamName =
          u.teamName &&
          (normalize(u.teamName) === normTarget ||
            normalize(u.teamName) === normCore ||
            u.teamName.toLowerCase() === cleanId ||
            (normCore && normalize(u.teamName).includes(normCore)));

        const matchTeamId =
          u.teamId &&
          (u.teamId.toLowerCase() === cleanId ||
            normalize(u.teamId) === normTarget ||
            normalize(u.teamId) === normCore);

        const teamObj = teams.find((t) => t.id === u.teamId);
        const matchShortName =
          teamObj &&
          (teamObj.shortName.toLowerCase() === cleanId ||
            normalize(teamObj.shortName) === normTarget ||
            normalize(teamObj.shortName) === normCore ||
            (normCore && normCore.includes(normalize(teamObj.shortName))));

        const matchClass =
          teamObj &&
          teamObj.class &&
          (teamObj.class.toLowerCase() === cleanId ||
            normalize(teamObj.class) === normTarget ||
            normalize(teamObj.class) === normCore ||
            (normCore && normCore.includes(normalize(teamObj.class))));

        matchCaptainInfo = Boolean(matchTeamName || matchTeamId || matchShortName || matchClass);
      }

      const isMatch = matchUsername || matchEmail || matchFullName || matchCaptainInfo;
      const userPassword = (u.password || '123').trim();
      return isMatch && userPassword === cleanPass;
    });

    // 2. Nếu chưa tìm thấy và mật khẩu là 123 (mật khẩu mặc định của Đội trưởng):
    // Tìm kiếm trong danh sách đội bóng để tự động tạo hoặc liên kết tài khoản Đội trưởng ngay lập tức!
    if (!found && cleanPass === '123' && normCore) {
      const matchedTeam = teams.find((t) => {
        const normName = normalize(t.name);
        const normShort = normalize(t.shortName);
        const normClass = normalize(t.class);
        const normId = normalize(t.id);

        return (
          normName === normCore ||
          normShort === normCore ||
          normClass === normCore ||
          normId === normCore ||
          (normCore.length >= 3 && normName.includes(normCore)) ||
          (normCore.length >= 3 && normCore.includes(normShort) && normShort.length >= 2) ||
          (normCore.length >= 3 && normCore.includes(normClass) && normClass.length >= 2) ||
          (normShort.length >= 3 && normShort.includes(normCore))
        );
      });

      if (matchedTeam) {
        const targetUsername = cleanId.startsWith('captain')
          ? cleanId
          : `captain_${normalize(matchedTeam.shortName || matchedTeam.name)}`;
        const captainAccount = this.createCaptainAccountForTeam(matchedTeam, targetUsername, '123');
        found = captainAccount;
      }
    }

    // 3. Nếu vẫn chưa có đội nào khớp, nhưng người dùng nhập dạng captain_... với mật khẩu 123:
    // Tự động khởi tạo đội bóng và tài khoản Đội trưởng để Đội trưởng luôn đăng nhập thành công 100%!
    if (!found && cleanPass === '123' && isCaptainIntent && normCore) {
      const teamCode = (idWithoutCaptain.replace(/[^a-zA-Z0-9]/g, '') || normCore).toUpperCase();
      const newTeam: Team = {
        id: `T-${normCore}`,
        name: `Đội ${teamCode}`,
        shortName: teamCode,
        logo: `⚽ ${teamCode}`,
        class: teamCode,
        department: 'Khoa Công nghệ Thông tin',
        leaderName: 'Trưởng đoàn',
        captainName: 'Đội trưởng',
        phoneNumber: '0900000000',
        email: `${normCore}@itftms.vn`,
        primaryColor: '#059669',
        secondaryColor: '#FFFFFF',
        status: 'APPROVED',
        feeStatus: 'UNPAID',
        registrationFee: 500000,
        depositFee: 50000,
        players: [],
      };

      const currentTeams = StorageService.getTeams();
      const updatedTeams = [...currentTeams, newTeam];
      StorageService.saveTeams(updatedTeams);

      const targetUsername = cleanId.startsWith('captain') ? cleanId : `captain_${normCore}`;
      const captainAccount = this.createCaptainAccountForTeam(newTeam, targetUsername, '123');
      found = captainAccount;
    }

    if (!found) {
      return {
        success: false,
        error: 'Tên đăng nhập hoặc mật khẩu không chính xác! Vui lòng kiểm tra lại.',
      };
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
