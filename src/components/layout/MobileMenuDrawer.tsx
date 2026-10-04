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
  ChevronRight
} from 'lucide-react';
import { TabKey } from './Navigation';
import { UserRole, Tournament } from '@/types';
import { SoundFX } from '@/utils/soundEffects';

interface MobileMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  tournament: Tournament;
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  liveMatchCount: number;
  activeComplaintsCount: number;
  suspendedPlayersCount: number;
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
  liveMatchCount,
  activeComplaintsCount,
  suspendedPlayersCount,
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
    { role: 'STUDENT', label: 'Sinh Viên', badge: 'Xem thông tin', color: 'border-slate-700 bg-slate-800 text-slate-300' },
    { role: 'ORGANIZER', label: 'Ban Tổ Chức', badge: 'Toàn quyền điều hành', color: 'border-emerald-500 bg-emerald-950/60 text-emerald-400' },
    { role: 'REFEREE', label: 'Trọng Tài', badge: 'Nhập tỷ số & thẻ', color: 'border-amber-500 bg-amber-950/60 text-amber-400' },
    { role: 'TEAM_MANAGER', label: 'Đội Bóng', badge: 'Quản lý cầu thủ', color: 'border-blue-500 bg-blue-950/60 text-blue-400' },
    { role: 'SUPER_ADMIN', label: 'Super Admin', badge: 'Hệ thống tối cao', color: 'border-purple-500 bg-purple-950/60 text-purple-300' },
  ];

  return (
    <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end animate-in fade-in duration-200">
      
      {/* Dimmed backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        aria-hidden="true"
      />

      {/* Sliding Bottom Sheet Container */}
      <div 
        role="dialog"
        aria-modal="true"
        aria-label="Menu chức năng điều hành giải"
        className="relative z-10 w-full max-h-[88vh] bg-[#0A1124] border-t border-slate-700/80 rounded-t-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300"
      >
        
        {/* Top Handle Bar */}
        <div className="pt-3 pb-2 flex items-center justify-center relative border-b border-slate-800/80">
          <div className="w-12 h-1.5 rounded-full bg-slate-700"></div>
          <button
            onClick={onClose}
            className="absolute right-4 top-2.5 p-1 rounded-full text-slate-400 hover:text-white bg-slate-800/80 border border-slate-700"
            aria-label="Đóng menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="p-4 space-y-5 overflow-y-auto pb-10">
          
          {/* Tournament Overview Header Card */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-slate-900 to-teal-950/70 border border-emerald-500/30 flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono font-black tracking-widest text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                  {tournament.shortCode || 'ITFTMS'}
                </span>
                <span className="text-[11px] font-bold text-slate-300">
                  {tournament.numberOfGroups || 4} Bảng × {tournament.teamsPerGroup || 4} Đội
                </span>
              </div>
              <h3 className="text-sm font-black text-white line-clamp-1">
                {tournament.name}
              </h3>
              <p className="text-[11px] text-slate-400">
                {tournament.format || 'Bóng đá 5 người'} • 40 phút
              </p>
            </div>

            {/* Quick configure button */}
            {onOpenEditTournament && (currentRole === 'SUPER_ADMIN' || currentRole === 'ORGANIZER') && (
              <button
                onClick={() => {
                  onClose();
                  onOpenEditTournament();
                }}
                className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 text-xs font-bold flex flex-col items-center gap-1 shadow-sm"
                title="Chỉnh sửa số bảng và số đội/bảng"
              >
                <Settings2 className="w-4 h-4 text-cyan-400" />
                <span className="text-[9px]">Cấu hình</span>
              </button>
            )}
          </div>

          {/* RBAC Role Selector Pills */}
          <div className="space-y-2">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Góc nhìn vai trò (RBAC)</span>
              <span className="text-[10px] text-emerald-400 font-mono">Đang chọn: {currentRole}</span>
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
                      <div className="text-[9px] text-slate-400">{r.badge}</div>
                    </div>
                    {isCurrent && <span className="text-emerald-400 text-xs font-black">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Primary Operations Grid */}
          <div className="space-y-2">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Tất Cả Các Chức Năng Của Giải
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
                <span>Lịch & Kết Quả</span>
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
                <span>Đội & Cầu Thủ</span>
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

          {/* Quick Utility Actions */}
          <div className="pt-2 border-t border-slate-800/80 space-y-2">
            
            {/* Back to Portal Hub */}
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
                  <span>Quay Về Cổng Các Giải Đấu Đã Tạo</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>
            )}

            {/* Sound Toggle Button */}
            <button
              onClick={handleToggleSound}
              className="w-full p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 flex items-center justify-between text-xs font-bold transition-colors"
            >
              <div className="flex items-center gap-2">
                {soundOn ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
                <span>Âm thanh còi & hiệu ứng bóng đá</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${soundOn ? 'bg-emerald-950 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                {soundOn ? 'BẬT' : 'TẮT'}
              </span>
            </button>

            {/* Clear / Demo Data (Admin / Organizer) */}
            {(currentRole === 'SUPER_ADMIN' || currentRole === 'ORGANIZER') && (
              <div className="grid grid-cols-2 gap-2 pt-1">
                {onClearData && (
                  <button
                    onClick={() => {
                      onClose();
                      onClearData();
                    }}
                    className="p-2.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-red-900"
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
                    className="p-2.5 rounded-xl bg-slate-900 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-slate-800"
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
