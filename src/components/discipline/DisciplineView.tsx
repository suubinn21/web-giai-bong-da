'use client';

import React, { useState } from 'react';
import { Team, Match, UserRole } from '@/types';
import { DisciplineEngine } from '@/services/disciplineEngine';
import { StorageService } from '@/services/storage';
import { ShieldAlert, AlertTriangle, Lock, Unlock, CheckCircle, Search, Filter } from 'lucide-react';

interface DisciplineViewProps {
  teams: Team[];
  matches: Match[];
  onTeamsUpdate: (teams: Team[]) => void;
  currentRole: UserRole;
}

export const DisciplineView: React.FC<DisciplineViewProps> = ({
  teams,
  matches,
  onTeamsUpdate,
  currentRole,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'SUSPENDED' | 'WARNING_1_YELLOW'>('ALL');

  // Suspension edit modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [modalSuspended, setModalSuspended] = useState(true);
  const [modalReason, setModalReason] = useState('');

  const canManage = currentRole === 'SUPER_ADMIN' || currentRole === 'ORGANIZER';

  // Evaluate card accumulations across all matches
  const reports = DisciplineEngine.evaluateAllPlayers(teams, matches);

  const filteredReports = reports.filter((r) => {
    if (filterStatus === 'SUSPENDED' && !r.isSuspended) return false;
    if (filterStatus === 'WARNING_1_YELLOW' && r.status !== 'WARNING_1_YELLOW') return false;
    if (
      searchQuery &&
      !r.playerName.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !r.teamName.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const handleOpenModal = (playerId: string, teamId: string, currentSuspended: boolean, reason?: string) => {
    setSelectedPlayerId(playerId);
    setSelectedTeamId(teamId);
    setModalSuspended(!currentSuspended);
    setModalReason(reason || 'Quyết định kỷ luật / Ân xá của Ban Tổ Chức theo Điều 11 & 12');
    setModalOpen(true);
  };

  const handleSaveSuspension = () => {
    if (!selectedPlayerId || !selectedTeamId) return;

    DisciplineEngine.setManualSuspension(
      selectedPlayerId,
      selectedTeamId,
      modalSuspended,
      modalReason,
      currentRole
    );

    const updated = StorageService.getTeams();
    onTeamsUpdate(updated);
    setModalOpen(false);
  };

  const totalSuspended = reports.filter((r) => r.isSuspended).length;
  const totalWarnings = reports.filter((r) => r.status === 'WARNING_1_YELLOW').length;

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-[#0B132B] border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-amber-500/20 text-amber-400 text-xs font-bold px-2.5 py-0.5 rounded-full border border-amber-500/30">
              DISCIPLINE & SUSPENSION ENGINE
            </span>
            <span className="text-xs text-slate-400">Quy định Điều 11 & Điều 12</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Quản Lý Thẻ Phạt & Án Treo Giò Tích Lũy
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Cầu thủ nhận đủ <strong>02 thẻ vàng</strong> trong toàn giải đấu bị treo giò 01 trận tiếp theo. Hệ thống tự động khóa đăng ký vào sân.
          </p>
        </div>

        {/* Metric Badges */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2.5 rounded-2xl bg-red-950/60 border border-red-500/40 text-red-300 flex items-center gap-2">
            <Lock className="w-4 h-4 text-red-400" />
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Đang Treo Giò</span>
              <span className="text-lg font-black font-mono">{totalSuspended} Cầu Thủ</span>
            </div>
          </div>

          <div className="px-4 py-2.5 rounded-2xl bg-amber-950/60 border border-amber-500/40 text-amber-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Cảnh Báo (1 Thẻ)</span>
              <span className="text-lg font-black font-mono">{totalWarnings} Cầu Thủ</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên cầu thủ hoặc tên đội bóng..."
            className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl pl-9 pr-3 py-2.5 focus:border-amber-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setFilterStatus('ALL')}
            className={`px-3 py-2 rounded-xl font-bold transition-all ${
              filterStatus === 'ALL'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Tất Cả Thẻ ({reports.filter((r) => r.yellowCount > 0 || r.redCount > 0).length})
          </button>
          <button
            onClick={() => setFilterStatus('SUSPENDED')}
            className={`px-3 py-2 rounded-xl font-bold transition-all ${
              filterStatus === 'SUSPENDED'
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Bị Treo Giò 🔒 ({totalSuspended})
          </button>
          <button
            onClick={() => setFilterStatus('WARNING_1_YELLOW')}
            className={`px-3 py-2 rounded-xl font-bold transition-all ${
              filterStatus === 'WARNING_1_YELLOW'
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Nguy Cơ (1 Thẻ 🟨)
          </button>
        </div>
      </div>

      {/* Disciplinary Table */}
      <div className="bg-[#0B132B]/90 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 font-bold border-b border-slate-800 text-[11px]">
              <tr>
                <th className="py-3 px-4">CẦU THỦ</th>
                <th className="py-3 px-4">ĐỘI BÓNG</th>
                <th className="py-3 px-3 text-center">THẺ VÀNG 🟨</th>
                <th className="py-3 px-3 text-center">THẺ ĐỎ 🟥</th>
                <th className="py-3 px-4">TRẠNG THÁI & ÁN PHẠT</th>
                <th className="py-3 px-4">LÝ DO ÁN PHẠT</th>
                {canManage && <th className="py-3 px-4 text-center">THAO TÁC BTC</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredReports
                .filter((r) => r.yellowCount > 0 || r.redCount > 0)
                .map((r) => (
                  <tr key={r.playerId} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white">
                      {r.playerName}
                    </td>

                    <td className="py-3.5 px-4 text-slate-300">
                      {r.teamName}
                    </td>

                    <td className="py-3.5 px-3 text-center font-mono font-black text-amber-400">
                      {r.yellowCount}
                    </td>

                    <td className="py-3.5 px-3 text-center font-mono font-black text-red-400">
                      {r.redCount}
                    </td>

                    <td className="py-3.5 px-4">
                      {r.isSuspended ? (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-black text-red-400 bg-red-950/70 border border-red-500/50 px-3 py-1 rounded-full animate-pulse">
                          <Lock className="w-3 h-3" />
                          TREO GIÒ 01 TRẬN
                        </span>
                      ) : r.status === 'WARNING_1_YELLOW' ? (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-400 bg-amber-950/60 border border-amber-500/40 px-3 py-1 rounded-full">
                          <AlertTriangle className="w-3 h-3" />
                          ĐÃ CÓ 1 THẺ VÀNG
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 bg-emerald-950/40 px-3 py-1 rounded-full">
                          ✓ ĐỦ ĐIỀU KIỆN
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-slate-400 text-xs">
                      {r.suspensionReason || 'Chấp hành tốt'}
                    </td>

                    {canManage && (
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() =>
                            handleOpenModal(
                              r.playerId,
                              r.teamId,
                              r.isSuspended,
                              r.suspensionReason
                            )
                          }
                          className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                        >
                          {r.isSuspended ? 'Gỡ Phạt' : 'Treo Giò'}
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Disciplinary Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-amber-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              Điều Chỉnh Án Kỷ Luật BTC (Điều 11 & 12)
            </h3>

            <div>
              <label className="text-xs font-semibold text-white block mb-1">
                Trạng Thái Thi Đấu
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setModalSuspended(true)}
                  className={`p-2.5 rounded-xl text-xs font-bold border transition-colors ${
                    modalSuspended
                      ? 'bg-red-600 text-white border-red-400'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  🔒 Ban Hành Án Treo Giò
                </button>
                <button
                  type="button"
                  onClick={() => setModalSuspended(false)}
                  className={`p-2.5 rounded-xl text-xs font-bold border transition-colors ${
                    !modalSuspended
                      ? 'bg-emerald-600 text-white border-emerald-400'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  ✓ Cho Phép Thi Đấu (Gỡ Án)
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-white block mb-1">
                Lý Do / Quyết Định BTC
              </label>
              <textarea
                rows={3}
                value={modalReason}
                onChange={(e) => setModalReason(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl p-2.5 focus:border-amber-500 focus:outline-none"
              ></textarea>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveSuspension}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-lg"
              >
                Lưu Quyết Định & Ghi Audit Log
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
