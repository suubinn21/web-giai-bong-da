import {
  Team,
  Player,
  Venue,
  Referee,
  Match,
  Complaint,
  FinancialTransaction,
  TournamentAward,
  AuditLog,
  TournamentStatus,
  UserRole,
  Tournament,
} from '@/types';

const STORAGE_KEYS = {
  ALL_TOURNAMENTS: 'itftms_all_tournaments_list',
  ACTIVE_TOURNAMENT_ID: 'itftms_active_tournament_id',
  TOURNAMENT: 'itftms_tournament_profile_2026',
  TEAMS: 'itftms_teams_2026',
  MATCHES: 'itftms_matches_2026',
  VENUES: 'itftms_venues_2026',
  REFEREES: 'itftms_referees_2026',
  COMPLAINTS: 'itftms_complaints_2026',
  FINANCES: 'itftms_finances_2026',
  AWARDS: 'itftms_awards_2026',
  AUDIT_LOGS: 'itftms_audit_logs_2026',
  STATUS: 'itftms_tournament_status_2026',
  CURRENT_ROLE: 'itftms_current_role_2026',
  INITIALIZED: 'itftms_initialized_2026',
};

export const defaultTournament: Tournament = {
  id: 'TOUR-2026-IT',
  name: 'Giải Bóng Đá Khoa Công Nghệ Thông Tin 2026',
  shortCode: 'ITFTMS-2026',
  year: 2026,
  organizer: 'Đoàn - Hội Khoa Công Nghệ Thông Tin',
  format: 'Bóng đá 5 người (Futsal)',
  maxTeams: 16,
  numberOfGroups: 4,
  teamsPerGroup: 4,
  maxPlayersPerTeam: 12,
  matchDurationMinutes: 40,
  breakDurationMinutes: 5,
  registrationFee: 500000,
  depositFee: 50000,
  startDate: '2026-10-15',
  endDate: '2026-10-25',
  status: 'REGISTRATION',
  description: 'Giải bóng đá sinh viên thường niên Khoa Công nghệ Thông tin năm 2026.',
};

export const initialTournamentsList: Tournament[] = [
  defaultTournament,
  {
    id: 'TOUR-2026-SPRING',
    name: 'Giải Futsal Mùa Xuân Đoàn Khoa CNTT 2026',
    shortCode: 'SPRING-2026',
    year: 2026,
    organizer: 'CLB Thể Thao IT & Đoàn Khoa',
    format: 'Bóng đá 5 người (Futsal)',
    maxTeams: 16,
    numberOfGroups: 4,
    teamsPerGroup: 4,
    maxPlayersPerTeam: 12,
    matchDurationMinutes: 40,
    breakDurationMinutes: 5,
    registrationFee: 500000,
    depositFee: 50000,
    startDate: '2026-11-05',
    endDate: '2026-11-15',
    status: 'REGISTRATION',
    description: 'Giải đấu futsal truyền thống đầu năm dành cho các chi đoàn khoa CNTT tranh tài.',
  },
  {
    id: 'TOUR-2025-AUTUMN',
    name: 'Giải Bóng Đá IT Mở Rộng 2025 (Mùa Trước)',
    shortCode: 'IT-CUP-2025',
    year: 2025,
    organizer: 'Ban Chấp Hành Đoàn Khoa CNTT',
    format: 'Bóng đá 5 người (Futsal)',
    maxTeams: 16,
    numberOfGroups: 4,
    teamsPerGroup: 4,
    maxPlayersPerTeam: 12,
    matchDurationMinutes: 40,
    breakDurationMinutes: 5,
    registrationFee: 500000,
    depositFee: 50000,
    startDate: '2025-10-10',
    endDate: '2025-10-20',
    status: 'COMPLETED',
    description: 'Mùa giải bóng đá sinh viên 2025 thành công rực rỡ với ngôi vương thuộc về CNTT K21.',
  },
];

// 3 Pitches per Specification Section 18 & 23
export const defaultVenues: Venue[] = [
  { id: 'V01', name: 'Sân 1 - Cỏ Nhân Tạo Ký Túc Xá', location: 'Khuôn viên KTX Khu A, ĐHQG', status: 'AVAILABLE' },
  { id: 'V02', name: 'Sân 2 - Trung Tâm Thể Thao', location: 'Sân số 2, Trung tâm GDTC', status: 'AVAILABLE' },
  { id: 'V03', name: 'Sân 3 - Nhà Thi Đấu CNTT', location: 'Sân phụ A, Nhà thi đấu đa năng', status: 'AVAILABLE' },
];

// Referees per Specification Section 24
export const defaultReferees: Referee[] = [
  { id: 'REF01', code: 'TT-01', name: 'Trần Văn Hùng', phoneNumber: '0901234567', status: 'ACTIVE' },
  { id: 'REF02', code: 'TT-02', name: 'Lê Minh Vũ', phoneNumber: '0912345678', status: 'ACTIVE' },
  { id: 'REF03', code: 'TT-03', name: 'Nguyễn Quốc Đạt', phoneNumber: '0923456789', status: 'ACTIVE' },
  { id: 'REF04', code: 'TT-04', name: 'Hoàng Đình Trọng', phoneNumber: '0934567890', status: 'ACTIVE' },
  { id: 'REF05', code: 'TT-05', name: 'Phạm Thanh Sơn', phoneNumber: '0945678901', status: 'ACTIVE' },
  { id: 'REF06', code: 'TT-06', name: 'Bùi Văn Hảo', phoneNumber: '0956789012', status: 'ACTIVE' },
];

