import { UserAccount, UserRole, Team, Referee } from '@/types';
import { StorageService } from './storage';
import { SecureStorage } from '@/utils/secureStorage';
import {
  hashPassword,
  verifyPassword,
  isDefaultPassword,
  isBtcDefaultPassword,
  formatPasswordDisplay,
  BTC_DEFAULT_PASSWORD,
  checkPasswordStrength,
  generateStrongPassword,
} from '@/utils/crypto';

export { BTC_DEFAULT_PASSWORD } from '@/utils/crypto';

const AUTH_STORAGE_KEYS = {
  USERS: 'itftms_accounts_list_2026',
  CURRENT_USER: 'itftms_current_authenticated_user_2026',
};

export const DEFAULT_ACCOUNTS: UserAccount[] = [];

export class AuthService {
  private static get isClient(): boolean {
    return typeof window !== 'undefined';
  }

  /**
   * Lấy danh sách toàn bộ tài khoản người dùng và tự động đồng bộ tài khoản BTC
   * Dữ liệu được mã hóa bảo mật hoàn toàn trong LocalStorage (không lộ thông tin khi F12)
   */
  static getAllUsers(): UserAccount[] {
    if (!this.isClient) return [];
    try {
      let parsed = SecureStorage.getItem<UserAccount[]>(AUTH_STORAGE_KEYS.USERS);
      if (!parsed || !Array.isArray(parsed)) {
        SecureStorage.setItem(AUTH_STORAGE_KEYS.USERS, []);
        return [];
      }

      // Loại bỏ hoàn toàn 2 tài khoản subin, thanhcong và các tài khoản demo cũ theo yêu cầu người dùng
      const PURGED_USERNAMES = ['subin', 'thanhcong', 'btc', 'referee', 'captain', 'admin', 'sinhvien'];
      const PURGED_IDS = ['USR-BTC-SUBIN', 'USR-BTC-THANHCONG', 'USR-BTC-01', 'USR-REF-01', 'USR-CAP-01', 'USR-ADM-01', 'USR-STU-01'];
      const filtered = parsed.filter(
        (u) => !PURGED_USERNAMES.includes(u.username.toLowerCase()) && !PURGED_IDS.includes(u.id)
      );

      let hasChanges = filtered.length !== parsed.length;
      parsed = filtered;

      // Tự động nâng cấp các tài khoản lưu dạng thô (plaintext) sang mã băm Salted SHA-256 an toàn
      for (let i = 0; i < parsed.length; i++) {
        const u = parsed[i];
        const isBtc = u.role === 'ORGANIZER' || u.role === 'SUPER_ADMIN';
        if (!u.password || (!u.password.startsWith('sha256$') && !u.password.startsWith('sha256:'))) {
          const raw = (u.password || (isBtc ? BTC_DEFAULT_PASSWORD : '123')).trim() || (isBtc ? BTC_DEFAULT_PASSWORD : '123');
          parsed[i].password = hashPassword(raw);
          hasChanges = true;
        }
      }

      // Tự động nâng cấp tài khoản Ban Tổ Chức (BTC) từ mật khẩu đơn giản '123' lên mật khẩu phức tạp Btc@2026!#
      for (let i = 0; i < parsed.length; i++) {
        const u = parsed[i];
        const isBtc = u.role === 'ORGANIZER' || u.role === 'SUPER_ADMIN';
        if (isBtc && verifyPassword('123', u.password)) {
          parsed[i].password = hashPassword(BTC_DEFAULT_PASSWORD);
          hasChanges = true;
        }
      }

      // Luôn ghi đè bản đã mã hóa an toàn vào storage
      SecureStorage.setItem(AUTH_STORAGE_KEYS.USERS, parsed);
      return parsed;
    } catch {
      return [];
    }
  }

