'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Team, UserRole, Tournament, getGroupLetters } from '@/types';
import { StorageService } from '@/services/storage';
import { SoundFX } from '@/utils/soundEffects';
import { 
  Dices, 
  Lock, 
  Unlock, 
  RotateCcw, 
  ArrowLeftRight, 
  Shuffle, 
  CheckCircle2, 
  Plus, 
  Sparkles,
  MoveRight,
  AlertCircle,
  Settings,
  Layers
} from 'lucide-react';

interface DrawStudioProps {
  teams: Team[];
  onTeamsUpdate: (teams: Team[]) => void;
  currentRole: UserRole;
  tournament?: Tournament;
  onTournamentUpdate?: (tournament: Tournament) => void;
}

export const DrawStudio: React.FC<DrawStudioProps> = ({
  teams,
  onTeamsUpdate,
  currentRole,
  tournament,
  onTournamentUpdate,
}) => {
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [currentRevealedTeam, setCurrentRevealedTeam] = useState<Team | null>(null);
  const [revealedGroup, setRevealedGroup] = useState<string | null>(null);

  // Group config states
  const [numberOfGroups, setNumberOfGroups] = useState<number>(tournament?.numberOfGroups || 4);
  const [teamsPerGroup, setTeamsPerGroup] = useState<number>(tournament?.teamsPerGroup || 4);
  const [showConfigPanel, setShowConfigPanel] = useState<boolean>(false);

  const groups = getGroupLetters(tournament?.numberOfGroups || numberOfGroups || 4);
  const groupCapacity = tournament?.teamsPerGroup || teamsPerGroup || 4;

  // Swap modal state
  const [swapModalOpen, setSwapModalOpen] = useState(false);
  const [swapTeam1Id, setSwapTeam1Id] = useState<string>('');
  const [swapTeam2Id, setSwapTeam2Id] = useState<string>('');

  // Target group for quick swap prompt
  const [pendingMoveTeamId, setPendingMoveTeamId] = useState<string>('');
  const [pendingTargetGroup, setPendingTargetGroup] = useState<string>('A');

  const canManage = currentRole === 'SUPER_ADMIN' || currentRole === 'ORGANIZER';
  const unassignedTeams = teams.filter((t) => !t.group);

  const handleSaveGroupConfig = () => {
    if (tournament && onTournamentUpdate) {
      const updatedTour: Tournament = {
        ...tournament,
        numberOfGroups,
        teamsPerGroup,
        maxTeams: numberOfGroups * teamsPerGroup,
      };
      onTournamentUpdate(updatedTour);
      StorageService.saveTournament(updatedTour);
      StorageService.logAction(
        currentRole,
        currentRole,
        'CẬP NHẬT CẤU HÌNH BẢNG ĐẤU',
        `${numberOfGroups} Bảng × ${teamsPerGroup} Đội`,
        `BTC điều chỉnh số lượng bảng: ${numberOfGroups}, số đội mỗi bảng: ${teamsPerGroup} (Tổng quy mô: ${numberOfGroups * teamsPerGroup} đội).`
      );
    }
    setShowConfigPanel(false);
    alert(`Đã lưu cấu hình: ${numberOfGroups} bảng, mỗi bảng tối đa ${teamsPerGroup} đội!`);
  };

  // Automated Sequential Draw with Animations
  const handleAutoDrawAll = async () => {
    if (isLocked) {
      alert('Kết quả bốc thăm đã bị KHÓA! Hãy mở khóa trước khi bốc thăm lại.');
      return;
    }
    if (!canManage) {
      alert('Chỉ có Ban Tổ Chức (BTC) mới có quyền thực hiện bốc thăm chia bảng.');
      return;
    }
    if (teams.length === 0) {
      alert('Chưa có đội bóng nào trong danh sách. Vui lòng đăng ký đội bóng trước!');
      return;
    }

    setIsDrawing(true);
    SoundFX.playWhistle();

    // Shuffle teams
    const shuffled = [...teams].sort(() => Math.random() - 0.5);
    const updated = [...teams];

    for (let i = 0; i < shuffled.length; i++) {
      const assignedGroup = groups[Math.floor(i / groupCapacity) % groups.length];
      const currentTeam = shuffled[i];

      setCurrentRevealedTeam(currentTeam);
      setRevealedGroup(assignedGroup);
      SoundFX.playDrawReveal();

      const teamInList = updated.find((t) => t.id === currentTeam.id);
      if (teamInList) {
        teamInList.group = assignedGroup;
      }

      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    onTeamsUpdate([...updated]);
    StorageService.saveTeams(updated);
    setIsDrawing(false);
    setCurrentRevealedTeam(null);
    setRevealedGroup(null);

    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#00F5D4', '#10B981', '#F59E0B', '#6366F1'],
    });

    StorageService.logAction(
      currentRole,
      currentRole,
      'BỐC THĂM TỰ ĐỘNG CHIA BẢNG',
      '16 Đội bóng',
      'Phân chia các đội vào 4 bảng A, B, C, D ngẫu nhiên và công bằng.'
    );
  };

  // Reset all groups (clear draw back to unassigned pool)
  const handleResetDraw = () => {
    if (isLocked) {
      alert('Kết quả bốc thăm đang bị KHÓA. Hãy bấm "Mở Khóa" trước khi đặt lại.');
      return;
    }
    if (!canManage) return;

    if (confirm('Bạn có chắc chắn muốn đặt lại (xóa toàn bộ bảng đấu) để tất cả các đội trở về danh sách chờ bốc thăm?')) {
      const updated = teams.map((t) => ({ ...t, group: undefined }));
      onTeamsUpdate(updated);
      StorageService.saveTeams(updated);

      StorageService.logAction(
        currentRole,
        currentRole,
        'ĐẶT LẠI KẾT QUẢ BỐC THĂM',
        'Tất Cả 4 Bảng',
        'Xóa phân bảng của các đội để chuẩn bị bốc thăm lại từ đầu.'
      );
      alert('Đã đặt lại toàn bộ bảng đấu thành công!');
    }
  };

  // Directly change a team's group
  const handleQuickChangeGroup = (
    teamId: string,
    targetGroup: string
  ) => {
    if (isLocked) {
      alert('Kết quả bốc thăm đang bị KHÓA! Hãy mở khóa trước khi điều chỉnh.');
      return;
    }
    if (!canManage) return;

    const currentTeam = teams.find((t) => t.id === teamId);
    if (!currentTeam) return;

    // If removing to unassigned pool
    if (targetGroup === 'UNASSIGNED') {
      const updated = teams.map((t) => (t.id === teamId ? { ...t, group: undefined } : t));
      onTeamsUpdate(updated);
      StorageService.saveTeams(updated);
      return;
    }

    // Check if target group already has groupCapacity teams
    const teamsInTarget = teams.filter((t) => t.group === targetGroup && t.id !== teamId);
    if (teamsInTarget.length >= groupCapacity) {
      // Group is full -> trigger swap modal so user can choose who to swap with!
      setPendingMoveTeamId(teamId);
      setPendingTargetGroup(targetGroup);
      setSwapTeam1Id(teamId);
      setSwapTeam2Id(teamsInTarget[0]?.id || '');
      setSwapModalOpen(true);
      return;
    }

    // Target group has space -> move directly
    const updated = teams.map((t) => (t.id === teamId ? { ...t, group: targetGroup } : t));
    onTeamsUpdate(updated);
    StorageService.saveTeams(updated);
    SoundFX.playDrawReveal();

    StorageService.logAction(
      currentRole,
      currentRole,
      'ĐIỀU CHỈNH BẢNG ĐẤU ĐỘI BÓNG',
      currentTeam.name,
      `Chuyển đội ${currentTeam.name} sang Bảng ${targetGroup}`
    );
  };

  // Swap 2 teams between groups
  const handleExecuteSwap = () => {
    if (!swapTeam1Id || !swapTeam2Id || swapTeam1Id === swapTeam2Id) {
      alert('Vui lòng chọn 2 đội bóng khác nhau để hoán đổi vị trí!');
      return;
    }

    const t1 = teams.find((t) => t.id === swapTeam1Id);
    const t2 = teams.find((t) => t.id === swapTeam2Id);
    if (!t1 || !t2) return;

    const g1 = t1.group;
    const g2 = t2.group;

    const updated = teams.map((t) => {
      if (t.id === t1.id) return { ...t, group: g2 };
      if (t.id === t2.id) return { ...t, group: g1 };
      return t;
    });

    onTeamsUpdate(updated);
    StorageService.saveTeams(updated);
    SoundFX.playDrawReveal();
    setSwapModalOpen(false);

    StorageService.logAction(
      currentRole,
      currentRole,
      'HOÁN ĐỔI VỊ TRÍ 2 ĐỘI BÓNG',
      `${t1.name} ⮂ ${t2.name}`,
      `Hoán đổi vị trí: ${t1.name} (sang Bảng ${g2 || 'Chưa gán'}) ⮂ ${t2.name} (sang Bảng ${g1 || 'Chưa gán'})`
    );

    alert(`Đã hoán đổi vị trí thành công giữa ${t1.name} và ${t2.name}!`);
  };

  // Lock / Unlock toggle
  const toggleLock = () => {
    if (!canManage) return;
    const next = !isLocked;
    setIsLocked(next);
    SoundFX.playWhistle();

    StorageService.logAction(
      currentRole,
      currentRole,
      next ? 'KHÓA KẾT QUẢ BỐC THĂM' : 'MỞ KHÓA BỐC THĂM',
      'Bảng A, B, C, D',
      next
        ? 'Khóa bảng đấu chính thức để chuẩn bị khởi tranh giải đấu.'
        : 'Mở khóa để hiệu chỉnh hạt giống / điều chỉnh bảng đấu.'
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Studio Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950/80 via-[#0B132B] to-slate-900 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5">
                <Dices className="w-3.5 h-3.5" />
                BỐC THĂM & CHIA BẢNG ĐẤU (ĐIỀU 21)
              </span>
              {isLocked ? (
                <span className="bg-red-500/20 text-red-400 border border-red-500/40 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <Lock className="w-3 h-3" /> ĐÃ KHÓA KẾT QUẢ
                </span>
              ) : (
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <Unlock className="w-3 h-3" /> CHO PHÉP CHỈNH SỬA
                </span>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Studio Điều Hành & Hiệu Chỉnh Bảng Đấu
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Hỗ trợ đầy đủ: <strong>Bốc thăm tự động 3D</strong>, <strong>chuyển bảng trực tiếp trên từng đội</strong>, <strong>hoán đổi vị trí 2 đội</strong> hoặc <strong>đặt lại bảng đấu</strong>.
            </p>
          </div>

          {/* Action Toolbar */}
          {canManage && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowConfigPanel(!showConfigPanel)}
                disabled={isLocked}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 disabled:opacity-50 text-emerald-300 border border-emerald-500/40 font-bold text-xs sm:text-sm transition-all shadow-md"
                title="Tùy chỉnh số lượng bảng đấu và số đội 1 bảng"
              >
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>Số Bảng ({groups.length}) & Số Đội/Bảng ({groupCapacity})</span>
              </button>

              <button
                onClick={handleAutoDrawAll}
                disabled={isLocked || isDrawing}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-xl shadow-emerald-500/25 transition-all"
              >
                <Shuffle className={`w-4 h-4 ${isDrawing ? 'animate-spin' : ''}`} />
                <span>{isDrawing ? 'Đang Quay Cầu...' : 'Bốc Thăm Tự Động'}</span>
              </button>

              <button
                onClick={() => setSwapModalOpen(true)}
                disabled={isLocked}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-cyan-300 border border-slate-700 font-bold text-xs sm:text-sm transition-all"
                title="Hoán đổi vị trí 2 đội bóng giữa các bảng"
              >
                <ArrowLeftRight className="w-4 h-4" />
                <span>Hoán Đổi 2 Đội</span>
              </button>

              <button
                onClick={handleResetDraw}
                disabled={isLocked}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-amber-300 border border-amber-500/30 font-bold text-xs sm:text-sm transition-all"
                title="Đưa tất cả đội về danh sách chờ bốc thăm"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Đặt Lại Bảng</span>
              </button>

              <button
                onClick={toggleLock}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm border transition-all ${
                  isLocked
                    ? 'bg-slate-800 text-amber-400 border-amber-500/40 hover:bg-slate-700'
                    : 'bg-red-950/60 text-red-300 border-red-500/40 hover:bg-red-900/60'
                }`}
              >
                {isLocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                <span>{isLocked ? 'Mở Khóa Bốc Thăm' : 'Khóa Kết Quả'}</span>
              </button>
            </div>
          )}

        </div>

        {/* Inline Group Configuration Panel */}
        {showConfigPanel && canManage && !isLocked && (
          <div className="mt-6 p-5 rounded-2xl bg-slate-950/90 border border-emerald-500/50 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-400" />
                <h4 className="text-sm font-black text-white uppercase tracking-wider">
                  Cấu Hình Số Lượng Bảng Đấu & Số Đội 1 Bảng
                </h4>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-300 bg-emerald-950 px-2.5 py-1 rounded border border-emerald-800">
                Tổng: {numberOfGroups} bảng × {teamsPerGroup} đội = {numberOfGroups * teamsPerGroup} đội
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Số lượng bảng đấu:
                </label>
                <select
                  value={numberOfGroups}
                  onChange={(e) => setNumberOfGroups(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 text-emerald-400 font-bold text-sm rounded-xl p-3 focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value={2}>2 Bảng (Bảng A, B)</option>
                  <option value={3}>3 Bảng (Bảng A, B, C)</option>
                  <option value={4}>4 Bảng (Bảng A, B, C, D - Chuẩn ITFTMS)</option>
                  <option value={5}>5 Bảng (Bảng A, B, C, D, E)</option>
                  <option value={6}>6 Bảng (Bảng A, B, C, D, E, F)</option>
                  <option value={8}>8 Bảng (Bảng A ➔ Bảng H)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Số đội trong 1 bảng:
                </label>
                <select
                  value={teamsPerGroup}
                  onChange={(e) => setTeamsPerGroup(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 text-emerald-400 font-bold text-sm rounded-xl p-3 focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value={3}>3 Đội / bảng</option>
                  <option value={4}>4 Đội / bảng (Chuẩn ITFTMS)</option>
                  <option value={5}>5 Đội / bảng</option>
                  <option value={6}>6 Đội / bảng</option>
                  <option value={8}>8 Đội / bảng</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <div className="text-xs text-slate-400">
                Các bảng sẽ tạo: <strong className="text-white">{getGroupLetters(numberOfGroups).map(g => `Bảng ${g}`).join(', ')}</strong>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowConfigPanel(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 transition-colors"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={handleSaveGroupConfig}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-black shadow-lg shadow-emerald-500/25 hover:from-emerald-400 hover:to-teal-500 transition-all"
                >
                  Lưu Cấu Hình Bảng
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Real-time Ball Reveal Spotlight Banner */}
        {currentRevealedTeam && (
          <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-900/90 via-teal-900/90 to-blue-900/90 border border-emerald-400/50 shadow-2xl flex items-center justify-between animate-bounce">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white text-slate-950 font-black text-xl flex items-center justify-center shadow-lg animate-spin-slow">
                ⚽
              </div>
              <div>
                <span className="text-xs text-emerald-300 font-bold uppercase tracking-widest block">
                  Vừa Bốc Trúng Quả Cầu:
                </span>
                <span className="text-lg font-black text-white">
                  {currentRevealedTeam.name} (#{currentRevealedTeam.shortName})
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-300 block">Xếp Vào Bảng:</span>
              <span className="text-2xl font-black text-amber-300 font-mono">
                BẢNG {revealedGroup}
              </span>
            </div>
          </div>
        )}

      </div>

      {/* Unassigned Teams Pool (If any teams don't have a group yet) */}
      {unassignedTeams.length > 0 && (
        <div className="bg-slate-900/90 border border-amber-500/40 rounded-3xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-black uppercase tracking-wider text-amber-300">
                ĐỘI CHƯA PHÂN BẢNG ({unassignedTeams.length} ĐỘI ĐANG CHỜ TRONG HỘP BỐC THĂM)
              </h3>
            </div>
            <span className="text-xs text-slate-400">Chọn bảng để đưa đội vào thi đấu</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {unassignedTeams.map((t) => (
              <div
                key={t.id}
                className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-2"
              >
                <div className="truncate">
                  <span className="text-xs font-bold text-white block truncate">{t.name}</span>
                  <span className="text-[10px] text-slate-400">{t.class}</span>
                </div>

                {canManage && !isLocked && (
                  <select
                    value=""
                    onChange={(e) => {
                      if (e.target.value) {
                        handleQuickChangeGroup(t.id, e.target.value as 'A' | 'B' | 'C' | 'D');
                      }
                    }}
                    className="bg-slate-800 border border-slate-700 text-emerald-400 font-bold text-xs rounded-xl px-2 py-1"
                  >
                    <option value="">+ Vào Bảng...</option>
                    {groups.map((gOpt) => (
                      <option key={gOpt} value={gOpt}>Vào Bảng {gOpt}</option>
                    ))}
                  </select>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dynamic Groups Grid with Direct Group Editing */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {groups.map((grp) => {
          const groupTeams = teams.filter((t) => t.group === grp);

          const groupColorPalette: Record<string, { header: string; border: string }> = {
            A: { header: 'from-blue-600 to-indigo-700', border: 'border-blue-500/40' },
            B: { header: 'from-emerald-600 to-teal-700', border: 'border-emerald-500/40' },
            C: { header: 'from-amber-600 to-orange-700', border: 'border-amber-500/40' },
            D: { header: 'from-purple-600 to-pink-700', border: 'border-purple-500/40' },
            E: { header: 'from-cyan-600 to-blue-700', border: 'border-cyan-500/40' },
            F: { header: 'from-rose-600 to-red-700', border: 'border-rose-500/40' },
            G: { header: 'from-teal-600 to-emerald-700', border: 'border-teal-500/40' },
            H: { header: 'from-fuchsia-600 to-purple-700', border: 'border-fuchsia-500/40' },
          };
          const colorConfig = groupColorPalette[grp] || { header: 'from-slate-700 to-slate-800', border: 'border-slate-600' };

          return (
            <div
              key={grp}
              className={`rounded-2xl border ${colorConfig.border} bg-[#0B132B]/80 overflow-hidden shadow-xl flex flex-col`}
            >
              {/* Group Card Header */}
              <div
                className={`bg-gradient-to-r ${colorConfig.header} p-4 text-white flex items-center justify-between`}
              >
                <div>
                  <h3 className="text-xl font-black tracking-tight">BẢNG {grp}</h3>
                  <span className="text-[11px] opacity-80">{groupCapacity} Đội bóng vòng bảng</span>
                </div>
                <span className="text-xs font-extrabold bg-black/30 px-2.5 py-1 rounded-full font-mono">
                  {groupTeams.length} / {groupCapacity} ĐỘI
                </span>
              </div>

              {/* Teams in Group */}
              <div className="p-4 space-y-3 flex-1">
                {groupTeams.map((t, idx) => (
                  <div
                    key={t.id}
                    className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 truncate">
                        <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[11px] font-mono font-bold text-slate-400 flex-shrink-0">
                          {idx + 1}
                        </span>
                        <div className="truncate">
                          <h4 className="text-xs font-bold text-white truncate">{t.name}</h4>
                          <span className="text-[10px] text-slate-400">
                            {t.class} • #{t.captainName}
                          </span>
                        </div>
                      </div>

                      <div
                        className="w-3.5 h-3.5 rounded-full border flex-shrink-0"
                        style={{ backgroundColor: t.primaryColor, borderColor: t.secondaryColor }}
                        title={`Màu áo: ${t.primaryColor}`}
                      ></div>
                    </div>

                    {/* Direct Quick Group Changer */}
                    {canManage && !isLocked && (
                      <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[11px]">
                        <span className="text-slate-500">Chuyển bảng:</span>
                        <select
                          value={t.group || ''}
                          onChange={(e) =>
                            handleQuickChangeGroup(
                              t.id,
                              e.target.value
                            )
                          }
                          className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-[10px] rounded px-2 py-0.5 cursor-pointer"
                        >
                          {groups.map((gOpt) => (
                            <option key={gOpt} value={gOpt}>Sang Bảng {gOpt}</option>
                          ))}
                          <option value="UNASSIGNED">❌ Rút về hộp chờ</option>
                        </select>
                      </div>
                    )}
                  </div>
                ))}

                {/* Empty slots placeholders */}
                {Array.from({ length: Math.max(0, groupCapacity - groupTeams.length) }).map((_, emptyIdx) => (
                  <div
                    key={emptyIdx}
                    className="p-3 rounded-xl border border-dashed border-slate-800 bg-slate-950/30 text-slate-600 text-xs text-center flex items-center justify-center gap-2"
                  >
                    <span>Vị trí {groupTeams.length + emptyIdx + 1}: Chờ bốc thăm</span>
                  </div>
                ))}
              </div>

              {/* Card Footer */}
              <div className="p-3 bg-slate-950/60 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Thể thức: Vòng tròn 1 lượt</span>
                <span className="text-emerald-400 font-bold">Top 2 vào Tứ kết</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* SWAP MODAL: Allows swapping 2 teams between groups or resolving full group collision */}
      {swapModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-cyan-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ArrowLeftRight className="w-5 h-5 text-cyan-400" />
              Hoán Đổi Vị Trí Giữa 2 Đội Bóng
            </h3>
            <p className="text-xs text-slate-300">
              Bảng đấu đã đủ 4 đội hoặc bạn muốn đổi vị trí. Hãy chọn 2 đội bóng để hoán đổi bảng cho nhau:
            </p>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Đội bóng thứ nhất</label>
              <select
                value={swapTeam1Id}
                onChange={(e) => setSwapTeam1Id(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl p-2.5"
              >
                <option value="">-- Chọn đội 1 --</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} (Bảng {t.group || 'Chưa gán'})
                  </option>
                ))}
              </select>
            </div>

            <div className="text-center font-bold text-cyan-400 text-xs flex items-center justify-center gap-2">
              <span>⮁ HOÁN ĐỔI VỚI ⮁</span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Đội bóng thứ hai</label>
              <select
                value={swapTeam2Id}
                onChange={(e) => setSwapTeam2Id(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl p-2.5"
              >
                <option value="">-- Chọn đội 2 --</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} (Bảng {t.group || 'Chưa gán'})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSwapModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleExecuteSwap}
                disabled={!swapTeam1Id || !swapTeam2Id || swapTeam1Id === swapTeam2Id}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 text-xs font-bold shadow-lg"
              >
                Xác Nhận Hoán Đổi
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