// Clean empty awards list per Specification Section 28
export const defaultCleanAwards: TournamentAward[] = [
  { id: 'AW-01', code: 'CHAMPION', title: '🥇 Cúp Vô Địch (Giải Nhất)', recipientName: 'Chưa xác định', recipientTeam: 'Chờ Chung kết', prizeMoney: 4000000, icon: '🏆' },
  { id: 'AW-02', code: 'RUNNER_UP', title: '🥈 Giải Nhì (Á Quân)', recipientName: 'Chưa xác định', recipientTeam: 'Chờ Chung kết', prizeMoney: 2500000, icon: '🥈' },
  { id: 'AW-03', code: 'THIRD_PLACE', title: '🥉 Giải Ba (Hạng Ba)', recipientName: 'Chưa xác định', recipientTeam: 'Chờ Tranh 3-4', prizeMoney: 1500000, icon: '🥉' },
  { id: 'AW-04', code: 'TOP_SCORER', title: '⚽ Vua Phá Lưới (Golden Boot)', recipientName: 'Chưa xác định', recipientTeam: 'Chờ kết quả thi đấu', prizeMoney: 500000, icon: '⚽' },
  { id: 'AW-05', code: 'BEST_GK', title: '🧤 Thủ Môn Xuất Sắc Nhất', recipientName: 'Chưa xác định', recipientTeam: 'Chờ kết quả thi đấu', prizeMoney: 500000, icon: '🧤' },
  { id: 'AW-06', code: 'BEST_PLAYER', title: '⭐ Cầu Thủ Xuất Sắc Nhất (MVP)', recipientName: 'Chưa xác định', recipientTeam: 'Chờ kết quả thi đấu', prizeMoney: 500000, icon: '⭐' },
  { id: 'AW-07', code: 'FAIR_PLAY', title: '🤝 Giải Phong Cách (Fair Play)', recipientName: 'Chưa xác định', recipientTeam: 'Chờ kết quả thi đấu', prizeMoney: 500000, icon: '🤝' },
];

