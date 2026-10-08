'use client';

import React, { useState } from 'react';
import { StorageService } from '@/services/storage';
import { 
  Trophy, 
  Sparkles, 
  Calendar, 
  Users, 
  Radio, 
  Search, 
  Plus, 
  Trash2, 
  ExternalLink, 
  Clock, 
  Coins, 
  Flame, 
  ArrowRight, 
  Building2, 
  Filter,
  Medal,
  Activity,
  Layers,
  Edit3,
  Cloud,
  LogIn,
  LogOut,
  User,
  ArrowLeft,
  MapPin
} from 'lucide-react';
import { Tournament, TournamentStatus, UserRole, UserAccount } from '@/types';

interface TournamentPortalProps {
  tournaments: Tournament[];
  onSelectTournament: (tournament: Tournament) => void;
  onCreateTournament: () => void;
  onEditTournament?: (tournament: Tournament) => void;
  onDeleteTournament: (tournamentId: string) => void;
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  cloudStatus?: 'connected' | 'connecting' | 'offline';
  currentUser?: UserAccount | null;
  onOpenAuthModal?: () => void;
  onOpenUserManagement?: () => void;
  onLogout?: () => void;
  onGoBack?: () => void;
  canGoBack?: boolean;
}

export const TournamentPortal: React.FC<TournamentPortalProps> = ({
  tournaments,
  onSelectTournament,
  onCreateTournament,
  onEditTournament,
  onDeleteTournament,
  currentRole,
  onRoleChange,
  cloudStatus = 'connected',
  currentUser,
  onOpenAuthModal,
  onOpenUserManagement,
  onLogout,
  onGoBack,
  canGoBack,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | TournamentStatus>('ALL');
  const [yearFilter, setYearFilter] = useState<string>('ALL');

  // Stats across tournaments
  const totalTournaments = tournaments.length;
  const activeTournaments = tournaments.filter((t) => t.status !== 'COMPLETED').length;

  const tournamentStatsMap = React.useMemo(() => {
    const map: Record<string, { teamsCount: number; matchesCount: number }> = {};
    tournaments.forEach((t) => {
      map[t.id] = StorageService.getTournamentStats(t.id);
    });
    return map;
  }, [tournaments]);

  const totalTeams = Object.values(tournamentStatsMap).reduce((sum, s) => sum + s.teamsCount, 0);
  const totalMatches = Object.values(tournamentStatsMap).reduce((sum, s) => sum + s.matchesCount, 0);

  // Available years
  const availableYears = Array.from(new Set(tournaments.map((t) => String(t.year || 2026)))).sort((a, b) => b.localeCompare(a));

  // Filtered list
  const filteredTournaments = tournaments.filter((t) => {
    const matchSearch =
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.shortCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.organizer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(t.year).includes(searchTerm);

    const matchStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const matchYear = yearFilter === 'ALL' || String(t.year) === yearFilter;

    return matchSearch && matchStatus && matchYear;
  });

  const statusConfigs: Record<TournamentStatus, { label: string; badgeClass: string; dotClass: string }> = {
    DRAFT: {
      label: 'Bản Nháp (Draft)',
      badgeClass: 'bg-slate-800 text-slate-300 border-slate-700',
      dotClass: 'bg-slate-400',
    },
    REGISTRATION: {
      label: 'Đang Mở Đăng Ký',
      badgeClass: 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40',
      dotClass: 'bg-emerald-400 animate-ping',
    },
    REGISTRATION_CLOSED: {
      label: 'Đã Chốt Danh Sách',
      badgeClass: 'bg-blue-950/80 text-blue-400 border-blue-500/40',
      dotClass: 'bg-blue-400',
    },
    DRAWING: {
      label: 'Đang Bốc Thăm',
      badgeClass: 'bg-amber-950/80 text-amber-400 border-amber-500/40',
      dotClass: 'bg-amber-400 animate-bounce',
    },
    GROUP_STAGE: {
      label: 'Vòng Bảng (24 Trận)',
      badgeClass: 'bg-teal-950/80 text-teal-300 border-teal-500/40',
      dotClass: 'bg-teal-400 animate-pulse',
    },
    QUARTER_FINAL: {
      label: 'Vòng Tứ Kết',
      badgeClass: 'bg-indigo-950/80 text-indigo-400 border-indigo-500/40',
      dotClass: 'bg-indigo-400',
    },
    SEMI_FINAL: {
      label: 'Vòng Bán Kết',
      badgeClass: 'bg-purple-950/80 text-purple-400 border-purple-500/40',
      dotClass: 'bg-purple-400',
    },
    THIRD_PLACE: {
      label: 'Tranh Hạng 3',
      badgeClass: 'bg-amber-950/80 text-amber-300 border-amber-500/40',
      dotClass: 'bg-amber-400',
    },
    FINAL: {
      label: 'Chung Kết Cúp',
      badgeClass: 'bg-rose-950/80 text-rose-300 border-rose-500/40',
      dotClass: 'bg-rose-400 animate-pulse',
    },
    COMPLETED: {
      label: 'Đã Bế Mạc',
      badgeClass: 'bg-slate-900 text-slate-400 border-slate-700/60',
      dotClass: 'bg-slate-500',
    },
  };


  return (
    <div className="min-h-screen bg-transparent text-slate-100 flex flex-col">
      {/* Top Header of the Portal */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-700/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-2 sm:gap-3.5">
            {onGoBack && canGoBack && (
              <button
                onClick={onGoBack}
                className="flex items-center gap-1.5 h-9 px-2.5 sm:px-3 rounded-xl bg-slate-900/90 active:bg-slate-800 hover:bg-slate-800 text-emerald-400 border border-emerald-500/40 shadow-md transition-all active:scale-95 shrink-0"
                title="Lùi lại giải đấu vừa xem"
                aria-label="Lùi lại 1 trang"
              >
                <ArrowLeft className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-xs font-bold text-emerald-300">Lùi</span>
              </button>
            )}

            <div className="relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 shadow-xl shadow-emerald-500/20 border border-emerald-400/30 shrink-0">
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              <Sparkles className="absolute -top-1 -right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black tracking-widest text-emerald-400 uppercase bg-emerald-950/80 px-1.5 py-0.2 rounded border border-emerald-800/80 font-mono">
                  IT FOOTBALL
                </span>
                <span className="text-[11px] text-slate-400 hidden sm:inline">• Khoa CNTT</span>
              </div>
              <h1 className="text-xs sm:text-base md:text-lg font-black tracking-tight text-white line-clamp-1">
                <span className="hidden sm:inline">CỔNG THÔNG TIN CÁC GIẢI ĐẤU BÓNG ĐÁ</span>
                <span className="sm:hidden">CỔNG CÁC GIẢI ĐẤU</span>
              </h1>
            </div>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Cloud Realtime Sync Status Indicator */}
            <div
              className={`flex items-center gap-1.5 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-xl border text-[11px] sm:text-xs font-semibold shadow-sm transition-all ${
                cloudStatus === 'connected'
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400'
                  : cloudStatus === 'connecting'
                  ? 'bg-amber-950/40 border-amber-500/40 text-amber-400'
                  : 'bg-slate-900 border-slate-700 text-slate-400'
              }`}
              title={
                cloudStatus === 'connected'
                  ? '🟢 Firebase Firestore Realtime: Dữ liệu đám mây đang kết nối đồng bộ trực tiếp'
                  : 'Đang kết nối...'
              }
            >
              <span className="relative flex h-2 w-2">
                {cloudStatus === 'connected' && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                )}
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    cloudStatus === 'connected' ? 'bg-emerald-400' : 'bg-amber-400'
                  }`}
                ></span>
              </span>
              <Cloud className="w-3.5 h-3.5" />
              <span className="hidden sm:inline font-mono font-bold text-[11px]">
                {cloudStatus === 'connected' ? 'Cloud Sync' : 'Đang kết nối...'}
              </span>
            </div>

            {/* User Profile / Login Button */}
            {currentUser ? (
              <div className="flex items-center gap-2 bg-[#091A2C] border border-emerald-500/40 px-2.5 sm:px-3 py-1.5 rounded-xl shadow-sm">
                <img
                  src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                  alt={currentUser.fullName}
                  className="w-6 h-6 rounded-lg object-cover border border-emerald-400/50"
                />
                <span className="text-xs font-bold text-white hidden md:inline max-w-[120px] truncate">
                  {currentUser.fullName}
                </span>
                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="p-1 text-slate-400 hover:text-red-400 rounded transition-colors"
                    title="Đăng xuất tài khoản"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ) : (
              onOpenAuthModal && (
                <button
                  onClick={onOpenAuthModal}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-black transition-all shadow-md shadow-emerald-500/30 border border-emerald-400/40 active:scale-95"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Đăng Nhập</span>
                </button>
              )
            )}

            {/* Create Staff Account Button in Portal */}
            {(currentRole === 'SUPER_ADMIN' || currentRole === 'ORGANIZER') && onOpenUserManagement && (
              <button
                onClick={onOpenUserManagement}
                className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500/50 text-emerald-400 font-bold text-xs sm:text-sm transition-all shadow-md shrink-0 active:scale-95"
                title="Tạo và quản lý tài khoản Ban Tổ Chức & Trọng tài"
              >
                <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Quản Lý Tài Khoản</span>
                <span className="sm:hidden">Tài Khoản</span>
              </button>
            )}

            {/* Create Tournament Button */}
            {(currentRole === 'SUPER_ADMIN' || currentRole === 'ORGANIZER') && (
              <button
                onClick={onCreateTournament}
                className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-xs sm:text-sm shadow-lg shadow-emerald-500/30 transition-all transform hover:-translate-y-0.5 border border-emerald-400/40 shrink-0"
              >
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">+ Tạo Mới Giải Đấu</span>
                <span className="sm:hidden">+ Tạo Giải</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Hero Stadium Billboard with Prominent Emerald Athletic Design */}
        <div className="relative rounded-3xl overflow-hidden border-2 border-emerald-500/40 bg-gradient-to-br from-[#091A2C]/95 via-[#071424]/95 to-[#040C18]/95 p-6 sm:p-10 shadow-2xl shadow-emerald-950/40 backdrop-blur-md">
          {/* Action Photo Background */}
          <div 
            className="absolute inset-0 bg-cover bg-right sm:bg-center bg-no-repeat opacity-35 transform scale-105 pointer-events-none"
            style={{ backgroundImage: `url('/images/tournament-hero.jpg')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#040C16]/95 via-[#061424]/85 to-[#061424]/35 pointer-events-none" />

          {/* Pitch ambient glow */}
          <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-emerald-500/30 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -left-20 -top-20 w-96 h-96 bg-teal-500/25 rounded-full blur-3xl pointer-events-none"></div>

          {/* Stadium tactical pitch watermark & turf stripes */}
          <div className="absolute inset-0 sports-turf-stripes opacity-45 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 pointer-events-none overflow-hidden">
            <svg viewBox="0 0 400 400" className="w-full h-full stroke-emerald-400" fill="none">
              <circle cx="200" cy="200" r="140" strokeWidth="2" />
              <circle cx="200" cy="200" r="6" fill="#10B981" />
              <line x1="200" y1="0" x2="200" y2="400" strokeWidth="2" strokeDasharray="6 6" />
            </svg>
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2 bg-emerald-950/90 border border-emerald-400/50 text-emerald-300 text-xs font-black px-3.5 py-1.5 rounded-full uppercase tracking-wider shadow-sm shadow-emerald-500/20">
                <Flame className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
                <span>NỀN TẢNG QUẢN LÝ & CÔNG BỐ GIẢI BÓNG ĐÁ SINH VIÊN CHUYÊN NGHIỆP</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-md">
                CÁC MÙA GIẢI BÓNG ĐÁ <br className="hidden sm:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 drop-shadow-[0_2px_15px_rgba(16,185,129,0.35)]">
                  KHOA CÔNG NGHỆ THÔNG TIN
                </span>
              </h2>

              <p className="text-sm sm:text-base text-slate-200 font-normal leading-relaxed">
                Hệ thống điều hành trọn vẹn từ khâu tiếp nhận đăng ký, bốc thăm chia bảng 3D, lập lịch thi đấu, 
                Live Match Center cập nhật từng phút, xếp hạng Ranking Engine tự động và sơ đồ nhánh đấu Knock-out.
              </p>
            </div>

            {/* Metric Counters Grid with High-Contrast Emerald Sports Theme */}
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-3.5 w-full lg:w-auto shrink-0">
              <div className="bg-[#091A2C]/90 backdrop-blur-md border border-emerald-500/30 hover:border-emerald-400 rounded-2xl p-4 sm:p-5 flex flex-col justify-center shadow-xl hover:shadow-emerald-500/20 transition-all hover:-translate-y-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-300 font-semibold">Tổng Số Giải</span>
                  <Trophy className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white">{totalTournaments}</div>
                <div className="text-[11px] text-emerald-400 mt-1 font-bold">Tất cả các mùa</div>
              </div>

              <div className="bg-[#091A2C]/90 backdrop-blur-md border border-emerald-500/40 hover:border-emerald-400 rounded-2xl p-4 sm:p-5 flex flex-col justify-center shadow-xl hover:shadow-emerald-500/25 transition-all hover:-translate-y-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-emerald-300 font-semibold">Giải Đang Chạy</span>
                  <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-400">{activeTournaments}</div>
                <div className="text-[11px] text-emerald-300 mt-1 font-bold">Đang tiếp diễn</div>
              </div>

              <div className="bg-[#091A2C]/90 backdrop-blur-md border border-emerald-500/30 hover:border-emerald-400 rounded-2xl p-4 sm:p-5 flex flex-col justify-center shadow-xl hover:shadow-emerald-500/20 transition-all hover:-translate-y-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-300 font-semibold">Đội Bóng</span>
                  <Users className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white">{totalTeams}</div>
                <div className="text-[11px] text-cyan-400 mt-1 font-bold">Đã đăng ký</div>
              </div>

              <div className="bg-[#091A2C]/90 backdrop-blur-md border border-emerald-500/30 hover:border-emerald-400 rounded-2xl p-4 sm:p-5 flex flex-col justify-center shadow-xl hover:shadow-emerald-500/20 transition-all hover:-translate-y-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-300 font-semibold">Trận Đấu</span>
                  <Radio className="w-4 h-4 text-rose-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white">{totalMatches}</div>
                <div className="text-[11px] text-rose-400 mt-1 font-bold">Lịch & Kết quả</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search, Filter & Year Selection Toolbar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-[#091A2C]/85 backdrop-blur-md border border-emerald-500/25 p-4 rounded-2xl shadow-xl">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm giải đấu theo tên, năm, mã hiệu hoặc đơn vị tổ chức..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#061220]/90 border border-emerald-500/30 focus:border-emerald-400 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white bg-slate-800 px-1.5 py-0.5 rounded"
              >
                Xóa
              </button>
            )}
          </div>

          {/* Status Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                statusFilter === 'ALL'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/30 border border-emerald-400/40'
                  : 'bg-[#0A1A2C] border border-slate-700/80 text-slate-300 hover:text-white hover:border-emerald-500/50'
              }`}
            >
              Tất Cả ({tournaments.length})
            </button>

            <button
              onClick={() => setStatusFilter('REGISTRATION')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                statusFilter === 'REGISTRATION'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/30 border border-emerald-400/40'
                  : 'bg-[#0A1A2C] border border-slate-700/80 text-slate-300 hover:text-white hover:border-emerald-500/50'
              }`}
            >
              Đang Mở Đăng Ký
            </button>

            <button
              onClick={() => setStatusFilter('GROUP_STAGE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                statusFilter === 'GROUP_STAGE'
                  ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-md shadow-teal-500/30 border border-teal-400/40'
                  : 'bg-[#0A1A2C] border border-slate-700/80 text-slate-300 hover:text-white hover:border-emerald-500/50'
              }`}
            >
              Vòng Bảng
            </button>

            <button
              onClick={() => setStatusFilter('COMPLETED')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                statusFilter === 'COMPLETED'
                  ? 'bg-slate-700 text-white border border-slate-500'
                  : 'bg-[#0A1A2C] border border-slate-700/80 text-slate-300 hover:text-white hover:border-emerald-500/50'
              }`}
            >
              Đã Bế Mạc
            </button>

            {/* Year Selector */}
            {availableYears.length > 1 && (
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="bg-slate-800 text-xs font-bold text-slate-300 border border-slate-700 px-3 py-1.5 rounded-lg focus:outline-none cursor-pointer"
              >
                <option value="ALL">Năm: Tất cả</option>
                {availableYears.map((yr) => (
                  <option key={yr} value={yr}>
                    Năm {yr}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Tournament Cards Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-400" />
              <span>DANH SÁCH CÁC GIẢI ĐẤU ĐÃ TẠO ({filteredTournaments.length})</span>
            </h3>

            {(currentRole === 'SUPER_ADMIN' || currentRole === 'ORGANIZER') && (
              <button
                onClick={onCreateTournament}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 underline"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm giải đấu mới</span>
              </button>
            )}
          </div>

          {filteredTournaments.length === 0 ? (
            <div className="bg-[#0B132B] border border-slate-800 rounded-3xl p-12 text-center space-y-4">
              <Trophy className="w-12 h-12 text-slate-600 mx-auto" />
              <div className="text-lg font-bold text-slate-300">Không tìm thấy giải đấu phù hợp</div>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Không có giải đấu nào khớp với từ khóa tìm kiếm hoặc bộ lọc hiện tại.
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('ALL');
                  setYearFilter('ALL');
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition-colors"
              >
                Xóa Bộ Lọc
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTournaments.map((tour, tourIdx) => {
                const stats = tournamentStatsMap[tour.id] || { teamsCount: 0, matchesCount: 0 };
                const statusInfo = statusConfigs[tour.status || 'REGISTRATION'] || statusConfigs.REGISTRATION;
                const teamFillPercent = Math.min(100, Math.round((stats.teamsCount / (tour.maxTeams || 16)) * 100));
                const tourCovers = ['/images/futsal-action.jpg', '/images/trophy-celebration.jpg', '/images/trophy-cup.jpg', '/images/tournament-hero.jpg'];
                const coverImg = tourCovers[tourIdx % tourCovers.length];

                return (
                  <div
                    key={tour.id}
                    className="group relative rounded-3xl bg-gradient-to-b from-[#091A2C]/95 via-[#071524]/95 to-[#050E1A]/95 backdrop-blur-md border border-emerald-500/25 hover:border-emerald-400 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/25 hover:-translate-y-1.5 overflow-hidden"
                  >
                    {/* Top ambient badge line */}
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 opacity-80 group-hover:opacity-100 transition-opacity z-10"></div>

                    {/* Tournament Cover Banner Image */}
                    <div 
                      onClick={() => onSelectTournament(tour)}
                      className="relative h-40 overflow-hidden cursor-pointer"
                    >
                      <img 
                        src={coverImg} 
                        alt={tour.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#071524] via-[#071524]/40 to-transparent" />

                      {/* Floating Short Code & Year Badges */}
                      <div className="absolute top-3.5 left-3.5 flex items-center gap-1.5 z-10">
                        <span className="font-mono text-[10px] font-black tracking-widest text-emerald-300 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-emerald-500/40 shadow-sm">
                          {tour.shortCode || 'ITFTMS'}
                        </span>
                        <span className="text-[10px] font-bold text-white bg-black/80 backdrop-blur-md px-2 py-1 rounded-lg border border-slate-700/60 shadow-sm">
                          {tour.year || 2026}
                        </span>
                      </div>

                      {/* Status Badge floating on top right */}
                      <div className="absolute top-3.5 right-3.5 z-10">
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border backdrop-blur-md shadow-sm ${statusInfo.badgeClass}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotClass}`}></span>
                          <span>{statusInfo.label}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 sm:p-6 space-y-4 flex-1 flex flex-col justify-between">
                      <div className="space-y-4">
                        {/* Tournament Name */}
                        <div>
                          <h4 
                            onClick={() => onSelectTournament(tour)}
                            className="text-lg font-black text-white group-hover:text-emerald-300 transition-colors line-clamp-2 cursor-pointer leading-tight"
                            title={tour.name}
                          >
                            {tour.name}
                          </h4>
                          <div className="flex items-center gap-1.5 text-xs text-slate-300 mt-1.5">
                            <Building2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span className="truncate">{tour.organizer || 'Khoa Công Nghệ Thông Tin'}</span>
                          </div>
                        </div>

                      {/* Format & Group Layout Pills */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        <div className="bg-[#061220]/90 border border-slate-800 text-[11px] text-slate-300 px-2.5 py-1 rounded-lg font-medium">
                          ⚽ {tour.format || 'Bóng đá 5 người (Futsal)'} • {tour.matchDurationMinutes || 40} phút
                        </div>
                        <div className="bg-emerald-950/80 border border-emerald-500/40 text-[11px] text-emerald-300 px-2.5 py-1 rounded-lg font-bold">
                          {tour.numberOfGroups || 4} Bảng × {tour.teamsPerGroup || 4} Đội
                        </div>
                        <div className="bg-cyan-950/80 border border-cyan-500/40 text-[11px] text-cyan-300 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-cyan-400" />
                          <span>{tour.numberOfVenues || 4} Sân Thi Đấu</span>
                        </div>
                      </div>

                      {/* Description */}
                      {tour.description && (
                        <p className="text-xs text-slate-400 font-light line-clamp-2 leading-relaxed">
                          {tour.description}
                        </p>
                      )}

                      {/* Team Registration Progress Bar */}
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400 flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-emerald-400" />
                            Đội đăng ký
                          </span>
                          <span className="font-bold text-white">
                            {stats.teamsCount} / {tour.maxTeams || 16} đội ({teamFillPercent}%)
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                          <div 
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                            style={{ width: `${teamFillPercent}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Quick Meta Info Box */}
                      <div className="grid grid-cols-2 gap-2 bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3 text-xs">
                        <div>
                          <div className="text-[10px] text-slate-500 font-medium">Số trận đấu</div>
                          <div className="font-bold text-slate-200 mt-0.5">{stats.matchesCount} trận</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-500 font-medium">Lệ phí & Ký quỹ</div>
                          <div className="font-bold text-emerald-400 mt-0.5">
                            {(tour.registrationFee || 500000).toLocaleString('vi-VN')} đ
                          </div>
                        </div>
                        <div className="col-span-2 pt-1 border-t border-slate-800/60 flex items-center gap-1.5 text-[11px] text-slate-400">
                          <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span>{tour.startDate || '15/10/2026'} ➔ {tour.endDate || '25/10/2026'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Controls */}
                    <div className="pt-5 mt-4 border-t border-slate-800/80 flex items-center gap-2">
                      <button
                        onClick={() => onSelectTournament(tour)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-xs shadow-md shadow-emerald-500/20 transition-all transform group-hover:scale-[1.02]"
                      >
                        <span>Vào Xem / Điều Hành Giải</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>

                      {/* Edit button */}
                      {(currentRole === 'SUPER_ADMIN' || currentRole === 'ORGANIZER') && onEditTournament && (
                        <button
                          onClick={() => onEditTournament(tour)}
                          className="p-2.5 rounded-xl bg-slate-900 hover:bg-cyan-950/80 text-slate-400 hover:text-cyan-300 border border-slate-800 hover:border-cyan-500/40 transition-colors"
                          title="Sửa cấu hình giải đấu (Số bảng, số đội/bảng...)"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      )}

                      {/* Delete button (Super admin / Organizer) */}
                      {(currentRole === 'SUPER_ADMIN' || currentRole === 'ORGANIZER') && (
                        <button
                          onClick={() => {
                            if (confirm(`Xác nhận xóa giải đấu "${tour.name}" (${tour.shortCode}) khỏi hệ thống?`)) {
                              onDeleteTournament(tour.id);
                            }
                          }}
                          className="p-2.5 rounded-xl bg-slate-900 hover:bg-red-950/80 text-slate-500 hover:text-red-400 border border-slate-800 hover:border-red-500/40 transition-colors"
                          title="Xóa giải đấu này"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </div>



      </main>

      {/* Portal Footer */}
      <footer className="bg-[#0B132B] border-t border-slate-800 text-slate-400 py-8 px-4 sm:px-6 lg:px-8 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/80">
              ITFTMS 2026
            </span>
            <span>Khoa Công Nghệ Thông Tin • Ban Thể Thao Đoàn - Hội</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-slate-500">
            <span>Bóng đá 5 người</span>
            <span>•</span>
            <span>16 Đội bóng • 192 Cầu thủ</span>
            <span>•</span>
            <span>32 Trận đấu</span>
            <span>•</span>
            <span>Sân cỏ nhân tạo KTX & TTGDTC</span>
          </div>

          <div className="text-slate-400">
            Cổng Thông Tin Quản Lý Các Giải Bóng Đá Sinh Viên CNTT
          </div>
        </div>
      </footer>
    </div>
  );
};
