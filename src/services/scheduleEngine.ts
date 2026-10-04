// ITFTMS 2026 - Schedule Generator Engine
// Specification: Section 18
// Pitch constraint: 3 venues (Sân 1, Sân 2, Sân 3)
// Operating hours: 06:30 - 17:00
// Conflict checks: No pitch collision, no time overlap, no team playing 2 matches simultaneously, minimum rest interval.

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

export class ScheduleEngine {
  /**
   * Generates a collision-free 24-match group stage schedule.
   * Distributes 8 matches per matchday across 3 pitches (07:30, 09:00, 15:00).
   */
  static generateGroupSchedule(
    teams: Team[],
    venues: Venue[],
    referees: Referee[],
    startDate: string = '2026-10-15'
  ): Match[] {
    const groups: Array<'A' | 'B' | 'C' | 'D'> = ['A', 'B', 'C', 'D'];
    const activeVenues = venues.filter((v) => v.status !== 'MAINTENANCE');
    const availableReferees = referees.filter((r) => r.status !== 'INACTIVE');

    if (activeVenues.length === 0) {
      throw new Error('Không có sân bóng khả dụng để lập lịch thi đấu.');
    }

    // 4 teams per group -> 3 rounds of 2 matches = 6 matches per group
    // Team indices: 0, 1, 2, 3
    // Round 1 (Lượt 1): 0 vs 1, 2 vs 3
    // Round 2 (Lượt 2): 0 vs 2, 1 vs 3
    // Round 3 (Lượt 3): 0 vs 3, 1 vs 2
    const roundPairings = [
      { roundIdx: 1, pairs: [[0, 1], [2, 3]] },
      { roundIdx: 2, pairs: [[0, 2], [1, 3]] },
      { roundIdx: 3, pairs: [[0, 3], [1, 2]] },
    ];

    // Standard synchronized time slots for 5-a-side matches (40 min + 5 min break + buffer):
    // Ca 1: 07:30 (Sân 1, Sân 2, Sân 3) -> 3 trận
    // Ca 2: 09:00 (Sân 1, Sân 2, Sân 3) -> 3 trận
    // Ca 3: 15:00 (Sân 1, Sân 2)        -> 2 trận
    // Tổng = 8 trận/ngày, tương ứng đúng 8 trận của mỗi lượt đấu vòng bảng!
    const dailyScheduleSlots = [
      { time: '07:30', venueIndex: 0 },
      { time: '07:30', venueIndex: 1 },
      { time: '07:30', venueIndex: 2 },
      { time: '09:00', venueIndex: 0 },
      { time: '09:00', venueIndex: 1 },
      { time: '09:00', venueIndex: 2 },
      { time: '15:00', venueIndex: 0 },
      { time: '15:00', venueIndex: 1 },
    ];

    const generatedMatches: Match[] = [];
    let matchCounter = 1;

    // Distribute rounds across 3 matchdays (Day 0, Day 1, Day 2)
    roundPairings.forEach((r, dayOffset) => {
      const dateStr = addDaysToDate(startDate, dayOffset);
      let slotIdx = 0;

      // Group order for this round
      groups.forEach((g) => {
        const groupTeams = teams.filter((t) => t.group === g);
        if (groupTeams.length < 4) return;

        r.pairs.forEach((pair) => {
          const home = groupTeams[pair[0]];
          const away = groupTeams[pair[1]];

          const slotConfig = dailyScheduleSlots[slotIdx % dailyScheduleSlots.length];
          const venue = activeVenues[slotConfig.venueIndex % activeVenues.length];
          const time = slotConfig.time;
          const referee = availableReferees[(matchCounter - 1) % availableReferees.length];

          const matchId = `M${String(matchCounter).padStart(2, '0')}`;

          generatedMatches.push({
            id: matchId,
            matchNumber: matchCounter,
            round: 'GROUP',
            group: g,
            roundLabel: `Bảng ${g} - Lượt ${r.roundIdx}`,
            venueId: venue.id,
            venueName: venue.name,
            date: dateStr,
            time,
            homeTeamId: home?.id || '',
            awayTeamId: away?.id || '',
            refereeId: referee?.id || 'REF01',
            refereeName: referee?.name || 'Trọng tài BTC',
            homeScore: 0,
            awayScore: 0,
            status: 'SCHEDULED',
            currentMinute: 0,
            half: 1,
            events: [],
          });

          matchCounter++;
          slotIdx++;
        });
      });
    });

    return generatedMatches;
  }

