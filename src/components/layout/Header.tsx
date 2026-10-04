'use client';

import React, { useState } from 'react';
import { UserRole, TournamentStatus, Tournament, UserAccount } from '@/types';
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
  Menu,
  LogIn,
  LogOut,
  User,
  Shield,
  KeyRound,
  ArrowLeft,
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from '@/utils/useTheme';

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
  currentUser?: UserAccount | null;
  onOpenAuthModal?: () => void;
  onLogout?: () => void;
  onGoBack?: () => void;
  canGoBack?: boolean;
  activeTab?: string;
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
  currentUser,
  onOpenAuthModal,
  onLogout,
  onGoBack,
  canGoBack,
  activeTab,
}) => {
  const [soundOn, setSoundOn] = useState(true);
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { isLight, toggleTheme } = useTheme();

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

  const canManage = currentRole === 'SUPER_ADMIN' || currentRole === 'ORGANIZER';

  const statusConfigs: Record<
    TournamentStatus,
    { label: string; bgClass: string; dotClass: string }
  > = {
    DRAFT: {
      label: 'Bản Nháp (Draft)',
      bgClass: 'bg-slate-900 border-slate-700 text-slate-300',
      dotClass: 'bg-slate-500',
    },
    REGISTRATION: {
      label: 'Đang Mở Đăng Ký',
      bgClass: 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300',
      dotClass: 'bg-emerald-400 animate-ping',
    },
    REGISTRATION_CLOSED: {
      label: 'Đã Chốt Danh Sách',
      bgClass: 'bg-blue-950/80 border-blue-500/50 text-blue-300',
      dotClass: 'bg-blue-400',
    },
    DRAWING: {
      label: 'Đang Bốc Thăm',
      bgClass: 'bg-amber-950/80 border-amber-500/50 text-amber-300',
      dotClass: 'bg-amber-400 animate-bounce',
    },
    GROUP_STAGE: {
      label: 'Vòng Bảng (24 Trận)',
      bgClass: 'bg-teal-950/80 border-teal-500/50 text-teal-300',
      dotClass: 'bg-teal-400 animate-pulse',
    },
    QUARTER_FINAL: {
      label: 'Vòng Tứ Kết',
      bgClass: 'bg-indigo-950/80 border-indigo-500/50 text-indigo-300',
      dotClass: 'bg-indigo-400 animate-pulse',
    },
    SEMI_FINAL: {
      label: 'Vòng Bán Kết',
      bgClass: 'bg-purple-950/80 border-purple-500/50 text-purple-300',
      dotClass: 'bg-purple-400 animate-pulse',
    },
    THIRD_PLACE: {
      label: 'Tranh Hạng 3',
      bgClass: 'bg-amber-950/80 border-amber-500/50 text-amber-300',
      dotClass: 'bg-amber-400',
    },
    FINAL: {
      label: 'Chung Kết & Trao Cúp',
      bgClass: 'bg-rose-950/90 border-rose-500/60 text-rose-300',
      dotClass: 'bg-rose-400 animate-pulse',
    },
    COMPLETED: {
      label: 'Đã Bế Mạc',
      bgClass: 'bg-slate-900 border-slate-700/80 text-slate-400',
      dotClass: 'bg-slate-500',
    },
  };

  const currentStage = statusConfigs[tournamentStatus] || statusConfigs.GROUP_STAGE;

  return (
    <header className="sticky top-0 z-50 bg-slate-900/85 backdrop-blur-md border-b border-slate-700/60 text-white shadow-xl">
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
          
          {/* Brand Logo, Back Button, Portal Button & Dynamic Tournament Title */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Dedicated Back Button (Lùi 1 trang) - Visible on mobile & desktop */}
            {onGoBack && canGoBack && (
              <button
                onClick={onGoBack}
                className="flex items-center gap-1.5 h-9 px-2.5 sm:px-3 rounded-xl bg-slate-900/90 active:bg-slate-800 hover:bg-slate-800 text-emerald-400 border border-emerald-500/40 hover:border-emerald-400 shadow-md transition-all active:scale-95 shrink-0"
                title={activeTab && activeTab !== 'home' ? 'Lùi lại trang trước' : 'Quay lại cổng danh sách giải đấu'}
                aria-label="Lùi lại 1 trang"
              >
                <ArrowLeft className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-xs font-bold text-emerald-300">
                  {activeTab && activeTab !== 'home' ? 'Lùi' : 'Cổng Giải'}
                </span>
              </button>
            )}

            <div className="relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-600 shadow-lg shadow-emerald-500/20 border border-emerald-400/30 shrink-0">
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              <Sparkles className="absolute -top-1 -right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300 animate-bounce" />
            </div>

            {/* Back to Portal Hub button (Desktop only when not already showing onGoBack) */}
            {onBackToPortal && (!onGoBack || !canGoBack) && (
              <button
                onClick={onBackToPortal}
                className="hidden lg:flex items-center gap-1.5 h-9 px-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-xs border border-slate-700 hover:border-emerald-500/50 shadow-sm transition-all shrink-0 whitespace-nowrap"
                title="Quay lại cổng danh sách các giải đấu đã tạo"
              >
                <LayoutGrid className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Danh Sách Giải</span>
              </button>
            )}

            <div className="flex-1 min-w-0 pr-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] sm:text-xs font-extrabold tracking-widest text-emerald-400 uppercase bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60 font-mono shrink-0 whitespace-nowrap">
                  {tournament.shortCode || 'ITFTMS 2026'}
                </span>
                <span className="hidden xl:inline-block text-xs text-slate-400 truncate">| {tournament.format || 'Bóng Đá 5 Người'}</span>
              </div>
              <h1 className="text-xs sm:text-sm lg:text-base font-black tracking-tight text-white truncate max-w-[140px] sm:max-w-[200px] md:max-w-xs lg:max-w-sm xl:max-w-md">
                {tournament.name || 'GIẢI BÓNG ĐÁ KHOA CNTT 2026'}
              </h1>
            </div>
          </div>

          {/* Right Controls: Desktop controls hidden on mobile, mobile has only Hamburger Menu */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            
            {/* Edit Tournament Config Button (Desktop only, mobile in Menu Hamburger) */}
            {(currentRole === 'SUPER_ADMIN' || currentRole === 'ORGANIZER') && onEditTournament && (
              <button
                onClick={onEditTournament}
                className="hidden md:inline-flex items-center gap-1.5 h-9 px-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-cyan-300 hover:text-cyan-200 font-bold text-xs border border-slate-700 hover:border-cyan-500/50 shadow-sm transition-all shrink-0 whitespace-nowrap"
                title={`Cấu hình giải đấu: ${tournament.numberOfGroups || 4} Bảng × ${tournament.teamsPerGroup || 4} Đội`}
              >
                <Edit3 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Cấu Hình Bảng</span>
              </button>
            )}

            {/* Create Tournament Button (Desktop only, mobile in Menu Hamburger) */}
            {(currentRole === 'SUPER_ADMIN' || currentRole === 'ORGANIZER') && (
              <button
                onClick={onOpenCreateTournament}
                className="hidden md:inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all border border-emerald-400/30 shrink-0 whitespace-nowrap active:scale-95"
                title="Khởi tạo mùa giải bóng đá mới"
              >
                <Plus className="w-3.5 h-3.5 shrink-0" />
                <span>+ Tạo Giải Mới</span>
              </button>
            )}

            {/* Tournament Stage Indicator */}
            <div className="relative hidden lg:block shrink-0">
              <button
                onClick={() => canManage && setStatusMenuOpen(!statusMenuOpen)}
                className={`flex items-center gap-2 text-xs font-bold h-9 px-3 rounded-xl border shadow-sm transition-all shrink-0 whitespace-nowrap ${currentStage.bgClass} ${
                  canManage ? 'cursor-pointer hover:brightness-110 active:scale-95' : 'cursor-default'
                }`}
                title={canManage ? 'Bấm để thay đổi giai đoạn giải đấu' : 'Giai đoạn hiện tại của giải đấu'}
              >
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className={`w-2 h-2 rounded-full ${currentStage.dotClass} shrink-0`}></span>
                </span>
                <span className="text-slate-400 font-medium whitespace-nowrap">Giai đoạn:</span>
                <span className="font-extrabold whitespace-nowrap">{currentStage.label}</span>
                {canManage && <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
              </button>

              {canManage && statusMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1.5 text-[11px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-800 flex items-center justify-between">
                    <span>Chuyển Giai Đoạn Giải</span>
                    <span className="text-[10px] text-emerald-400 font-normal">BTC / Admin</span>
                  </div>
                  <div className="max-h-80 overflow-y-auto py-1">
                    {(Object.entries(statusConfigs) as [TournamentStatus, typeof currentStage][]).map(([key, config]) => (
                      <button
                        key={key}
                        onClick={() => {
                          onStatusChange(key);
                          setStatusMenuOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors ${
                          tournamentStatus === key
                            ? `${config.bgClass} font-black border-y border-transparent`
                            : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${config.dotClass} shrink-0`}></span>
                          <span>{config.label}</span>
                        </div>
                        {tournamentStatus === key && <span className="text-xs font-bold">✓</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Cloud Realtime Sync Status Indicator (Desktop only) */}
            <div
              className={`hidden lg:flex items-center gap-1.5 h-9 px-2.5 rounded-xl border text-xs font-semibold shadow-sm transition-all shrink-0 whitespace-nowrap ${
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
              <span className="relative flex h-2 w-2 shrink-0">
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
              <Cloud className="w-3.5 h-3.5 shrink-0" />
              <span className="font-mono font-bold text-[11px] whitespace-nowrap">
                {cloudStatus === 'connected' ? 'Cloud Sync' : cloudStatus === 'connecting' ? 'Kết nối...' : 'Offline'}
              </span>
            </div>

            {/* Sound FX Toggle Button (Desktop only, mobile in Menu Hamburger) */}
            <button
              onClick={toggleSound}
              className={`hidden md:flex items-center justify-center h-9 w-9 rounded-xl border transition-all shrink-0 ${
                soundOn
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400 hover:bg-emerald-900/50'
                  : 'bg-slate-900 border-slate-700 text-slate-500 hover:text-slate-300'
              }`}
              title={soundOn ? 'Âm thanh còi & ăn mừng: BẬT' : 'Âm thanh: TẮT'}
            >
              {soundOn ? <Volume2 className="w-4 h-4 shrink-0" /> : <VolumeX className="w-4 h-4 shrink-0" />}
            </button>

            {/* Theme Mode Toggle Button (Sáng / Tối) */}
            <button
              onClick={toggleTheme}
              className={`hidden md:flex items-center gap-1.5 h-9 px-2.5 rounded-xl border transition-all shrink-0 font-bold text-xs ${
                isLight
                  ? 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100 shadow-sm'
                  : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white hover:border-slate-600'
              }`}
              title={isLight ? 'Chuyển sang Giao diện Nền Tối' : 'Chuyển sang Giao diện Nền Trắng'}
            >
              {isLight ? (
                <>
                  <Sun className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="hidden xl:inline">Nền Trắng</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span className="hidden xl:inline">Nền Tối</span>
                </>
              )}
            </button>

            {/* User Profile / Login System (Desktop only, mobile in Menu Hamburger) */}
            {currentUser ? (
              <div className="relative hidden md:block shrink-0">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 h-9 px-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500/50 shadow-sm transition-all shrink-0 whitespace-nowrap"
                  title="Thông tin tài khoản & Đổi vai trò"
                >
                  <img
                    src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                    alt={currentUser.fullName}
                    className="w-6 h-6 rounded-lg object-cover border border-emerald-500/40 shrink-0"
                  />
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-white max-w-[110px] truncate leading-tight">
                      {currentUser.fullName}
                    </span>
                    <span className={`text-[10px] font-semibold text-emerald-400`}>
                      {roleLabels[currentRole]?.label || currentRole}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5 shrink-0" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl py-3 z-50">
                    {/* User Info Header */}
                    <div className="px-4 pb-3 border-b border-slate-800 flex items-center gap-3">
                      <img
                        src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                        alt={currentUser.fullName}
                        className="w-10 h-10 rounded-xl object-cover border border-emerald-500/50 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-white truncate">{currentUser.fullName}</div>
                        <div className="text-[11px] text-slate-400 font-mono truncate">@{currentUser.username} • {currentUser.email}</div>
                        <span className={`inline-block mt-1 text-[10px] font-bold px-1.5 py-0.5 rounded border ${roleLabels[currentRole]?.color || 'bg-slate-800 text-slate-300'}`}>
                          {roleLabels[currentRole]?.label}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-2 border-t border-slate-800 px-3 space-y-1">
                      {onOpenAuthModal && (
                        <button
                          onClick={() => {
                            setUserMenuOpen(false);
                            onOpenAuthModal();
                          }}
                          className="w-full text-left px-2.5 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg flex items-center gap-2 transition-colors"
                        >
                          <User className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Đổi Tài Khoản / Đăng Ký Mới</span>
                        </button>
                      )}

                      {onLogout && (
                        <button
                          onClick={() => {
                            setUserMenuOpen(false);
                            onLogout();
                          }}
                          className="w-full text-left px-2.5 py-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded-lg flex items-center gap-2 transition-colors"
                        >
                          <LogOut className="w-3.5 h-3.5 text-red-400" />
                          <span>Đăng Xuất</span>
                        </button>
                      )}

                      {/* Database Utilities inside User Menu for Admin/BTC */}
                      {(currentRole === 'SUPER_ADMIN' || currentRole === 'ORGANIZER') && (
                        <div className="pt-2 border-t border-slate-800 space-y-1">
                          {onClearData && (
                            <button
                              onClick={() => {
                                setUserMenuOpen(false);
                                onClearData();
                              }}
                              className="w-full text-left px-2.5 py-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded-lg flex items-center gap-2 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-400" />
                              <span>Xóa Sạch Dữ Liệu Mẫu</span>
                            </button>
                          )}
                          {onLoadDemo && (
                            <button
                              onClick={() => {
                                setUserMenuOpen(false);
                                onLoadDemo();
                              }}
                              className="w-full text-left px-2.5 py-1.5 text-xs text-amber-300 hover:text-amber-200 hover:bg-amber-950/40 rounded-lg flex items-center gap-2 transition-colors"
                            >
                              <Database className="w-3.5 h-3.5 text-amber-400" />
                              <span>Nạp Dữ Liệu Mẫu (Demo)</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* If not logged in */
              onOpenAuthModal && (
                <button
                  onClick={onOpenAuthModal}
                  className="hidden md:inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all border border-emerald-400/30 shrink-0 whitespace-nowrap active:scale-95"
                >
                  <LogIn className="w-3.5 h-3.5 shrink-0" />
                  <span>Đăng Nhập</span>
                </button>
              )
            )}

            {/* Mobile Menu Hamburger Button: ONLY button visible on right on mobile phones */}
            {onOpenMobileMenu && (
              <button
                onClick={onOpenMobileMenu}
                className="flex items-center justify-center p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-emerald-400 hover:text-white md:hidden transition-all shadow-md active:scale-95"
                title="Mở menu chức năng giải đấu"
                aria-label="Mở menu chức năng"
              >
                <Menu className="w-6 h-6 text-emerald-400" />
              </button>
            )}

          </div>
        </div>
      </div>
    </header>
  );
};
