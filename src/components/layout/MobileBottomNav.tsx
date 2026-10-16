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
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-[max(env(safe-area-inset-bottom),10px)]"
    >
      <div className="grid grid-cols-5 items-center px-1.5 py-1">
        
        {/* 1. Trang Chủ */}
        <button
          onClick={() => handleSelectTab('home')}
          className={`flex flex-col items-center justify-center min-h-[48px] py-1 px-1 rounded-xl transition-all active:scale-95 ${
            activeTab === 'home'
              ? 'text-blue-600 font-black'
              : 'text-slate-500 hover:text-blue-600'
          }`}
          aria-label="Trang chủ giải đấu"
        >
          <div className="relative">
            <Home className="w-5 h-5" />
            {activeTab === 'home' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-blue-600 shadow-xs"></span>
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight font-semibold">Trang Chủ</span>
        </button>

        {/* 2. Trực Tiếp (Live) */}
        <button
          onClick={() => handleSelectTab('live')}
          className={`relative flex flex-col items-center justify-center min-h-[48px] py-1 px-1 rounded-xl transition-all active:scale-95 ${
            activeTab === 'live'
              ? 'text-red-600 font-black'
              : 'text-slate-500 hover:text-slate-700'
          }`}
          aria-label="Xem trực tiếp trận đấu"
        >
          <div className="relative">
            <Radio className={`w-5 h-5 ${liveMatchCount > 0 ? 'text-red-600 animate-pulse' : ''}`} />
            {liveMatchCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 px-1.5 py-0.2 text-[9px] font-black bg-red-600 text-white rounded-full animate-bounce shadow">
                {liveMatchCount}
              </span>
            )}
            {activeTab === 'live' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-red-600 shadow-xs"></span>
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight font-semibold">Trực Tiếp</span>
        </button>

        {/* 3. Lịch Đấu */}
        <button
          onClick={() => handleSelectTab('schedule')}
          className={`flex flex-col items-center justify-center min-h-[48px] py-1 px-1 rounded-xl transition-all active:scale-95 ${
            activeTab === 'schedule'
              ? 'text-sky-600 font-black'
              : 'text-slate-500 hover:text-slate-700'
          }`}
          aria-label="Lịch thi đấu và kết quả"
        >
          <div className="relative">
            <CalendarDays className="w-5 h-5" />
            {activeTab === 'schedule' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-sky-600 shadow-xs"></span>
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight font-semibold">Lịch Đấu</span>
        </button>

        {/* 4. BXH */}
        <button
          onClick={() => handleSelectTab('standings')}
          className={`flex flex-col items-center justify-center min-h-[48px] py-1 px-1 rounded-xl transition-all active:scale-95 ${
            activeTab === 'standings'
              ? 'text-amber-600 font-black'
              : 'text-slate-500 hover:text-slate-700'
          }`}
          aria-label="Bảng xếp hạng giải đấu"
        >
          <div className="relative">
            <Trophy className="w-5 h-5" />
            {activeTab === 'standings' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-amber-500 shadow-xs"></span>
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight font-semibold">Bảng XH</span>
        </button>

        {/* 5. Menu Thêm (Mở Drawer chức năng) */}
        <button
          onClick={() => {
            SoundFX.playClick();
            onOpenMobileMenu();
          }}
          className={`relative flex flex-col items-center justify-center min-h-[48px] py-1 px-1 rounded-xl transition-all active:scale-95 ${
            ['bracket', 'teams', 'draw', 'discipline', 'complaints', 'finance', 'awards', 'audit'].includes(activeTab)
              ? 'text-blue-600 font-black'
              : 'text-slate-500 hover:text-slate-700'
          }`}
          aria-label="Menu chức năng thêm"
        >
          <div className="relative">
            <MoreHorizontal className="w-5 h-5" />
            {hasAlerts && (
              <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
            )}
            {['bracket', 'teams', 'draw', 'discipline', 'complaints', 'finance', 'awards', 'audit'].includes(activeTab) && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-blue-600 shadow-xs"></span>
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight font-semibold">Thêm</span>
        </button>

      </div>

      {/* Floating Quick-Thumb Back Button (Lùi 1 trang cho ngón tay cái trên di động) */}
      {canGoBack && onGoBack && (
        <button
          onClick={onGoBack}
          className="fixed bottom-[78px] left-3 z-40 md:hidden flex items-center gap-1.5 min-h-[44px] px-3.5 py-2 rounded-full bg-white hover:bg-slate-50 text-blue-700 border border-blue-200 shadow-lg font-bold text-xs active:scale-95 transition-all animate-in fade-in slide-in-from-bottom-2"
          title="Lùi lại 1 trang"
          aria-label="Lùi lại 1 trang"
        >
          <ArrowLeft className="w-4 h-4 text-blue-600 shrink-0" />
          <span>Lùi 1 trang</span>
        </button>
      )}
    </nav>
  );
};
