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
  Users,
  Shield,
  KeyRound,
  ArrowLeft
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
  currentUser?: UserAccount | null;
  onOpenAuthModal?: () => void;
  onOpenUserManagement?: () => void;
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
  onOpenUserManagement,
  onLogout,
  onGoBack,
  canGoBack,
  activeTab,
}) => {
  const [soundOn, setSoundOn] = useState(true);
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    SoundFX.setSoundEnabled(next);
    if (next) {
      SoundFX.playWhistle();
    }
  };

  const roleLabels: Record<UserRole, { label: string; badge: string; color: string }> = {
    SUPER_ADMIN: { label: 'Super Admin', badge: 'Toàn quyền', color: 'bg-red-50 text-red-700 border-red-200' },
    ORGANIZER: { label: 'Ban Tổ Chức (BTC)', badge: 'Điều hành', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    REFEREE: { label: 'Trọng Tài', badge: 'Biên bản trận', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    TEAM_MANAGER: { label: 'Trưởng Đoàn / Đội Trưởng', badge: 'Quản lý đội', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
    STUDENT: { label: 'Sinh Viên / Cổ Động Viên', badge: 'Công khai', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  };

  const canManage = currentRole === 'SUPER_ADMIN' || currentRole === 'ORGANIZER';

  const statusConfigs: Record<
    TournamentStatus,
    { label: string; bgClass: string; dotClass: string }
  > = {
    DRAFT: {
      label: 'Bản Nháp (Draft)',
      bgClass: 'bg-slate-100 border-slate-200 text-slate-700',
      dotClass: 'bg-slate-400',
    },
    REGISTRATION: {
      label: 'Đang Mở Đăng Ký',
      bgClass: 'bg-emerald-50 border-emerald-200 text-emerald-700',
      dotClass: 'bg-emerald-500 animate-ping',
    },
    REGISTRATION_CLOSED: {
      label: 'Đã Chốt Danh Sách',
      bgClass: 'bg-blue-50 border-blue-200 text-blue-700',
      dotClass: 'bg-blue-500',
    },
    DRAWING: {
      label: 'Đang Bốc Thăm',
      bgClass: 'bg-amber-50 border-amber-200 text-amber-700',
      dotClass: 'bg-amber-500 animate-bounce',
    },
    GROUP_STAGE: {
      label: 'Vòng Bảng (24 Trận)',
      bgClass: 'bg-sky-50 border-sky-200 text-sky-700',
      dotClass: 'bg-sky-500 animate-pulse',
    },
    QUARTER_FINAL: {
      label: 'Vòng Tứ Kết',
      bgClass: 'bg-indigo-50 border-indigo-200 text-indigo-700',
      dotClass: 'bg-indigo-500 animate-pulse',
    },
    SEMI_FINAL: {
      label: 'Vòng Bán Kết',
      bgClass: 'bg-purple-50 border-purple-200 text-purple-700',
      dotClass: 'bg-purple-500 animate-pulse',
    },
    THIRD_PLACE: {
      label: 'Tranh Hạng 3',
      bgClass: 'bg-amber-50 border-amber-200 text-amber-700',
      dotClass: 'bg-amber-500',
    },
    FINAL: {
      label: 'Chung Kết & Trao Cúp',
      bgClass: 'bg-rose-50 border-rose-200 text-rose-700',
      dotClass: 'bg-rose-500 animate-pulse',
    },
    COMPLETED: {
      label: 'Đã Bế Mạc',
      bgClass: 'bg-slate-100 border-slate-200 text-slate-600',
      dotClass: 'bg-slate-400',
    },
  };

  const currentStage = statusConfigs[tournamentStatus] || statusConfigs.GROUP_STAGE;

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 text-slate-800 shadow-xs">
      {/* Top Banner Alert for Live Matches */}
      {liveMatchCount > 0 && (
        <div 
          onClick={onNavigateToLive}
          className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white text-xs font-black py-2 px-4 text-center cursor-pointer hover:opacity-95 transition-all flex items-center justify-center gap-2 shadow-inner"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
          </span>
          <span className="tracking-wide">ĐANG CÓ {liveMatchCount} TRẬN ĐẤU LIVE! BẤM ĐỂ THEO DÕI LIVE SCORE VÀ BÌNH LUẬN TRỰC TIẾP</span>
          <Radio className="w-4 h-4 animate-pulse shrink-0" />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 sm:h-20">
          
          {/* Brand Logo, Back Button, Portal Button & Dynamic Tournament Title */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Dedicated Back Button (Lùi 1 trang) - Visible on mobile & desktop */}
            {onGoBack && canGoBack && (
              <button
                onClick={onGoBack}
                className="flex items-center gap-1.5 min-h-[44px] min-w-[44px] px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-blue-700 border border-slate-200 shadow-xs transition-all active:scale-95 shrink-0"
                title={activeTab && activeTab !== 'home' ? 'Lùi lại trang trước' : 'Quay lại cổng danh sách giải đấu'}
                aria-label="Lùi lại 1 trang"
              >
                <ArrowLeft className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="text-xs font-bold text-blue-700">
                  {activeTab && activeTab !== 'home' ? 'Lùi' : 'Cổng Giải'}
                </span>
              </button>
            )}

            <div className="relative flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-blue-600 via-sky-600 to-cyan-500 shadow-md shadow-blue-500/20 border border-sky-400/40 shrink-0">
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              <Sparkles className="absolute -top-1 -right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300 animate-bounce" />
            </div>

            {/* Back to Portal Hub button (Desktop only when not already showing onGoBack) */}
            {onBackToPortal && (!onGoBack || !canGoBack) && (
              <button
                onClick={onBackToPortal}
                className="hidden lg:flex items-center gap-1.5 min-h-[40px] px-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-blue-700 font-bold text-xs border border-slate-200 shadow-xs transition-all shrink-0 whitespace-nowrap"
                title="Quay lại cổng danh sách các giải đấu đã tạo"
              >
                <LayoutGrid className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Danh Sách Giải</span>
              </button>
            )}

            <div className="flex-1 min-w-0 pr-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] sm:text-xs font-black tracking-widest text-sky-700 uppercase bg-sky-50 px-2 py-0.5 rounded border border-sky-200 font-mono shrink-0 whitespace-nowrap">
                  {tournament.shortCode || 'ITFTMS 2026'}
                </span>
                <span className="hidden xl:inline-block text-xs text-slate-500 truncate">| {tournament.format || 'Bóng Đá 5 Người'}</span>
              </div>
              <h1 className="text-xs sm:text-sm lg:text-base font-black tracking-tight text-slate-900 truncate max-w-[140px] sm:max-w-[200px] md:max-w-xs lg:max-w-sm xl:max-w-md">
                {tournament.name || 'GIẢI BÓNG ĐÁ KHOA CNTT 2026'}
              </h1>
            </div>
          </div>

          {/* Right Controls: Desktop controls hidden on mobile, mobile has ONLY the Hamburger Menu button */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            
            {/* Edit Tournament Config Button (Desktop only, mobile in Menu Hamburger) */}
            {(currentRole === 'SUPER_ADMIN' || currentRole === 'ORGANIZER') && onEditTournament && (
              <button
                onClick={onEditTournament}
                className="hidden md:inline-flex items-center gap-1.5 min-h-[40px] px-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-sky-700 hover:text-sky-800 font-bold text-xs border border-slate-200 shadow-xs transition-all shrink-0 whitespace-nowrap active:scale-95"
                title={`Cấu hình giải đấu: ${tournament.numberOfGroups || 4} Bảng × ${tournament.teamsPerGroup || 4} Đội`}
              >
                <Edit3 className="w-4 h-4 text-sky-600 shrink-0" />
                <span>Cấu Hình Bảng</span>
              </button>
            )}

            {/* Create Tournament Button (Desktop only, mobile in Menu Hamburger) */}
            {(currentRole === 'SUPER_ADMIN' || currentRole === 'ORGANIZER') && (
              <button
                onClick={onOpenCreateTournament}
                className="hidden md:inline-flex items-center gap-1.5 min-h-[40px] px-4 rounded-xl bg-gradient-to-r from-blue-600 via-sky-600 to-cyan-600 hover:from-blue-700 hover:to-sky-700 text-white font-black text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all border border-blue-400/30 shrink-0 whitespace-nowrap active:scale-95"
                title="Khởi tạo mùa giải bóng đá mới"
              >
                <Plus className="w-4 h-4 shrink-0" />
                <span>+ Tạo Giải Mới</span>
              </button>
            )}

            {/* Tournament Stage Indicator */}
            <div className="relative hidden lg:block shrink-0">
              <button
                onClick={() => canManage && setStatusMenuOpen(!statusMenuOpen)}
                className={`flex items-center gap-2 text-xs font-bold min-h-[40px] px-3.5 rounded-xl border shadow-xs transition-all shrink-0 whitespace-nowrap ${currentStage.bgClass} ${
                  canManage ? 'cursor-pointer hover:brightness-95 active:scale-95' : 'cursor-default'
                }`}
                title={canManage ? 'Bấm để thay đổi giai đoạn giải đấu' : 'Giai đoạn hiện tại của giải đấu'}
              >
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className={`w-2 h-2 rounded-full ${currentStage.dotClass} shrink-0`}></span>
                </span>
                <span className="text-slate-500 font-medium whitespace-nowrap">Giai đoạn:</span>
                <span className="font-extrabold whitespace-nowrap">{currentStage.label}</span>
                {canManage && <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />}
              </button>

              {canManage && statusMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3.5 py-2 text-[11px] font-black text-slate-500 uppercase tracking-wider border-b border-slate-100 flex items-center justify-between">
                    <span>Chuyển Giai Đoạn Giải</span>
                    <span className="text-[10px] text-blue-600 font-bold">BTC / Admin</span>
                  </div>
                  <div className="max-h-80 overflow-y-auto py-1">
                    {(Object.entries(statusConfigs) as [TournamentStatus, typeof currentStage][]).map(([key, config]) => (
                      <button
                        key={key}
                        onClick={() => {
                          onStatusChange(key);
                          setStatusMenuOpen(false);
                        }}
                        className={`w-full text-left px-3.5 py-2.5 text-xs flex items-center justify-between transition-colors min-h-[40px] ${
                          tournamentStatus === key
                            ? `${config.bgClass} font-black border-y border-transparent`
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${config.dotClass} shrink-0`}></span>
                          <span>{config.label}</span>
                        </div>
                        {tournamentStatus === key && <span className="text-xs font-bold text-blue-600">✓</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Cloud Realtime Sync Status Indicator (Desktop only) */}
            <div
              className={`hidden lg:flex items-center gap-1.5 min-h-[40px] px-3 rounded-xl border text-xs font-semibold shadow-xs transition-all shrink-0 whitespace-nowrap ${
                cloudStatus === 'connected'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : cloudStatus === 'connecting'
                  ? 'bg-amber-50 border-amber-200 text-amber-700'
                  : 'bg-slate-100 border-slate-200 text-slate-600'
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
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                )}
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    cloudStatus === 'connected'
                      ? 'bg-emerald-500'
                      : cloudStatus === 'connecting'
                      ? 'bg-amber-500'
                      : 'bg-slate-400'
                  }`}
                ></span>
              </span>
              <Cloud className="w-3.5 h-3.5 shrink-0" />
              <span className="font-mono font-bold text-[11px] whitespace-nowrap">
                {cloudStatus === 'connected' ? 'Cloud Sync' : cloudStatus === 'connecting' ? 'Kết nối...' : 'Offline'}
              </span>
            </div>

            {/* Quick Admin User Management Button (Desktop only) */}
            {canManage && onOpenUserManagement && (
              <button
                onClick={onOpenUserManagement}
                className="hidden xl:flex items-center gap-1.5 min-h-[40px] px-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-blue-700 transition-all shadow-xs shrink-0 active:scale-95"
                title="Tạo và quản lý tài khoản Ban Tổ Chức & Trọng tài"
              >
                <Users className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Cấp Tài Khoản</span>
              </button>
            )}

            {/* Sound FX Toggle Button (Desktop only, mobile in Menu Hamburger) */}
            <button
              onClick={toggleSound}
              className={`hidden md:flex items-center justify-center min-h-[40px] min-w-[40px] rounded-xl border transition-all shrink-0 ${
                soundOn
                  ? 'bg-sky-50 border-sky-200 text-sky-700 hover:bg-sky-100'
                  : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600'
              }`}
              title={soundOn ? 'Âm thanh còi & ăn mừng: BẬT' : 'Âm thanh: TẮT'}
              aria-label="Bật tắt âm thanh hiệu ứng"
            >
              {soundOn ? <Volume2 className="w-4 h-4 shrink-0 text-sky-600" /> : <VolumeX className="w-4 h-4 shrink-0" />}
            </button>

            {/* User Profile / Login System (Desktop only, mobile in Menu Hamburger) */}
            {currentUser ? (
              <div className="relative hidden md:block shrink-0">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 min-h-[40px] px-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 shadow-xs transition-all shrink-0 whitespace-nowrap"
                  title="Thông tin tài khoản & Đổi vai trò"
                >
                  <img
                    src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                    alt={currentUser.fullName}
                    className="w-7 h-7 rounded-lg object-cover border border-sky-300 shrink-0"
                  />
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-slate-900 max-w-[110px] truncate leading-tight">
                      {currentUser.fullName}
                    </span>
                    <span className="text-[10px] font-semibold text-blue-600">
                      {roleLabels[currentRole]?.label || currentRole}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 ml-0.5 shrink-0" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl py-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                    {/* User Info Header */}
                    <div className="px-4 pb-3 border-b border-slate-100 flex items-center gap-3">
                      <img
                        src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                        alt={currentUser.fullName}
                        className="w-10 h-10 rounded-xl object-cover border border-sky-300 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-slate-900 truncate">{currentUser.fullName}</div>
                        <div className="text-[11px] text-slate-500 font-mono truncate">@{currentUser.username} • {currentUser.email}</div>
                        <span className={`inline-block mt-1 text-[10px] font-bold px-1.5 py-0.5 rounded border ${roleLabels[currentRole]?.color || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                          {roleLabels[currentRole]?.label}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-2 px-3 space-y-1">
                      {onOpenAuthModal && (
                        <button
                          onClick={() => {
                            setUserMenuOpen(false);
                            onOpenAuthModal();
                          }}
                          className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:text-blue-700 hover:bg-blue-50/80 rounded-xl flex items-center gap-2 transition-colors min-h-[38px]"
                        >
                          <User className="w-4 h-4 text-sky-600" />
                          <span>Đổi Tài Khoản / Đăng Ký Mới</span>
                        </button>
                      )}

                      {onLogout && (
                        <button
                          onClick={() => {
                            setUserMenuOpen(false);
                            onLogout();
                          }}
                          className="w-full text-left px-3 py-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl flex items-center gap-2 transition-colors min-h-[38px]"
                        >
                          <LogOut className="w-4 h-4 text-red-600" />
                          <span>Đăng Xuất</span>
                        </button>
                      )}

                      {/* User Management for Admin/BTC */}
                      {(currentRole === 'SUPER_ADMIN' || currentRole === 'ORGANIZER') && onOpenUserManagement && (
                        <button
                          onClick={() => {
                            setUserMenuOpen(false);
                            onOpenUserManagement();
                          }}
                          className="w-full text-left px-3 py-2 text-xs text-blue-700 hover:text-blue-800 hover:bg-blue-50 rounded-xl flex items-center gap-2 transition-colors font-bold min-h-[38px]"
                        >
                          <Users className="w-4 h-4 text-blue-600" />
                          <span>Quản Lý Tài Khoản (BTC/Trọng Tài)</span>
                        </button>
                      )}

                      {/* Database Utilities inside User Menu for Admin/BTC */}
                      {(currentRole === 'SUPER_ADMIN' || currentRole === 'ORGANIZER') && (
                        <div className="pt-2 border-t border-slate-100 space-y-1">
                          {onClearData && (
                            <button
                              onClick={() => {
                                setUserMenuOpen(false);
                                onClearData();
                              }}
                              className="w-full text-left px-3 py-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl flex items-center gap-2 transition-colors min-h-[38px]"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                              <span>Xóa Sạch Dữ Liệu Mẫu</span>
                            </button>
                          )}
                          {onLoadDemo && (
                            <button
                              onClick={() => {
                                setUserMenuOpen(false);
                                onLoadDemo();
                              }}
                              className="w-full text-left px-3 py-2 text-xs text-amber-700 hover:text-amber-800 hover:bg-amber-50 rounded-xl flex items-center gap-2 transition-colors min-h-[38px]"
                            >
                              <Database className="w-4 h-4 text-amber-600" />
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
                  className="hidden md:inline-flex items-center gap-2 min-h-[40px] px-4 rounded-xl bg-gradient-to-r from-blue-600 via-sky-600 to-cyan-600 hover:from-blue-700 hover:to-sky-700 text-white font-black text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all border border-blue-400/30 shrink-0 whitespace-nowrap active:scale-95"
                >
                  <LogIn className="w-4 h-4 shrink-0" />
                  <span>Đăng Nhập</span>
                </button>
              )
            )}

            {/* Mobile Menu Hamburger Button: ONLY button visible on right on mobile phones with 44px min touch target */}
            {onOpenMobileMenu && (
              <button
                onClick={onOpenMobileMenu}
                className="flex items-center justify-center min-h-[44px] min-w-[44px] p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-blue-700 hover:text-blue-800 md:hidden transition-all shadow-xs active:scale-95"
                title="Mở menu chức năng giải đấu"
                aria-label="Mở menu chức năng"
              >
                <Menu className="w-6 h-6 text-blue-600" />
              </button>
            )}

          </div>
        </div>
      </div>
    </header>
  );
};
