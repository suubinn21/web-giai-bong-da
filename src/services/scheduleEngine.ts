// ITFTMS 2026 - Schedule Generator Engine
// Thể thức thi đấu: Trọn gói trong 1 ngày duy nhất (06:30 – 18:00)
// Sân bãi: 4 sân thi đấu đồng thời (Sân 1, Sân 2, Sân 3, Sân 4)
// Vòng bảng: 24 trận từ 06:30 đến 10:30 (6 lượt x 4 sân, mỗi trận 40 phút)
// Vòng knock-out: 15:00 – 17:35 (20 phút/hiệp + nghỉ 5 phút = 45 phút/trận)
//  - 15:00 – 15:45: Tứ kết 1-4 trên 4 sân
//  - 15:45 – 15:55: Nghỉ 10 phút
//  - 15:55 – 16:40: Bán kết 1-2 trên 2 sân
//  - 16:40 – 16:50: Nghỉ 10 phút
//  - 16:50 – 17:35: Tranh hạng 3 (Sân 1) & Chung kết (Sân 2)

import { Team, Venue, Referee, Match, MatchRound } from '@/types';

/**
 * Adds days to a YYYY-MM-DD date string safely without timezone offset shifts.
 */
export const addDaysToDate = (startDateStr: string, days: number): string => {
  if (!startDateStr || !startDateStr.includes('-')) return startDateStr || '2026-10-15';
  const parts = startDateStr.split('-').map(Number);
  const year = parts[0];
  const month = parts[1] - 1;
  const day = parts[2];
  const d = new Date(year, month, day + days);
  const yStr = d.getFullYear();
  const mStr = String(d.getMonth() + 1).padStart(2, '0');
  const dStr = String(d.getDate()).padStart(2, '0');
  return `${yStr}-${mStr}-${dStr}`;
};

/**
 * Legacy migration helper maintaining backward compatibility.
 */
export const migrateMatchTimesTo7AM = (matches: Match[]): { matches: Match[]; migrated: boolean } => {
  return ScheduleEngine.migrateMatchesToSingleDay4Pitches(matches, [], [], []);
};