// Generator for Demo Data (16 teams, 192 players, 32 matches, sample finances)
export const generateDemoTeams = (): Team[] => {
  const teamTemplates = [
    { id: 'T01', name: 'CNTT K21 Chiến Binh', shortName: 'CNTT-K21', class: '21CNTT1', dept: 'Kỹ thuật Máy tính', primaryColor: '#2563EB', secondaryColor: '#FFFFFF', group: 'A' as const },
    { id: 'T02', name: 'Kỹ Thuật Phần Mềm K21', shortName: 'KTPM-K21', class: '21KTPM1', dept: 'Kỹ thuật Phần mềm', primaryColor: '#059669', secondaryColor: '#F59E0B', group: 'A' as const },
    { id: 'T03', name: 'Hệ Thống Thông Tin K22', shortName: 'HTTT-K22', class: '22HTTT2', dept: 'Hệ thống Thông tin', primaryColor: '#DC2626', secondaryColor: '#FFFFFF', group: 'A' as const },
    { id: 'T04', name: 'An Toàn Thông Tin K23', shortName: 'ATTT-K23', class: '23ATTT1', dept: 'An toàn Thông tin', primaryColor: '#7C3AED', secondaryColor: '#10B981', group: 'A' as const },
    { id: 'T05', name: 'Khoa Học Máy Tính K21', shortName: 'KHMT-K21', class: '21KHMT1', dept: 'Khoa học Máy tính', primaryColor: '#0284C7', secondaryColor: '#F3F4F6', group: 'B' as const },
    { id: 'T06', name: 'Mạng Máy Tính K22', shortName: 'MMT-K22', class: '22MMT1', dept: 'Mạng & Truyền thông', primaryColor: '#EA580C', secondaryColor: '#111827', group: 'B' as const },
    { id: 'T07', name: 'Trí Tuệ Nhân Tạo K23', shortName: 'TTNT-K23', class: '23AI01', dept: 'Khoa học Máy tính', primaryColor: '#4F46E5', secondaryColor: '#06B6D4', group: 'B' as const },
    { id: 'T08', name: 'Khoa Học Dữ Liệu K22', shortName: 'KHDL-K22', class: '22DS01', dept: 'Khoa học Dữ liệu', primaryColor: '#0D9488', secondaryColor: '#FEF08A', group: 'B' as const },
    { id: 'T09', name: 'CNTT K22 Tia Chớp', shortName: 'CNTT-K22', class: '22CNTT2', dept: 'Kỹ thuật Máy tính', primaryColor: '#D97706', secondaryColor: '#1F2937', group: 'C' as const },
    { id: 'T10', name: 'Thương Mại Điện Tử K22', shortName: 'TMĐT-K22', class: '22TMDT1', dept: 'Hệ thống Thông tin', primaryColor: '#E11D48', secondaryColor: '#FFFFFF', group: 'C' as const },
    { id: 'T11', name: 'Kỹ Thuật Phần Mềm K23', shortName: 'KTPM-K23', class: '23KTPM2', dept: 'Kỹ thuật Phần mềm', primaryColor: '#16A34A', secondaryColor: '#38BDF8', group: 'C' as const },
    { id: 'T12', name: 'An Toàn Thông Tin K22', shortName: 'ATTT-K22', class: '22ATTT2', dept: 'An toàn Thông tin', primaryColor: '#4338CA', secondaryColor: '#A7F3D0', group: 'C' as const },
    { id: 'T13', name: 'CNTT K23 Sấm Sét', shortName: 'CNTT-K23', class: '23CNTT3', dept: 'Kỹ thuật Máy tính', primaryColor: '#0891B2', secondaryColor: '#FDE047', group: 'D' as const },
    { id: 'T14', name: 'Tân Binh CNTT K24', shortName: 'CNTT-K24', class: '24CNTT1', dept: 'Kỹ thuật Máy tính', primaryColor: '#9333EA', secondaryColor: '#FFFFFF', group: 'D' as const },
    { id: 'T15', name: 'Kỹ Thuật Phần Mềm K24', shortName: 'KTPM-K24', class: '24KTPM1', dept: 'Kỹ thuật Phần mềm', primaryColor: '#059669', secondaryColor: '#F87171', group: 'D' as const },
    { id: 'T16', name: 'Trí Tuệ Nhân Tạo K24', shortName: 'TTNT-K24', class: '24AI02', dept: 'Khoa học Máy tính', primaryColor: '#BE185D', secondaryColor: '#FEF3C7', group: 'D' as const },
  ];

  const positions: Array<'GK' | 'DF' | 'MF' | 'FW'> = ['GK', 'DF', 'DF', 'MF', 'MF', 'MF', 'FW', 'FW', 'GK', 'DF', 'MF', 'FW'];
  const firstNames = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý'];
  const middleNames = ['Văn', 'Thanh', 'Minh', 'Đức', 'Quốc', 'Tuấn', 'Hải', 'Bảo', 'Thành', 'Hoàng', 'Khánh', 'Hữu'];
  const lastNames = ['An', 'Bình', 'Cường', 'Dũng', 'Đạt', 'Hiếu', 'Huy', 'Khoa', 'Long', 'Nam', 'Phong', 'Quân', 'Sơn', 'Tâm', 'Thắng', 'Việt'];

  return teamTemplates.map((t, tIndex) => {
    const players: Player[] = [];
    const usedNumbers = new Set<number>();

    for (let p = 0; p < 12; p++) {
      let num = p === 0 ? 1 : p === 1 ? 10 : p === 2 ? 7 : p + 2;
      while (usedNumbers.has(num)) num++;
      usedNumbers.add(num);

      const f = firstNames[(tIndex * 7 + p) % firstNames.length];
      const m = middleNames[(tIndex * 5 + p) % middleNames.length];
      const l = lastNames[(tIndex * 3 + p) % lastNames.length];
      const fullName = `${f} ${m} ${l}`;
      const cohortYear = t.class.substring(0, 2);
      const studentId = `${cohortYear}52${String(tIndex * 12 + p + 1).padStart(4, '0')}`;

      const isCardDemo = t.id === 'T01' && p === 6;
      const yellowCards = isCardDemo ? 2 : (tIndex + p) % 7 === 0 ? 1 : 0;
      const isSuspended = yellowCards >= 2;

      players.push({
        id: `PL-${t.id}-${p + 1}`,
        teamId: t.id,
        name: fullName,
        studentId,
        class: t.class,
        cohort: `K${cohortYear}`,
        dateOfBirth: `200${Number(cohortYear) - 18}-${String((p % 12) + 1).padStart(2, '0')}-${String((p * 2 % 28) + 1).padStart(2, '0')}`,
        jerseyNumber: num,
        position: positions[p],
        yellowCards,
        redCards: 0,
        isSuspended,
        suspensionReason: isSuspended ? 'Tích lũy đủ 02 thẻ vàng (Quy định Điều 11) - Treo giò 01 trận' : undefined,
        goals: (tIndex === 0 && p === 6) ? 3 : (tIndex % 2 === 0 && p === 4) ? 2 : 0,
        assists: (tIndex === 0 && p === 4) ? 2 : 0,
      });
    }

    return {
      id: t.id,
      name: t.name,
      shortName: t.shortName,
      logo: `⚽ ${t.shortName}`,
      class: t.class,
      department: t.dept,
      leaderName: `ThS. ${firstNames[tIndex % firstNames.length]} ${middleNames[tIndex % middleNames.length]} Hùng`,
      captainName: players[1].name,
      phoneNumber: `09${Math.floor(10000000 + Math.random() * 89999999)}`,
      email: `${t.shortName.toLowerCase().replace(/[^a-z0-9]/g, '')}@uit.edu.vn`,
      primaryColor: t.primaryColor,
      secondaryColor: t.secondaryColor,
      status: 'APPROVED',
      feeStatus: tIndex < 14 ? 'PAID' : 'UNPAID',
      registrationFee: 500000,
      depositFee: 50000,
      group: t.group,
      players,
    };
  });
};

