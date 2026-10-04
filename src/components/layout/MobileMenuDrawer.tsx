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
  ChevronDown
} from 'lucide-react';
import { TabKey } from './Navigation';
import { UserRole, Tournament, TournamentStatus } from '@/types';
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

  const rolesList: { role: UserRole; label: string; badge: string; color: string }[] = [
    { role: 'STUDENT', label: 'Sinh Viên', badge: 'Xem thông tin & bảng xếp hạng', color: 'border-slate-700 bg-slate-800 text-slate-300' },
    { role: 'ORGANIZER', label: 'Ban Tổ Chức', badge: 'Toàn quyền điều hành giải', color: 'border-emerald-500 bg-emerald-950/60 text-emerald-400' },
    { role: 'REFEREE', label: 'Trọng Tài', badge: 'Nhập tỷ số & sự kiện trận', color: 'border-amber-500 bg-amber-950/60 text-amber-400' },
    { role: 'TEAM_MANAGER', label: 'Đội Bóng', badge: 'Quản lý cầu thủ & áo đấu', color: 'border-blue-500 bg-blue-950/60 text-blue-400' },
    { role: 'SUPER_ADMIN', label: 'Super Admin', badge: 'Quản trị hệ thống tối cao', color: 'border-purple-500 bg-purple-950/60 text-purple-300' },
  ];

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

  const canManage = currentRole === 'SUPER_ADMIN' || currentRole === 'ORGANIZER';

  return (
    <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end animate-in fade-in duration-200">
      
      {/* Dimmed backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        aria-hidden="true"
      />

      {/* Sliding Bottom Sheet Container */}
      <div 
        role="dialog"
        aria-modal="true"
        aria-label="Menu chức năng điều hành giải"
        className="relative z-10 w-full max-h-[90vh] bg-[#090F1E] border-t border-slate-700/80 rounded-t-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300"
      >
        
        {/* Top Handle Bar */}
        <div className="pt-3 pb-2.5 px-4 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-black uppercase text-white tracking-wider">
              MENU ĐIỀU HÀNH &amp; CHỨC NĂNG
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white bg-slate-800 border border-slate-700 active:scale-95"
            aria-label="Đóng menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="p-4 space-y-5 overflow-y-auto pb-12">
          
          {/* Tournament Overview Header Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/70 via-slate-900 to-teal-950/70 border border-emerald-500/30 space-y-3 shadow-lg">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono font-black tracking-widest text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                    {tournament.shortCode || 'ITFTMS'}
                  </span>
                  <span className="text-[11px] font-bold text-slate-300">
                    {tournament.numberOfGroups || 4} Bảng × {tournament.teamsPerGroup || 4} Đội
                  </span>
                </div>
                <h3 className="text-sm font-black text-white line-clamp-2">
                  {tournament.name}
                </h3>
                <p className="text-[11px] text-slate-400">
                  {tournament.format || 'Bóng đá 5 người'} • 40 phút • {tournament.maxTeams || 16} đội
                </p>
              </div>

              {/* Tournament Stage Badge */}
              <div className="text-[10px] font-bold text-emerald-400 bg-emerald-950/90 border border-emerald-500/40 px-2 py-1 rounded-lg shrink-0">
                {statusLabels[tournamentStatus] || 'Vòng Bảng'}
              </div>
            </div>

            {/* Quick Management Buttons (Moved from mobile header into Menu) */}
            {canManage && (
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
                {onOpenEditTournament && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenEditTournament();
                    }}
                    className="p-2.5 rounded-xl bg-cyan-950/80 hover:bg-cyan-900/80 border border-cyan-500/40 text-cyan-300 text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Sửa Cấu Hình Bảng</span>
                  </button>
                )}

                {onOpenCreateTournament && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenCreateTournament();
                    }}
                    className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Tạo Mới Giải Đấu</span>
                  </button>
                )}
              </div>
            )}

            {/* Change Tournament Stage Dropdown (For Organizers) */}
            {canManage && onStatusChange && (
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Chuyển Giai Đoạn:</span>
                <select
                  value={tournamentStatus}
                  onChange={(e) => onStatusChange(e.target.value as TournamentStatus)}
                  className="bg-slate-900 border border-slate-700 text-emerald-400 font-bold px-2 py-1 rounded-lg text-xs focus:outline-none"
                >
                  {Object.entries(statusLabels).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* RBAC Role Selector (Moved from mobile header into Menu) */}
          <div className="space-y-2">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Góc nhìn vai trò người dùng (RBAC)</span>
              <span className="text-[10px] text-emerald-400 font-mono font-bold">
                {currentRole}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {rolesList.map((r) => {
                const isCurrent = currentRole === r.role;
                return (
                  <button
                    key={r.role}
                    onClick={() => {
                      SoundFX.playClick();
                      onRoleChange(r.role);
                    }}
                    className={`p-2.5 rounded-xl text-left border transition-all flex items-center justify-between ${
                      isCurrent
                        ? 'border-emerald-500 bg-emerald-950/80 text-white font-bold shadow-md shadow-emerald-500/20'
                        : 'border-slate-800 bg-slate-900/80 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div>
                      <div className="text-xs">{r.label}</div>
                      <div className="text-[9px] text-slate-500 line-clamp-1">{r.badge}</div>
                    </div>
                    {isCurrent && <span className="text-emerald-400 text-xs font-black">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Primary Operations Grid (12 Feature Tabs) */}
          <div className="space-y-2">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              12 Chức Năng Nghiệp Vụ Của Giải
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              
              {/* Home */}
              <button
                onClick={() => handlePickTab('home')}
                className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
                  activeTab === 'home'
                    ? 'bg-emerald-950/80 border-emerald-500 text-white font-bold'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <Home className="w-4 h-4" />
                </div>
                <span>Trang Chủ</span>
              </button>

              {/* Live */}
              <button
                onClick={() => handlePickTab('live')}
                className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  activeTab === 'live'
                    ? 'bg-red-950/80 border-red-500 text-white font-bold'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-red-500/10 text-red-400">
                    <Radio className="w-4 h-4" />
                  </div>
                  <span>Live Match</span>
                </div>
                {liveMatchCount > 0 && (
                  <span className="text-[10px] bg-red-600 text-white px-1.5 py-0.2 rounded-full font-black animate-pulse">
                    {liveMatchCount}
                  </span>
                )}
              </button>

              {/* Schedule */}
              <button
                onClick={() => handlePickTab('schedule')}
                className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
                  activeTab === 'schedule'
                    ? 'bg-teal-950/80 border-teal-500 text-white font-bold'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400">
                  <CalendarDays className="w-4 h-4" />
                </div>
                <span>Lịch &amp; Kết Quả</span>
              </button>

              {/* Standings */}
              <button
                onClick={() => handlePickTab('standings')}
                className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
                  activeTab === 'standings'
                    ? 'bg-emerald-950/80 border-emerald-500 text-white font-bold'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <Trophy className="w-4 h-4" />
                </div>
                <span>Bảng Xếp Hạng</span>
              </button>

              {/* Teams */}
              <button
                onClick={() => handlePickTab('teams')}
                className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
                  activeTab === 'teams'
                    ? 'bg-blue-950/80 border-blue-500 text-white font-bold'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                  <Users className="w-4 h-4" />
                </div>
                <span>Đội &amp; Cầu Thủ</span>
              </button>

              {/* Draw Studio */}
              <button
                onClick={() => handlePickTab('draw')}
                className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
                  activeTab === 'draw'
                    ? 'bg-amber-950/80 border-amber-500 text-white font-bold'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                  <Dices className="w-4 h-4" />
                </div>
                <span>Bốc Thăm Bảng</span>
              </button>

              {/* Knockout Bracket */}
              <button
                onClick={() => handlePickTab('bracket')}
                className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
                  activeTab === 'bracket'
                    ? 'bg-purple-950/80 border-purple-500 text-white font-bold'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                  <GitFork className="w-4 h-4" />
                </div>
                <span>Nhánh Knock-out</span>
              </button>

              {/* Discipline */}
              <button
                onClick={() => handlePickTab('discipline')}
                className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  activeTab === 'discipline'
                    ? 'bg-amber-950/80 border-amber-500 text-white font-bold'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <span>Kỷ Luật / Treo Giò</span>
                </div>
                {suspendedPlayersCount > 0 && (
                  <span className="text-[10px] bg-amber-500 text-slate-950 px-1.5 py-0.2 rounded-full font-bold">
                    {suspendedPlayersCount}
                  </span>
                )}
              </button>

              {/* Complaints */}
              <button
                onClick={() => handlePickTab('complaints')}
                className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  activeTab === 'complaints'
                    ? 'bg-cyan-950/80 border-cyan-500 text-white font-bold'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                    <Clock className="w-4 h-4" />
                  </div>
                  <span>Khiếu Nại 15 Phút</span>
                </div>
                {activeComplaintsCount > 0 && (
                  <span className="text-[10px] bg-cyan-400 text-slate-950 px-1.5 py-0.2 rounded-full font-bold">
                    {activeComplaintsCount}
                  </span>
                )}
              </button>

              {/* Finance */}
              <button
                onClick={() => handlePickTab('finance')}
                className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
                  activeTab === 'finance'
                    ? 'bg-emerald-950/80 border-emerald-500 text-white font-bold'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <BadgeDollarSign className="w-4 h-4" />
                </div>
                <span>Tài Chính Lệ Phí</span>
              </button>

              {/* Awards */}
              <button
                onClick={() => handlePickTab('awards')}
                className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
                  activeTab === 'awards'
                    ? 'bg-yellow-950/80 border-yellow-500 text-white font-bold'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="p-2 rounded-xl bg-yellow-500/10 text-yellow-400">
                  <Award className="w-4 h-4" />
                </div>
                <span>Giải Thưởng</span>
              </button>

              {/* Audit Log */}
              <button
                onClick={() => handlePickTab('audit')}
                className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
                  activeTab === 'audit'
                    ? 'bg-slate-800 border-slate-600 text-white font-bold'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="p-2 rounded-xl bg-slate-800 text-slate-300">
                  <FileText className="w-4 h-4" />
                </div>
                <span>Audit Logs</span>
              </button>

            </div>
          </div>

          {/* Quick Utility Actions (Moved from mobile header into Menu) */}
          <div className="pt-2 border-t border-slate-800/80 space-y-2">
            
            {/* Back to Portal Hub (Đổi Giải) */}
            {onBackToPortal && (
              <button
                onClick={() => {
                  onClose();
                  onBackToPortal();
                }}
                className="w-full p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 flex items-center justify-between text-xs font-bold transition-colors"
              >
                <div className="flex items-center gap-2">
                  <LayoutGrid className="w-4 h-4 text-emerald-400" />
                  <span>Quay Về Cổng Các Giải Đấu Đã Tạo (Đổi Giải)</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>
            )}

            {/* Sound Toggle Button (Moved from mobile header) */}
            <button
              onClick={handleToggleSound}
              className="w-full p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 flex items-center justify-between text-xs font-bold transition-colors"
            >
              <div className="flex items-center gap-2">
                {soundOn ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
                <span>Âm thanh còi &amp; hiệu ứng ăn mừng bóng đá</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${soundOn ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-800 text-slate-500'}`}>
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
                    className="p-2.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-red-900 active:scale-95"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    <span>Xóa Dữ Liệu</span>
                  </button>
                )}

                {onLoadDemo && (
                  <button
                    onClick={() => {
                      onClose();
                      onLoadDemo();
                    }}
                    className="p-2.5 rounded-xl bg-slate-900 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-slate-800 active:scale-95"
                  >
                    <Database className="w-3.5 h-3.5 text-amber-400" />
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