export class ScheduleEngine {
  /**
   * Generates collision-free 24-match group stage schedule for 16 teams / 4 groups / 4 pitches in 1 single day.
   * Timetable: 06:30 - 10:30 across 6 synchronized rounds (40 mins/match, 4 pitches).
   * Lượt 1: 06:30–07:10 | Sân 1 (A1-A2), Sân 2 (A3-A4), Sân 3 (B1-B2), Sân 4 (B3-B4)
   * Lượt 2: 07:10–07:50 | Sân 1 (C1-C2), Sân 2 (D1-D2), Sân 3 (C3-C4), Sân 4 (D3-D4)
   * Lượt 3: 07:50–08:30 | Sân 1 (B1-B3), Sân 2 (A1-A3), Sân 3 (A2-A4), Sân 4 (B2-B4)
   * Lượt 4: 08:30–09:10 | Sân 1 (C1-C3), Sân 2 (D1-D3), Sân 3 (C2-C4), Sân 4 (D2-D4)
   * Lượt 5: 09:10–09:50 | Sân 1 (A1-A4), Sân 2 (B2-B3), Sân 3 (A2-A3), Sân 4 (B1-B4)
   * Lượt 6: 09:50–10:30 | Sân 1 (C1-C4), Sân 2 (C2-C3), Sân 3 (D1-D4), Sân 4 (D2-D3)
   */
  static generateGroupSchedule(
    teams: Team[],
    venues: Venue[],
    referees: Referee[],
    startDate: string = '2026-10-15'
  ): Match[] {
    const activeVenues = venues.filter((v) => v.status !== 'MAINTENANCE');
    const availableReferees = referees.filter((r) => r.status !== 'INACTIVE');

    if (activeVenues.length === 0) {
      throw new Error('Không có sân bóng khả dụng để lập lịch thi đấu.');
    }

    // Chuẩn 4 sân thi đấu
    const v1 = activeVenues[0] || venues[0];
    const v2 = activeVenues[1] || activeVenues[0] || venues[1];
    const v3 = activeVenues[2] || activeVenues[0] || venues[2];
    const v4 = activeVenues[3] || activeVenues[0] || venues[3] || venues[0];
    const pitchVenues = [v1, v2, v3, v4];

    const groupTeamsA = teams.filter((t) => t.group === 'A');
    const groupTeamsB = teams.filter((t) => t.group === 'B');
    const groupTeamsC = teams.filter((t) => t.group === 'C');
    const groupTeamsD = teams.filter((t) => t.group === 'D');

    const getGroupTeam = (group: 'A' | 'B' | 'C' | 'D', idx: number): Team | undefined => {
      if (group === 'A') return groupTeamsA[idx];
      if (group === 'B') return groupTeamsB[idx];
      if (group === 'C') return groupTeamsC[idx];
      return groupTeamsD[idx];
    };

    const scheduleSlots: {
      time: string;
      venueIdx: number;
      group: 'A' | 'B' | 'C' | 'D';
      homeIdx: number;
      awayIdx: number;
      label: string;
    }[] = [
      // Lượt 1: 06:30 – 07:10 (4 sân)
      { time: '06:30', venueIdx: 0, group: 'A', homeIdx: 0, awayIdx: 1, label: 'Bảng A - Lượt 1 (A1 - A2)' },
      { time: '06:30', venueIdx: 1, group: 'A', homeIdx: 2, awayIdx: 3, label: 'Bảng A - Lượt 1 (A3 - A4)' },
      { time: '06:30', venueIdx: 2, group: 'B', homeIdx: 0, awayIdx: 1, label: 'Bảng B - Lượt 1 (B1 - B2)' },
      { time: '06:30', venueIdx: 3, group: 'B', homeIdx: 2, awayIdx: 3, label: 'Bảng B - Lượt 1 (B3 - B4)' },

      // Lượt 2: 07:10 – 07:50 (4 sân)
      { time: '07:10', venueIdx: 0, group: 'C', homeIdx: 0, awayIdx: 1, label: 'Bảng C - Lượt 1 (C1 - C2)' },
      { time: '07:10', venueIdx: 1, group: 'D', homeIdx: 0, awayIdx: 1, label: 'Bảng D - Lượt 1 (D1 - D2)' },
      { time: '07:10', venueIdx: 2, group: 'C', homeIdx: 2, awayIdx: 3, label: 'Bảng C - Lượt 1 (C3 - C4)' },
      { time: '07:10', venueIdx: 3, group: 'D', homeIdx: 2, awayIdx: 3, label: 'Bảng D - Lượt 1 (D3 - D4)' },

      // Lượt 3: 07:50 – 08:30 (4 sân)
      { time: '07:50', venueIdx: 0, group: 'B', homeIdx: 0, awayIdx: 2, label: 'Bảng B - Lượt 2 (B1 - B3)' },
      { time: '07:50', venueIdx: 1, group: 'A', homeIdx: 0, awayIdx: 2, label: 'Bảng A - Lượt 2 (A1 - A3)' },
      { time: '07:50', venueIdx: 2, group: 'A', homeIdx: 1, awayIdx: 3, label: 'Bảng A - Lượt 2 (A2 - A4)' },
      { time: '07:50', venueIdx: 3, group: 'B', homeIdx: 1, awayIdx: 3, label: 'Bảng B - Lượt 2 (B2 - B4)' },

      // Lượt 4: 08:30 – 09:10 (4 sân)
      { time: '08:30', venueIdx: 0, group: 'C', homeIdx: 0, awayIdx: 2, label: 'Bảng C - Lượt 2 (C1 - C3)' },
      { time: '08:30', venueIdx: 1, group: 'D', homeIdx: 0, awayIdx: 2, label: 'Bảng D - Lượt 2 (D1 - D3)' },
      { time: '08:30', venueIdx: 2, group: 'C', homeIdx: 1, awayIdx: 3, label: 'Bảng C - Lượt 2 (C2 - C4)' },
      { time: '08:30', venueIdx: 3, group: 'D', homeIdx: 1, awayIdx: 3, label: 'Bảng D - Lượt 2 (D2 - D4)' },

      // Lượt 5: 09:10 – 09:50 (4 sân)
      { time: '09:10', venueIdx: 0, group: 'A', homeIdx: 0, awayIdx: 3, label: 'Bảng A - Lượt 3 (A1 - A4)' },
      { time: '09:10', venueIdx: 1, group: 'B', homeIdx: 1, awayIdx: 2, label: 'Bảng B - Lượt 3 (B2 - B3)' },
      { time: '09:10', venueIdx: 2, group: 'A', homeIdx: 1, awayIdx: 2, label: 'Bảng A - Lượt 3 (A2 - A3)' },
      { time: '09:10', venueIdx: 3, group: 'B', homeIdx: 0, awayIdx: 3, label: 'Bảng B - Lượt 3 (B1 - B4)' },

      // Lượt 6: 09:50 – 10:30 (4 sân)
      { time: '09:50', venueIdx: 0, group: 'C', homeIdx: 0, awayIdx: 3, label: 'Bảng C - Lượt 3 (C1 - C4)' },
      { time: '09:50', venueIdx: 1, group: 'C', homeIdx: 1, awayIdx: 2, label: 'Bảng C - Lượt 3 (C2 - C3)' },
      { time: '09:50', venueIdx: 2, group: 'D', homeIdx: 0, awayIdx: 3, label: 'Bảng D - Lượt 3 (D1 - D4)' },
      { time: '09:50', venueIdx: 3, group: 'D', homeIdx: 1, awayIdx: 2, label: 'Bảng D - Lượt 3 (D2 - D3)' },
    ];

    const generatedMatches: Match[] = [];

    scheduleSlots.forEach((slot, index) => {
      const matchNumber = index + 1;
      const home = getGroupTeam(slot.group, slot.homeIdx);
      const away = getGroupTeam(slot.group, slot.awayIdx);
      const venue = pitchVenues[slot.venueIdx % pitchVenues.length];
      const referee = availableReferees.length > 0
        ? availableReferees[slot.venueIdx % availableReferees.length]
        : { id: `REF0${(slot.venueIdx % 4) + 1}`, name: `Trọng tài Sân ${(slot.venueIdx % 4) + 1}` };

      const matchId = `M${String(matchNumber).padStart(2, '0')}`;

      generatedMatches.push({
        id: matchId,
        matchNumber,
        round: 'GROUP',
        group: slot.group,
        roundLabel: slot.label,
        venueId: venue.id,
        venueName: venue.name,
        date: startDate,
        time: slot.time,
        homeTeamId: home?.id || '',
        awayTeamId: away?.id || '',
        refereeId: referee.id,
        refereeName: referee.name,
        homeScore: 0,
        awayScore: 0,
        status: 'SCHEDULED',
        currentMinute: 0,
        half: 1,
        events: [],
      });
    });

    return generatedMatches;
  }

