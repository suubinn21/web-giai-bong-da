// ITFTMS 2026 - Schedule Generator Engine
// Specification: Section 18
// Pitch constraint: 3 venues (Sân 1, Sân 2, Sân 3)
// Operating hours: 07:00 - 18:15
// Conflict checks: No pitch collision, no time overlap, no team playing 2 matches simultaneously, minimum rest interval.

import { Team, Venue, Referee, Match, MatchRound } from '@/types';

/**
 * Migration map shifting old 06:30 schedule slots to 07:00 start (+30 mins)
 */
export const TIME_MIGRATION_MAP: Record<string, string> = {
  '06:30': '07:00',
  '07:20': '07:50',
  '08:10': '08:40',
  '09:00': '09:30',
  '09:50': '10:20',
  '10:40': '11:10',
  '11:30': '12:00',
  '12:20': '12:50',
  '13:50': '14:20',
  '14:40': '15:10',
  '15:35': '16:05',
  '16:30': '17:00',
};

export const migrateMatchTimesTo7AM = (matches: Match[]): { matches: Match[]; migrated: boolean } => {
  let migrated = false;
  const updated = matches.map((m) => {
    if (m.time && TIME_MIGRATION_MAP[m.time]) {
      migrated = true;
      return { ...m, time: TIME_MIGRATION_MAP[m.time] };
    }
    return m;
  });
  return { matches: updated, migrated };
};

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