export const generateDemoMatches = (teams: Team[]): Match[] => {
  const matches: Match[] = [];
  const groups: Array<'A' | 'B' | 'C' | 'D'> = ['A', 'B', 'C', 'D'];
  let matchNum = 1;

  const pairings = [
    [0, 1], [2, 3],
    [0, 2], [1, 3],
    [0, 3], [1, 2],
  ];

  groups.forEach((g) => {
    const groupTeams = teams.filter((t) => t.group === g);
    pairings.forEach((pair, pIdx) => {
      const homeTeam = groupTeams[pair[0]];
      const awayTeam = groupTeams[pair[1]];
      const venueId = pIdx % 3 === 0 ? 'V01' : pIdx % 3 === 1 ? 'V02' : 'V03';
      const venueName = defaultVenues.find((v) => v.id === venueId)?.name;
      const ref = defaultReferees[pIdx % defaultReferees.length];

      let status: Match['status'] = 'SCHEDULED';
      let homeScore = 0;
      let awayScore = 0;
      let currentMinute = 0;
      let half: 1 | 2 = 1;
      let completedAt: string | undefined = undefined;
      const events: Match['events'] = [];

      if (matchNum === 1 && homeTeam && awayTeam) {
        status = 'FINISHED';
        homeScore = 3;
        awayScore = 1;
        currentMinute = 40;
        half = 2;
        completedAt = new Date(Date.now() - 8 * 60 * 1000).toISOString();
        events.push(
          { id: 'E1', matchId: 'M01', type: 'GOAL', minute: 8, teamId: homeTeam.id, playerId: homeTeam.players[6].id, playerName: homeTeam.players[6].name, timestamp: '14:08' },
          { id: 'E2', matchId: 'M01', type: 'CARD', minute: 15, teamId: awayTeam.id, playerId: awayTeam.players[3].id, playerName: awayTeam.players[3].name, cardType: 'YELLOW', reason: 'Kéo người thô bạo', timestamp: '14:15' },
          { id: 'E3', matchId: 'M01', type: 'SUBSTITUTION', minute: 18, teamId: homeTeam.id, playerOutId: homeTeam.players[4].id, playerOutName: homeTeam.players[4].name, playerInId: homeTeam.players[8].id, playerInName: homeTeam.players[8].name, timestamp: '14:18' },
          { id: 'E4', matchId: 'M01', type: 'GOAL', minute: 23, teamId: awayTeam.id, playerId: awayTeam.players[6].id, playerName: awayTeam.players[6].name, timestamp: '14:28' },
          { id: 'E5', matchId: 'M01', type: 'CARD', minute: 31, teamId: homeTeam.id, playerId: homeTeam.players[6].id, playerName: homeTeam.players[6].name, cardType: 'YELLOW', reason: 'Phản ứng trọng tài', timestamp: '14:36' },
          { id: 'E6', matchId: 'M01', type: 'GOAL', minute: 35, teamId: homeTeam.id, playerId: homeTeam.players[1].id, playerName: homeTeam.players[1].name, timestamp: '14:40' },
          { id: 'E7', matchId: 'M01', type: 'GOAL', minute: 39, teamId: homeTeam.id, playerId: homeTeam.players[6].id, playerName: homeTeam.players[6].name, timestamp: '14:44' }
        );
      } else if (matchNum === 2 && homeTeam && awayTeam) {
        status = 'LIVE';
        homeScore = 2;
        awayScore = 1;
        currentMinute = 28;
        half = 2;
        events.push(
          { id: 'E21', matchId: 'M02', type: 'GOAL', minute: 12, teamId: homeTeam.id, playerId: homeTeam.players[6].id, playerName: homeTeam.players[6].name, timestamp: '15:12' },
          { id: 'E22', matchId: 'M02', type: 'CARD', minute: 19, teamId: homeTeam.id, playerId: homeTeam.players[2].id, playerName: homeTeam.players[2].name, cardType: 'YELLOW', reason: 'Vào bóng chậm', timestamp: '15:19' },
          { id: 'E23', matchId: 'M02', type: 'GOAL', minute: 22, teamId: awayTeam.id, playerId: awayTeam.players[6].id, playerName: awayTeam.players[6].name, timestamp: '15:24' },
          { id: 'E24', matchId: 'M02', type: 'GOAL', minute: 26, teamId: homeTeam.id, playerId: homeTeam.players[1].id, playerName: homeTeam.players[1].name, timestamp: '15:28' }
        );
      }

      const matchId = `M${String(matchNum).padStart(2, '0')}`;
      const hour = 7 + (matchNum % 8) * 1;
      const timeStr = `${String(hour).padStart(2, '0')}:30`;

      matches.push({
        id: matchId,
        matchNumber: matchNum,
        round: 'GROUP',
        group: g,
        roundLabel: `Bảng ${g} - Lượt ${Math.floor(pIdx / 2) + 1}`,
        venueId,
        venueName,
        date: '2026-10-15',
        time: timeStr,
        homeTeamId: homeTeam?.id || '',
        awayTeamId: awayTeam?.id || '',
        refereeId: ref.id,
        refereeName: ref.name,
        homeScore,
        awayScore,
        status,
        currentMinute,
        half,
        events,
        completedAt,
      });

      matchNum++;
    });
  });

  const knockoutTemplates: { id: string; label: string; round: Match['round'] }[] = [
    { id: 'M25', label: 'Tứ kết 1 (Nhất A vs Nhì B)', round: 'QUARTER_FINAL' },
    { id: 'M26', label: 'Tứ kết 2 (Nhất B vs Nhì A)', round: 'QUARTER_FINAL' },
    { id: 'M27', label: 'Tứ kết 3 (Nhất C vs Nhì D)', round: 'QUARTER_FINAL' },
    { id: 'M28', label: 'Tứ kết 4 (Nhất D vs Nhì C)', round: 'QUARTER_FINAL' },
    { id: 'M29', label: 'Bán kết 1 (Thắng TK1 vs Thắng TK3)', round: 'SEMI_FINAL' },
    { id: 'M30', label: 'Bán kết 2 (Thắng TK2 vs Thắng TK4)', round: 'SEMI_FINAL' },
    { id: 'M31', label: 'Tranh Hạng 3 (Thua BK1 vs Thua BK2)', round: 'THIRD_PLACE' },
    { id: 'M32', label: 'CHUNG KẾT (Thắng BK1 vs Thắng BK2)', round: 'FINAL' },
  ];

  knockoutTemplates.forEach((k, idx) => {
    matches.push({
      id: k.id,
      matchNumber: 25 + idx,
      round: k.round,
      roundLabel: k.label,
      venueId: 'V01',
      venueName: 'Sân 1 - Cỏ Nhân Tạo Ký Túc Xá',
      date: '2026-10-18',
      time: `${14 + idx}:00`,
      homeTeamId: '',
      awayTeamId: '',
      refereeId: 'REF01',
      refereeName: 'Trần Văn Hùng',
      homeScore: 0,
      awayScore: 0,
      status: 'SCHEDULED',
      currentMinute: 0,
      half: 1,
      events: [],
    });
  });

  return matches;
};

