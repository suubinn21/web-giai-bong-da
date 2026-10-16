'use client';

import React, { useState } from 'react';
import { Team, Match, UserRole, Tournament, getGroupLetters } from '@/types';
import { RankingEngine } from '@/services/rankingEngine';
import { StorageService } from '@/services/storage';
import { Trophy, AlertTriangle, CheckCircle, ShieldAlert, ArrowUpDown } from 'lucide-react';

interface StandingsViewProps {
  teams: Team[];
  matches: Match[];
  currentRole: UserRole;
  tournament?: Tournament;
  onRefresh: () => void;
}

export const StandingsView: React.FC<StandingsViewProps> = ({
  teams,
  matches,
  currentRole,
  tournament,
  onRefresh,
}) => {
  const groups = getGroupLetters(tournament?.numberOfGroups || 4);
  const [selectedGroup, setSelectedGroup] = useState<string>('ALL');

  // Tie break modal state
  const [tieBreakModalOpen, setTieBreakModalOpen] = useState(false);
  const [tieBreakGroup, setTieBreakGroup] = useState<string>('A');
  const [tieBreakTeams, setTieBreakTeams] = useState<string[]>([]);
  const [selectedWinnerId, setSelectedWinnerId] = useState<string>('');
  const [tieBreakReason, setTieBreakReason] = useState<string>('');

  const canResolveTieBreak = currentRole === 'SUPER_ADMIN' || currentRole === 'ORGANIZER';

  const handleOpenTieBreakModal = (group: string, tiedTeamIds: string[]) => {
    setTieBreakGroup(group);
    setTieBreakTeams(tiedTeamIds);
    setSelectedWinnerId(tiedTeamIds[0] || '');
    setTieBreakReason('Xác định dựa trên chỉ số phụ fair-play (thẻ phạt) và biên bản bốc thăm phụ của BTC.');
    setTieBreakModalOpen(true);
  };

  const handleConfirmTieBreak = () => {
    if (!selectedWinnerId || !tieBreakReason) return;
    const loserId = tieBreakTeams.find((id) => id !== selectedWinnerId) || '';

    RankingEngine.resolveTieBreak(
      tieBreakGroup,
      selectedWinnerId,
      loserId,
      tieBreakReason,
      currentRole
    );

    setTieBreakModalOpen(false);
    onRefresh();
    alert('Đã lưu kết quả phân định bằng điểm của BTC vào Audit Log hệ thống!');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 text-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-blue-200">
              RANKING ENGINE TỰ ĐỘNG
            </span>
            <span className="text-xs text-slate-500">Quy định Điều 9, 10 &amp; 13</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            Bảng Xếp Hạng Vòng Bảng ({groups.length} Bảng: {groups.join(', ')})
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Tính điểm: Thắng 3 điểm, Hòa 1 điểm, Thua 0 điểm. Xếp hạng: Điểm ➔ Hiệu số ➔ Bàn thắng ➔ Đối đầu.
          </p>
        </div>

        {/* Group Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 self-start md:self-auto flex-wrap">
          <button
            onClick={() => setSelectedGroup('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedGroup === 'ALL'
                ? 'bg-gradient-to-r from-blue-600 to-sky-600 text-white shadow-xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tất Cả ({groups.length} Bảng)
          </button>
          {groups.map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGroup(g)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedGroup === g
                  ? 'bg-gradient-to-r from-blue-600 to-sky-600 text-white shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Bảng {g}
            </button>
          ))}
        </div>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {groups
          .filter((g) => selectedGroup === 'ALL' || selectedGroup === g)
          .map((grp) => {
            const standings = RankingEngine.calculateGroupStandings(grp, teams, matches);
            const hasTieBreakIssue = standings.some((s) => s.needsBtcTieBreak);
            const tiedTeamIds = standings.filter((s) => s.needsBtcTieBreak).map((s) => s.teamId);

            return (
              <div
                key={grp}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs text-slate-800"
              >
                {/* Table Header */}
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-blue-100 border border-blue-200 text-blue-700 flex items-center justify-center font-black text-sm">
                      {grp}
                    </span>
                    <div>
                      <h3 className="text-base font-black text-slate-900">BẢNG {grp}</h3>
                      <span className="text-[10px] text-slate-500">Top {tournament?.advancePerGroup || 2} đội giành vé vào Knock-out</span>
                    </div>
                  </div>

                  {/* Warning banner for tie-break if needed */}
                  {hasTieBreakIssue && (
                    <div className="flex items-center gap-2">
                      <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 animate-pulse">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        <span>CẦN BTC XÁC NHẬN</span>
                      </span>

                      {canResolveTieBreak && (
                        <button
                          onClick={() => handleOpenTieBreakModal(grp, tiedTeamIds)}
                          className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
                        >
                          Xử Lý
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Table Content */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 text-[11px]">
                      <tr>
                        <th className="py-3 px-3 text-center w-10">STT</th>
                        <th className="py-3 px-3">ĐỘI BÓNG</th>
                        <th className="py-3 px-2 text-center" title="Số trận đã đấu">ST</th>
                        <th className="py-3 px-2 text-center" title="Thắng">T</th>
                        <th className="py-3 px-2 text-center" title="Hòa">H</th>
                        <th className="py-3 px-2 text-center" title="Bại">B</th>
                        <th className="py-3 px-2 text-center" title="Bàn thắng">BT</th>
                        <th className="py-3 px-2 text-center" title="Bàn thua">BB</th>
                        <th className="py-3 px-2 text-center" title="Hiệu số">+/-</th>
                        <th className="py-3 px-3 text-center font-black text-blue-700" title="Điểm số">Đ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {standings.map((team, idx) => {
                        const isQualifying = idx < (tournament?.advancePerGroup || 2);
                        const isWithdrawn = team.isWithdrawn;

                        return (
                          <tr
                            key={team.teamId}
                            className={`transition-colors ${
                              isQualifying ? 'bg-blue-50/30 hover:bg-blue-50/60' : 'hover:bg-slate-50'
                            }`}
                          >
                            <td className="py-3 px-3 text-center">
                              <span
                                className={`inline-flex items-center justify-center w-5 h-5 rounded-full font-bold text-[11px] font-mono ${
                                  isQualifying
                                    ? 'bg-blue-100 text-blue-700 border border-blue-200 font-bold'
                                    : 'text-slate-400'
                                }`}
                              >
                                {idx + 1}
                              </span>
                            </td>

                            <td className="py-3 px-3">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900 text-xs">{team.teamName}</span>
                                {isWithdrawn && (
                                  <span className="text-[9px] bg-rose-50 text-rose-700 border border-rose-200 px-1.5 py-0.2 rounded font-bold">
                                    BỎ CUỘC
                                  </span>
                                )}
                                {team.needsBtcTieBreak && (
                                  <span className="text-amber-500" title="Bằng điểm và chỉ số phụ, cần BTC xác nhận">
                                    ⚠️
                                  </span>
                                )}
                              </div>
                            </td>

                            <td className="py-3 px-2 text-center font-mono text-slate-600">{team.played}</td>
                            <td className="py-3 px-2 text-center font-mono text-slate-600">{team.won}</td>
                            <td className="py-3 px-2 text-center font-mono text-slate-600">{team.drawn}</td>
                            <td className="py-3 px-2 text-center font-mono text-slate-600">{team.lost}</td>
                            <td className="py-3 px-2 text-center font-mono text-slate-600">{team.goalsFor}</td>
                            <td className="py-3 px-2 text-center font-mono text-slate-600">{team.goalsAgainst}</td>
                            <td
                              className={`py-3 px-2 text-center font-mono font-bold ${
                                team.goalDifference > 0
                                  ? 'text-blue-600'
                                  : team.goalDifference < 0
                                  ? 'text-rose-600'
                                  : 'text-slate-400'
                              }`}
                            >
                              {team.goalDifference > 0 ? `+${team.goalDifference}` : team.goalDifference}
                            </td>
                            <td className="py-3 px-3 text-center font-mono font-black text-sm text-blue-700 bg-blue-50/80">
                              {team.points}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Table Footer legend */}
                <div className="p-3 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                    <span>Top {tournament?.advancePerGroup || 2}: Vào Tứ kết</span>
                  </div>
                  <span>Quy định Điều 10: Xếp hạng khi bằng điểm</span>
                </div>
              </div>
            );
          })}
      </div>

      {/* Tie Break Modal (Rule #10) */}
      {tieBreakModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl space-y-4 text-slate-800">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Xác Nhận Thứ Hạng Bằng Điểm (Điều 10)
            </h3>
            <p className="text-xs text-slate-600">
              Hai đội có cùng Điểm số, Hiệu số bàn thắng và Số bàn thắng ghi được. Hệ thống yêu cầu BTC trực tiếp chỉ định đội xếp trên và lưu lại quyết định vào Audit Log.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Chọn Đội Xếp Hạng Trên
              </label>
              <div className="space-y-2">
                {tieBreakTeams.map((tId) => {
                  const teamObj = teams.find((t) => t.id === tId);
                  return (
                    <label
                      key={tId}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                        selectedWinnerId === tId
                          ? 'bg-blue-50 border-blue-400 text-blue-800 font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span className="text-sm">{teamObj?.name}</span>
                      <input
                        type="radio"
                        name="tieBreakWinner"
                        checked={selectedWinnerId === tId}
                        onChange={() => setSelectedWinnerId(tId)}
                        className="text-blue-600"
                      />
                    </label>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Lý do / Căn cứ phân định của BTC:
              </label>
              <textarea
                value={tieBreakReason}
                onChange={(e) => setTieBreakReason(e.target.value)}
                rows={3}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl text-xs focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setTieBreakModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmTieBreak}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-sky-600 text-white text-xs font-bold shadow-xs hover:from-blue-700 hover:to-sky-700"
              >
                Lưu Quyết Định &amp; Xếp Hạng
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