  /**
   * Generates synchronized knockout stage schedule (Quarterfinals, Semifinals, 3rd Place, Final).
   */
  static generateKnockoutSchedule(
    venues: Venue[],
    referees: Referee[],
    startDate: string = '2026-10-15'
  ): Match[] {
    const v1 = venues[0] || { id: 'V01', name: 'Sân 1 - Cỏ Nhân Tạo Ký Túc Xá' };
    const v2 = venues[1] || v1;
    const ref = referees[0] || { id: 'REF01', name: 'Trần Văn Hùng' };

    // Tứ kết: Day 4 (cách 1 ngày nghỉ hồi phục sau vòng bảng)
    const qfDate = addDaysToDate(startDate, 4);
    // Bán kết: Day 6 (cách 1 ngày nghỉ sau tứ kết)
    const sfDate = addDaysToDate(startDate, 6);
    // Chung kết & Tranh hạng 3: Day 8 (bế mạc giải)
    const finalDate = addDaysToDate(startDate, 8);

    const knockoutSlots: {
      id: string;
      matchNumber: number;
      round: MatchRound;
      label: string;
      date: string;
      time: string;
      venueId: string;
      venueName: string;
    }[] = [
      // 4 Quarterfinals (2 ca sáng)
      { id: 'M25', matchNumber: 25, round: 'QUARTER_FINAL', label: 'Tứ kết 1 (Nhất A vs Nhì B)', date: qfDate, time: '08:00', venueId: v1.id, venueName: v1.name },
      { id: 'M26', matchNumber: 26, round: 'QUARTER_FINAL', label: 'Tứ kết 2 (Nhất B vs Nhì A)', date: qfDate, time: '08:00', venueId: v2.id, venueName: v2.name },
      { id: 'M27', matchNumber: 27, round: 'QUARTER_FINAL', label: 'Tứ kết 3 (Nhất C vs Nhì D)', date: qfDate, time: '09:30', venueId: v1.id, venueName: v1.name },
      { id: 'M28', matchNumber: 28, round: 'QUARTER_FINAL', label: 'Tứ kết 4 (Nhất D vs Nhì C)', date: qfDate, time: '09:30', venueId: v2.id, venueName: v2.name },
      // 2 Semifinals (1 ca chiều)
      { id: 'M29', matchNumber: 29, round: 'SEMI_FINAL', label: 'Bán kết 1 (Thắng TK1 vs Thắng TK3)', date: sfDate, time: '15:00', venueId: v1.id, venueName: v1.name },
      { id: 'M30', matchNumber: 30, round: 'SEMI_FINAL', label: 'Bán kết 2 (Thắng TK2 vs Thắng TK4)', date: sfDate, time: '15:00', venueId: v2.id, venueName: v2.name },
      // Tranh Hạng 3 & Chung Kết (Sân chính V01)
      { id: 'M31', matchNumber: 31, round: 'THIRD_PLACE', label: 'Tranh Hạng 3 (Thua BK1 vs Thua BK2)', date: finalDate, time: '14:30', venueId: v1.id, venueName: v1.name },
      { id: 'M32', matchNumber: 32, round: 'FINAL', label: 'CHUNG KẾT VÔ ĐỊCH (Thắng BK1 vs Thắng BK2)', date: finalDate, time: '16:00', venueId: v1.id, venueName: v1.name },
    ];

    return knockoutSlots.map((k, idx) => ({
      id: k.id,
      matchNumber: k.matchNumber,
      round: k.round,
      roundLabel: k.label,
      venueId: k.venueId,
      venueName: k.venueName,
      date: k.date,
      time: k.time,
      homeTeamId: '',
      awayTeamId: '',
      refereeId: referees[idx % referees.length]?.id || ref.id,
      refereeName: referees[idx % referees.length]?.name || ref.name,
      homeScore: 0,
      awayScore: 0,
      status: 'SCHEDULED' as const,
      currentMinute: 0,
      half: 1 as const,
      events: [],
    }));
  }

  /**
   * Generates a completely synchronized full tournament schedule (32 matches).
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
        roundLabel: m.roundLabel || template.roundLabel,
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