export class StorageService {
  private static isClient = typeof window !== 'undefined';

  private static getScopedKey(baseKey: string): string {
    if (!this.isClient) return baseKey;
    const activeId = this.getActiveTournamentId();
    if (!activeId || activeId === defaultTournament.id) {
      return baseKey;
    }
    return `${baseKey}_${activeId}`;
  }

  /**
   * Returns teams. Defaults to clean empty array []
   */
  static getTeams(): Team[] {
    if (!this.isClient) return [];
    const data = localStorage.getItem(this.getScopedKey(STORAGE_KEYS.TEAMS));
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  static saveTeams(teams: Team[]): void {
    if (!this.isClient) return;
    localStorage.setItem(this.getScopedKey(STORAGE_KEYS.TEAMS), JSON.stringify(teams));
  }

  /**
   * Returns matches. Defaults to clean empty array []
   */
  static getMatches(): Match[] {
    if (!this.isClient) return [];
    const data = localStorage.getItem(this.getScopedKey(STORAGE_KEYS.MATCHES));
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  static saveMatches(matches: Match[]): void {
    if (!this.isClient) return;
    localStorage.setItem(this.getScopedKey(STORAGE_KEYS.MATCHES), JSON.stringify(matches));
  }

  static getVenues(): Venue[] {
    if (!this.isClient) return defaultVenues;
    const data = localStorage.getItem(STORAGE_KEYS.VENUES);
    if (!data) {
      this.saveVenues(defaultVenues);
      return defaultVenues;
    }
    try {
      return JSON.parse(data);
    } catch {
      return defaultVenues;
    }
  }

  static saveVenues(venues: Venue[]): void {
    if (!this.isClient) return;
    localStorage.setItem(STORAGE_KEYS.VENUES, JSON.stringify(venues));
  }

  static getReferees(): Referee[] {
    if (!this.isClient) return defaultReferees;
    const data = localStorage.getItem(STORAGE_KEYS.REFEREES);
    if (!data) {
      this.saveReferees(defaultReferees);
      return defaultReferees;
    }
    try {
      return JSON.parse(data);
    } catch {
      return defaultReferees;
    }
  }

  static saveReferees(referees: Referee[]): void {
    if (!this.isClient) return;
    localStorage.setItem(STORAGE_KEYS.REFEREES, JSON.stringify(referees));
  }

  /**
   * Complaints. Defaults to clean empty array []
   */
  static getComplaints(): Complaint[] {
    if (!this.isClient) return [];
    const data = localStorage.getItem(this.getScopedKey(STORAGE_KEYS.COMPLAINTS));
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  static saveComplaints(complaints: Complaint[]): void {
    if (!this.isClient) return;
    localStorage.setItem(this.getScopedKey(STORAGE_KEYS.COMPLAINTS), JSON.stringify(complaints));
  }

  /**
   * Finances. Defaults to clean empty array []
   */
  static getFinances(): FinancialTransaction[] {
    if (!this.isClient) return [];
    const data = localStorage.getItem(this.getScopedKey(STORAGE_KEYS.FINANCES));
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  static saveFinances(finances: FinancialTransaction[]): void {
    if (!this.isClient) return;
    localStorage.setItem(this.getScopedKey(STORAGE_KEYS.FINANCES), JSON.stringify(finances));
  }

  static getAwards(): TournamentAward[] {
    if (!this.isClient) return defaultCleanAwards;
    const data = localStorage.getItem(this.getScopedKey(STORAGE_KEYS.AWARDS));
    if (!data) {
      this.saveAwards(defaultCleanAwards);
      return defaultCleanAwards;
    }
    try {
      return JSON.parse(data);
    } catch {
      return defaultCleanAwards;
    }
  }

  static saveAwards(awards: TournamentAward[]): void {
    if (!this.isClient) return;
    localStorage.setItem(this.getScopedKey(STORAGE_KEYS.AWARDS), JSON.stringify(awards));
  }

  static getAuditLogs(): AuditLog[] {
    const cleanInitLog: AuditLog[] = [
      {
        id: 'AUD-00',
        timestamp: new Date().toLocaleString('vi-VN'),
        actorName: 'Ban Quản Trị Hệ Thống',
        actorRole: 'SUPER_ADMIN',
        action: 'KHỞI TẠO CƠ SỞ DỮ LIỆU SẠCH',
        target: 'ITFTMS 2026',
        details: 'Hệ thống đã xóa toàn bộ dữ liệu mẫu và sẵn sàng tiếp nhận đăng ký đội bóng mới.',
      },
    ];

    if (!this.isClient) return cleanInitLog;
    const data = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    if (!data) {
      this.saveAuditLogs(cleanInitLog);
      return cleanInitLog;
    }
    try {
      return JSON.parse(data);
    } catch {
      return cleanInitLog;
    }
  }

  static saveAuditLogs(logs: AuditLog[]): void {
    if (!this.isClient) return;
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs));
  }

  static logAction(actorName: string, actorRole: UserRole, action: string, target: string, details: string, reason?: string): void {
    const logs = this.getAuditLogs();
    const newLog: AuditLog = {
      id: `AUD-${Date.now()}`,
      timestamp: new Date().toLocaleString('vi-VN'),
      actorName,
      actorRole,
      action,
      target,
      details,
      reason,
    };
    logs.unshift(newLog);
    this.saveAuditLogs(logs);
  }

  static getAllTournaments(): Tournament[] {
    if (!this.isClient) return initialTournamentsList;
    const data = localStorage.getItem(STORAGE_KEYS.ALL_TOURNAMENTS);
    if (!data) {
      this.saveAllTournaments(initialTournamentsList);
      return initialTournamentsList;
    }
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
      return initialTournamentsList;
    } catch {
      return initialTournamentsList;
    }
  }

  static saveAllTournaments(list: Tournament[]): void {
    if (!this.isClient) return;
    localStorage.setItem(STORAGE_KEYS.ALL_TOURNAMENTS, JSON.stringify(list));
  }

  static getActiveTournamentId(): string {
    if (!this.isClient) return defaultTournament.id;
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_TOURNAMENT_ID) || defaultTournament.id;
  }