  /**
   * Generates synchronized single-day knockout stage schedule:
   * - 10:30 - 15:00: Nghỉ trưa & tổng hợp kết quả (BXH 4 bảng, chỉ số phụ)
   * - 15:00 - 15:45: Tứ kết 1-4 trên 4 sân đồng thời (45 phút/trận)
   * - 15:45 - 15:55: Nghỉ 10 phút, chuẩn bị bán kết
   * - 15:55 - 16:40: Bán kết 1 & Bán kết 2 song song trên 2 sân (45 phút/trận)
   * - 16:40 - 16:50: Nghỉ 10 phút, chuẩn bị chung kết & tranh 3
   * - 16:50 - 17:35: Tranh Hạng 3 (Sân 1) & CHUNG KẾT VÔ ĐỊCH (Sân 2)
   * - 17:35 - 18:15: Lễ Bế Mạc & Trao Cúp Vô Địch
   */
  static generateKnockoutSchedule(
    venues: Venue[],
    referees: Referee[],
    startDate: string = '2026-10-15'
  ): Match[] {
    const v1 = venues[0] || { id: 'V01', name: 'Sân 1 - Cỏ Nhân Tạo Ký Túc Xá' };
    const v2 = venues[1] || v1;
    const v3 = venues[2] || v1;
    const v4 = venues[3] || v2;

    const availableReferees = referees.filter((r) => r.status !== 'INACTIVE');
    const ref1 = availableReferees[0] || { id: 'REF01', name: 'Trần Văn Hùng' };
    const ref2 = availableReferees[1] || ref1;
    const ref3 = availableReferees[2] || ref1;
    const ref4 = availableReferees[3] || ref2;

    const knockoutSlots: {
      id: string;
      matchNumber: number;
      round: MatchRound;
      label: string;
      time: string;
      venueId: string;
      venueName: string;
      referee: { id: string; name: string };
    }[] = [
      // 15:00 – 15:45: 4 trận Tứ kết thi đấu đồng thời trên 4 sân
      { id: 'M25', matchNumber: 25, round: 'QUARTER_FINAL', label: 'Tứ kết 1 (Nhất A vs Nhì B)', time: '15:00', venueId: v1.id, venueName: v1.name, referee: ref1 },
      { id: 'M26', matchNumber: 26, round: 'QUARTER_FINAL', label: 'Tứ kết 2 (Nhất B vs Nhì A)', time: '15:00', venueId: v2.id, venueName: v2.name, referee: ref2 },
      { id: 'M27', matchNumber: 27, round: 'QUARTER_FINAL', label: 'Tứ kết 3 (Nhất C vs Nhì D)', time: '15:00', venueId: v3.id, venueName: v3.name, referee: ref3 },
      { id: 'M28', matchNumber: 28, round: 'QUARTER_FINAL', label: 'Tứ kết 4 (Nhất D vs Nhì C)', time: '15:00', venueId: v4.id, venueName: v4.name, referee: ref4 },

      // 15:55 – 16:40: 2 trận Bán kết song song trên 2 sân
      { id: 'M29', matchNumber: 29, round: 'SEMI_FINAL', label: 'Bán kết 1 (Thắng TK1 vs Thắng TK3)', time: '15:55', venueId: v1.id, venueName: v1.name, referee: ref1 },
      { id: 'M30', matchNumber: 30, round: 'SEMI_FINAL', label: 'Bán kết 2 (Thắng TK2 vs Thắng TK4)', time: '15:55', venueId: v2.id, venueName: v2.name, referee: ref2 },

      // 16:50 – 17:35: Tranh Hạng 3 (Sân 1) & Chung Kết Vô Địch (Sân 2)
      { id: 'M31', matchNumber: 31, round: 'THIRD_PLACE', label: 'Tranh Hạng 3 (Thua BK1 vs Thua BK2)', time: '16:50', venueId: v1.id, venueName: v1.name, referee: ref1 },
      { id: 'M32', matchNumber: 32, round: 'FINAL', label: 'CHUNG KẾT VÔ ĐỊCH (Thắng BK1 vs Thắng BK2)', time: '16:50', venueId: v2.id, venueName: v2.name, referee: ref2 },
    ];

    return knockoutSlots.map((k) => ({
      id: k.id,
      matchNumber: k.matchNumber,
      round: k.round,
      roundLabel: k.label,
      venueId: k.venueId,
      venueName: k.venueName,
      date: startDate,
      time: k.time,
      homeTeamId: '',
      awayTeamId: '',
      refereeId: k.referee.id,
      refereeName: k.referee.name,
      homeScore: 0,
      awayScore: 0,
      status: 'SCHEDULED' as const,
      currentMinute: 0,
      half: 1 as const,
      events: [],
    }));
  }

