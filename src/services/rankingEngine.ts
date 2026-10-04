// ITFTMS 2026 - Ranking Engine (Business Logic Engine)
// Specification: Sections 9, 10, 13
// Win = 3, Draw = 1, Loss = 0.
// Tie-breaking: Goal Difference -> Goals Scored -> Head-to-Head -> Flag ⚠️ CẦN BTC XÁC NHẬN

import { Team, Match, GroupStanding } from '@/types';
import { StorageService } from './storage';

export class RankingEngine {
  /**
   * Computes the standings table for a specific group or all groups.
   */
  static calculateGroupStandings(group: string, teams: Team[], matches: Match[]): GroupStanding[] {
    const groupTeams = teams.filter((t) => t.group === group);
    const groupMatches = matches.filter(
      (m) => m.group === group && (m.status === 'FINISHED' || m.status === 'LIVE')
    );

    // Initialize standings map
    const map = new Map<string, GroupStanding>();
    groupTeams.forEach((t) => {
      map.set(t.id, {
        teamId: t.id,
        teamName: t.name,
        shortName: t.shortName,
        logo: t.logo,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0,
        rank: 1,
        isWithdrawn: t.status === 'WITHDRAWN' || t.status === 'DISQUALIFIED',
      });
    });

    // Check for withdrawn teams in the group (Rule #13)
    const withdrawnTeams = groupTeams.filter(
      (t) => t.status === 'WITHDRAWN' || t.status === 'DISQUALIFIED'
    );

    // Apply match results
    groupMatches.forEach((m) => {
      const home = map.get(m.homeTeamId);
      const away = map.get(m.awayTeamId);
      if (!home || !away) return;

      home.played += 1;
      away.played += 1;

      home.goalsFor += m.homeScore;
      home.goalsAgainst += m.awayScore;
      away.goalsFor += m.awayScore;
      away.goalsAgainst += m.homeScore;

      if (m.homeScore > m.awayScore) {
        home.won += 1;
        home.points += 3;
        away.lost += 1;
      } else if (m.homeScore < m.awayScore) {
        away.won += 1;
        away.points += 3;
        home.lost += 1;
      } else {
        home.drawn += 1;
        home.points += 1;
        away.drawn += 1;
        away.points += 1;
      }
    });

    // Rule 13: Các đội cùng bảng được cộng 3 điểm khi xử lý trường hợp đội bỏ cuộc
    if (withdrawnTeams.length > 0) {
      withdrawnTeams.forEach((wTeam) => {
        groupTeams.forEach((t) => {
          if (t.id !== wTeam.id) {
            const entry = map.get(t.id);
            if (entry) {
              // Award 3 points and default 3-0 goal bonus if not already played
              entry.points += 3;
              entry.goalsFor += 3;
            }
          }
        });
      });
    }

    // Calculate goal difference
    map.forEach((item) => {
      item.goalDifference = item.goalsFor - item.goalsAgainst;
    });

    // Sort teams using ranking criteria
    const sorted = Array.from(map.values()).sort((a, b) => {
      // Withdrawn teams always at the bottom
      if (a.isWithdrawn && !b.isWithdrawn) return 1;
      if (!a.isWithdrawn && b.isWithdrawn) return -1;

      // 1. Points
      if (b.points !== a.points) return b.points - a.points;

      // 2. Goal Difference (+/-)
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;

      // 3. Goals Scored (BT) - "Kiểm tra số bàn thắng"
      if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;

      // 4. Head-to-Head
      const h2h = groupMatches.find(
        (m) =>
          (m.homeTeamId === a.teamId && m.awayTeamId === b.teamId) ||
          (m.homeTeamId === b.teamId && m.awayTeamId === a.teamId)
      );
      if (h2h && h2h.status === 'FINISHED') {
        if (h2h.homeTeamId === a.teamId && h2h.homeScore !== h2h.awayScore) {
          return h2h.awayScore - h2h.homeScore;
        }
        if (h2h.homeTeamId === b.teamId && h2h.homeScore !== h2h.awayScore) {
          return h2h.homeScore - h2h.awayScore;
        }
      }

      return 0;
    });

    // Check for identical tie-breaker that requires BTC confirmation
    for (let i = 0; i < sorted.length - 1; i++) {
      const cur = sorted[i];
      const nxt = sorted[i + 1];

      if (
        !cur.isWithdrawn &&
        !nxt.isWithdrawn &&
        cur.points === nxt.points &&
        cur.goalDifference === nxt.goalDifference &&
        cur.goalsFor === nxt.goalsFor
      ) {
        // Tied identically! Mark as needing BTC confirmation
        cur.needsBtcTieBreak = true;
        nxt.needsBtcTieBreak = true;
      }
    }

    // Assign final ranks
    sorted.forEach((item, index) => {
      item.rank = index + 1;
    });

    return sorted;
  }

  /**
   * Resolves manual tie break by BTC and writes to Audit Log
   */
  static resolveTieBreak(
    group: string,
    winnerTeamId: string,
    loserTeamId: string,
    reason: string,
    organizerName: string
  ): void {
    const teams = StorageService.getTeams();
    const winner = teams.find((t) => t.id === winnerTeamId);
    const loser = teams.find((t) => t.id === loserTeamId);

    StorageService.logAction(
      organizerName,
      'ORGANIZER',
      'XÁC NHẬN THỨ HẠNG BẰNG ĐIỂM (TIE-BREAK)',
      `Bảng ${group}`,
      `BTC quyết định xếp hạng: ${winner?.name || winnerTeamId} xếp trên ${loser?.name || loserTeamId}`,
      reason || 'BTC quyết định theo biên bản bốc thăm phụ / chỉ số fair-play.'
    );
  }
}