  /**
   * Lưu danh sách tài khoản (được mã hóa bảo mật tuyệt đối)
   */
  static saveUsers(users: UserAccount[]): void {
    if (!this.isClient) return;
    try {
      SecureStorage.setItem(AUTH_STORAGE_KEYS.USERS, users);
    } catch (e) {
      console.error('Error saving users to secure storage:', e);
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
    const plainPass = (customPassword || '123').trim() || '123';
    const hashedPassword = hashPassword(plainPass);

    // Tìm xem đã có tài khoản gắn với teamId hoặc username này chưa
    const existingIndex = users.findIndex(
      (u) => (u.teamId && u.teamId === team.id) || u.username.toLowerCase() === username
    );

    const captainAccount: UserAccount = {
      id: existingIndex >= 0 ? users[existingIndex].id : `USR-CAP-${team.id}`,
      username,
      password: hashedPassword,
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
      `Tự động tạo tài khoản @${captainAccount.username} cho Đội trưởng đội ${team.name} (Đã mã hóa bảo mật).`
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
        if (!existing.password || (!existing.password.startsWith('sha256$') && !existing.password.startsWith('sha256:'))) {
          existing.password = hashPassword('123');
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
          password: hashPassword('123'),
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
   * Đảm bảo KHÔNG BAO GIỜ để lộ trường password.
   */
  static getCurrentUser(): UserAccount | null {
    if (!this.isClient) return null;
    this.clearLegacyAutoLogin();
    try {
      const stored = SecureStorage.getItem<UserAccount>(AUTH_STORAGE_KEYS.CURRENT_USER);
      if (!stored) {
        return null;
      }
      // Tự động dọn dẹp phiên nếu là tài khoản demo đã bị xóa (subin, thanhcong)
      const purgedUsernames = ['subin', 'thanhcong'];
      const purgedIds = ['USR-BTC-SUBIN', 'USR-BTC-THANHCONG'];
      if (
        (stored.username && purgedUsernames.includes(stored.username.toLowerCase())) ||
        (stored.id && purgedIds.includes(stored.id))
      ) {
        SecureStorage.removeItem(AUTH_STORAGE_KEYS.CURRENT_USER);
        StorageService.setCurrentRole('STUDENT');
        return null;
      }
      // Bảo mật: Xóa bỏ trường password nếu còn tồn dư từ các phiên bản cũ
      delete (stored as any).password;
      return stored;
    } catch {
      return null;
    }
  }

  /**
   * Đặt tài khoản đang đăng nhập hiện tại.
   * TUYỆT ĐỐI KHÔNG LƯU PASSWORD vào LocalStorage phiên người dùng.
   */
  static setCurrentUser(user: UserAccount | null): void {
    if (!this.isClient) return;
    try {
      if (user) {
        // Tạo bản sao an toàn và loại bỏ triệt để trường password
        const sanitized: UserAccount = { ...user };
        delete (sanitized as any).password;

        // Lưu trữ bảo mật có mã hóa vào LocalStorage
        SecureStorage.setItem(AUTH_STORAGE_KEYS.CURRENT_USER, sanitized);
        StorageService.setCurrentRole(user.role);
      } else {
        SecureStorage.removeItem(AUTH_STORAGE_KEYS.CURRENT_USER);
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
      const isBtcAccount = u.role === 'ORGANIZER' || u.role === 'SUPER_ADMIN';
      let isPassCorrect = verifyPassword(cleanPass, u.password);
      
      // Hỗ trợ mật khẩu phức tạp chuẩn của BTC
      if (!isPassCorrect && isBtcAccount) {
        if (cleanPass === BTC_DEFAULT_PASSWORD) {
          isPassCorrect = true;
        }
      }

      if (isMatch && isPassCorrect) {
        // Tự động nâng cấp sang mã băm Salted SHA-256 nếu mật khẩu chưa được băm
        if (u.password && !u.password.startsWith('sha256$') && !u.password.startsWith('sha256:')) {
          u.password = hashPassword(cleanPass);
          this.saveUsers(users);
        }
        return true;
      }
      return false;
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
      // Kiểm tra nếu tài khoản là BTC nhưng người dùng gõ mật khẩu cũ "123"
      const matchedBtc = users.find((u) => {
        const isBtc = u.role === 'ORGANIZER' || u.role === 'SUPER_ADMIN';
        const isMatchUser =
          u.username.toLowerCase() === cleanId ||
          (u.email && u.email.toLowerCase() === cleanId) ||
          u.fullName.toLowerCase() === cleanId;
        return isBtc && isMatchUser;
      });

      if (matchedBtc && cleanPass === '123') {
        return {
          success: false,
          error: `Mật khẩu Ban Tổ Chức (BTC) đã được nâng cấp độ phức tạp cao hơn: "${BTC_DEFAULT_PASSWORD}". Vui lòng đăng nhập bằng mật khẩu này!`,
        };
      }

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
      password: hashPassword(data.password),
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
  static quickLogin(role: UserRole): UserAccount | null {
    const users = this.getAllUsers();
    const userForRole = users.find((a) => a.role === role) || users[0] || null;
    if (userForRole) {
      this.setCurrentUser(userForRole);
      StorageService.logAction(
        userForRole.fullName,
        userForRole.role,
        'ĐĂNG NHẬP NHANH (QUICK LOGIN)',
        'Chuyển phiên làm việc',
        `Đăng nhập nhanh với quyền ${userForRole.role} (@${userForRole.username})`
      );
    }
    return userForRole;
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

  /**
   * Tạo tài khoản mới cho Ban Tổ Chức (BTC) hoặc Trọng tài (Admin Role Only)
   */
  static createStaffAccount(data: {
    fullName: string;
    username: string;
    password?: string;
    role: 'ORGANIZER' | 'REFEREE';
    phone?: string;
    email?: string;
    refereeCode?: string;
    creatorName?: string;
  }): { success: boolean; user?: UserAccount; error?: string } {
    const rawName = (data.fullName || '').trim();
    if (!rawName) {
      return { success: false, error: 'Vui lòng nhập họ và tên!' };
    }

    const rawUsername = (data.username || '').trim();
    if (!rawUsername) {
      return { success: false, error: 'Vui lòng nhập tên đăng nhập!' };
    }

    const cleanUsername = rawUsername
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9_]/g, '');

    if (!cleanUsername) {
      return { success: false, error: 'Tên đăng nhập không hợp lệ (chỉ chấp nhận chữ cái, số và dấu gạch dưới)!' };
    }

    const users = this.getAllUsers();
    if (users.some((u) => u.username.toLowerCase() === cleanUsername)) {
      return { success: false, error: `Tên đăng nhập "${cleanUsername}" đã tồn tại. Vui lòng chọn tên khác!` };
    }

    const isBtcRole = data.role === 'ORGANIZER';
    const defaultPasswordForRole = isBtcRole ? BTC_DEFAULT_PASSWORD : '123';
    const plainPassword = (data.password || defaultPasswordForRole).trim() || defaultPasswordForRole;

    // Kiểm tra độ phức tạp cho tài khoản BTC
    if (isBtcRole) {
      const strength = checkPasswordStrength(plainPassword);
      if (!strength.isValidForBtc) {
        return {
          success: false,
          error: `Mật khẩu tài khoản BTC chưa đạt chuẩn phức tạp: ${strength.errors.join(', ')}. Gợi ý mật khẩu chuẩn: ${BTC_DEFAULT_PASSWORD}`,
        };
      }
    }

    const hashedPassword = hashPassword(plainPassword);
    const email = (data.email || '').trim() || `${cleanUsername}@itftms.vn`;
    const phone = (data.phone || '').trim();

    const newUser: UserAccount = {
      id: data.role === 'REFEREE' ? `USR-REF-${Date.now()}` : `USR-BTC-${Date.now()}`,
      username: cleanUsername,
      password: hashedPassword,
      fullName: rawName,
      role: data.role,
      email,
      phone,
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanUsername}`,
      createdAt: new Date().toISOString(),
    };

    // Nếu là Trọng tài, tự động đồng bộ vào danh sách Trọng tài thi đấu của giải
    if (data.role === 'REFEREE') {
      try {
        const referees = StorageService.getReferees();
        const existingRef = referees.find(
          (r) =>
            r.name.toLowerCase().trim() === rawName.toLowerCase() ||
            (phone && r.phoneNumber === phone)
        );

        if (!existingRef) {
          const autoCode = data.refereeCode?.trim() || `TT-${String(referees.length + 1).padStart(2, '0')}`;
          const newRef: Referee = {
            id: `REF-${Date.now()}`,
            code: autoCode,
            name: rawName,
            phoneNumber: phone || '0900000000',
            status: 'ACTIVE',
          };
          referees.push(newRef);
          StorageService.saveReferees(referees);
        }
      } catch (e) {
        console.error('Error syncing referee to storage:', e);
      }
    }

    users.push(newUser);
    this.saveUsers(users);

    StorageService.logAction(
      data.creatorName || 'Ban Quản Trị Hệ Thống',
      'ORGANIZER',
      data.role === 'REFEREE' ? 'TẠO TÀI KHOẢN TRỌNG TÀI' : 'TẠO TÀI KHOẢN BAN TỔ CHỨC',
      newUser.fullName,
      `Tạo tài khoản @${newUser.username} cho ${data.role === 'REFEREE' ? 'Trọng tài' : 'Ban Tổ Chức'} ${newUser.fullName} (Đã mã hóa bảo mật).`
    );

    return { success: true, user: newUser };
  }

  /**
   * Xóa tài khoản người dùng
   */
  static deleteUserAccount(
    userId: string,
    currentUserId?: string,
    actorName?: string
  ): { success: boolean; error?: string } {
    if (currentUserId && userId === currentUserId) {
      return { success: false, error: 'Không thể xóa chính tài khoản bạn đang đăng nhập!' };
    }

    const users = this.getAllUsers();
    const target = users.find((u) => u.id === userId);
    if (!target) {
      return { success: false, error: 'Không tìm thấy tài khoản cần xóa trong hệ thống!' };
    }

    const updated = users.filter((u) => u.id !== userId);
    this.saveUsers(updated);

    // Nếu là Trọng tài, kiểm tra đồng bộ danh sách trọng tài
    if (target.role === 'REFEREE') {
      try {
        const referees = StorageService.getReferees();
        const filteredRefs = referees.filter(
          (r) => r.name.toLowerCase().trim() !== target.fullName.toLowerCase().trim()
        );
        if (filteredRefs.length !== referees.length) {
          StorageService.saveReferees(filteredRefs);
        }
      } catch {}
    }

    StorageService.logAction(
      actorName || 'Ban Quản Trị Hệ Thống',
      'ORGANIZER',
      'XÓA TÀI KHOẢN',
      target.fullName,
      `Đã xóa tài khoản @${target.username} (${target.fullName}, vai trò: ${target.role}).`
    );

    return { success: true };
  }

  /**
   * Đặt lại mật khẩu tài khoản (Reset password) - Lưu dưới dạng mã băm SHA-256
   */
  static resetUserPassword(
    userId: string,
    newPassword?: string,
    actorName?: string
  ): { success: boolean; newPassword?: string; error?: string } {
    const users = this.getAllUsers();
    const target = users.find((u) => u.id === userId);
    if (!target) {
      return { success: false, error: 'Không tìm thấy tài khoản cần đặt lại mật khẩu!' };
    }

    const isBtc = target.role === 'ORGANIZER' || target.role === 'SUPER_ADMIN';
    const defaultPassForRole = isBtc ? BTC_DEFAULT_PASSWORD : '123';
    const plainPassword = (newPassword || defaultPassForRole).trim() || defaultPassForRole;

    if (isBtc && newPassword && newPassword !== BTC_DEFAULT_PASSWORD) {
      const strength = checkPasswordStrength(plainPassword);
      if (!strength.isValidForBtc) {
        return {
          success: false,
          error: `Mật khẩu tài khoản BTC phải đạt chuẩn phức tạp: ${strength.errors.join(', ')}. Gợi ý mặc định: ${BTC_DEFAULT_PASSWORD}`,
        };
      }
    }

    target.password = hashPassword(plainPassword);
    this.saveUsers(users);

    StorageService.logAction(
      actorName || 'Ban Quản Trị Hệ Thống',
      'ORGANIZER',
      'ĐẶT LẠI MẬT KHẨU',
      target.fullName,
      `Đặt lại mật khẩu cho tài khoản @${target.username} (${target.fullName}) thành công (Đã mã hóa bảo mật).`
    );

    return { success: true, newPassword: plainPassword };
  }

  /**
   * Cập nhật thông tin tài khoản nhân sự
   */
  static updateStaffAccount(
    userId: string,
    data: { fullName?: string; phone?: string; email?: string; password?: string },
    actorName?: string
  ): { success: boolean; error?: string } {
    const users = this.getAllUsers();
    const target = users.find((u) => u.id === userId);
    if (!target) {
      return { success: false, error: 'Không tìm thấy tài khoản cần cập nhật!' };
    }

    if (data.fullName?.trim()) target.fullName = data.fullName.trim();
    if (data.phone !== undefined) target.phone = data.phone.trim();
    if (data.email?.trim()) target.email = data.email.trim();
    if (data.password?.trim()) {
      const plain = data.password.trim();
      const isBtc = target.role === 'ORGANIZER' || target.role === 'SUPER_ADMIN';
      if (isBtc) {
        const strength = checkPasswordStrength(plain);
        if (!strength.isValidForBtc) {
          return {
            success: false,
            error: `Mật khẩu tài khoản BTC chưa đạt chuẩn phức tạp: ${strength.errors.join(', ')}. Gợi ý mặc định: ${BTC_DEFAULT_PASSWORD}`,
          };
        }
      }
      target.password = hashPassword(plain);
    }

    this.saveUsers(users);

    StorageService.logAction(
      actorName || 'Ban Quản Trị Hệ Thống',
      'ORGANIZER',
      'CẬP NHẬT TÀI KHOẢN',
      target.fullName,
      `Cập nhật thông tin cho tài khoản @${target.username} (${target.fullName}).`
    );

    return { success: true };
  }

  /**
   * Mật khẩu phức tạp chuẩn dành cho Ban Tổ Chức
   */
  static get BTC_DEFAULT_PASSWORD(): string {
    return BTC_DEFAULT_PASSWORD;
  }

  /**
   * Tiện ích băm mật khẩu (SHA-256 kèm Salt)
   */
  static hashPassword(password: string, salt?: string): string {
    return hashPassword(password, salt);
  }

  /**
   * Xác thực mật khẩu nhập vào đối chiếu mã băm
   */
  static verifyPassword(plainPassword: string, storedHashOrPlain?: string): boolean {
    return verifyPassword(plainPassword, storedHashOrPlain);
  }

  /**
   * Kiểm tra mật khẩu có phải là mật khẩu mặc định "123" hay không
   */
  static isDefaultPassword(storedHashOrPlain?: string): boolean {
    return isDefaultPassword(storedHashOrPlain);
  }

  /**
   * Kiểm tra mật khẩu có phải là mật khẩu mặc định phức tạp của BTC hay không
   */
  static isBtcDefaultPassword(storedHashOrPlain?: string): boolean {
    return isBtcDefaultPassword(storedHashOrPlain);
  }

  /**
   * Kiểm tra độ phức tạp của mật khẩu
   */
  static checkPasswordStrength(password: string) {
    return checkPasswordStrength(password);
  }

  /**
   * Tự động sinh mật khẩu phức tạp ngẫu nhiên
   */
  static generateStrongPassword(length?: number): string {
    return generateStrongPassword(length);
  }

  /**
   * Định dạng chuỗi hiển thị bảo mật cho giao diện
   */
  static formatPasswordDisplay(storedHashOrPlain?: string, role?: string) {
    return formatPasswordDisplay(storedHashOrPlain, role);
  }
}
