'use client';

import React, { useState, useMemo } from 'react';
import { Tournament, UserRole, TournamentStatus, UserAccount } from '@/types';
import { 
  Trophy, 
  Calendar, 
  Users, 
  Building2, 
  MapPin, 
  Plus, 
  Edit3, 
  Trash2, 
  Search, 
  Filter, 
  ArrowRight, 
  Sparkles, 
  Activity, 
  Flame, 
  Radio, 
  ChevronRight,
  Cloud,
  ArrowLeft,
  LogIn,
  LogOut,
  User,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { StorageService } from '@/services/storage';

interface TournamentPortalProps {
  tournaments: Tournament[];
  onSelectTournament: (tournament: Tournament) => void;
  onCreateTournament: () => void;
  onEditTournament: (tournament: Tournament) => void;
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
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [yearFilter, setYearFilter] = useState<string>('ALL');

  // Compute live statistics for each tournament
  const tournamentStatsMap = useMemo(() => {
    const map: Record<string, { teamsCount: number; matchesCount: number }> = {};
    tournaments.forEach((tour) => {
      const stats = StorageService.getTournamentStats(tour.id);
      map[tour.id] = stats;
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
      badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
      dotClass: 'bg-slate-400',
    },
    REGISTRATION: {
      label: 'Đang Mở Đăng Ký',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dotClass: 'bg-emerald-500 animate-ping',
    },
    REGISTRATION_CLOSED: {
      label: 'Đã Chốt Danh Sách',
      badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
      dotClass: 'bg-blue-500',
    },
    DRAWING: {
      label: 'Đang Bốc Thăm',
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
      dotClass: 'bg-amber-500 animate-bounce',
    },
    GROUP_STAGE: {
      label: 'Vòng Bảng (24 Trận)',
      badgeClass: 'bg-sky-50 text-sky-700 border-sky-200',
      dotClass: 'bg-sky-500 animate-pulse',
    },
    QUARTER_FINAL: {
      label: 'Vòng Tứ Kết',
      badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      dotClass: 'bg-indigo-500',
    },
    SEMI_FINAL: {
      label: 'Vòng Bán Kết',
      badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
      dotClass: 'bg-purple-500',
    },
    THIRD_PLACE: {
      label: 'Tranh Hạng 3',
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
      dotClass: 'bg-amber-500',
    },
    FINAL: {
      label: 'Chung Kết Cúp',
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
      dotClass: 'bg-rose-500 animate-pulse',
    },
    COMPLETED: {
      label: 'Đã Bế Mạc',
      badgeClass: 'bg-slate-100 text-slate-600 border-slate-200',
      dotClass: 'bg-slate-400',
    },
  };

  const totalTournaments = tournaments.length;
  const activeTournaments = tournaments.filter((t) => t.status !== 'COMPLETED' && t.status !== 'DRAFT').length;

  return (
    <div className="min-h-screen bg-transparent text-slate-900 flex flex-col">
      {/* Top Header of the Portal - Crisp Solid White */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 text-slate-800 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            {onGoBack && canGoBack && (
              <button
                onClick={onGoBack}
                className="flex items-center gap-1.5 min-h-[44px] min-w-[44px] px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-blue-700 border border-slate-200 shadow-xs transition-all active:scale-95 shrink-0"
                title="Lùi lại giải đấu vừa xem"
                aria-label="Lùi lại 1 trang"
              >
                <ArrowLeft className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="text-xs font-bold text-blue-700">Lùi</span>
              </button>
            )}

            <div className="relative flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-blue-600 via-sky-600 to-cyan-500 shadow-md shadow-blue-500/20 border border-sky-400/40 shrink-0">
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              <Sparkles className="absolute -top-1 -right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black tracking-widest text-sky-700 uppercase bg-sky-50 px-2 py-0.5 rounded border border-sky-200 font-mono">
                  IT FOOTBALL
                </span>
                <span className="text-[11px] text-slate-500 hidden sm:inline font-medium">• Khoa CNTT</span>
              </div>
              <h1 className="text-sm sm:text-base md:text-lg font-black tracking-tight text-slate-900 line-clamp-1">
                <span className="hidden sm:inline">CỔNG THÔNG TIN CÁC GIẢI ĐẤU BÓNG ĐÁ</span>
                <span className="sm:hidden">CỔNG CÁC GIẢI ĐẤU</span>
              </h1>
            </div>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Cloud Realtime Sync Status Indicator */}
            <div
              className={`flex items-center gap-1.5 min-h-[44px] px-2.5 sm:px-3 rounded-xl border text-[11px] sm:text-xs font-semibold shadow-xs transition-all ${
                cloudStatus === 'connected'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : cloudStatus === 'connecting'
                  ? 'bg-amber-50 border-amber-200 text-amber-700'
                  : 'bg-slate-100 border-slate-200 text-slate-600'
              }`}
              title={
                cloudStatus === 'connected'
                  ? '🟢 Firebase Firestore Realtime: Dữ liệu đám mây đang kết nối đồng bộ trực tiếp'
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
              <span className="font-mono font-bold text-[10px] sm:text-[11px] whitespace-nowrap">
                {cloudStatus === 'connected' ? 'Cloud Sync' : cloudStatus === 'connecting' ? 'Kết nối...' : 'Offline'}
              </span>
            </div>

            {/* User Profile / Login Button */}
            {currentUser ? (
              <div className="flex items-center gap-2 min-h-[44px] bg-slate-50 border border-slate-200 px-2.5 sm:px-3.5 rounded-xl shadow-xs">
                <img
                  src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                  alt={currentUser.fullName}
                  className="w-7 h-7 rounded-lg object-cover border border-sky-300 shrink-0"
                />
                <span className="text-xs font-bold text-slate-900 hidden md:inline max-w-[120px] truncate">
                  {currentUser.fullName}
                </span>
                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center active:scale-95"
                    title="Đăng xuất tài khoản"
                    aria-label="Đăng xuất"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              onOpenAuthModal && (
                <button
                  onClick={onOpenAuthModal}
                  className="flex items-center gap-2 min-h-[44px] px-3.5 sm:px-4 rounded-xl bg-gradient-to-r from-blue-600 via-sky-600 to-cyan-600 hover:from-blue-700 hover:to-sky-700 text-white text-xs sm:text-sm font-black transition-all shadow-md shadow-blue-500/20 border border-blue-400/30 active:scale-95"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Đăng Nhập</span>
                </button>
              )
            )}

            {/* Create Staff Account Button in Portal */}
            {(currentRole === 'SUPER_ADMIN' || currentRole === 'ORGANIZER') && onOpenUserManagement && (
              <button
                onClick={onOpenUserManagement}
                className="flex items-center gap-2 min-h-[44px] px-3 sm:px-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-blue-700 font-bold text-xs sm:text-sm transition-all shadow-xs shrink-0 active:scale-95"
                title="Tạo và quản lý tài khoản Ban Tổ Chức & Trọng tài"
              >
                <Users className="w-4 h-4 text-blue-600" />
                <span className="hidden sm:inline">Quản Lý Tài Khoản</span>
                <span className="sm:hidden">Tài Khoản</span>
              </button>
            )}

            {/* Create Tournament Button */}
            {(currentRole === 'SUPER_ADMIN' || currentRole === 'ORGANIZER') && (
              <button
                onClick={onCreateTournament}
                className="flex items-center gap-2 min-h-[44px] px-3.5 sm:px-4 rounded-xl bg-gradient-to-r from-blue-600 via-sky-600 to-cyan-600 hover:from-blue-700 hover:to-sky-700 text-white font-black text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all transform hover:-translate-y-0.5 border border-blue-400/30 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">+ Tạo Mới Giải Đấu</span>
                <span className="sm:hidden">+ Tạo Giải</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Hero Stadium Billboard in Ocean Blue */}
        <div className="relative rounded-3xl overflow-hidden border border-blue-500/30 bg-gradient-to-br from-blue-700 via-sky-600 to-blue-800 text-white p-6 sm:p-10 shadow-xl">
          {/* Action Photo Background */}
          <div 
            className="absolute inset-0 bg-cover bg-right sm:bg-center bg-no-repeat opacity-20 transform scale-105 pointer-events-none"
            style={{ backgroundImage: `url('/images/tournament-hero.jpg')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 via-blue-800/80 to-sky-700/60 pointer-events-none" />

          {/* Soft ambient glow */}
          <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-sky-400/25 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -left-20 -top-20 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl pointer-events-none"></div>

          {/* Stadium tactical pitch watermark */}
          <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-15 pointer-events-none overflow-hidden">
            <svg viewBox="0 0 400 400" className="w-full h-full stroke-sky-200" fill="none">
              <circle cx="200" cy="200" r="140" strokeWidth="2" />
              <circle cx="200" cy="200" r="6" fill="#FFFFFF" />
              <line x1="200" y1="0" x2="200" y2="400" strokeWidth="2" strokeDasharray="6 6" />
            </svg>
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2 bg-white/20 border border-white/30 text-white text-xs font-black px-3.5 py-1.5 rounded-full uppercase tracking-wider shadow-xs">
                <Flame className="w-3.5 h-3.5 text-amber-300 animate-bounce" />
                <span>NỀN TẢNG QUẢN LÝ &amp; CÔNG BỐ GIẢI BÓNG ĐÁ SINH VIÊN CHUYÊN NGHIỆP</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                CÁC MÙA GIẢI BÓNG ĐÁ <br className="hidden sm:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-200 via-white to-cyan-200">
                  KHOA CÔNG NGHỆ THÔNG TIN
                </span>
              </h2>

              <p className="text-sm sm:text-base text-blue-100 font-normal leading-relaxed">
                Hệ thống điều hành trọn vẹn từ khâu tiếp nhận đăng ký, bốc thăm chia bảng, lập lịch thi đấu, 
                Live Match Center cập nhật từng phút, xếp hạng Ranking Engine tự động và sơ đồ nhánh đấu Knock-out.
              </p>
            </div>

            {/* Metric Counters Grid - Solid White Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-3.5 w-full lg:w-auto shrink-0 text-slate-900">
              <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col justify-center shadow-lg transition-all hover:-translate-y-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-500 font-semibold">Tổng Số Giải</span>
                  <Trophy className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">{totalTournaments}</div>
                <div className="text-[11px] text-blue-600 mt-1 font-bold">Tất cả các mùa</div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col justify-center shadow-lg transition-all hover:-translate-y-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-500 font-semibold">Giải Đang Chạy</span>
                  <Activity className="w-4 h-4 text-blue-600 animate-pulse" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-blue-600 font-mono">{activeTournaments}</div>
                <div className="text-[11px] text-blue-600 mt-1 font-bold">Đang tiếp diễn</div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col justify-center shadow-lg transition-all hover:-translate-y-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-500 font-semibold">Đội Bóng</span>
                  <Users className="w-4 h-4 text-cyan-600" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">{totalTeams}</div>
                <div className="text-[11px] text-cyan-600 mt-1 font-bold">Đã đăng ký</div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col justify-center shadow-lg transition-all hover:-translate-y-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-500 font-semibold">Trận Đấu</span>
                  <Radio className="w-4 h-4 text-rose-500" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">{totalMatches}</div>
                <div className="text-[11px] text-rose-600 mt-1 font-bold">Lịch &amp; Kết quả</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search, Filter & Year Selection Toolbar - Solid White */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3.5 bg-white border border-slate-200 p-3.5 sm:p-4 rounded-2xl shadow-xs">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm giải đấu theo tên, năm, mã hiệu hoặc đơn vị tổ chức..."
              className="w-full pl-10 pr-12 min-h-[44px] py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 min-h-[36px] px-2.5 py-1 text-xs text-slate-600 hover:text-slate-900 bg-slate-200 hover:bg-slate-300 rounded-lg active:scale-95 transition-all"
                aria-label="Xóa từ khóa tìm kiếm"
              >
                Xóa
              </button>
            )}
          </div>

          {/* Status Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`shrink-0 min-h-[44px] px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all active:scale-95 ${
                statusFilter === 'ALL'
                  ? 'bg-gradient-to-r from-blue-600 to-sky-600 text-white shadow-md shadow-blue-500/20 border border-blue-500/30'
                  : 'bg-slate-100 border border-slate-200 text-slate-700 hover:text-blue-700 hover:bg-slate-200'
              }`}
            >
              Tất Cả ({tournaments.length})
            </button>

            <button
              onClick={() => setStatusFilter('REGISTRATION')}
              className={`shrink-0 min-h-[44px] px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all active:scale-95 ${
                statusFilter === 'REGISTRATION'
                  ? 'bg-gradient-to-r from-blue-600 to-sky-600 text-white shadow-md shadow-blue-500/20 border border-blue-500/30'
                  : 'bg-slate-100 border border-slate-200 text-slate-700 hover:text-blue-700 hover:bg-slate-200'
              }`}
            >
              Đang Mở Đăng Ký
            </button>

            <button
              onClick={() => setStatusFilter('GROUP_STAGE')}
              className={`shrink-0 min-h-[44px] px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all active:scale-95 ${
                statusFilter === 'GROUP_STAGE'
                  ? 'bg-gradient-to-r from-blue-600 to-sky-600 text-white shadow-md shadow-blue-500/20 border border-blue-500/30'
                  : 'bg-slate-100 border border-slate-200 text-slate-700 hover:text-blue-700 hover:bg-slate-200'
              }`}
            >
              Vòng Bảng
            </button>

            <button
              onClick={() => setStatusFilter('COMPLETED')}
              className={`shrink-0 min-h-[44px] px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all active:scale-95 ${
                statusFilter === 'COMPLETED'
                  ? 'bg-slate-700 text-white border border-slate-600'
                  : 'bg-slate-100 border border-slate-200 text-slate-700 hover:text-blue-700 hover:bg-slate-200'
              }`}
            >
              Đã Bế Mạc
            </button>

            {/* Year Dropdown Filter */}
            {availableYears.length > 1 && (
              <div className="shrink-0 flex items-center gap-1.5 min-h-[44px] px-3 bg-slate-100 border border-slate-200 rounded-xl">
                <Filter className="w-3.5 h-3.5 text-blue-600" />
                <select
                  value={yearFilter}
                  onChange={(e) => setYearFilter(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
                >
                  <option value="ALL" className="text-slate-800">Tất Cả Năm</option>
                  {availableYears.map((yr) => (
                    <option key={yr} value={yr} className="text-slate-800">
                      Năm {yr}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Tournaments List Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-blue-600" />
              <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                DANH SÁCH CÁC GIẢI ĐẤU ({filteredTournaments.length})
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-medium">Bấm vào giải đấu để truy cập hệ thống điều hành</span>
          </div>

          {filteredTournaments.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-4 shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto text-2xl shadow-xs">
                🔍
              </div>
              <h4 className="text-base font-bold text-slate-900">Không tìm thấy giải đấu phù hợp</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Không có giải đấu nào khớp với từ khóa &quot;{searchTerm}&quot; hoặc bộ lọc trạng thái đã chọn.
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('ALL');
                  setYearFilter('ALL');
                }}
                className="min-h-[44px] px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs sm:text-sm font-bold text-slate-700 transition-colors active:scale-95 border border-slate-200"
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
                    className="group relative rounded-3xl bg-white border border-slate-200 hover:border-blue-400 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 overflow-hidden shadow-xs"
                  >
                    {/* Top ambient badge line */}
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-400 opacity-80 group-hover:opacity-100 transition-opacity z-10"></div>

                    {/* Tournament Cover Banner Image */}
                    <div 
                      onClick={() => onSelectTournament(tour)}
                      className="relative h-44 overflow-hidden cursor-pointer"
                    >
                      <img 
                        src={coverImg} 
                        alt={tour.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/30 to-transparent" />

                      {/* Floating Short Code & Year Badges */}
                      <div className="absolute top-3.5 left-3.5 flex items-center gap-1.5 z-10">
                        <span className="font-mono text-[10px] font-black tracking-widest text-blue-700 bg-white/95 px-2.5 py-1 rounded-lg border border-blue-200 shadow-xs">
                          {tour.shortCode || 'ITFTMS'}
                        </span>
                        <span className="text-[10px] font-bold text-slate-800 bg-white/95 px-2 py-1 rounded-lg border border-slate-200 shadow-xs">
                          {tour.year || 2026}
                        </span>
                      </div>

                      {/* Status Badge floating on top right */}
                      <div className="absolute top-3.5 right-3.5 z-10">
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border shadow-xs ${statusInfo.badgeClass}`}>
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
                            className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 cursor-pointer leading-tight"
                            title={tour.name}
                          >
                            {tour.name}
                          </h4>
                          <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-1.5">
                            <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <span className="truncate">{tour.organizer || 'Khoa Công Nghệ Thông Tin'}</span>
                          </div>
                        </div>

                        {/* Format & Group Layout Pills */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          <div className="bg-slate-100 border border-slate-200 text-[11px] text-slate-700 px-2.5 py-1 rounded-lg font-medium">
                            ⚽ {tour.format || 'Bóng đá 5 người (Futsal)'} • {tour.matchDurationMinutes || 40}p
                          </div>
                          <div className="bg-blue-50 border border-blue-200 text-[11px] text-blue-700 px-2.5 py-1 rounded-lg font-bold">
                            {tour.numberOfGroups || 4} Bảng × {tour.teamsPerGroup || 4} Đội
                          </div>
                          <div className="bg-sky-50 border border-sky-200 text-[11px] text-sky-700 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-sky-600" />
                            <span>{tour.numberOfVenues || 4} Sân Thi Đấu</span>
                          </div>
                        </div>

                        {/* Description */}
                        {tour.description && (
                          <p className="text-xs text-slate-600 font-normal line-clamp-2 leading-relaxed">
                            {tour.description}
                          </p>
                        )}

                        {/* Team Registration Progress Bar */}
                        <div className="space-y-1.5 pt-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-600 flex items-center gap-1">
                              <Users className="w-3.5 h-3.5 text-blue-600" />
                              Đội đăng ký
                            </span>
                            <span className="font-bold text-slate-900">
                              {stats.teamsCount} / {tour.maxTeams || 16} đội ({teamFillPercent}%)
                            </span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                            <div 
                              className="h-full bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-500 rounded-full transition-all duration-500"
                              style={{ width: `${teamFillPercent}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Quick Meta Info Box */}
                        <div className="grid grid-cols-2 gap-2 bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs">
                          <div>
                            <div className="text-[10px] text-slate-500 font-medium">Số trận đấu</div>
                            <div className="font-bold text-slate-800 mt-0.5">{stats.matchesCount} trận</div>
                          </div>
                          <div>
                            <div className="text-[10px] text-slate-500 font-medium">Lệ phí &amp; Ký quỹ</div>
                            <div className="font-bold text-blue-600 mt-0.5">
                              {(tour.registrationFee || 500000).toLocaleString('vi-VN')} đ
                            </div>
                          </div>
                          <div className="col-span-2 pt-1.5 border-t border-slate-200 flex items-center gap-1.5 text-[11px] text-slate-500">
                            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{tour.startDate || '15/10/2026'} ➔ {tour.endDate || '25/10/2026'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Action Controls with 44px Touch Targets */}
                      <div className="pt-4 mt-4 border-t border-slate-100 flex items-center gap-2">
                        <button
                          onClick={() => onSelectTournament(tour)}
                          className="flex-1 flex items-center justify-center gap-2 min-h-[44px] px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-sky-600 to-cyan-600 hover:from-blue-700 hover:to-sky-700 text-white font-black text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all transform active:scale-98"
                        >
                          <span>Vào Xem / Điều Hành Giải</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>

                        {/* Edit button */}
                        {(currentRole === 'SUPER_ADMIN' || currentRole === 'ORGANIZER') && onEditTournament && (
                          <button
                            onClick={() => onEditTournament(tour)}
                            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-slate-100 hover:bg-sky-50 text-slate-600 hover:text-sky-700 border border-slate-200 hover:border-sky-300 transition-colors active:scale-95"
                            title="Sửa cấu hình giải đấu (Số bảng, số đội/bảng...)"
                            aria-label="Sửa cấu hình giải đấu"
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
                            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 hover:border-rose-300 transition-colors active:scale-95"
                            title="Xóa giải đấu này"
                            aria-label="Xóa giải đấu"
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

      {/* Portal Footer with Safe-Area-Bottom */}
      <footer className="bg-white border-t border-slate-200 text-slate-600 py-8 px-4 sm:px-6 lg:px-8 mt-12 safe-area-bottom shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
              ITFTMS 2026
            </span>
            <span className="font-semibold text-slate-800">Khoa Công Nghệ Thông Tin • Ban Thể Thao Đoàn - Hội</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-slate-500">
            <span>Bóng đá 5 người</span>
            <span>•</span>
            <span>16 Đội bóng • 192 Cầu thủ</span>
            <span>•</span>
            <span>32 Trận đấu</span>
            <span>•</span>
            <span>Sân cỏ nhân tạo KTX &amp; TTGDTC</span>
          </div>

          <div className="text-slate-500">
            Cổng Thông Tin Quản Lý Các Giải Bóng Đá Sinh Viên CNTT
          </div>
        </div>
      </footer>
    </div>
  );
};
