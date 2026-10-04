'use client';

import React from 'react';
import { Home, Radio, CalendarDays, Trophy, MoreHorizontal, ArrowLeft } from 'lucide-react';
import { TabKey } from './Navigation';
import { SoundFX } from '@/utils/soundEffects';

interface MobileBottomNavProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  liveMatchCount: number;
  activeComplaintsCount: number;
  suspendedPlayersCount: number;
  onOpenMobileMenu: () => void;
  onGoBack?: () => void;
  canGoBack?: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onTabChange,
  liveMatchCount,
  activeComplaintsCount,
  suspendedPlayersCount,
  onOpenMobileMenu,
  onGoBack,
  canGoBack,
}) => {
  const hasAlerts = activeComplaintsCount > 0 || suspendedPlayersCount > 0;

  const handleSelectTab = (tab: TabKey) => {
    SoundFX.playClick();
    onTabChange(tab);
  };

  return (
    <nav 
      aria-label="Thanh điều hướng di động"
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-[#070B14]/95 backdrop-blur-xl border-t border-slate-800/90 shadow-[0_-8px_30px_rgba(0,0,0,0.5)] pb-[env(safe-area-inset-bottom,8px)]"
    >
      <div className="grid grid-cols-5 items-center px-2 py-1.5">
        
        {/* 1. Trang Chủ */}
        <button
          onClick={() => handleSelectTab('home')}
          className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all ${
            activeTab === 'home'
              ? 'text-emerald-400 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Home className="w-5 h-5" />
            {activeTab === 'home' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400"></span>
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Trang Chủ</span>
        </button>

        {/* 2. Trực Tiếp (Live) */}
        <button
          onClick={() => handleSelectTab('live')}
          className={`relative flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all ${
            activeTab === 'live'
              ? 'text-red-400 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Radio className={`w-5 h-5 ${liveMatchCount > 0 ? 'text-red-400 animate-pulse' : ''}`} />
            {liveMatchCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 px-1.5 py-0.2 text-[9px] font-black bg-red-600 text-white rounded-full animate-bounce shadow">
                {liveMatchCount}
              </span>
            )}
            {activeTab === 'live' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-red-400 shadow-sm shadow-red-400"></span>
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Trực Tiếp</span>
        </button>

        {/* 3. Lịch Đấu */}
        <button
          onClick={() => handleSelectTab('schedule')}
          className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all ${
            activeTab === 'schedule'
              ? 'text-teal-400 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <CalendarDays className="w-5 h-5" />
            {activeTab === 'schedule' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-teal-400 shadow-sm shadow-teal-400"></span>
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Lịch Đấu</span>
        </button>

        {/* 4. BXH */}
        <button
          onClick={() => handleSelectTab('standings')}
          className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all ${
            activeTab === 'standings'
              ? 'text-emerald-400 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Trophy className="w-5 h-5" />
            {activeTab === 'standings' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400"></span>
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Bảng XH</span>
        </button>

        {/* 5. Menu Thêm (Mở Drawer chức năng) */}
        <button
          onClick={() => {
            SoundFX.playClick();
            onOpenMobileMenu();
          }}
          className={`relative flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all ${
            ['bracket', 'teams', 'draw', 'discipline', 'complaints', 'finance', 'awards', 'audit'].includes(activeTab)
              ? 'text-cyan-400 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <MoreHorizontal className="w-5 h-5" />
            {hasAlerts && (
              <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
            )}
            {['bracket', 'teams', 'draw', 'discipline', 'complaints', 'finance', 'awards', 'audit'].includes(activeTab) && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400"></span>
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Thêm</span>
        </button>

      </div>

      {/* Floating Quick-Thumb Back Button (Lùi 1 trang cho ngón tay cái trên di động) */}
      {canGoBack && onGoBack && (
        <button
          onClick={onGoBack}
          className="fixed bottom-[74px] left-3 z-40 md:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/95 hover:bg-slate-800 text-emerald-400 border border-emerald-500/40 shadow-xl backdrop-blur-md font-bold text-xs active:scale-95 transition-all animate-in fade-in slide-in-from-bottom-2"
          title="Lùi lại 1 trang"
          aria-label="Lùi lại 1 trang"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-emerald-400" />
          <span>Lùi 1 trang</span>
        </button>
      )}
    </nav>
  );
};
