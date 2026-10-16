'use client';

import React from 'react';
import { 
  X, 
  Users, 
  Dices, 
  GitFork, 
  ShieldAlert, 
  Clock, 
  BadgeDollarSign, 
  Award, 
  FileText, 
  Home, 
  Radio, 
  CalendarDays, 
  Trophy, 
  LayoutGrid, 
  Settings2, 
  Volume2, 
  VolumeX, 
  Trash2, 
  Database,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Plus,
  Edit3,
  ChevronDown,
  LogIn,
  LogOut,
  User,
  KeyRound,
  ArrowLeft
} from 'lucide-react';
import { TabKey } from './Navigation';
import { UserRole, Tournament, TournamentStatus, UserAccount } from '@/types';
import { SoundFX } from '@/utils/soundEffects';

interface MobileMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  tournament: Tournament;
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  tournamentStatus?: TournamentStatus;
  onStatusChange?: (status: TournamentStatus) => void;
  liveMatchCount: number;
  activeComplaintsCount: number;
  suspendedPlayersCount: number;
  onOpenCreateTournament?: () => void;
  onOpenEditTournament?: () => void;
  onBackToPortal?: () => void;
  onClearData?: () => void;
  onLoadDemo?: () => void;
  currentUser?: UserAccount | null;
  onOpenAuthModal?: () => void;
  onOpenUserManagement?: () => void;
  onLogout?: () => void;
  onGoBack?: () => void;
  canGoBack?: boolean;
  cloudStatus?: 'connected' | 'connecting' | 'offline';
}

