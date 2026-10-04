'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { TournamentAward, UserRole } from '@/types';
import { StorageService } from '@/services/storage';
import { SoundFX } from '@/utils/soundEffects';
import { Trophy, Award, Sparkles, Edit3, CheckCircle2 } from 'lucide-react';

interface AwardsViewProps {
  awards: TournamentAward[];
  onAwardsUpdate: (awards: TournamentAward[]) => void;
  currentRole: UserRole;
}

export const AwardsView: React.FC<AwardsViewProps> = ({
  awards,
  onAwardsUpdate,
  currentRole,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAward, setSelectedAward] = useState<TournamentAward | null>(null);
  const [recipientName, setRecipientName] = useState('');
  const [recipientTeam, setRecipientTeam] = useState('');
  const [prizeMoney, setPrizeMoney] = useState(0);

  const canEdit = currentRole === 'SUPER_ADMIN' || currentRole === 'ORGANIZER';

  const champion = awards.find((a) => a.code === 'CHAMPION');
  const runnerUp = awards.find((a) => a.code === 'RUNNER_UP');
  const thirdPlace = awards.find((a) => a.code === 'THIRD_PLACE');

  const individualAwards = awards.filter(
    (a) => a.code !== 'CHAMPION' && a.code !== 'RUNNER_UP' && a.code !== 'THIRD_PLACE'
  );

  const handleOpenEdit = (award: TournamentAward) => {
    setSelectedAward(award);
    setRecipientName(award.recipientName);
    setRecipientTeam(award.recipientTeam);
    setPrizeMoney(award.prizeMoney);
    setModalOpen(true);
  };

  const handleSaveAward = () => {
    if (!selectedAward) return;

    selectedAward.recipientName = recipientName;
    selectedAward.recipientTeam = recipientTeam;
    selectedAward.prizeMoney = prizeMoney;

    const updated = [...awards];
    onAwardsUpdate(updated);
    StorageService.saveAwards(updated);

    setModalOpen(false);

    SoundFX.playGoalFanfare();
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#F59E0B', '#FBBF24', '#FFFFFF'],
    });

    StorageService.logAction(
      currentRole,
      currentRole,
      'CÔNG BỐ GIẢI THƯỞNG GIẢI ĐẤU',
      selectedAward.title,
      `Vinh danh: ${recipientName} (${recipientTeam}). Giải thưởng: ${prizeMoney.toLocaleString()} VNĐ`
    );
  };

  return (
    <div className="space-y-8">
      
      {/* Top Banner Card */}
      <div className="bg-[#0B132B] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-amber-500/20 text-amber-400 text-xs font-bold px-2.5 py-0.5 rounded-full border border-amber-500/30">
              VINH DANH & CƠ CẤU GIẢI THƯỞNG
            </span>
            <span className="text-xs text-slate-400">Quy định Điều 28</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Bảng Vàng Danh Dự ITFTMS 2026
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Trao Cúp, Huy chương Vàng - Bạc - Đồng và các danh hiệu cá nhân xuất sắc nhất giải bóng đá Khoa CNTT.
          </p>
        </div>

        <button
          onClick={() => {
            SoundFX.playGoalFanfare();
            confetti({
              particleCount: 120,
              spread: 80,
              origin: { y: 0.5 },
            });
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black text-xs shadow-xl shadow-amber-500/25 transition-all self-start md:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          <span>Bắn Pháo Hoa Ăn Mừng!</span>
        </button>
      </div>

      {/* 3D Olympic-Style Podium Showcase */}
      <div className="bg-gradient-to-b from-[#0F1E36] via-[#0B132B] to-[#070B14] border border-amber-500/30 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        <h3 className="text-center text-sm font-black uppercase tracking-widest text-amber-400 mb-8">
          BỤC VINH QUANG TỔNG KẾT MÙA GIẢI
        </h3>

        <div className="flex flex-col sm:flex-row items-end justify-center gap-4 sm:gap-6 pt-10">
          
          {/* 2nd Place (Silver) */}
          <div className="w-full sm:w-64 flex flex-col items-center order-2 sm:order-1">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-300 to-slate-500 shadow-xl flex items-center justify-center text-3xl mb-3 border-2 border-slate-200">
              🥈
            </div>
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              {runnerUp?.title || 'Giải Nhì'}
            </span>
            <h4 className="text-base font-black text-white text-center mt-1">
              {runnerUp?.recipientName || 'Chờ Chung kết'}
            </h4>
            <span className="text-xs text-slate-400">{runnerUp?.recipientTeam}</span>
            <span className="text-xs font-mono font-bold text-amber-400 mt-1">
              {runnerUp?.prizeMoney.toLocaleString()} đ
            </span>

            {/* Podium Step 2 */}
            <div className="w-full h-32 sm:h-40 mt-4 rounded-t-2xl bg-gradient-to-b from-slate-600/80 to-slate-800/80 border-t-2 border-slate-400 flex items-center justify-center font-black text-4xl text-slate-300 shadow-2xl">
              2
            </div>
            {canEdit && runnerUp && (
              <button
                onClick={() => handleOpenEdit(runnerUp)}
                className="mt-2 text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
              >
                <Edit3 className="w-3 h-3" /> Sửa giải
              </button>
            )}
          </div>

          {/* 1st Place (Gold / Champion) */}
          <div className="w-full sm:w-72 flex flex-col items-center order-1 sm:order-2">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-300 to-yellow-600 shadow-2xl shadow-amber-500/40 flex items-center justify-center text-4xl mb-3 border-2 border-amber-200 animate-bounce">
              🏆
            </div>
            <span className="text-xs font-black text-amber-300 uppercase tracking-widest bg-amber-950/60 px-3 py-0.5 rounded-full border border-amber-500/40">
              QUÁN QUÂN 2026
            </span>
            <h4 className="text-lg sm:text-xl font-black text-white text-center mt-2">
              {champion?.recipientName || 'Chờ Chung kết'}
            </h4>
            <span className="text-xs text-slate-400">{champion?.recipientTeam}</span>
            <span className="text-sm font-mono font-black text-amber-400 mt-1">
              {champion?.prizeMoney.toLocaleString()} đ
            </span>

            {/* Podium Step 1 */}
            <div className="w-full h-44 sm:h-56 mt-4 rounded-t-2xl bg-gradient-to-b from-amber-500 to-yellow-700 border-t-4 border-amber-300 flex items-center justify-center font-black text-5xl text-slate-950 shadow-2xl shadow-amber-500/20">
              1
            </div>
            {canEdit && champion && (
              <button
                onClick={() => handleOpenEdit(champion)}
                className="mt-2 text-[11px] text-amber-400 hover:text-white flex items-center gap-1"
              >
                <Edit3 className="w-3 h-3" /> Sửa giải
              </button>
            )}
          </div>

          {/* 3rd Place (Bronze) */}
          <div className="w-full sm:w-64 flex flex-col items-center order-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-700 to-amber-900 shadow-xl flex items-center justify-center text-3xl mb-3 border-2 border-amber-600">
              🥉
            </div>
            <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">
              {thirdPlace?.title || 'Giải Ba'}
            </span>
            <h4 className="text-base font-black text-white text-center mt-1">
              {thirdPlace?.recipientName || 'Chờ Tranh 3-4'}
            </h4>
            <span className="text-xs text-slate-400">{thirdPlace?.recipientTeam}</span>
            <span className="text-xs font-mono font-bold text-amber-400 mt-1">
              {thirdPlace?.prizeMoney.toLocaleString()} đ
            </span>

            {/* Podium Step 3 */}
            <div className="w-full h-24 sm:h-32 mt-4 rounded-t-2xl bg-gradient-to-b from-amber-900/80 to-slate-900/80 border-t-2 border-amber-700 flex items-center justify-center font-black text-4xl text-amber-600 shadow-2xl">
              3
            </div>
            {canEdit && thirdPlace && (
              <button
                onClick={() => handleOpenEdit(thirdPlace)}
                className="mt-2 text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
              >
                <Edit3 className="w-3 h-3" /> Sửa giải
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Individual Awards Grid */}
      <div>
        <h3 className="text-sm font-black text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <Award className="w-4 h-4 text-emerald-400" />
          <span>Danh Hiệu Cá Nhân & Phong Cách (Điều 28)</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {individualAwards.map((a) => (
            <div
              key={a.id}
              className="bg-[#0B132B]/90 border border-slate-800 rounded-2xl p-5 shadow-xl hover:border-emerald-500/50 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">{a.icon}</span>
                  <span className="font-mono text-xs font-bold text-amber-400">
                    {a.prizeMoney.toLocaleString()} đ
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{a.title}</h4>
                <div className="text-base font-black text-white mt-1">{a.recipientName}</div>
                <div className="text-xs text-emerald-400 font-semibold mt-0.5">{a.recipientTeam}</div>
              </div>

              {canEdit && (
                <button
                  onClick={() => handleOpenEdit(a)}
                  className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 hover:text-emerald-400 flex items-center justify-center gap-1 transition-colors"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Cập Nhật Người Nhận</span>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Edit Modal */}
      {modalOpen && selectedAward && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-amber-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              Cập Nhật Danh Hiệu: {selectedAward.title}
            </h3>

            <div>
              <label className="text-xs font-semibold text-white block mb-1">
                Tên Cá Nhân / Đội Bóng Nhận Giải
              </label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl p-2.5 font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-white block mb-1">
                Đơn Vị / Chi Đoàn Trực Thuộc
              </label>
              <input
                type="text"
                value={recipientTeam}
                onChange={(e) => setRecipientTeam(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl p-2.5"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-white block mb-1">
                Tiền Thưởng Kèm Theo (VNĐ)
              </label>
              <input
                type="number"
                min={0}
                step={100000}
                value={prizeMoney}
                onChange={(e) => setPrizeMoney(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl p-2.5 font-mono"
              />
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
                onClick={handleSaveAward}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-lg"
              >
                Lưu Danh Hiệu & Bắn Pháo Hoa
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
