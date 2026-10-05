'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { TournamentAward, UserRole } from '@/types';
import { StorageService } from '@/services/storage';
import { SoundFX } from '@/utils/soundEffects';
import { 
  Trophy, 
  Award, 
  Sparkles, 
  Edit3, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  X, 
  Check, 
  AlertTriangle,
  Image as ImageIcon
} from 'lucide-react';

interface AwardsViewProps {
  awards: TournamentAward[];
  onAwardsUpdate: (awards: TournamentAward[]) => void;
  currentRole: UserRole;
}

const PRESET_ICONS = ['🧤', '⚽', '⭐', '🏆', '🥇', '🥈', '🥉', '🔥', '👟', '🎯', '👑', '🤝', '🌟', '⚡', '🛡️'];

const PRESET_IMAGES = [
  { label: 'Thủ Môn / Cứu Thua', url: '/images/goalkeeper-save.jpg' },
  { label: 'Cúp Vinh Quang', url: '/images/trophy-cup.jpg' },
  { label: 'Ngôi Sao Sân Cỏ', url: '/images/tournament-hero.jpg' },
  { label: 'Pha Bóng Futsal', url: '/images/futsal-action.jpg' },
  { label: 'Ăn Mừng Vô Địch', url: '/images/trophy-celebration.jpg' },
  { label: 'Giày Vàng', url: '/images/golden-boot.jpg' },
];