  static setActiveTournamentId(id: string): void {
    if (!this.isClient) return;
    localStorage.setItem(STORAGE_KEYS.ACTIVE_TOURNAMENT_ID, id);
    const tour = this.getAllTournaments().find((t) => t.id === id);
    if (tour) {
      localStorage.setItem(STORAGE_KEYS.TOURNAMENT, JSON.stringify(tour));
    }
  }

  static getTournament(): Tournament {
    if (!this.isClient) return defaultTournament;
    const activeId = this.getActiveTournamentId();
    const all = this.getAllTournaments();
    const found = all.find((t) => t.id === activeId);
    if (found) return found;

    const data = localStorage.getItem(STORAGE_KEYS.TOURNAMENT);
    if (data) {
      try {
        return JSON.parse(data);
      } catch {
        return defaultTournament;
      }
    }
    return defaultTournament;
  }

  static saveTournament(tournament: Tournament): void {
    if (!this.isClient) return;
    localStorage.setItem(STORAGE_KEYS.TOURNAMENT, JSON.stringify(tournament));
    const all = this.getAllTournaments();
    const idx = all.findIndex((t) => t.id === tournament.id);
    if (idx >= 0) {
      all[idx] = tournament;
    } else {
      all.unshift(tournament);
    }
    this.saveAllTournaments(all);
  }

  static updateTournament(tournament: Tournament): void {
    this.saveTournament(tournament);
    this.logAction(
      'Ban Tổ Chức',
      'ORGANIZER',
      'CẬP NHẬT CẤU HÌNH GIẢI ĐẤU',
      tournament.name,
      `Cấu hình: ${tournament.numberOfGroups || 4} bảng đấu, ${tournament.teamsPerGroup || 4} đội/bảng, tối đa ${tournament.maxTeams || 16} đội.`
    );
  }

  static deleteTournament(id: string): void {
    if (!this.isClient) return;
    let all = this.getAllTournaments();
    all = all.filter((t) => t.id !== id);
    if (all.length === 0) {
      all = [defaultTournament];
    }
    this.saveAllTournaments(all);
    if (this.getActiveTournamentId() === id) {
      this.setActiveTournamentId(all[0].id);
    }
    this.logAction(
      'Ban Tổ Chức',
      'SUPER_ADMIN',
      'XÓA GIẢI ĐẤU',
      `Giải ID: ${id}`,
      `Đã xóa giải đấu khỏi danh sách hệ thống`
    );
  }

