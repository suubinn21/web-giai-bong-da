'use client';

import React from 'react';
import { 
  Home, 
  Radio, 
  CalendarDays, 
  Trophy, 
  GitFork, 
  Users, 
  Dices, 
  ShieldAlert, 
  Clock, 
  BadgeDollarSign, 
  Award, 
  FileText,
  LayoutGrid
} from 'lucide-react';

export type TabKey =
  | 'home'
  | 'live'
  | 'schedule'
  | 'standings'
  | 'bracket'
  | 'teams'
  | 'draw'
  | 'discipline'
  | 'complaints'
  | 'finance'
  | 'awards'
  | 'audit';

interface NavigationProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  liveMatchCount: number;
  activeComplaintsCount: number;
  suspendedPlayersCount: number;
  onBackToPortal?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  liveMatchCount,
  activeComplaintsCount,
  suspendedPlayersCount,
  onBackToPortal,
}) => {
  const navItems = [
    { key: 'home' as TabKey, label: 'Trang Chủ', icon: Home },
    { 
      key: 'live' as TabKey, 
      label: 'Live Match Center', 
      icon: Radio, 
      badge: liveMatchCount > 0 ? `${liveMatchCount} LIVE` : undefined,
      badgeColor: 'bg-red-500 text-white animate-pulse'
    },
    { key: 'schedule' as TabKey, label: 'Lịch & Kết Quả', icon: CalendarDays },
    { key: 'standings' as TabKey, label: 'Bảng Xếp Hạng', icon: Trophy },
    { key: 'bracket' as TabKey, label: 'Nhánh Knockout', icon: GitFork },
    { key: 'teams' as TabKey, label: 'Đội Bóng & Cầu Thủ', icon: Users },
    { key: 'draw' as TabKey, label: 'Bốc Thăm Chia Bảng', icon: Dices },
    { 
      key: 'discipline' as TabKey, 
      label: 'Kỷ Luật & Treo Giò', 
      icon: ShieldAlert,
      badge: suspendedPlayersCount > 0 ? `${suspendedPlayersCount}` : undefined,
      badgeColor: 'bg-amber-500 text-slate-950 font-bold'
    },
    { 
      key: 'complaints' as TabKey, 
      label: 'Khiếu Nại (15 Phút)', 
      icon: Clock,
      badge: activeComplaintsCount > 0 ? `${activeComplaintsCount}` : undefined,
      badgeColor: 'bg-cyan-500 text-slate-950 font-bold'
    },
    { key: 'finance' as TabKey, label: 'Tài Chính & Lệ Phí', icon: BadgeDollarSign },
    { key: 'awards' as TabKey, label: 'Giải Thưởng', icon: Award },
    { key: 'audit' as TabKey, label: 'Audit Log', icon: FileText },
  ];

  return (
    <nav className="hidden md:block bg-[#0B132B]/80 border-b border-slate-800 sticky top-16 sm:top-20 z-40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-1 overflow-x-auto py-2.5 no-scrollbar scroll-smooth">
          {onBackToPortal && (
            <button
              onClick={onBackToPortal}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-emerald-400 bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/40 whitespace-nowrap transition-all mr-1 shadow-sm"
              title="Trở về cổng danh sách các giải đấu"
            >
              <LayoutGrid className="w-4 h-4 text-emerald-400" />
              <span>« Cổng Các Giải</span>
            </button>
          )}

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => onTabChange(item.key)}
                className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25 font-bold scale-[1.02]'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold uppercase tracking-wider ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
