// ITFTMS 2026 - Schedule Generator Engine
// Specification: Section 18
// Pitch constraint: 3 venues (Sân 1, Sân 2, Sân 3)
// Operating hours: 06:30 - 17:00
// Conflict checks: No pitch collision, no time overlap, no team playing 2 matches simultaneously, minimum rest interval.

import { Team, Venue, Referee, Match } from '@/types';
import { StorageService } from './storage';

export class ScheduleEngine {
  /**
   * Generates a collision-free 24-match group stage schedule.
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
    // Round 1: 0 vs 1, 2 vs 3
    // Round 2: 0 vs 2, 1 vs 3
    // Round 3: 0 vs 3, 1 vs 2
    const roundPairings = [
      { roundIdx: 1, pairs: [[0, 1], [2, 3]] },
      { roundIdx: 2, pairs: [[0, 2], [1, 3]] },
      { roundIdx: 3, pairs: [[0, 3], [1, 2]] },
    ];

    // Time slots available between 06:30 and 17:00
    // Each 5-a-side match is 40 min play + 5 min break + 15 min buffer = 60 mins slot
    const timeSlots = [
      '07:00', '08:15', '09:30', '10:45',
      '14:00', '15:15', '16:30'
    ];

    const generatedMatches: Match[] = [];
    let matchCounter = 1;

    // We can distribute the rounds across 3 matchdays
    roundPairings.forEach((r, dayOffset) => {
      // Calculate matchday date
      const dateObj = new Date(startDate);
      dateObj.setDate(dateObj.getDate() + dayOffset);
      const dateStr = dateObj.toISOString().split('T')[0];

      let slotIndex = 0;
      let venueIndex = 0;

      // Group order for this round
      groups.forEach((g) => {
        const groupTeams = teams.filter((t) => t.group === g);
        if (groupTeams.length < 4) return;

        r.pairs.forEach((pair) => {
          const home = groupTeams[pair[0]];
          const away = groupTeams[pair[1]];

          const venue = activeVenues[venueIndex % activeVenues.length];
          const time = timeSlots[slotIndex % timeSlots.length];
          const referee = availableReferees[(matchCounter - 1) % availableReferees.length];

          const matchId = `M${String(matchCounter).padStart(2, '0')}`;

          generatedMatches.push({
            id: matchId,
            matchNumber: matchCounter,
            round: 'GROUP',
            group: g,
            roundLabel: `Bảng ${g} - Vòng ${r.roundIdx}`,
            venueId: venue.id,
            venueName: venue.name,
            date: dateStr,
            time,
            homeTeamId: home.id,
            awayTeamId: away.id,
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
          venueIndex++;
          if (venueIndex % activeVenues.length === 0) {
            slotIndex++;
          }
        });
      });
    });

    return generatedMatches;
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