  static getTournamentStats(tournamentId: string): { teamsCount: number; matchesCount: number } {
    if (!this.isClient) return { teamsCount: 0, matchesCount: 0 };
    const teamKey = tournamentId === defaultTournament.id ? STORAGE_KEYS.TEAMS : `${STORAGE_KEYS.TEAMS}_${tournamentId}`;
    const matchKey = tournamentId === defaultTournament.id ? STORAGE_KEYS.MATCHES : `${STORAGE_KEYS.MATCHES}_${tournamentId}`;
    try {
      const teams = JSON.parse(localStorage.getItem(teamKey) || '[]');
      const matches = JSON.parse(localStorage.getItem(matchKey) || '[]');
      return {
        teamsCount: Array.isArray(teams) ? teams.length : 0,
        matchesCount: Array.isArray(matches) ? matches.length : 0,
      };
    } catch {
      return { teamsCount: 0, matchesCount: 0 };
    }
  }

  static saveTournamentStatsCache(tournamentId: string, teams: Team[], matches: Match[]): void {
    if (!this.isClient) return;
    const teamKey = tournamentId === defaultTournament.id ? STORAGE_KEYS.TEAMS : `${STORAGE_KEYS.TEAMS}_${tournamentId}`;
    const matchKey = tournamentId === defaultTournament.id ? STORAGE_KEYS.MATCHES : `${STORAGE_KEYS.MATCHES}_${tournamentId}`;
    localStorage.setItem(teamKey, JSON.stringify(teams));
    localStorage.setItem(matchKey, JSON.stringify(matches));
  }

  static createNewTournament(tournament: Tournament, preloadDemoTeams: boolean = false): void {
    if (!this.isClient) return;
    
    // Save to all tournaments list and set as active
    const all = this.getAllTournaments();
    const existingIndex = all.findIndex((t) => t.id === tournament.id);
    if (existingIndex >= 0) {
      all[existingIndex] = tournament;
    } else {
      all.unshift(tournament);
    }
    this.saveAllTournaments(all);
    this.setActiveTournamentId(tournament.id);

    this.saveTournament(tournament);
    this.setTournamentStatus(tournament.status || 'REGISTRATION');
    this.saveComplaints([]);
    this.saveFinances([]);
    this.saveAwards(defaultCleanAwards);

    if (preloadDemoTeams) {
      const demo = this.loadDemoData();
      this.saveTeams(demo.teams);
      this.saveMatches(demo.matches);
    } else {
      this.saveTeams([]);
      this.saveMatches([]);
    }

    this.logAction(
      'Ban Tổ Chức',
      'SUPER_ADMIN',
      'TẠO MỚI GIẢI ĐẤU (CREATE TOURNAMENT)',
      tournament.name,
      `Khởi tạo giải đấu: ${tournament.name} (${tournament.shortCode}), Thể thức: ${tournament.format}, Khởi tranh: ${tournament.startDate}`
    );
  }

  static getTournamentStatus(): TournamentStatus {
    if (!this.isClient) return 'REGISTRATION';
    const key = this.getScopedKey(STORAGE_KEYS.STATUS);
    return (localStorage.getItem(key) as TournamentStatus) || 'REGISTRATION';
  }

  static setTournamentStatus(status: TournamentStatus): void {
    if (!this.isClient) return;
    const key = this.getScopedKey(STORAGE_KEYS.STATUS);
    localStorage.setItem(key, status);
  }

  static getCurrentRole(): UserRole {
    if (!this.isClient) return 'ORGANIZER';
    return (localStorage.getItem(STORAGE_KEYS.CURRENT_ROLE) as UserRole) || 'ORGANIZER';
  }

  static setCurrentRole(role: UserRole): void {
    if (!this.isClient) return;
    localStorage.setItem(STORAGE_KEYS.CURRENT_ROLE, role);
  }

  /**
   * Clears ALL mock and transactional data, creating a clean empty slate!
   */
  static clearAllData(): void {
    if (!this.isClient) return;
    this.saveTeams([]);
    this.saveMatches([]);
    this.saveComplaints([]);
    this.saveFinances([]);
    this.saveAwards(defaultCleanAwards);
    this.setTournamentStatus('REGISTRATION');

    const cleanLog: AuditLog[] = [
      {
        id: `AUD-${Date.now()}`,
        timestamp: new Date().toLocaleString('vi-VN'),
        actorName: 'Ban Tổ Chức',
        actorRole: 'SUPER_ADMIN',
        action: 'XÓA TOÀN BỘ DỮ LIỆU MẪU (CLEAN DATABASE)',
        target: 'Toàn Hệ Thống ITFTMS 2026',
        details: 'Đã xóa trắng danh sách đội bóng, lịch thi đấu, tỷ số, khiếu nại và thu chi.',
      },
    ];
    this.saveAuditLogs(cleanLog);
  }