export class ScheduleEngine {
  /**
   * Generates collision-free 24-match group stage schedule for 16 teams / 4 groups / 3 pitches in 1 single day.
   * Specification timetable: 07:00 - 13:40 across 8 synchronized time slots (bắt đầu lúc 7:00 sáng).
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

    // Standard 3 pitches
    const v1 = activeVenues[0] || venues[0];
    const v2 = activeVenues[1] || activeVenues[0] || venues[1];
    const v3 = activeVenues[2] || activeVenues[0] || venues[2];
    const pitchVenues = [v1, v2, v3];

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

    // Quy ước theo yêu cầu BTC (Bắt đầu lúc 07:00):
    // Slot 1 (07:00): Sân 1 (A1-A4), Sân 2 (A2-A3), Sân 3 (B1-B4)
    // Slot 2 (07:50): Sân 1 (B2-B3), Sân 2 (C1-C4), Sân 3 (C2-C3)
    // Slot 3 (08:40): Sân 1 (D1-D4), Sân 2 (D2-D3), Sân 3 (A1-A3)
    // Slot 4 (09:30): Sân 1 (A4-A2), Sân 2 (B1-B3), Sân 3 (B4-B2)
    // Slot 5 (10:20): Sân 1 (C1-C3), Sân 2 (C4-C2), Sân 3 (D1-D3)
    // Slot 6 (11:10): Sân 1 (D4-D2), Sân 2 (A1-A2), Sân 3 (A3-A4)
    // Slot 7 (12:00): Sân 1 (B1-B2), Sân 2 (B3-B4), Sân 3 (C1-C2)
    // Slot 8 (12:50): Sân 1 (C3-C4), Sân 2 (D1-D2), Sân 3 (D3-D4)
    const scheduleSlots: {
      time: string;
      venueIdx: number;
      group: 'A' | 'B' | 'C' | 'D';
      homeIdx: number;
      awayIdx: number;
      label: string;
    }[] = [
      // 07:00 – 07:50 (Ca 1)
      { time: '07:00', venueIdx: 0, group: 'A', homeIdx: 0, awayIdx: 3, label: 'Bảng A - Lượt 1 (A1 - A4)' },
      { time: '07:00', venueIdx: 1, group: 'A', homeIdx: 1, awayIdx: 2, label: 'Bảng A - Lượt 1 (A2 - A3)' },
      { time: '07:00', venueIdx: 2, group: 'B', homeIdx: 0, awayIdx: 3, label: 'Bảng B - Lượt 1 (B1 - B4)' },

      // 07:50 – 08:40 (Ca 2)
      { time: '07:50', venueIdx: 0, group: 'B', homeIdx: 1, awayIdx: 2, label: 'Bảng B - Lượt 1 (B2 - B3)' },
      { time: '07:50', venueIdx: 1, group: 'C', homeIdx: 0, awayIdx: 3, label: 'Bảng C - Lượt 1 (C1 - C4)' },
      { time: '07:50', venueIdx: 2, group: 'C', homeIdx: 1, awayIdx: 2, label: 'Bảng C - Lượt 1 (C2 - C3)' },

      // 08:40 – 09:30 (Ca 3)
      { time: '08:40', venueIdx: 0, group: 'D', homeIdx: 0, awayIdx: 3, label: 'Bảng D - Lượt 1 (D1 - D4)' },
      { time: '08:40', venueIdx: 1, group: 'D', homeIdx: 1, awayIdx: 2, label: 'Bảng D - Lượt 1 (D2 - D3)' },
      { time: '08:40', venueIdx: 2, group: 'A', homeIdx: 0, awayIdx: 2, label: 'Bảng A - Lượt 2 (A1 - A3)' },

      // 09:30 – 10:20 (Ca 4)
      { time: '09:30', venueIdx: 0, group: 'A', homeIdx: 3, awayIdx: 1, label: 'Bảng A - Lượt 2 (A4 - A2)' },
      { time: '09:30', venueIdx: 1, group: 'B', homeIdx: 0, awayIdx: 2, label: 'Bảng B - Lượt 2 (B1 - B3)' },
      { time: '09:30', venueIdx: 2, group: 'B', homeIdx: 3, awayIdx: 1, label: 'Bảng B - Lượt 2 (B4 - B2)' },

      // 10:20 – 11:10 (Ca 5)
      { time: '10:20', venueIdx: 0, group: 'C', homeIdx: 0, awayIdx: 2, label: 'Bảng C - Lượt 2 (C1 - C3)' },
      { time: '10:20', venueIdx: 1, group: 'C', homeIdx: 3, awayIdx: 1, label: 'Bảng C - Lượt 2 (C4 - C2)' },
      { time: '10:20', venueIdx: 2, group: 'D', homeIdx: 0, awayIdx: 2, label: 'Bảng D - Lượt 2 (D1 - D3)' },

      // 11:10 – 12:00 (Ca 6)
      { time: '11:10', venueIdx: 0, group: 'D', homeIdx: 3, awayIdx: 1, label: 'Bảng D - Lượt 2 (D4 - D2)' },
      { time: '11:10', venueIdx: 1, group: 'A', homeIdx: 0, awayIdx: 1, label: 'Bảng A - Lượt 3 (A1 - A2)' },
      { time: '11:10', venueIdx: 2, group: 'A', homeIdx: 2, awayIdx: 3, label: 'Bảng A - Lượt 3 (A3 - A4)' },

      // 12:00 – 12:50 (Ca 7)
      { time: '12:00', venueIdx: 0, group: 'B', homeIdx: 0, awayIdx: 1, label: 'Bảng B - Lượt 3 (B1 - B2)' },
      { time: '12:00', venueIdx: 1, group: 'B', homeIdx: 2, awayIdx: 3, label: 'Bảng B - Lượt 3 (B3 - B4)' },
      { time: '12:00', venueIdx: 2, group: 'C', homeIdx: 0, awayIdx: 1, label: 'Bảng C - Lượt 3 (C1 - C2)' },

      // 12:50 – 13:40 (Ca 8)
      { time: '12:50', venueIdx: 0, group: 'C', homeIdx: 2, awayIdx: 3, label: 'Bảng C - Lượt 3 (C3 - C4)' },
      { time: '12:50', venueIdx: 1, group: 'D', homeIdx: 0, awayIdx: 1, label: 'Bảng D - Lượt 3 (D1 - D2)' },
      { time: '12:50', venueIdx: 2, group: 'D', homeIdx: 2, awayIdx: 3, label: 'Bảng D - Lượt 3 (D3 - D4)' },
    ];

    const generatedMatches: Match[] = [];

    scheduleSlots.forEach((slot, index) => {
      const matchNumber = index + 1;
      const home = getGroupTeam(slot.group, slot.homeIdx);
      const away = getGroupTeam(slot.group, slot.awayIdx);
      const venue = pitchVenues[slot.venueIdx % pitchVenues.length];
      const referee = availableReferees.length > 0
        ? availableReferees[slot.venueIdx % availableReferees.length]
        : { id: 'REF01', name: 'Trọng tài BTC' };

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
   * - 13:40 - 14:20: Nghỉ trưa & tổng hợp kết quả (BXH 4 bảng, chỉ số phụ)
   * - 14:20 - 15:05: Tứ kết 1 & Tứ kết 2 (Nhánh A-B, nghỉ từ 12:00)
   * - 15:10 - 15:55: Tứ kết 3 & Tứ kết 4 (Nhánh C-D, nghỉ từ 13:40)
   * - 16:05 - 16:50: Bán kết 1 & Bán kết 2 song song (Sân 1, Sân 2)
   * - 17:00 - 17:45: Tranh Hạng 3 (Sân 2) & CHUNG KẾT VÔ ĐỊCH (Sân 1)
   * - 17:45 - 18:15: Lễ Trao Giải & Bế Mạc
   */
  static generateKnockoutSchedule(
    venues: Venue[],
    referees: Referee[],
    startDate: string = '2026-10-15'
  ): Match[] {
    const v1 = venues[0] || { id: 'V01', name: 'Sân 1 - Cỏ Nhân Tạo Ký Túc Xá' };
    const v2 = venues[1] || v1;
    const availableReferees = referees.filter((r) => r.status !== 'INACTIVE');
    const ref1 = availableReferees[0] || { id: 'REF01', name: 'Trần Văn Hùng' };
    const ref2 = availableReferees[1] || ref1;

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
      // 14:20 – 15:05: 2 Tứ kết nhánh A-B (đã nghỉ từ 12:00 trưa)
      { id: 'M25', matchNumber: 25, round: 'QUARTER_FINAL', label: 'Tứ kết 1 (Nhất A vs Nhì B)', time: '14:20', venueId: v1.id, venueName: v1.name, referee: ref1 },
      { id: 'M26', matchNumber: 26, round: 'QUARTER_FINAL', label: 'Tứ kết 2 (Nhất B vs Nhì A)', time: '14:20', venueId: v2.id, venueName: v2.name, referee: ref2 },

      // 15:10 – 15:55: 2 Tứ kết nhánh C-D (kết thúc vòng bảng lúc 13:40, nghỉ đến 15:10)
      { id: 'M27', matchNumber: 27, round: 'QUARTER_FINAL', label: 'Tứ kết 3 (Nhất C vs Nhì D)', time: '15:10', venueId: v1.id, venueName: v1.name, referee: ref1 },
      { id: 'M28', matchNumber: 28, round: 'QUARTER_FINAL', label: 'Tứ kết 4 (Nhất D vs Nhì C)', time: '15:10', venueId: v2.id, venueName: v2.name, referee: ref2 },

      // 16:05 – 16:50: 2 trận Bán kết song song
      { id: 'M29', matchNumber: 29, round: 'SEMI_FINAL', label: 'Bán kết 1 (Thắng TK1 vs Thắng TK3)', time: '16:05', venueId: v1.id, venueName: v1.name, referee: ref1 },
      { id: 'M30', matchNumber: 30, round: 'SEMI_FINAL', label: 'Bán kết 2 (Thắng TK2 vs Thắng TK4)', time: '16:05', venueId: v2.id, venueName: v2.name, referee: ref2 },

      // 17:00 – 17:45: Tranh Hạng 3 & Chung Kết Vô Địch song song
      { id: 'M31', matchNumber: 31, round: 'THIRD_PLACE', label: 'Tranh Hạng 3 (Thua BK1 vs Thua BK2)', time: '17:00', venueId: v2.id, venueName: v2.name, referee: ref2 },
      { id: 'M32', matchNumber: 32, round: 'FINAL', label: 'CHUNG KẾT VÔ ĐỊCH (Thắng BK1 vs Thắng BK2)', time: '17:00', venueId: v1.id, venueName: v1.name, referee: ref1 },
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
   * Generates a completely synchronized full tournament schedule (32 matches in 1 day).
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
   * Synchronizes all existing matches' dates and times with a target startDate while keeping scores & events intact.
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
      return {
        ...m,
        date: template.date,
        time: template.time,
        venueId: m.venueId || template.venueId,
        venueName: m.venueName || template.venueName,
        roundLabel: template.roundLabel || m.roundLabel,
        homeTeamId: m.homeTeamId || template.homeTeamId,
        awayTeamId: m.awayTeamId || template.awayTeamId,
      };
    });
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

