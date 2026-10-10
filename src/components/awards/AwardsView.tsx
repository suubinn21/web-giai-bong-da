'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { TournamentAward, UserRole, Match, Team } from '@/types';
import { StorageService } from '@/services/storage';
import { SoundFX } from '@/utils/soundEffects';
import { RankingEngine, KnockoutPlayerScorer } from '@/services/rankingEngine';
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
  Image as ImageIcon,
  Star,
  Flame,
  Target,
  Zap,
  TrendingUp,
  Medal,
  UserCheck,
  ChevronRight
} from 'lucide-react';

interface AwardsViewProps {
  awards: TournamentAward[];
  onAwardsUpdate: (awards: TournamentAward[]) => void;
  currentRole: UserRole;
  matches?: Match[];
  teams?: Team[];
}

const PRESET_ICONS = ['⭐', '🧤', '⚽', '🏆', '🥇', '🥈', '🥉', '🔥', '👟', '🎯', '👑', '🤝', '🌟', '⚡', '🛡️'];

const PRESET_IMAGES = [
  { label: 'Cầu Thủ Xuất Sắc (MVP)', url: '/images/tournament-hero.jpg' },
  { label: 'Thủ Môn / Cứu Thua', url: '/images/goalkeeper-save.jpg' },
  { label: 'Cúp Vinh Quang', url: '/images/trophy-cup.jpg' },
  { label: 'Pha Bóng Futsal', url: '/images/futsal-action.jpg' },
  { label: 'Ăn Mừng Vô Địch', url: '/images/trophy-celebration.jpg' },
  { label: 'Giày Vàng', url: '/images/golden-boot.jpg' },
];

