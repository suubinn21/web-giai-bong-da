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

  /**
   * Tính toán và tìm danh sách cầu thủ xuất sắc nhất dựa trên điểm số bàn thắng vòng Knock-out
   * (Tứ kết, Bán kết, Tranh hạng 3, Chung kết)
   */
  static getKnockoutBestPlayers(matches: Match[], teams: Team[]): KnockoutPlayerScorer[] {
    const knockoutRounds = new Set(['QUARTER_FINAL', 'SEMI_FINAL', 'THIRD_PLACE', 'FINAL']);
    const knockoutMatchIds = new Set(['M25', 'M26', 'M27', 'M28', 'M29', 'M30', 'M31', 'M32']);

    // 1. Lọc tất cả các trận đấu thuộc vòng Knock-out
    const knockoutMatches = (matches || []).filter((m) => {
      if (knockoutRounds.has(m.round)) return true;
      if (knockoutMatchIds.has(m.id)) return true;
      const lbl = (m.roundLabel || '').toLowerCase();
      return (
        lbl.includes('tứ kết') ||
        lbl.includes('bán kết') ||
        lbl.includes('chung kết') ||
        lbl.includes('tranh hạng 3')
      );
    });

    const playerMap = new Map<string, KnockoutPlayerScorer>();

    // 2. Thu thập bàn thắng và kiến tạo từ các sự kiện trận đấu vòng Knockout
    knockoutMatches.forEach((m) => {
      const homeTeam = teams.find((t) => t.id === m.homeTeamId);
      const awayTeam = teams.find((t) => t.id === m.awayTeamId);

      const roundLower = (m.roundLabel || m.round || '').toLowerCase();
      const isQuarter = m.round === 'QUARTER_FINAL' || roundLower.includes('tứ kết') || ['M25', 'M26', 'M27', 'M28'].includes(m.id);
      const isSemi = m.round === 'SEMI_FINAL' || roundLower.includes('bán kết') || ['M29', 'M30'].includes(m.id);
      const isFinal = m.round === 'FINAL' || roundLower.includes('chung kết') || m.id === 'M32';
      const isThirdPlace = m.round === 'THIRD_PLACE' || roundLower.includes('hạng 3') || m.id === 'M31';

      (m.events || []).forEach((ev) => {
        // Ghi nhận bàn thắng hợp lệ (không tính phản lưới nhà)
        if (ev.type === 'GOAL' && !ev.isOwnGoal && ev.playerId) {
          const pId = ev.playerId;
          const scoringTeam = ev.teamId === m.homeTeamId ? homeTeam : awayTeam;
          const defendingTeam = ev.teamId === m.homeTeamId ? awayTeam : homeTeam;
          const playerObj = scoringTeam?.players.find((p) => p.id === pId);

          if (!playerMap.has(pId)) {
            playerMap.set(pId, {
              playerId: pId,
              playerName: ev.playerName || playerObj?.name || 'Cầu thủ',
              jerseyNumber: playerObj?.jerseyNumber,
              teamId: ev.teamId,
              teamName: scoringTeam?.name || 'Đội bóng',
              avatarUrl: playerObj?.avatarUrl,
              cohort: playerObj?.cohort,
              class: playerObj?.class,
              knockoutGoals: 0,
              quarterGoals: 0,
              semiGoals: 0,
              finalGoals: 0,
              thirdPlaceGoals: 0,
              knockoutAssists: 0,
              totalGoalsAllStages: playerObj?.goals || 0,
              matchesPlayed: 1,
              points: 0,
              rank: 1,
              goalsBreakdown: [],
            });
          }

          const entry = playerMap.get(pId)!;
          entry.knockoutGoals += 1;

          if (isQuarter) entry.quarterGoals += 1;
          else if (isSemi) entry.semiGoals += 1;
          else if (isFinal) entry.finalGoals += 1;
          else if (isThirdPlace) entry.thirdPlaceGoals += 1;

          entry.goalsBreakdown.push({
            matchId: m.id,
            roundLabel: m.roundLabel || (isFinal ? 'Chung Kết' : isSemi ? 'Bán Kết' : isQuarter ? 'Tứ Kết' : 'Tranh Hạng 3'),
            minute: ev.minute,
            againstTeamName: defendingTeam?.name,
          });
        }

        // Ghi nhận kiến tạo vòng Knockout
        if (ev.type === 'GOAL' && ev.assistPlayerId) {
          const aId = ev.assistPlayerId;
          const assistTeam = ev.teamId === m.homeTeamId ? homeTeam : awayTeam;
          const assistPlayer = assistTeam?.players.find((p) => p.id === aId);

          if (!playerMap.has(aId)) {
            playerMap.set(aId, {
              playerId: aId,
              playerName: ev.assistPlayerName || assistPlayer?.name || 'Cầu thủ',
              jerseyNumber: assistPlayer?.jerseyNumber,
              teamId: ev.teamId,
              teamName: assistTeam?.name || 'Đội bóng',
              avatarUrl: assistPlayer?.avatarUrl,
              cohort: assistPlayer?.cohort,
              class: assistPlayer?.class,
              knockoutGoals: 0,
              quarterGoals: 0,
              semiGoals: 0,
              finalGoals: 0,
              thirdPlaceGoals: 0,
              knockoutAssists: 0,
              totalGoalsAllStages: assistPlayer?.goals || 0,
              matchesPlayed: 1,
              points: 0,
              rank: 1,
              goalsBreakdown: [],
            });
          }

          const entry = playerMap.get(aId)!;
          entry.knockoutAssists += 1;
        }
      });
    });

    // 3. Quy đổi điểm số phong độ và xếp hạng:
    // - Mỗi bàn thắng vòng Knockout = 10 điểm
    // - Bàn thắng trận Chung kết: +5 điểm thưởng (Bonus)
    // - Bàn thắng trận Bán kết: +3 điểm thưởng (Bonus)
    // - Mỗi đường kiến tạo vòng Knockout: +4 điểm
    const scoredList = Array.from(playerMap.values()).map((p) => {
      const points =
        p.knockoutGoals * 10 +
        p.finalGoals * 5 +
        p.semiGoals * 3 +
        p.knockoutAssists * 4;
      return { ...p, points };
    });

    // 4. Sắp xếp thứ hạng:
    // Tiêu chí 1: Số bàn thắng vòng Knockout nhiều nhất
    // Tiêu chí 2: Điểm số phong độ cao nhất
    // Tiêu chí 3: Số bàn thắng ở Chung kết > Bán kết > Tứ kết
    // Tiêu chí 4: Số đường kiến tạo
    // Tiêu chí 5: Tổng số bàn thắng toàn giải
    scoredList.sort((a, b) => {
      if (b.knockoutGoals !== a.knockoutGoals) return b.knockoutGoals - a.knockoutGoals;
      if (b.points !== a.points) return b.points - a.points;
      if (b.finalGoals !== a.finalGoals) return b.finalGoals - a.finalGoals;
      if (b.semiGoals !== a.semiGoals) return b.semiGoals - a.semiGoals;
      if (b.knockoutAssists !== a.knockoutAssists) return b.knockoutAssists - a.knockoutAssists;
      return b.totalGoalsAllStages - a.totalGoalsAllStages;
    });

    scoredList.forEach((p, idx) => {
      p.rank = idx + 1;
    });

    return scoredList;
  }

  /**
   * Lấy ngay Cầu thủ xuất sắc nhất (MVP) vòng Knock-out
   */
  static getKnockoutMvp(matches: Match[], teams: Team[]): KnockoutPlayerScorer | null {
    const list = this.getKnockoutBestPlayers(matches, teams);
    return list.length > 0 && list[0].knockoutGoals > 0 ? list[0] : null;
  }
}

export interface KnockoutPlayerScorer {
  playerId: string;
  playerName: string;
  jerseyNumber?: number;
  teamId: string;
  teamName: string;
  avatarUrl?: string;
  cohort?: string;
  class?: string;
  knockoutGoals: number;      // Bàn thắng vòng Knock-out
  quarterGoals: number;       // Bàn Tứ kết
  semiGoals: number;          // Bàn Bán kết
  finalGoals: number;         // Bàn Chung kết
  thirdPlaceGoals: number;    // Bàn Tranh hạng 3
  knockoutAssists: number;    // Kiến tạo vòng Knock-out
  totalGoalsAllStages: number;// Tổng bàn toàn giải
  matchesPlayed: number;
  points: number;             // Điểm số quy đổi
  rank: number;
  goalsBreakdown: Array<{
    matchId: string;
    roundLabel: string;
    minute: number;
    againstTeamName?: string;
  }>;
}