export const MobileMenuDrawer: React.FC<MobileMenuDrawerProps> = ({
  isOpen,
  onClose,
  activeTab,
  onSelectTab,
  tournament,
  currentRole,
  onRoleChange,
  tournamentStatus = 'GROUP_STAGE',
  onStatusChange,
  liveMatchCount,
  activeComplaintsCount,
  suspendedPlayersCount,
  onOpenCreateTournament,
  onOpenEditTournament,
  onBackToPortal,
  onClearData,
  onLoadDemo,
  currentUser,
  onOpenAuthModal,
  onOpenUserManagement,
  onLogout,
  onGoBack,
  canGoBack,
  cloudStatus,
}) => {
  const [soundOn, setSoundOn] = React.useState(true);

  if (!isOpen) return null;

  const handlePickTab = (tab: TabKey) => {
    SoundFX.playClick();
    onSelectTab(tab);
    onClose();
  };

  const handleToggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    SoundFX.setSoundEnabled(next);
    if (next) SoundFX.playWhistle();
  };

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
  const canManage = currentRole === 'SUPER_ADMIN' || currentRole === 'ORGANIZER';

  return (
    <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end animate-in fade-in duration-200">
      
      {/* Dimmed backdrop - NO blur */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/50 transition-opacity"
        aria-hidden="true"
      />

      {/* Sliding Bottom Sheet Container - Crisp Solid White */}
      <div 
        role="dialog"
        aria-modal="true"
        aria-label="Menu chức năng điều hành giải"
        className="relative z-10 w-full max-h-[90vh] bg-white border-t border-slate-200 rounded-t-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300 text-slate-800"
      >
        
        {/* Top Handle Bar */}
        <div className="pt-3 pb-2.5 px-4 flex items-center justify-between border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${
              cloudStatus === 'connected' ? 'bg-emerald-500 animate-pulse' : cloudStatus === 'connecting' ? 'bg-amber-500 animate-ping' : 'bg-slate-400'
            }`}></span>
            <span className="text-xs font-black uppercase text-slate-800 tracking-wider">
              MENU ĐIỀU HÀNH &amp; CHỨC NĂNG
            </span>
          </div>

          <div className="flex items-center gap-2">
            {cloudStatus && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold border ${
                cloudStatus === 'connected'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : cloudStatus === 'connecting'
                  ? 'bg-amber-50 border-amber-200 text-amber-700'
                  : 'bg-slate-100 border-slate-200 text-slate-600'
              }`}>
                {cloudStatus === 'connected' ? '🟢 Cloud Sync' : cloudStatus === 'connecting' ? '🟡 Kết nối...' : '⚪ Offline'}
              </span>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 active:scale-95"
              aria-label="Đóng menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Back Button inside drawer */}
        {onGoBack && canGoBack && (
          <div className="px-4 pt-3 pb-1 bg-slate-50 border-b border-slate-100">
            <button
              onClick={() => {
                onClose();
                onGoBack();
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-white border border-blue-200 hover:bg-blue-50 text-blue-700 text-xs font-bold flex items-center justify-center gap-2 shadow-xs active:scale-95 transition-all"
            >
              <ArrowLeft className="w-4 h-4 text-blue-600" />
              <span>Lùi Lại Trang Trước (Trang Vừa Xem)</span>
            </button>
          </div>
        )}

        {/* Drawer Scrollable Content */}
        <div className="p-4 space-y-4 overflow-y-auto pb-12">
          
          {/* User Account / Login Card */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs">
            {currentUser ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <img
                    src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                    alt={currentUser.fullName}
                    className="w-11 h-11 rounded-xl object-cover border-2 border-blue-400 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-900 truncate">{currentUser.fullName}</span>
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded border border-blue-200">
                        {currentRole}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono truncate">@{currentUser.username} • {currentUser.email}</div>
                    {currentUser.teamName && (
                      <div className="text-[10px] text-blue-600 mt-0.5 font-medium truncate">Đội: {currentUser.teamName}</div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
                  {onOpenAuthModal && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenAuthModal();
                      }}
                      className="py-2 px-3 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      <User className="w-3.5 h-3.5 text-blue-600" />
                      <span>Đổi Tài Khoản</span>
                    </button>
                  )}

                  {onLogout && (
                    <button
                      onClick={() => {
                        onClose();
                        onLogout();
                      }}
                      className="py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-600" />
                      <span>Đăng Xuất</span>
                    </button>
                  )}
                </div>

                {/* User Management Button for Admin/BTC */}
                {canManage && onOpenUserManagement && (
                  <div className="pt-2 border-t border-slate-200">
                    <button
                      onClick={() => {
                        onClose();
                        onOpenUserManagement();
                      }}
                      className="w-full py-2.5 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-bold flex items-center justify-center gap-2 active:scale-95 shadow-xs"
                    >
                      <Users className="w-4 h-4 text-blue-600" />
                      <span>Tạo & Quản Lý Tài Khoản (BTC & Trọng Tài)</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-slate-900">Chưa Đăng Nhập Hệ Thống</div>
                  <div className="text-[10px] text-slate-500">Đăng nhập tài khoản để điều hành &amp; cập nhật giải</div>
                </div>
                {onOpenAuthModal && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenAuthModal();
                    }}
                    className="py-2 px-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-sky-600 to-cyan-600 hover:from-blue-700 hover:to-sky-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center gap-1.5 active:scale-95 shrink-0"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Đăng Nhập</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Tournament Overview Header Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-700 via-sky-600 to-blue-800 text-white space-y-3 shadow-md border border-blue-500/30">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono font-black tracking-widest text-white bg-white/20 px-2 py-0.5 rounded border border-white/30">
                    {tournament?.shortCode || 'ITFTMS'}
                  </span>
                  <span className="text-[11px] font-bold text-blue-100">
                    {tournament?.numberOfGroups || 4} Bảng × {tournament?.teamsPerGroup || 4} Đội
                  </span>
                </div>
                <h3 className="text-sm font-black text-white line-clamp-2">
                  {tournament?.name || 'Giải Bóng Đá'}
                </h3>
                <p className="text-[11px] text-blue-100">
                  {tournament?.format || 'Bóng đá 5 người'} • 40 phút • {tournament?.maxTeams || 16} đội
                </p>
              </div>

              {/* Tournament Stage Badge */}
              <div className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border shrink-0 flex items-center gap-1.5 shadow-xs bg-white text-blue-800 border-white`}>
                <span className={`w-1.5 h-1.5 rounded-full ${currentStage.dotClass} shrink-0`}></span>
                <span className="whitespace-nowrap">{currentStage.label}</span>
              </div>
            </div>

            {/* Quick Management Buttons */}
            {canManage && (
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/20">
                {onOpenEditTournament && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenEditTournament();
                    }}
                    className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/25 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs active:scale-95"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-blue-200" />
                    <span>Sửa Cấu Hình Bảng</span>
                  </button>
                )}

                {onOpenCreateTournament && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenCreateTournament();
                    }}
                    className="p-2.5 rounded-xl bg-white text-blue-700 hover:bg-blue-50 text-xs font-black flex items-center justify-center gap-1.5 shadow-md active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5 text-blue-600" />
                    <span>+ Tạo Mới Giải Đấu</span>
                  </button>
                )}
              </div>
            )}

            {/* Change Tournament Stage Dropdown */}
            {canManage && onStatusChange && (
              <div className="pt-2 border-t border-white/20 flex items-center justify-between text-xs">
                <span className="text-blue-100 font-medium">Chuyển Giai Đoạn:</span>
                <select
                  value={tournamentStatus}
                  onChange={(e) => onStatusChange(e.target.value as TournamentStatus)}
                  className="border font-bold px-2.5 py-1.5 rounded-xl text-xs focus:outline-none bg-white text-slate-800 border-white shadow-xs"
                >
                  {(Object.entries(statusConfigs) as [TournamentStatus, typeof currentStage][]).map(([key, config]) => (
                    <option key={key} value={key} className="bg-white text-slate-800">
                      {config.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Primary Operations Grid */}
          <div className="space-y-2">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Danh Mục Chức Năng Giải Đấu
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              
              {/* Home */}
              <button
                onClick={() => handlePickTab('home')}
                className={`p-3 min-h-[48px] rounded-2xl border text-left flex items-center gap-2.5 transition-all active:scale-95 ${
                  activeTab === 'home'
                    ? 'bg-blue-50 border-blue-400 text-blue-800 font-bold shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className={`p-2 rounded-xl shrink-0 ${activeTab === 'home' ? 'bg-blue-200 text-blue-800' : 'bg-slate-200 text-slate-600'}`}>
                  <Home className="w-4 h-4" />
                </div>
                <span>Trang Chủ</span>
              </button>

              {/* Live */}
              <button
                onClick={() => handlePickTab('live')}
                className={`p-3 min-h-[48px] rounded-2xl border text-left flex items-center justify-between transition-all active:scale-95 ${
                  activeTab === 'live'
                    ? 'bg-red-50 border-red-300 text-red-800 font-bold shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-xl shrink-0 ${activeTab === 'live' ? 'bg-red-100 text-red-600' : 'bg-slate-200 text-slate-600'}`}>
                    <Radio className="w-4 h-4" />
                  </div>
                  <span>Live Match</span>
                </div>
                {liveMatchCount > 0 && (
                  <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded-full font-black animate-pulse">
                    {liveMatchCount}
                  </span>
                )}
              </button>

              {/* Schedule */}
              <button
                onClick={() => handlePickTab('schedule')}
                className={`p-3 min-h-[48px] rounded-2xl border text-left flex items-center gap-2.5 transition-all active:scale-95 ${
                  activeTab === 'schedule'
                    ? 'bg-sky-50 border-sky-300 text-sky-800 font-bold shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className={`p-2 rounded-xl shrink-0 ${activeTab === 'schedule' ? 'bg-sky-100 text-sky-600' : 'bg-slate-200 text-slate-600'}`}>
                  <CalendarDays className="w-4 h-4" />
                </div>
                <span>Lịch &amp; Kết Quả</span>
              </button>

              {/* Standings */}
              <button
                onClick={() => handlePickTab('standings')}
                className={`p-3 min-h-[48px] rounded-2xl border text-left flex items-center gap-2.5 transition-all active:scale-95 ${
                  activeTab === 'standings'
                    ? 'bg-amber-50 border-amber-300 text-amber-800 font-bold shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className={`p-2 rounded-xl shrink-0 ${activeTab === 'standings' ? 'bg-amber-100 text-amber-600' : 'bg-slate-200 text-slate-600'}`}>
                  <Trophy className="w-4 h-4" />
                </div>
                <span>Bảng Xếp Hạng</span>
              </button>

              {/* Teams */}
              <button
                onClick={() => handlePickTab('teams')}
                className={`p-3 min-h-[48px] rounded-2xl border text-left flex items-center gap-2.5 transition-all active:scale-95 ${
                  activeTab === 'teams'
                    ? 'bg-blue-50 border-blue-400 text-blue-800 font-bold shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className={`p-2 rounded-xl shrink-0 ${activeTab === 'teams' ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-600'}`}>
                  <Users className="w-4 h-4" />
                </div>
                <span>Đội &amp; Cầu Thủ</span>
              </button>

              {/* Draw Studio - Only for Super Admin and BTC */}
              {canManage && (
                <button
                  onClick={() => handlePickTab('draw')}
                  className={`p-3 min-h-[48px] rounded-2xl border text-left flex items-center gap-2.5 transition-all active:scale-95 ${
                    activeTab === 'draw'
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-800 font-bold shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className={`p-2 rounded-xl shrink-0 ${activeTab === 'draw' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-600'}`}>
                    <Dices className="w-4 h-4" />
                  </div>
                  <span>Bốc Thăm Bảng</span>
                </button>
              )}

              {/* Knockout Bracket */}
              <button
                onClick={() => handlePickTab('bracket')}
                className={`p-3 min-h-[48px] rounded-2xl border text-left flex items-center gap-2.5 transition-all active:scale-95 ${
                  activeTab === 'bracket'
                    ? 'bg-purple-50 border-purple-300 text-purple-800 font-bold shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className={`p-2 rounded-xl shrink-0 ${activeTab === 'bracket' ? 'bg-purple-100 text-purple-600' : 'bg-slate-200 text-slate-600'}`}>
                  <GitFork className="w-4 h-4" />
                </div>
                <span>Nhánh Knock-out</span>
              </button>

              {/* Discipline */}
              <button
                onClick={() => handlePickTab('discipline')}
                className={`p-3 min-h-[48px] rounded-2xl border text-left flex items-center justify-between transition-all active:scale-95 ${
                  activeTab === 'discipline'
                    ? 'bg-amber-50 border-amber-300 text-amber-800 font-bold shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-xl shrink-0 ${activeTab === 'discipline' ? 'bg-amber-100 text-amber-600' : 'bg-slate-200 text-slate-600'}`}>
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <span>Kỷ Luật / Treo Giò</span>
                </div>
                {suspendedPlayersCount > 0 && (
                  <span className="text-[10px] bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full font-bold">
                    {suspendedPlayersCount}
                  </span>
                )}
              </button>

              {/* Complaints - Only for Super Admin, BTC, and Team Captains */}
              {(canManage || currentRole === 'TEAM_MANAGER') && (
                <button
                  onClick={() => handlePickTab('complaints')}
                  className={`p-3 min-h-[48px] rounded-2xl border text-left flex items-center justify-between transition-all active:scale-95 ${
                    activeTab === 'complaints'
                      ? 'bg-cyan-50 border-cyan-300 text-cyan-800 font-bold shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-xl shrink-0 ${activeTab === 'complaints' ? 'bg-cyan-100 text-cyan-600' : 'bg-slate-200 text-slate-600'}`}>
                      <Clock className="w-4 h-4" />
                    </div>
                    <span>Khiếu Nại 15 Phút</span>
                  </div>
                  {activeComplaintsCount > 0 && (
                    <span className="text-[10px] bg-cyan-600 text-white px-2 py-0.5 rounded-full font-bold">
                      {activeComplaintsCount}
                    </span>
                  )}
                </button>
              )}

              {/* Finance - Only for Super Admin and BTC */}
              {canManage && (
                <button
                  onClick={() => handlePickTab('finance')}
                  className={`p-3 min-h-[48px] rounded-2xl border text-left flex items-center gap-2.5 transition-all active:scale-95 ${
                    activeTab === 'finance'
                      ? 'bg-blue-50 border-blue-400 text-blue-800 font-bold shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className={`p-2 rounded-xl shrink-0 ${activeTab === 'finance' ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-600'}`}>
                    <BadgeDollarSign className="w-4 h-4" />
                  </div>
                  <span>Tài Chính Lệ Phí</span>
                </button>
              )}

              {/* Awards */}
              <button
                onClick={() => handlePickTab('awards')}
                className={`p-3 min-h-[48px] rounded-2xl border text-left flex items-center gap-2.5 transition-all active:scale-95 ${
                  activeTab === 'awards'
                    ? 'bg-amber-50 border-amber-300 text-amber-800 font-bold shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className={`p-2 rounded-xl shrink-0 ${activeTab === 'awards' ? 'bg-amber-100 text-amber-600' : 'bg-slate-200 text-slate-600'}`}>
                  <Award className="w-4 h-4" />
                </div>
                <span>Giải Thưởng</span>
              </button>

              {/* Audit Log - Only for Super Admin and BTC */}
              {canManage && (
                <button
                  onClick={() => handlePickTab('audit')}
                  className={`p-3 min-h-[48px] rounded-2xl border text-left flex items-center gap-2.5 transition-all active:scale-95 ${
                    activeTab === 'audit'
                      ? 'bg-slate-200 border-slate-400 text-slate-900 font-bold shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="p-2 rounded-xl bg-slate-200 text-slate-700 shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <span>Audit Logs</span>
                </button>
              )}

            </div>
          </div>

          {/* Quick Utility Actions */}
          <div className="pt-2 border-t border-slate-200 space-y-2">
            
            {/* Back to Portal Hub (Đổi Giải) */}
            {onBackToPortal && (
              <button
                onClick={() => {
                  onClose();
                  onBackToPortal();
                }}
                className="w-full min-h-[48px] p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-between text-xs font-bold transition-all active:scale-95"
              >
                <div className="flex items-center gap-2">
                  <LayoutGrid className="w-4 h-4 text-blue-600" />
                  <span>Quay Về Cổng Các Giải Đấu Đã Tạo (Đổi Giải)</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            )}

            {/* Sound Toggle Button */}
            <button
              onClick={handleToggleSound}
              className="w-full min-h-[48px] p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-between text-xs font-bold transition-all active:scale-95"
            >
              <div className="flex items-center gap-2">
                {soundOn ? <Volume2 className="w-4 h-4 text-blue-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
                <span>Âm thanh còi &amp; hiệu ứng ăn mừng bóng đá</span>
              </div>
              <span className={`text-[10px] px-2.5 py-1 rounded-lg font-bold ${soundOn ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-slate-200 text-slate-500'}`}>
                {soundOn ? 'ĐANG BẬT' : 'ĐANG TẮT'}
              </span>
            </button>

            {/* Clear / Demo Data (Admin / Organizer) */}
            {canManage && (
              <div className="grid grid-cols-2 gap-2 pt-1">
                {onClearData && (
                  <button
                    onClick={() => {
                      onClose();
                      onClearData();
                    }}
                    className="p-3 min-h-[44px] rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-rose-100 active:scale-95"
                  >
                    <Trash2 className="w-4 h-4 text-rose-600" />
                    <span>Xóa Dữ Liệu</span>
                  </button>
                )}

                {onLoadDemo && (
                  <button
                    onClick={() => {
                      onClose();
                      onLoadDemo();
                    }}
                    className="p-3 min-h-[44px] rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-amber-100 active:scale-95"
                  >
                    <Database className="w-4 h-4 text-amber-600" />
                    <span>Nạp Dữ Liệu Demo</span>
                  </button>
                )}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