  /**
   * Loads realistic 16-team demo data for testing and demonstration purposes.
   */
  static loadDemoData(): { teams: Team[]; matches: Match[]; finances: FinancialTransaction[]; complaints: Complaint[] } {
    const demoTeams = generateDemoTeams();
    const demoMatches = generateDemoMatches(demoTeams);
    const demoFinances: FinancialTransaction[] = [
      { id: 'FIN-01', type: 'INCOME', category: 'REGISTRATION_FEE', categoryName: 'Lệ phí đăng ký (16 đội × 500k)', amount: 8000000, date: '2026-10-01', description: 'Thu lệ phí đăng ký giải 16 đội bóng khoa CNTT', recipientOrPayer: 'Đại diện 16 Đội bóng' },
      { id: 'FIN-02', type: 'INCOME', category: 'DEPOSIT', categoryName: 'Tiền ký quỹ (16 đội × 50k)', amount: 800000, date: '2026-10-01', description: 'Thu tiền ký quỹ chấp hành điều lệ giải', recipientOrPayer: 'Đại diện 16 Đội bóng' },
      { id: 'FIN-03', type: 'INCOME', category: 'SPONSORSHIP', categoryName: 'Tài trợ vàng', amount: 15000000, date: '2026-10-03', description: 'Tài trợ từ Cty Công nghệ VNG & FPT Software', recipientOrPayer: 'Nhà tài trợ VNG Cloud' },
      { id: 'FIN-04', type: 'INCOME', category: 'SPONSORSHIP', categoryName: 'Hỗ trợ Đoàn Khoa CNTT', amount: 5000000, date: '2026-10-04', description: 'Kinh phí hỗ trợ phong trào thể thao từ BCH Đoàn Khoa', recipientOrPayer: 'Đoàn - Hội Khoa CNTT' },
      { id: 'FIN-05', type: 'EXPENSE', category: 'VENUE_RENTAL', categoryName: 'Thuê sân thi đấu', amount: 6400000, date: '2026-10-05', description: 'Thuê 3 cụm sân cỏ nhân tạo cho 32 trận đấu', recipientOrPayer: 'Ban Quản Lý Sân Cỏ ĐHQG' },
      { id: 'FIN-06', type: 'EXPENSE', category: 'REFEREE', categoryName: 'Bồi dưỡng trọng tài', amount: 4800000, date: '2026-10-05', description: 'Thù lao tổ trọng tài chuyên nghiệp điều hành 32 trận', recipientOrPayer: 'Tổ Trọng Tài Thành Phố' },
      { id: 'FIN-07', type: 'EXPENSE', category: 'TROPHY_MEDALS', categoryName: 'Cúp, Cờ & Huy chương', amount: 3500000, date: '2026-10-06', description: 'Bộ Cúp mạ vàng, 60 huy chương Vàng-Bạc-Đồng và cờ lưu niệm', recipientOrPayer: 'Xưởng Cúp Pha Lê Tân Bình' },
      { id: 'FIN-08', type: 'EXPENSE', category: 'BANNER_PRINT', categoryName: 'In ấn & Backdrop', amount: 1800000, date: '2026-10-07', description: 'Backdrop khai mạc, bế mạc, băng rôn cổ động', recipientOrPayer: 'Nhà in Sinh Viên' },
      { id: 'FIN-09', type: 'EXPENSE', category: 'WATER_MEDICAL', categoryName: 'Nước uống & Y tế', amount: 1500000, date: '2026-10-08', description: 'Thùng nước khoáng, bình xịt lạnh giảm đau, bông băng y tế', recipientOrPayer: 'Tổ Hậu Cần & Y Tế' },
      { id: 'FIN-10', type: 'EXPENSE', category: 'PRIZES', categoryName: 'Cơ cấu giải thưởng', amount: 8000000, date: '2026-10-18', description: 'Tiền thưởng: Nhất 4tr, Nhì 2.5tr, Ba 1.5tr, Vua phá lưới 500k...', recipientOrPayer: 'Các đội & Cá nhân đạt giải' },
    ];
    const demoComplaints: Complaint[] = [
      {
        id: 'CMP-01',
        matchId: 'M01',
        teamId: 'T02',
        teamName: 'Kỹ Thuật Phần Mềm K21',
        submittedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        expiresAt: new Date(Date.now() + 7 * 60 * 1000).toISOString(),
        type: 'REFEREE_DECISION',
        title: 'Khiếu nại tình huống thẻ vàng phút 15',
        content: 'Đội trưởng KTPM khiếu nại pha va chạm phút 15 của cầu thủ mang áo số 4 là tranh bóng hợp lệ, đề nghị BTC xem lại băng ghi hình.',
        evidenceUrls: ['https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=500'],
        status: 'UNDER_REVIEW',
      },
    ];

    if (this.isClient) {
      this.saveTeams(demoTeams);
      this.saveMatches(demoMatches);
      this.saveFinances(demoFinances);
      this.saveComplaints(demoComplaints);
      this.setTournamentStatus('GROUP_STAGE');

      this.logAction(
        'Ban Quản Trị',
        'SUPER_ADMIN',
        'NẠP DỮ LIỆU MẪU (LOAD DEMO DATA)',
        '16 Đội bóng & 32 Trận',
        'Đã nạp 16 đội bóng chính thức, 192 cầu thủ, lịch thi đấu và quỹ tài chính.'
      );
    }

    return { teams: demoTeams, matches: demoMatches, finances: demoFinances, complaints: demoComplaints };
  }
}