  /**
   * Generates a completely synchronized full tournament schedule (32 matches in 1 day on 4 pitches).
   */
  static generateFullTournamentSchedule(
    teams: Team[],
    venues: Venue[],
    referees: Referee[],
    startDate: string = '2026-10-15'
  ): Match[] {
    const groups = this.generateGroupSchedule(teams, venues, referees, startDate);
    const knockouts = this.generateKnockoutSchedule(venues, referees, startDate);
    return [...groups, ...knockouts];
  }

  /**
   * Synchronizes all existing matches' dates, times, and venues with a target startDate while keeping scores & events intact.
   */
  static synchronizeMatchTimes(
    existingMatches: Match[],
    teams: Team[],
    venues: Venue[],
    referees: Referee[],
    targetStartDate: string = '2026-10-15'
  ): Match[] {
    const templateMatches = this.generateFullTournamentSchedule(teams, venues, referees, targetStartDate);
    const templateMap = new Map(templateMatches.map((m) => [m.id, m]));

    return existingMatches.map((m) => {
      const template = templateMap.get(m.id);
      if (!template) return m;
      const isGroup = m.round === 'GROUP';
      return {
        ...m,
        date: template.date,
        time: template.time,
        venueId: template.venueId,
        venueName: template.venueName,
        roundLabel: template.roundLabel || m.roundLabel,
        group: template.group || m.group,
        homeTeamId: m.isCustomMatchup ? m.homeTeamId : (isGroup ? (template.homeTeamId || m.homeTeamId) : m.homeTeamId),
        awayTeamId: m.isCustomMatchup ? m.awayTeamId : (isGroup ? (template.awayTeamId || m.awayTeamId) : m.awayTeamId),
        refereeId: m.refereeId || template.refereeId,
        refereeName: m.refereeName || template.refereeName,
      };
    });
  }