export const AwardsView: React.FC<AwardsViewProps> = ({
  awards,
  onAwardsUpdate,
  currentRole,
  matches = [],
  teams = [],
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [selectedAward, setSelectedAward] = useState<TournamentAward | null>(null);

  // Form fields
  const [awardTitle, setAwardTitle] = useState('');
  const [awardIcon, setAwardIcon] = useState('⭐');
  const [awardImage, setAwardImage] = useState('/images/tournament-hero.jpg');
  const [recipientName, setRecipientName] = useState('');
  const [recipientTeam, setRecipientTeam] = useState('');
  const [prizeMoney, setPrizeMoney] = useState(1000000);

  // Delete confirm state
  const [deleteConfirmAward, setDeleteConfirmAward] = useState<TournamentAward | null>(null);

  const canEdit = currentRole === 'SUPER_ADMIN' || currentRole === 'ORGANIZER';

  const champion = awards.find((a) => a.code === 'CHAMPION');
  const runnerUp = awards.find((a) => a.code === 'RUNNER_UP');
  const thirdPlace = awards.find((a) => a.code === 'THIRD_PLACE');
  const bestPlayerAward = awards.find((a) => a.code === 'BEST_PLAYER');

  // Tính toán bảng xếp hạng Cầu thủ xuất sắc nhất dựa trên bàn thắng từ vòng Knock-out (Tứ kết, Bán kết, Chung kết)
  const knockoutBestPlayers = React.useMemo(() => {
    return RankingEngine.getKnockoutBestPlayers(matches, teams);
  }, [matches, teams]);

  const topKnockoutMvp = knockoutBestPlayers.length > 0 && knockoutBestPlayers[0].knockoutGoals > 0
    ? knockoutBestPlayers[0]
    : null;

  // Tự động vinh danh Cầu thủ xuất sắc nhất vòng Knock-out vào giải thưởng chính thức
  const handleAutoAwardKnockoutMvp = (player?: KnockoutPlayerScorer) => {
    const target = player || topKnockoutMvp;
    if (!target) return;

    let existing = awards.find((a) => a.code === 'BEST_PLAYER');
    let updatedAwards: TournamentAward[];

    const formattedRecipient = `${target.playerName}${target.jerseyNumber ? ` (#${target.jerseyNumber})` : ''}`;

    if (existing) {
      existing.recipientName = formattedRecipient;
      existing.recipientTeam = target.teamName;
      existing.title = `⭐ Cầu Thủ Xuất Sắc Nhất (Knock-out: ${target.knockoutGoals} Bàn)`;
      existing.customImage = target.avatarUrl || '/images/tournament-hero.jpg';
      updatedAwards = [...awards];
    } else {
      const newAward: TournamentAward = {
        id: 'AW-04',
        code: 'BEST_PLAYER',
        title: `⭐ Cầu Thủ Xuất Sắc Nhất (Knock-out: ${target.knockoutGoals} Bàn)`,
        recipientName: formattedRecipient,
        recipientTeam: target.teamName,
        prizeMoney: 1000000,
        icon: '⭐',
        customImage: target.avatarUrl || '/images/tournament-hero.jpg',
      };
      updatedAwards = [...awards, newAward];
    }

    onAwardsUpdate(updatedAwards);
    StorageService.saveAwards(updatedAwards);

    SoundFX.playGoalFanfare();
    confetti({
      particleCount: 150,
      spread: 90,
      origin: { y: 0.5 },
      colors: ['#F59E0B', '#10B981', '#06B6D4', '#FFFFFF'],
    });

    StorageService.logAction(
      currentRole,
      currentRole,
      'VINH DANH CẦU THỦ XUẤT SẮC NHẤT',
      target.playerName,
      `Tự động vinh danh Cầu thủ xuất sắc nhất vòng Knock-out: ${target.playerName} (${target.teamName}) với ${target.knockoutGoals} bàn thắng (${target.points} điểm phong độ).`
    );
  };

  // Lọc danh hiệu cá nhân tùy chọn khác (đã đưa BEST_PLAYER lên khu vực chuyên biệt)
  const individualAwards = awards.filter(
    (a) =>
      a.code !== 'CHAMPION' &&
      a.code !== 'RUNNER_UP' &&
      a.code !== 'THIRD_PLACE' &&
      a.code !== 'BEST_PLAYER' &&
      a.code !== 'TOP_SCORER' &&
      a.code !== 'FAIR_PLAY'
  );

  const getAwardImage = (award: TournamentAward) => {
    if (award.customImage) return award.customImage;
    if (award.code === 'BEST_PLAYER') return '/images/tournament-hero.jpg';
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

      {/* ======================================================== */}
      {/* CẦU THỦ XUẤT SẮC NHẤT GIẢI (TÍNH THEO BÀN THẮNG VÒNG KNOCK-OUT) */}
      {/* ======================================================== */}
      <div className="bg-gradient-to-br from-[#0B1528] via-[#0F1E38] to-[#08101E] border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Glow Accent Background */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Section Header */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 text-[11px] font-black px-3 py-0.5 rounded-full shadow-md flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>DANH HIỆU ĐẶC BIỆT</span>
              </span>
              <span className="text-[11px] text-amber-400 bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-500/40 font-mono font-bold">
                TÍNH BÀN THẮNG TỪ VÒNG KNOCK-OUT
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
              <span>⭐ Cầu Thủ Xuất Sắc Nhất Giải (Knock-out MVP)</span>
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Xác định dựa trên tổng số bàn thắng ghi được trong các trận loại trực tiếp: 
              <span className="text-amber-400 font-bold"> Tứ Kết ➔ Bán Kết ➔ Tranh Hạng 3 &amp; Chung Kết</span>.
            </p>
          </div>

          {/* Quick Auto-Award Button for BTC */}
          {canEdit && topKnockoutMvp && (
            <button
              onClick={() => handleAutoAwardKnockoutMvp(topKnockoutMvp)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/30 transition-all flex items-center gap-2 active:scale-95 shrink-0 self-start md:self-auto"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>⚡ Tự Động Vinh Danh Cầu Thủ Này Vào Bảng Vàng</span>
            </button>
          )}
        </div>

        {/* Hero Card for Current #1 Player */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Left Column: Player Spotlight Card */}
          <div className="lg:col-span-7 bg-slate-900/90 border border-amber-500/30 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
              
              {/* Player Image / Avatar */}
              <div className="relative shrink-0">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-amber-400 shadow-xl shadow-amber-500/20 bg-slate-950">
                  <img
                    src={topKnockoutMvp?.avatarUrl || '/images/tournament-hero.jpg'}
                    alt={topKnockoutMvp?.playerName || 'Cầu thủ xuất sắc'}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -top-2 -left-2 w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 text-slate-950 font-black flex items-center justify-center text-xs shadow-md border border-white">
                  #1
                </div>
              </div>

              {/* Player Details */}
              <div className="flex-1 text-center sm:text-left space-y-2 min-w-0">
                <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                  <span className="text-[10px] font-mono font-black uppercase text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800">
                    DẪN ĐẦU GHI BÀN KNOCK-OUT
                  </span>
                  {bestPlayerAward?.recipientName && bestPlayerAward.recipientName.includes(topKnockoutMvp?.playerName || '---') && (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>ĐÃ VINH DANH</span>
                    </span>
                  )}
                </div>

                <h4 className="text-lg sm:text-2xl font-black text-white truncate">
                  {topKnockoutMvp ? (
                    <>
                      {topKnockoutMvp.playerName}
                      {topKnockoutMvp.jerseyNumber ? ` (#${topKnockoutMvp.jerseyNumber})` : ''}
                    </>
                  ) : (
                    'Chờ Kết Quả Vòng Knock-out'
                  )}
                </h4>

                <p className="text-xs text-slate-300 font-medium">
                  {topKnockoutMvp ? (
                    <>
                      Đội: <span className="text-cyan-400 font-bold">{topKnockoutMvp.teamName}</span>
                      {topKnockoutMvp.class ? ` • Lớp ${topKnockoutMvp.class}` : ''}
                    </>
                  ) : (
                    'Hệ thống sẽ tự động cập nhật ngay khi các trận Tứ kết diễn ra'
                  )}
                </p>

                {/* Score & Goal Badges */}
                {topKnockoutMvp ? (
                  <div className="pt-2 flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                    <div className="px-3 py-1.5 rounded-xl bg-amber-950/80 border border-amber-500/50 text-amber-300 text-xs font-black flex items-center gap-1.5">
                      <Flame className="w-4 h-4 text-amber-400 fill-current" />
                      <span>{topKnockoutMvp.knockoutGoals} Bàn Thắng Knock-out</span>
                    </div>

                    <div className="px-3 py-1.5 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-bold flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{topKnockoutMvp.knockoutAssists} Kiến tạo</span>
                    </div>

                    <div className="px-3 py-1.5 rounded-xl bg-purple-950/80 border border-purple-500/40 text-purple-300 text-xs font-mono font-bold flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
                      <span>{topKnockoutMvp.points} Điểm phong độ</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-400 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                    💡 Chưa có bàn thắng nào được ghi ở vòng loại trực tiếp (Tứ kết, Bán kết, Chung kết).
                  </div>
                )}
              </div>
            </div>

            {/* Breakdown per Knockout Round */}
            {topKnockoutMvp && (
              <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-4 gap-2 text-center text-[11px]">
                <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Tứ Kết</div>
                  <div className="text-sm font-black text-white mt-0.5">{topKnockoutMvp.quarterGoals} bàn</div>
                </div>
                <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Bán Kết</div>
                  <div className="text-sm font-black text-amber-400 mt-0.5">{topKnockoutMvp.semiGoals} bàn</div>
                </div>
                <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Chung Kết</div>
                  <div className="text-sm font-black text-yellow-300 mt-0.5">{topKnockoutMvp.finalGoals} bàn</div>
                </div>
                <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Tranh Hạng 3</div>
                  <div className="text-sm font-black text-slate-300 mt-0.5">{topKnockoutMvp.thirdPlaceGoals} bàn</div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Scoring Rules and Official Award Status */}
          <div className="lg:col-span-5 bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
                <Medal className="w-4 h-4 text-amber-400" />
                <span>Giải Thưởng Chính Thức</span>
              </h5>
              {bestPlayerAward && canEdit && (
                <button
                  onClick={() => handleOpenEdit(bestPlayerAward)}
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                >
                  <Edit3 className="w-3 h-3" /> Chỉnh sửa
                </button>
              )}
            </div>

            <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Tên giải thưởng:</span>
                <span className="font-bold text-white">{bestPlayerAward?.title || 'Cầu Thủ Xuất Sắc Nhất'}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Người nhận giải:</span>
                <span className="font-bold text-amber-300">{bestPlayerAward?.recipientName || 'Chưa xác định'}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Đội bóng:</span>
                <span className="font-medium text-cyan-300">{bestPlayerAward?.recipientTeam || 'Chờ vòng Knock-out'}</span>
              </div>
              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/80">
                <span className="text-slate-400">Tiền thưởng:</span>
                <span className="font-mono font-black text-amber-400">
                  {bestPlayerAward?.prizeMoney ? bestPlayerAward.prizeMoney.toLocaleString() : '1,000,000'} đ
                </span>
              </div>
            </div>

            {/* Scoring Methodology Box */}
            <div className="text-[11px] text-slate-300 bg-amber-950/30 border border-amber-500/20 p-3 rounded-xl space-y-1.5">
              <div className="font-bold text-amber-300 flex items-center gap-1.5">
                <span>📋 Quy chuẩn tính điểm Cầu thủ xuất sắc nhất:</span>
              </div>
              <ul className="space-y-1 text-slate-400 pl-3 list-disc text-[10px]">
                <li><span className="text-white font-medium">Bàn thắng vòng Knock-out</span> là tiêu chí số 1 để xác định danh hiệu.</li>
                <li>Mỗi bàn thắng vòng Knock-out: <span className="text-amber-300 font-bold">+10 điểm</span>.</li>
                <li>Bàn thắng trận Chung kết: <span className="text-yellow-300 font-bold">+5 điểm thưởng</span>.</li>
                <li>Bàn thắng trận Bán kết: <span className="text-amber-400 font-bold">+3 điểm thưởng</span>.</li>
                <li>Mỗi đường kiến tạo ở vòng Knock-out: <span className="text-cyan-300 font-bold">+4 điểm</span>.</li>
              </ul>
            </div>
          </div>

        </div>

        {/* Knockout Goal Scorers Leaderboard Table */}
        <div className="relative z-10 space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs sm:text-sm font-black uppercase text-white tracking-wider flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Bảng Xếp Hạng Ghi Bàn Vòng Knock-out ({knockoutBestPlayers.length} Cầu thủ)</span>
            </h4>
            <span className="text-[10px] text-slate-400">Tứ kết ➔ Bán kết ➔ Chung kết</span>
          </div>

          {knockoutBestPlayers.length === 0 ? (
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-6 text-center text-xs text-slate-400 space-y-1">
              <p>Chưa có cầu thủ nào ghi bàn ở vòng Knock-out.</p>
              <p className="text-[11px] text-slate-500">
                Khi các trận đấu Tứ kết (15:00) và Bán kết (15:55) diễn ra và có bàn thắng, danh sách sẽ tự động xếp hạng tại đây.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/70">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-slate-400 font-bold border-b border-slate-800 text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3 text-center w-12">HẠNG</th>
                    <th className="py-2.5 px-3">CẦU THỦ</th>
                    <th className="py-2.5 px-3">ĐỘI BÓNG</th>
                    <th className="py-2.5 px-3 text-center font-black text-amber-400" title="Bàn thắng vòng Knock-out">
                      BÀN KNOCK-OUT
                    </th>
                    <th className="py-2.5 px-2 text-center text-slate-300" title="Bàn thắng Tứ kết">TỨ KẾT</th>
                    <th className="py-2.5 px-2 text-center text-amber-300" title="Bàn thắng Bán kết">BÁN KẾT</th>
                    <th className="py-2.5 px-2 text-center text-yellow-300" title="Bàn thắng Chung kết">CHUNG KẾT</th>
                    <th className="py-2.5 px-2 text-center text-cyan-400" title="Kiến tạo">KIẾN TẠO</th>
                    <th className="py-2.5 px-3 text-center font-mono text-purple-300" title="Điểm phong độ">ĐIỂM</th>
                    {canEdit && <th className="py-2.5 px-3 text-center">THAO TÁC</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {knockoutBestPlayers.map((player) => {
                    const isMvp = player.rank === 1 && player.knockoutGoals > 0;

                    return (
                      <tr
                        key={player.playerId}
                        className={`hover:bg-slate-800/40 transition-colors ${
                          isMvp ? 'bg-amber-950/20 font-bold' : ''
                        }`}
                      >
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-black text-xs font-mono ${
                              player.rank === 1
                                ? 'bg-amber-400 text-slate-950'
                                : player.rank === 2
                                ? 'bg-slate-300 text-slate-950'
                                : player.rank === 3
                                ? 'bg-amber-700 text-white'
                                : 'text-slate-500'
                            }`}
                          >
                            {player.rank}
                          </span>
                        </td>

                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-xs">{player.playerName}</span>
                            {player.jerseyNumber && (
                              <span className="text-[10px] font-mono text-slate-400">#{player.jerseyNumber}</span>
                            )}
                            {isMvp && (
                              <span className="text-[9px] bg-amber-400/20 text-amber-300 border border-amber-400/40 px-1.5 py-0.2 rounded font-black">
                                MVP DẪN ĐẦU
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-2.5 px-3 text-cyan-300 text-xs">{player.teamName}</td>

                        <td className="py-2.5 px-3 text-center font-mono font-black text-sm text-amber-400 bg-amber-950/20">
                          {player.knockoutGoals}
                        </td>

                        <td className="py-2.5 px-2 text-center font-mono text-slate-300">{player.quarterGoals}</td>
                        <td className="py-2.5 px-2 text-center font-mono text-amber-300 font-bold">{player.semiGoals}</td>
                        <td className="py-2.5 px-2 text-center font-mono text-yellow-300 font-black">{player.finalGoals}</td>
                        <td className="py-2.5 px-2 text-center font-mono text-cyan-300">{player.knockoutAssists}</td>
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-purple-300">{player.points}</td>

                        {canEdit && (
                          <td className="py-2.5 px-3 text-center">
                            <button
                              onClick={() => handleAutoAwardKnockoutMvp(player)}
                              className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 border border-amber-500/40 text-[10px] font-bold transition-all active:scale-95"
                              title="Vinh danh cầu thủ này làm Cầu thủ xuất sắc nhất"
                            >
                              Vinh Danh
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
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
