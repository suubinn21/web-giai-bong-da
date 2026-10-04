'use client';

import React, { useState } from 'react';
import { UserRole, TournamentStatus, Tournament } from '@/types';
import { SoundFX } from '@/utils/soundEffects';
import { 
  Trophy, 
  Volume2, 
  VolumeX, 
  Trash2, 
  Database,
  UserCheck, 
  Radio, 
  Sparkles,
  ChevronDown,
  Plus,
  LayoutGrid,
  Edit3,
  Cloud,
  Menu
} from 'lucide-react';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  tournamentStatus: TournamentStatus;
  onStatusChange: (status: TournamentStatus) => void;
  onClearData: () => void;
  onLoadDemo: () => void;
  liveMatchCount: number;
  onNavigateToLive: () => void;
  tournament: Tournament;
  onOpenCreateTournament: () => void;
  onEditTournament?: () => void;
  onBackToPortal?: () => void;
  cloudStatus?: 'connected' | 'connecting' | 'offline';
  onOpenMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  tournamentStatus,
  onStatusChange,
  onClearData,
  onLoadDemo,
  liveMatchCount,
  onNavigateToLive,
  tournament,
  onOpenCreateTournament,
  onEditTournament,
  onBackToPortal,
  cloudStatus = 'connected',
  onOpenMobileMenu,
}) => {
  const [soundOn, setSoundOn] = useState(true);
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    SoundFX.setSoundEnabled(next);
    if (next) {
      SoundFX.playWhistle();
    }
  };

  const roleLabels: Record<UserRole, { label: string; badge: string; color: string }> = {
    SUPER_ADMIN: { label: 'Super Admin', badge: 'Toàn quyền', color: 'bg-red-500/20 text-red-400 border-red-500/40' },
    ORGANIZER: { label: 'Ban Tổ Chức (BTC)', badge: 'Điều hành', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' },
    REFEREE: { label: 'Trọng Tài', badge: 'Biên bản trận', color: 'bg-amber-500/20 text-amber-400 border-amber-500/40' },
    TEAM_MANAGER: { label: 'Trưởng Đoàn / Đội Trưởng', badge: 'Quản lý đội', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40' },
    STUDENT: { label: 'Sinh Viên / Cổ Động Viên', badge: 'Công khai', color: 'bg-purple-500/20 text-purple-400 border-purple-500/40' },
  };

  const statusLabels: Record<TournamentStatus, string> = {
    DRAFT: 'Bản Nháp (Draft)',
    REGISTRATION: 'Đang Mở Đăng Ký',
    REGISTRATION_CLOSED: 'Đã Chốt Danh Sách',
    DRAWING: 'Đang Bốc Thăm',
    GROUP_STAGE: 'Vòng Bảng (24 Trận)',
    QUARTER_FINAL: 'Vòng Tứ Kết',
    SEMI_FINAL: 'Vòng Bán Kết',
    THIRD_PLACE: 'Tranh Hạng 3',
    FINAL: 'Chung Kết',
    COMPLETED: 'Đã Bế Mạc',
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0B132B]/95 backdrop-blur-md border-b border-slate-800 text-white shadow-xl">
      {/* Top Banner Alert for Live Matches */}
      {liveMatchCount > 0 && (
        <div 
          onClick={onNavigateToLive}
          className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white text-xs font-bold py-1.5 px-4 text-center cursor-pointer hover:opacity-95 transition-all flex items-center justify-center gap-2"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
          </span>
          <span>ĐANG CÓ {liveMatchCount} TRẬN ĐẤU LIVE! BẤM ĐỂ THEO DÕI LIVE SCORE VÀ BÌNH LUẬN TRỰC TIẾP</span>
          <Radio className="w-3.5 h-3.5 animate-pulse" />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Brand Logo, Portal Button & Dynamic Tournament Title */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-600 shadow-lg shadow-emerald-500/20 border border-emerald-400/30">
              <Trophy className="w-6 h-6 text-white" />
              <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-amber-300 animate-bounce" />
            </div>

            {/* Back to Portal Hub button */}
            {onBackToPortal && (
              <button
                onClick={onBackToPortal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-xs border border-slate-700 hover:border-emerald-500/50 shadow-sm transition-all"
                title="Quay lại cổng danh sách các giải đấu đã tạo"
              >
                <LayoutGrid className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Danh Sách Giải</span>
                <span className="sm:hidden">Đổi Giải</span>
              </button>
            )}

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold tracking-widest text-emerald-400 uppercase bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60 font-mono">
                  {tournament.shortCode || 'ITFTMS 2026'}
                </span>
                <span className="hidden sm:inline-block text-xs text-slate-400">| {tournament.format || 'Bóng Đá 5 Người'}</span>
              </div>
              <h1 className="text-sm sm:text-base lg:text-lg font-black tracking-tight text-white truncate max-w-[180px] sm:max-w-xs md:max-w-md lg:max-w-lg">
                {tournament.name || 'GIẢI BÓNG ĐÁ KHOA CNTT 2026'}
              </h1>
            </div>
          </div>

          {/* Right Controls: Create Tournament, Stage Badge, Audio, Role Switcher, Clear/Load Data */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            
            {/* Edit Tournament Config Button */}
            {(currentRole === 'SUPER_ADMIN' || currentRole === 'ORGANIZER') && onEditTournament && (
              <button
                onClick={onEditTournament}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-cyan-300 hover:text-cyan-200 font-bold text-xs border border-slate-700 hover:border-cyan-500/50 shadow-sm transition-all"
                title="Chỉnh sửa cấu hình số bảng đấu, số đội/bảng, lệ phí và thông tin giải đấu"
              >
                <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden lg:inline">Cấu Hình ({tournament.numberOfGroups || 4} Bảng × {tournament.teamsPerGroup || 4} Đội)</span>
                <span className="lg:hidden">Cấu Hình Bảng</span>
              </button>
            )}

            {/* Create Tournament Button */}
            {(currentRole === 'SUPER_ADMIN' || currentRole === 'ORGANIZER') && (
              <button
                onClick={onOpenCreateTournament}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all border border-emerald-400/30"
                title="Khởi tạo mùa giải bóng đá mới"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden md:inline">+ Tạo Mới Giải Đấu</span>
                <span className="md:hidden">+ Tạo Giải</span>
              </button>
            )}

            {/* Tournament Stage Indicator */}
            <div className="relative hidden xl:block">
              <button
                onClick={() => setStatusMenuOpen(!statusMenuOpen)}
                className="flex items-center gap-2 text-xs font-medium bg-slate-900/80 hover:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors"
                title="Thay đổi giai đoạn giải đấu"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-slate-400">Giai đoạn:</span>
                <span className="text-emerald-300 font-bold">{statusLabels[tournamentStatus]}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {statusMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-2 z-50">
                  <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase border-b border-slate-800">
                    Chuyển Giai Đoạn Giải
                  </div>
                  {Object.entries(statusLabels).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => {
                        onStatusChange(key as TournamentStatus);
                        setStatusMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-800 flex items-center justify-between ${
                        tournamentStatus === key ? 'text-emerald-400 font-bold bg-emerald-950/40' : 'text-slate-300'
                      }`}
                    >
                      <span>{label}</span>
                      {tournamentStatus === key && <span className="text-xs">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Cloud Realtime Sync Status Indicator */}
            <div
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold shadow-sm transition-all ${
                cloudStatus === 'connected'
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400'
                  : cloudStatus === 'connecting'
                  ? 'bg-amber-950/40 border-amber-500/40 text-amber-400'
                  : 'bg-slate-900 border-slate-700 text-slate-400'
              }`}
              title={
                cloudStatus === 'connected'
                  ? '🟢 Firebase Firestore Realtime: Dữ liệu đang được đồng bộ trực tuyến thời gian thực'
                  : cloudStatus === 'connecting'
                  ? '🟡 Đang kết nối đến Firebase...'
                  : '⚪ Chế độ ngoại tuyến'
              }
            >
              <span className="relative flex h-2 w-2">
                {cloudStatus === 'connected' && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                )}
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    cloudStatus === 'connected'
                      ? 'bg-emerald-400'
                      : cloudStatus === 'connecting'
                      ? 'bg-amber-400'
                      : 'bg-slate-500'
                  }`}
                ></span>
              </span>
              <Cloud className="w-3.5 h-3.5" />
              <span className="hidden lg:inline font-mono font-bold text-[11px]">
                {cloudStatus === 'connected' ? 'Cloud Sync' : cloudStatus === 'connecting' ? 'Kết nối...' : 'Offline'}
              </span>
            </div>

            {/* Sound FX Toggle Button */}
            <button
              onClick={toggleSound}
              className={`p-2 rounded-lg border transition-all ${
                soundOn
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400 hover:bg-emerald-900/50'
                  : 'bg-slate-900 border-slate-700 text-slate-500 hover:text-slate-300'
              }`}
              title={soundOn ? 'Âm thanh còi & ăn mừng: BẬT' : 'Âm thanh: TẮT'}
            >
              {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Role Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-lg border shadow-sm transition-all ${roleLabels[currentRole].color}`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{roleLabels[currentRole].label}</span>
                <span className="sm:hidden">{roleLabels[currentRole].label.slice(0, 6)}..</span>
                <ChevronDown className="w-3 h-3 ml-0.5" />
              </button>

              {roleMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-2 z-50">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase border-b border-slate-800">
                    Chuyển Quyền Trải Nghiệm (RBAC)
                  </div>
                  {(Object.keys(roleLabels) as UserRole[]).map((role) => (
                    <button
                      key={role}
                      onClick={() => {
                        onRoleChange(role);
                        setRoleMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-800 flex items-center justify-between transition-colors ${
                        currentRole === role ? 'bg-slate-800 text-emerald-400 font-bold' : 'text-slate-300'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span>{roleLabels[role].label}</span>
                        <span className="text-[10px] text-slate-500">{roleLabels[role].badge}</span>
                      </div>
                      {currentRole === role && <span className="text-emerald-400 text-sm">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons: Clear Mock Data & Load Demo Data */}
            {(currentRole === 'SUPER_ADMIN' || currentRole === 'ORGANIZER') && (
              <div className="hidden lg:flex items-center gap-1.5">
                <button
                  onClick={onClearData}
                  className="flex items-center gap-1.5 text-xs text-red-300 hover:text-white bg-red-950/60 hover:bg-red-900 px-2.5 py-1.5 rounded-lg border border-red-500/40 transition-colors"
                  title="Xóa trắng toàn bộ dữ liệu để bắt đầu giải đấu"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  <span>Xóa Dữ Liệu</span>
                </button>

                <button
                  onClick={onLoadDemo}
                  className="flex items-center gap-1.5 text-xs text-amber-300 hover:text-white bg-slate-900 hover:bg-slate-800 px-2.5 py-1.5 rounded-lg border border-amber-500/30 transition-colors"
                  title="Nạp lại 16 đội và lịch thi đấu mẫu để thử nghiệm"
                >
                  <Database className="w-3.5 h-3.5 text-amber-400" />
                  <span>Demo</span>
                </button>
              </div>
            )}

            {/* Mobile Menu Hamburger Button */}
            {onOpenMobileMenu && (
              <button
                onClick={onOpenMobileMenu}
                className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white md:hidden transition-colors shadow-sm"
                title="Mở menu tính năng giải đấu"
                aria-label="Mở menu chức năng"
              >
                <Menu className="w-5 h-5 text-emerald-400" />
              </button>
            )}

          </div>
        </div>
      </div>
    </header>
  );
};
