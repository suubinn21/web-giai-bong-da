'use client';

import React from 'react';
import { UserRole } from '@/types';
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
  currentRole: UserRole;
  onBackToPortal?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  liveMatchCount,
  activeComplaintsCount,
  suspendedPlayersCount,
  currentRole,
  onBackToPortal,
}) => {
  const canManageDraw = currentRole === 'SUPER_ADMIN' || currentRole === 'ORGANIZER';
  const canManageFinance = currentRole === 'SUPER_ADMIN' || currentRole === 'ORGANIZER';
  const canViewAudit = currentRole === 'SUPER_ADMIN' || currentRole === 'ORGANIZER';
  const canViewComplaints = currentRole === 'SUPER_ADMIN' || currentRole === 'ORGANIZER' || currentRole === 'TEAM_MANAGER';

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
    ...(canManageDraw
      ? [{ key: 'draw' as TabKey, label: 'Bốc Thăm Chia Bảng', icon: Dices }]
      : []),
    { 
      key: 'discipline' as TabKey, 
      label: 'Kỷ Luật & Treo Giò', 
      icon: ShieldAlert,
      badge: suspendedPlayersCount > 0 ? `${suspendedPlayersCount}` : undefined,
      badgeColor: 'bg-amber-500 text-slate-950 font-bold'
    },
    ...(canViewComplaints
      ? [
          { 
            key: 'complaints' as TabKey, 
            label: 'Khiếu Nại (15 Phút)', 
            icon: Clock,
            badge: activeComplaintsCount > 0 ? `${activeComplaintsCount}` : undefined,
            badgeColor: 'bg-cyan-500 text-slate-950 font-bold'
          }
        ]
      : []),
    ...(canManageFinance
      ? [{ key: 'finance' as TabKey, label: 'Tài Chính & Lệ Phí', icon: BadgeDollarSign }]
      : []),
    { key: 'awards' as TabKey, label: 'Giải Thưởng', icon: Award },
    ...(canViewAudit
      ? [{ key: 'audit' as TabKey, label: 'Audit Log', icon: FileText }]
      : []),
  ];

  return (
    <nav className="hidden md:block bg-white border-b border-slate-200 sticky top-18 sm:top-20 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 overflow-x-auto py-2.5 no-scrollbar scroll-smooth">
          {onBackToPortal && (
            <button
              onClick={onBackToPortal}
              className="shrink-0 flex items-center gap-1.5 min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 whitespace-nowrap transition-all shadow-xs active:scale-95"
              title="Trở về cổng danh sách các giải đấu"
            >
              <LayoutGrid className="w-4 h-4 text-sky-600 shrink-0" />
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
                className={`shrink-0 relative flex items-center gap-2 min-h-[40px] px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap active:scale-95 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 via-sky-600 to-cyan-600 text-white shadow-md shadow-blue-500/20 font-black scale-[1.02]'
                    : 'text-slate-600 hover:text-blue-700 hover:bg-blue-50/70 border border-transparent hover:border-blue-100'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider shrink-0 ${item.badgeColor}`}>
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