export const AwardsView: React.FC<AwardsViewProps> = ({
  awards,
  onAwardsUpdate,
  currentRole,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [selectedAward, setSelectedAward] = useState<TournamentAward | null>(null);

  // Form fields
  const [awardTitle, setAwardTitle] = useState('');
  const [awardIcon, setAwardIcon] = useState('🧤');
  const [awardImage, setAwardImage] = useState('/images/goalkeeper-save.jpg');
  const [recipientName, setRecipientName] = useState('');
  const [recipientTeam, setRecipientTeam] = useState('');
  const [prizeMoney, setPrizeMoney] = useState(500000);

  // Delete confirm state
  const [deleteConfirmAward, setDeleteConfirmAward] = useState<TournamentAward | null>(null);

  const canEdit = currentRole === 'SUPER_ADMIN' || currentRole === 'ORGANIZER';

  const champion = awards.find((a) => a.code === 'CHAMPION');
  const runnerUp = awards.find((a) => a.code === 'RUNNER_UP');
  const thirdPlace = awards.find((a) => a.code === 'THIRD_PLACE');

  // Lọc danh hiệu cá nhân: Đã loại bỏ hoàn toàn Vua Phá Lưới, Cầu Thủ Xuất Sắc, Giải Phong Cách
  const individualAwards = awards.filter(
    (a) =>
      a.code !== 'CHAMPION' &&
      a.code !== 'RUNNER_UP' &&
      a.code !== 'THIRD_PLACE' &&
      a.code !== 'TOP_SCORER' &&
      a.code !== 'BEST_PLAYER' &&
      a.code !== 'FAIR_PLAY'
  );

  const getAwardImage = (award: TournamentAward) => {
    if (award.customImage) return award.customImage;
    if (award.code === 'BEST_GK') return '/images/goalkeeper-save.jpg';
    if (award.code === 'CHAMPION') return '/images/trophy-celebration.jpg';
    if (award.code === 'RUNNER_UP' || award.code === 'THIRD_PLACE') return '/images/trophy-cup.jpg';
    return '/images/trophy-cup.jpg';
  };

  const handleOpenCreate = () => {
    setIsCreatingNew(true);
    setSelectedAward(null);
    setAwardTitle('');
    setAwardIcon('🧤');
    setAwardImage('/images/goalkeeper-save.jpg');
    setRecipientName('Chưa xác định');
    setRecipientTeam('Chờ kết quả thi đấu');
    setPrizeMoney(500000);
    setModalOpen(true);
  };

  const handleOpenEdit = (award: TournamentAward) => {
    setIsCreatingNew(false);
    setSelectedAward(award);
    setAwardTitle(award.title);
    setAwardIcon(award.icon || '🏆');
    setAwardImage(award.customImage || getAwardImage(award));
    setRecipientName(award.recipientName);
    setRecipientTeam(award.recipientTeam);
    setPrizeMoney(award.prizeMoney);
    setModalOpen(true);
  };

  const handleDeleteAward = (award: TournamentAward) => {
    const updated = awards.filter((a) => a.id !== award.id);
    onAwardsUpdate(updated);
    StorageService.saveAwards(updated);
    setDeleteConfirmAward(null);
    if (selectedAward?.id === award.id) {
      setModalOpen(false);
    }
    StorageService.logAction(
      currentRole,
      currentRole,
      'XÓA DANH HIỆU CÁ NHÂN',
      award.title,
      `Đã xóa danh hiệu "${award.title}" khỏi cơ cấu giải thưởng`
    );
  };

  const handleSaveAward = () => {
    if (isCreatingNew) {
      const finalTitle = awardTitle.trim() || 'Danh Hiệu Tùy Chọn';
      const newAward: TournamentAward = {
        id: `AW-CUSTOM-${Date.now()}`,
        code: `CUSTOM_${Date.now()}`,
        title: finalTitle,
        icon: awardIcon || '⭐',
        customImage: awardImage,
        recipientName: recipientName.trim() || 'Chưa xác định',
        recipientTeam: recipientTeam.trim() || 'Chờ kết quả thi đấu',
        prizeMoney: Number(prizeMoney) >= 0 ? Number(prizeMoney) : 0,
      };

      const updated = [...awards, newAward];
      onAwardsUpdate(updated);
      StorageService.saveAwards(updated);
      setModalOpen(false);

      SoundFX.playGoalFanfare();
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10B981', '#06B6D4', '#FFFFFF'],
      });

      StorageService.logAction(
        currentRole,
        currentRole,
        'THÊM DANH HIỆU CÁ NHÂN',
        newAward.title,
        `Tạo danh hiệu: ${newAward.title}. Tiền thưởng: ${newAward.prizeMoney.toLocaleString()} VNĐ`
      );
    } else if (selectedAward) {
      const isPodium = selectedAward.code === 'CHAMPION' || selectedAward.code === 'RUNNER_UP' || selectedAward.code === 'THIRD_PLACE';

      selectedAward.recipientName = recipientName.trim() || 'Chưa xác định';
      selectedAward.recipientTeam = recipientTeam.trim() || 'Chờ kết quả thi đấu';
      selectedAward.prizeMoney = Number(prizeMoney) >= 0 ? Number(prizeMoney) : 0;

      if (!isPodium) {
        selectedAward.title = awardTitle.trim() || selectedAward.title;
        selectedAward.icon = awardIcon || selectedAward.icon || '⭐';
        selectedAward.customImage = awardImage;
      }

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
        'CẬP NHẬT DANH HIỆU',
        selectedAward.title,
        `Vinh danh: ${selectedAward.recipientName} (${selectedAward.recipientTeam}). Tiền thưởng: ${selectedAward.prizeMoney.toLocaleString()} VNĐ`
      );
    }
  };

  const isPodiumSelected = selectedAward && (selectedAward.code === 'CHAMPION' || selectedAward.code === 'RUNNER_UP' || selectedAward.code === 'THIRD_PLACE');

  return (
    <div className="space-y-8">
      
      {/* Top Banner Card */}
      <div className="relative rounded-3xl overflow-hidden border border-amber-500/40 bg-slate-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur-md">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-25 transform scale-105 pointer-events-none"
          style={{ backgroundImage: `url('/images/trophy-celebration.jpg')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-900/80 to-slate-950/60 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-amber-500/20 text-amber-400 text-xs font-bold px-2.5 py-0.5 rounded-full border border-amber-500/30">
                VINH DANH &amp; CƠ CẤU GIẢI THƯỞNG
              </span>
              <span className="text-xs text-slate-400">Quy định Điều 28</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Bảng Vàng Danh Dự ITFTMS 2026
            </h2>
            <p className="text-xs text-slate-300 mt-1">
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
      </div>

      {/* 3D Olympic-Style Podium Showcase (Top 3) */}
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
            {/* Real Champion Cup Trophy Photo */}
            <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-amber-400 shadow-2xl shadow-amber-500/50 mb-3 relative group">
              <img 
                src="/images/trophy-cup.jpg" 
                alt="Cúp Vô Địch" 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <span className="absolute bottom-1 inset-x-0 text-center text-[10px] font-black font-mono text-amber-300 drop-shadow">CÚP VÀNG</span>
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

      {/* Individual Awards Section (Tùy Chọn Danh Hiệu Cá Nhân) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
          <div>
            <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-400" />
              <span>Danh Hiệu Cá Nhân Tùy Chọn ({individualAwards.length})</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Quy định Điều 28: Tuyên dương các cá nhân xuất sắc. Ban Tổ Chức có thể tùy biến thêm, sửa hoặc xóa danh hiệu theo nhu cầu giải đấu.
            </p>
          </div>

          {canEdit && (
            <button
              onClick={handleOpenCreate}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-2 self-start sm:self-auto active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>+ Thêm Danh Hiệu Cá Nhân</span>
            </button>
          )}
        </div>

        {individualAwards.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-10 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto text-2xl">
              🏅
            </div>
            <h4 className="text-base font-bold text-white">Chưa Có Danh Hiệu Cá Nhân Nào</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Hiện tại danh sách danh hiệu cá nhân đang trống. Ban Tổ Chức có thể bấm nút bên dưới để tạo các danh hiệu tùy chỉnh (Thủ môn xuất sắc, Bàn thắng đẹp, Cầu thủ triển vọng, v.v.).
            </p>
            {canEdit && (
              <div className="pt-2">
                <button
                  onClick={handleOpenCreate}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/25 transition-all inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Tạo Danh Hiệu Cá Nhân Đầu Tiên</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {individualAwards.map((a) => {
              const awardImg = getAwardImage(a);

              return (
                <div
                  key={a.id}
                  className="bg-slate-900/90 backdrop-blur-md border border-slate-700/60 rounded-2xl overflow-hidden shadow-xl hover:border-emerald-500/50 transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Photo Thumbnail Banner */}
                    <div className="relative h-32 overflow-hidden bg-slate-950">
                      <img 
                        src={awardImg} 
                        alt={a.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent" />
                      
                      <div className="absolute top-2.5 left-2.5">
                        <span className="text-xl p-1.5 bg-black/70 rounded-xl backdrop-blur-sm border border-slate-700/60 inline-flex items-center justify-center shadow-md">
                          {a.icon || '🏅'}
                        </span>
                      </div>

                      <div className="absolute top-2.5 right-2.5 font-mono text-xs font-bold text-amber-300 bg-black/70 px-2.5 py-1 rounded-xl border border-amber-500/40 backdrop-blur-sm shadow-md">
                        {a.prizeMoney.toLocaleString()} đ
                      </div>
                    </div>

                    <div className="p-4 space-y-1">
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider truncate" title={a.title}>
                        {a.title}
                      </h4>
                      <div className="text-base font-black text-white mt-1 truncate" title={a.recipientName}>
                        {a.recipientName}
                      </div>
                      <div className="text-xs text-emerald-400 font-semibold mt-0.5 truncate" title={a.recipientTeam}>
                        {a.recipientTeam}
                      </div>
                    </div>
                  </div>

                  {canEdit && (
                    <div className="p-3 pt-0 border-t border-slate-800/80 grid grid-cols-2 gap-2 mt-2">
                      <button
                        onClick={() => handleOpenEdit(a)}
                        className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Sửa</span>
                      </button>

                      <button
                        onClick={() => setDeleteConfirmAward(a)}
                        className="py-1.5 px-2 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                        <span>Xóa</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Thêm Mới / Chỉnh Sửa Danh Hiệu */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-slate-900 border-2 border-emerald-500/40 rounded-3xl p-6 shadow-2xl space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                <span>
                  {isCreatingNew
                    ? 'Thêm Danh Hiệu Cá Nhân Mới'
                    : isPodiumSelected
                    ? `Cập Nhật Bục Vinh Quang: ${selectedAward?.title}`
                    : `Tùy Chỉnh Danh Hiệu: ${selectedAward?.title}`}
                </span>
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Title & Icon (Chỉ cho Individual Awards hoặc Tạo mới) */}
            {(!isPodiumSelected || isCreatingNew) && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Tên Danh Hiệu <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={awardTitle}
                    onChange={(e) => setAwardTitle(e.target.value)}
                    placeholder="Ví dụ: 🧤 Thủ Môn Xuất Sắc Nhất, Bàn Thắng Đẹp..."
                    className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-xl p-3 font-bold focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                {/* Chọn Icon / Emoji */}
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">
                    Biểu Tượng (Icon / Emoji)
                  </label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {PRESET_ICONS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setAwardIcon(emoji)}
                        className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-all ${
                          awardIcon === emoji
                            ? 'bg-emerald-500/30 border-2 border-emerald-400 shadow-md scale-105'
                            : 'bg-slate-800 border border-slate-700 hover:bg-slate-700'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={awardIcon}
                    onChange={(e) => setAwardIcon(e.target.value)}
                    placeholder="Hoặc nhập emoji tùy ý (VD: 🧤, ⚽)..."
                    className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-xl p-2.5 font-mono"
                    maxLength={10}
                  />
                </div>

                {/* Chọn Ảnh Đại Diện */}
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Hình Ảnh Banner Danh Hiệu</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {PRESET_IMAGES.map((img) => (
                      <div
                        key={img.url}
                        onClick={() => setAwardImage(img.url)}
                        className={`cursor-pointer rounded-xl overflow-hidden border-2 transition-all relative group ${
                          awardImage === img.url
                            ? 'border-emerald-400 shadow-lg shadow-emerald-500/30 scale-[1.02]'
                            : 'border-slate-800 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={img.url} alt={img.label} className="w-full h-16 object-cover" />
                        <span className="block text-[10px] font-bold text-center py-1 bg-slate-950 text-slate-300 truncate px-1">
                          {img.label}
                        </span>
                        {awardImage === img.url && (
                          <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Recipient & Team */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Tên Cá Nhân / Đội Nhận Giải
                </label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn A hoặc Chưa xác định"
                  className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-xl p-2.5 font-bold focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Đơn Vị / Đội Bóng Trực Thuộc
                </label>
                <input
                  type="text"
                  value={recipientTeam}
                  onChange={(e) => setRecipientTeam(e.target.value)}
                  placeholder="Ví dụ: 22CNTT1 hoặc Chờ kết quả"
                  className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-xl p-2.5 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Tiền Thưởng */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Tiền Thưởng Kèm Theo (VNĐ)
              </label>
              <input
                type="number"
                min={0}
                step={50000}
                value={prizeMoney}
                onChange={(e) => setPrizeMoney(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 text-emerald-400 text-xs rounded-xl p-2.5 font-mono font-bold focus:border-emerald-500 focus:outline-none"
              />
              <span className="text-[11px] text-slate-400 block mt-1">
                Định dạng hiển thị: <strong className="text-amber-300">{Number(prizeMoney || 0).toLocaleString()} VNĐ</strong>
              </span>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-800">
              <div>
                {!isCreatingNew && !isPodiumSelected && selectedAward && (
                  <button
                    type="button"
                    onClick={() => {
                      setModalOpen(false);
                      setDeleteConfirmAward(selectedAward);
                    }}
                    className="px-3 py-2 rounded-xl bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-500/40 text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Xóa Danh Hiệu</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleSaveAward}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/30 transition-all flex items-center gap-1.5 active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isCreatingNew ? 'Tạo Danh Hiệu' : 'Lưu Danh Hiệu & Pháo Hoa'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal Xóa Danh Hiệu */}
      {deleteConfirmAward && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-slate-900 border-2 border-red-500/40 rounded-3xl p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-950/80 border border-red-500/40 text-red-400 flex items-center justify-center mx-auto text-xl">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h4 className="text-base font-bold text-white">Xác Nhận Xóa Danh Hiệu?</h4>
              <p className="text-xs text-slate-300 mt-1">
                Bạn có chắc chắn muốn xóa danh hiệu <strong className="text-red-400">&quot;{deleteConfirmAward.title}&quot;</strong> khỏi cơ cấu giải thưởng không?
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmAward(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                onClick={() => handleDeleteAward(deleteConfirmAward)}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg shadow-red-600/30"
              >
                Xóa Danh Hiệu
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