  /**
   * Tự động di chuyển (migrate) toàn bộ các trận đấu sang mô hình 1 ngày trên 4 sân chuẩn mới nhất
   */
  static migrateMatchesToSingleDay4Pitches(
    existingMatches: Match[],
    teams: Team[],
    venues: Venue[],
    referees: Referee[],
    targetStartDate: string = '2026-10-15'
  ): { matches: Match[]; migrated: boolean } {
    if (!existingMatches || existingMatches.length === 0) {
      return { matches: [], migrated: false };
    }

    const migrationKey = 'itftms_schedule_4pitches_v2026_applied';
    const isApplied = typeof window !== 'undefined' ? localStorage.getItem(migrationKey) : null;

    // Kiểm tra nếu còn bất kỳ trận nào theo lịch cũ (ví dụ M01 lúc 07:00, M25 lúc 14:20 hoặc Sân 1/Sân 2)
    const needsMigration =
      !isApplied ||
      existingMatches.some(
        (m) =>
          (m.id === 'M01' && m.time !== '06:30') ||
          (m.id === 'M02' && m.time !== '06:30') ||
          (m.id === 'M04' && m.time !== '06:30') ||
          (m.id === 'M25' && m.time !== '15:00') ||
          (m.id === 'M27' && (m.time !== '15:00' || !m.venueName?.includes('Sân 3'))) ||
          (m.id === 'M28' && (m.time !== '15:00' || !m.venueName?.includes('Sân 4'))) ||
          (m.id === 'M29' && m.time !== '15:55') ||
          (m.id === 'M31' && (m.time !== '16:50' || !m.venueName?.includes('Sân 1'))) ||
          (m.id === 'M32' && (m.time !== '16:50' || !m.venueName?.includes('Sân 2')))
      );

    if (!needsMigration) {
      return { matches: existingMatches, migrated: false };
    }

    const migratedMatches = this.synchronizeMatchTimes(
      existingMatches,
      teams,
      venues,
      referees,
      targetStartDate
    );

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(migrationKey, 'true');
      } catch {}
    }

    return { matches: migratedMatches, migrated: true };
  }

  /**
   * Validates schedule integrity: no venue overlap, no simultaneous team matches.
   */
  static validateSchedule(matches: Match[]): { valid: boolean; conflicts: string[] } {
    const conflicts: string[] = [];

    for (let i = 0; i < matches.length; i++) {
      for (let j = i + 1; j < matches.length; j++) {
        const m1 = matches[i];
        const m2 = matches[j];

        if (m1.date === m2.date && m1.time === m2.time) {
          // Check venue conflict
          if (m1.venueId === m2.venueId) {
            conflicts.push(
              `Trùng sân: Trận #${m1.matchNumber} và Trận #${m2.matchNumber} cùng diễn ra tại ${m1.venueName} lúc ${m1.time} ngày ${m1.date}`
            );
          }
          // Check team conflict
          const teams1 = [m1.homeTeamId, m1.awayTeamId].filter(Boolean);
          const teams2 = [m2.homeTeamId, m2.awayTeamId].filter(Boolean);
          const overlapTeam = teams1.find((t) => teams2.includes(t));
          if (overlapTeam) {
            conflicts.push(
              `Trùng đội: Đội ${overlapTeam} bị xếp đá 2 trận cùng lúc (#${m1.matchNumber} & #${m2.matchNumber}) lúc ${m1.time} ngày ${m1.date}`
            );
          }
          // Check referee conflict
          if (m1.refereeId && m2.refereeId && m1.refereeId === m2.refereeId) {
            conflicts.push(
              `Trùng trọng tài: ${m1.refereeName} bị xếp bắt 2 trận cùng lúc (${m1.id} & ${m2.id}) lúc ${m1.time}`
            );
          }
        }
      }
    }

    return {
      valid: conflicts.length === 0,
      conflicts,
    };
  }
}
