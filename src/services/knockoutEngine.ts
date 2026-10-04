// ITFTMS 2026 - Knockout Bracket Engine
// Specification: Sections 5, 8, 22
// Quarter-Finals: 1A vs 2B, 1B vs 2A, 1C vs 2D, 1D vs 2C
// Semi-Finals: Win TK1 vs Win TK3, Win TK2 vs Win TK4
// Final: Win BK1 vs Win BK2 | 3rd Place: Lose BK1 vs Lose BK2
// Penalty Shootout 6m for draws in knockout stages.

import { Team, Match, GroupStanding } from '@/types';
import { RankingEngine } from './rankingEngine';
import { StorageService } from './storage';

export interface BracketNode {
  id: string; // e.g., 'TK1', 'TK2', 'TK3', 'TK4', 'BK1', 'BK2', 'THIRD_PLACE', 'FINAL'
  label: string;
  round: 'QUARTER_FINAL' | 'SEMI_FINAL' | 'THIRD_PLACE' | 'FINAL';
  matchId: string;
  match?: Match;
  homeTeamName: string;
  awayTeamName: string;
  homeScore?: number;
  awayScore?: number;
  homePenalty?: number;
  awayPenalty?: number;
  winnerTeamId?: string;
  status: Match['status'];
  date: string;
  time: string;
  venueName: string;
  placeholderHome: string;
  placeholderAway: string;
}

export class KnockoutEngine {
  /**
   * Syncs and generates knockout fixtures based on current group stage standings.
   */
  static generateOrUpdateBracket(teams: Team[], matches: Match[]): Match[] {
    const updatedMatches = [...matches];

    // Compute standings for all groups
    const standingsA = RankingEngine.calculateGroupStandings('A', teams, matches);
    const standingsB = RankingEngine.calculateGroupStandings('B', teams, matches);
    const standingsC = RankingEngine.calculateGroupStandings('C', teams, matches);
    const standingsD = RankingEngine.calculateGroupStandings('D', teams, matches);

    const team1A = standingsA[0]?.teamId;
    const team2A = standingsA[1]?.teamId;
    const team1B = standingsB[0]?.teamId;
    const team2B = standingsB[1]?.teamId;
    const team1C = standingsC[0]?.teamId;
    const team2C = standingsC[1]?.teamId;
    const team1D = standingsD[0]?.teamId;
    const team2D = standingsD[1]?.teamId;

    // Helper to find or create match
    const getMatch = (matchId: string): Match | undefined => updatedMatches.find((m) => m.id === matchId);

    // 1. Quarter Finals
    // TK1: Nhất A vs Nhì B (Match 25)
    const m25 = getMatch('M25');
    if (m25) {
      if (team1A) m25.homeTeamId = team1A;
      if (team2B) m25.awayTeamId = team2B;
    }

    // TK2: Nhất B vs Nhì A (Match 26)
    const m26 = getMatch('M26');
    if (m26) {
      if (team1B) m26.homeTeamId = team1B;
      if (team2A) m26.awayTeamId = team2A;
    }

    // TK3: Nhất C vs Nhì D (Match 27)
    const m27 = getMatch('M27');
    if (m27) {
      if (team1C) m27.homeTeamId = team1C;
      if (team2D) m27.awayTeamId = team2D;
    }

    // TK4: Nhất D vs Nhì C (Match 28)
    const m28 = getMatch('M28');
    if (m28) {
      if (team1D) m28.homeTeamId = team1D;
      if (team2C) m28.awayTeamId = team2C;
    }

    // Helper for knockout match winner
    const getWinnerId = (m?: Match): string | undefined => {
      if (!m || m.status !== 'FINISHED') return undefined;
      if (m.winnerTeamId) return m.winnerTeamId;
      if (m.homeScore > m.awayScore) return m.homeTeamId;
      if (m.awayScore > m.homeScore) return m.awayTeamId;
      if (m.penaltyShootout) {
        return m.penaltyShootout.homeScore > m.penaltyShootout.awayScore ? m.homeTeamId : m.awayTeamId;
      }
      return undefined;
    };

    const getLoserId = (m?: Match): string | undefined => {
      if (!m || m.status !== 'FINISHED') return undefined;
      const winner = getWinnerId(m);
      if (!winner) return undefined;
      return m.homeTeamId === winner ? m.awayTeamId : m.homeTeamId;
    };

    // 2. Semi Finals
    // BK1: Win TK1 vs Win TK3 (Match 29)
    const m29 = getMatch('M29');
    const winTK1 = getWinnerId(m25);
    const winTK3 = getWinnerId(m27);
    if (m29) {
      if (winTK1) m29.homeTeamId = winTK1;
      if (winTK3) m29.awayTeamId = winTK3;
    }

    // BK2: Win TK2 vs Win TK4 (Match 30)
    const m30 = getMatch('M30');
    const winTK2 = getWinnerId(m26);
    const winTK4 = getWinnerId(m28);
    if (m30) {
      if (winTK2) m30.homeTeamId = winTK2;
      if (winTK4) m30.awayTeamId = winTK4;
    }

    // 3. Third Place: Lose BK1 vs Lose BK2 (Match 31)
    const m31 = getMatch('M31');
    const loseBK1 = getLoserId(m29);
    const loseBK2 = getLoserId(m30);
    if (m31) {
      if (loseBK1) m31.homeTeamId = loseBK1;
      if (loseBK2) m31.awayTeamId = loseBK2;
    }

    // 4. Final: Win BK1 vs Win BK2 (Match 32)
    const m32 = getMatch('M32');
    const winBK1 = getWinnerId(m29);
    const winBK2 = getWinnerId(m30);
    if (m32) {
      if (winBK1) m32.homeTeamId = winBK1;
      if (winBK2) m32.awayTeamId = winBK2;
    }

    return updatedMatches;
  }

  /**
   * Resolves a tie in knockout stage with 6m penalty shootout.
   */
  static recordPenaltyShootout(
    matchId: string,
    homePenScore: number,
    awayPenScore: number,
    organizerName: string
  ): void {
    const matches = StorageService.getMatches();
    const match = matches.find((m) => m.id === matchId);
    if (!match) return;

    const winnerId = homePenScore > awayPenScore ? match.homeTeamId : match.awayTeamId;
    match.penaltyShootout = {
      homeScore: homePenScore,
      awayScore: awayPenScore,
      shots: [],
    };
    match.winnerTeamId = winnerId;
    match.status = 'FINISHED';
    match.completedAt = new Date().toISOString();

    const teams = StorageService.getTeams();
    const updated = this.generateOrUpdateBracket(teams, matches);
    StorageService.saveMatches(updated);

    StorageService.logAction(
      organizerName,
      'REFEREE',
      'KẾT QUẢ LUÂN LƯU 6M',
      `Trận ${match.roundLabel}`,
      `Tỷ số luân lưu: ${homePenScore} - ${awayPenScore}. Đội thắng: ${winnerId}`,
      'Phân định thắng thua vòng loại trực tiếp theo Điều 8'
    );
  }
}
