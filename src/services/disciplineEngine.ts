// ITFTMS 2026 - Disciplinary Engine
// Specification: Sections 11, 12
// Rule: Accumulating 2 yellow cards across matches = 1-match suspension (Treo giò 01 trận tiếp theo)
// Red card / Second yellow card management & automated lock in match roster.

import { Team, Player, Match } from '@/types';
import { StorageService } from './storage';

export interface DisciplinaryReport {
  playerId: string;
  playerName: string;
  teamId: string;
  teamName: string;
  yellowCount: number;
  redCount: number;
  isSuspended: boolean;
  suspensionReason?: string;
  nextMatchId?: string;
  status: 'SAFE' | 'WARNING_1_YELLOW' | 'SUSPENDED_2_YELLOWS' | 'SUSPENDED_RED';
}

export class DisciplineEngine {
  /**
   * Recalculates card accumulations and suspensions across all finished and active matches.
   */
  static evaluateAllPlayers(teams: Team[], matches: Match[]): DisciplinaryReport[] {
    const playerCardMap = new Map<string, { yellows: number; reds: number; lastMatchMinute: number }>();

    // Scan all card events
    matches.forEach((m) => {
      if (m.events) {
        m.events.forEach((ev) => {
          if (ev.type === 'CARD' && ev.playerId) {
            const current = playerCardMap.get(ev.playerId) || { yellows: 0, reds: 0, lastMatchMinute: 0 };
            if (ev.cardType === 'YELLOW') {
              current.yellows += 1;
            } else if (ev.cardType === 'SECOND_YELLOW') {
              current.yellows += 1;
              current.reds += 1;
            } else if (ev.cardType === 'RED') {
              current.reds += 1;
            }
            playerCardMap.set(ev.playerId, current);
          }
        });
      }
    });

    const reports: DisciplinaryReport[] = [];

    teams.forEach((team) => {
      team.players.forEach((player) => {
        const cardInfo = playerCardMap.get(player.id) || {
          yellows: player.yellowCards || 0,
          reds: player.redCards || 0,
          lastMatchMinute: 0,
        };

        const totalYellows = Math.max(player.yellowCards, cardInfo.yellows);
        const totalReds = Math.max(player.redCards, cardInfo.reds);

        let isSuspended = false;
        let suspensionReason: string | undefined = undefined;
        let status: DisciplinaryReport['status'] = 'SAFE';

        if (totalReds > 0) {
          isSuspended = true;
          suspensionReason = 'Thẻ đỏ trực tiếp - Treo giò theo quyết định BTC';
          status = 'SUSPENDED_RED';
        } else if (totalYellows >= 2) {
          isSuspended = true;
          suspensionReason = `Tích lũy ${totalYellows} thẻ vàng (Điều 11) - Treo giò 01 trận tiếp theo`;
          status = 'SUSPENDED_2_YELLOWS';
        } else if (totalYellows === 1) {
          status = 'WARNING_1_YELLOW';
        }

        // Keep player model in sync
        player.yellowCards = totalYellows;
        player.redCards = totalReds;
        player.isSuspended = isSuspended;
        player.suspensionReason = suspensionReason;

        reports.push({
          playerId: player.id,
          playerName: player.name,
          teamId: team.id,
          teamName: team.name,
          yellowCount: totalYellows,
          redCount: totalReds,
          isSuspended,
          suspensionReason,
          status,
        });
      });
    });

    return reports;
  }

  /**
   * Check if player can participate in a given match.
   */
  static isPlayerEligible(playerId: string, team: Team): { eligible: boolean; reason?: string } {
    const player = team.players.find((p) => p.id === playerId);
    if (!player) return { eligible: false, reason: 'Không tìm thấy cầu thủ trong danh sách đội.' };

    if (player.isSuspended) {
      return {
        eligible: false,
        reason: `🔒 KHÔNG ĐƯỢC THI ĐẤU: ${player.suspensionReason || 'Đang chấp hành án phạt treo giò.'}`,
      };
    }

    return { eligible: true };
  }

  /**
   * Manually update suspension status by Organizer
   */
  static setManualSuspension(
    playerId: string,
    teamId: string,
    isSuspended: boolean,
    reason: string,
    organizerName: string
  ): void {
    const teams = StorageService.getTeams();
    const team = teams.find((t) => t.id === teamId);
    if (!team) return;

    const player = team.players.find((p) => p.id === playerId);
    if (!player) return;

    player.isSuspended = isSuspended;
    player.suspensionReason = isSuspended ? reason : undefined;

    StorageService.saveTeams(teams);
    StorageService.logAction(
      organizerName,
      'ORGANIZER',
      isSuspended ? 'BAN HÀNH ÁN TREO GIÒ' : 'GỠ BỎ ÁN TREO GIÒ',
      `Cầu thủ ${player.name} (#${player.jerseyNumber}) - ${team.name}`,
      `Trạng thái: ${isSuspended ? 'Treo giò' : 'Cho phép thi đấu'}. Lý do: ${reason}`
    );
  }
}
