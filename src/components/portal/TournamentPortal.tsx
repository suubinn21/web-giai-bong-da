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
  ShieldCheck, 
  Clock, 
  Coins, 
  Flame, 
  ArrowRight, 
  Building2, 
  Filter,
  CheckCircle2,
  Medal,
  Activity,
  Layers,
  Edit3,
  Cloud,
  LogIn,
  LogOut,
  User
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
  onLogout?: () => void;
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
  onLogout,
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

  const roleLabels: Record<UserRole, { label: string; badge: string }> = {
    SUPER_ADMIN: { label: 'Super Admin', badge: 'Toàn quyền' },
    ORGANIZER: { label: 'Ban Tổ Chức (BTC)', badge: 'Điều hành' },
    REFEREE: { label: 'Trọng Tài', badge: 'Biên bản trận' },
    TEAM_MANAGER: { label: 'Trưởng Đoàn / Đội Trưởng', badge: 'Quản lý đội' },
    STUDENT: { label: 'Sinh Viên / Cổ Động Viên', badge: 'Công khai' },
  };

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 flex flex-col">
      {/* Top Header of the Portal */}
      <header className="sticky top-0 z-50 bg-[#0B132B]/95 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-2.5 sm:gap-3.5">
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

            {/* RBAC Role Selector (visible on mobile and desktop) */}
            <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-700/80 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl text-xs">
              <span className="text-slate-400 hidden lg:inline">Góc nhìn:</span>
              <select
                value={currentRole}
                onChange={(e) => onRoleChange(e.target.value as UserRole)}
                className="bg-transparent text-emerald-400 font-bold focus:outline-none cursor-pointer max-w-[85px] sm:max-w-none text-[11px] sm:text-xs"
              >
                {Object.entries(roleLabels).map(([role, item]) => (
                  <option key={role} value={role} className="bg-slate-900 text-white">
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            {/* User Profile / Login Button */}
            {currentUser ? (
              <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-700/80 px-2 sm:px-2.5 py-1 rounded-xl">
                <img
                  src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                  alt={currentUser.fullName}
                  className="w-6 h-6 rounded-lg object-cover border border-emerald-500/40"
                />
                <span className="text-xs font-bold text-white hidden md:inline max-w-[100px] truncate">
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
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500/50 text-emerald-400 text-xs font-bold transition-all shadow-sm active:scale-95"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Đăng Nhập</span>
                </button>
              )
            )}

            {/* Create Tournament Button */}
            {(currentRole === 'SUPER_ADMIN' || currentRole === 'ORGANIZER') && (
              <button
                onClick={onCreateTournament}
                className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-xs sm:text-sm shadow-lg shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5 border border-emerald-400/40 shrink-0"
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
        
        {/* Hero Stadium Billboard */}
        <div className="relative rounded-3xl overflow-hidden border border-emerald-500/30 bg-gradient-to-br from-[#070B14] via-[#0B132B] to-[#131D38] p-6 sm:p-10 shadow-2xl">
          {/* Pitch ambient glow */}
          <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -left-20 -top-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2 bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-xs font-black px-3.5 py-1 rounded-full uppercase tracking-wider">
                <Flame className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
                <span>NỀN TẢNG QUẢN LÝ & CÔNG BỐ GIẢI BÓNG ĐÁ SINH VIÊN CHUYÊN NGHIỆP</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                CÁC MÙA GIẢI BÓNG ĐÁ <br className="hidden sm:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                  KHOA CÔNG NGHỆ THÔNG TIN
                </span>
              </h2>

              <p className="text-sm sm:text-base text-slate-300 font-light leading-relaxed">
                Hệ thống điều hành trọn vẹn từ khâu tiếp nhận đăng ký, bốc thăm chia bảng 3D, lập lịch thi đấu, 
                Live Match Center cập nhật từng phút, xếp hạng Ranking Engine tự động và sơ đồ nhánh đấu Knock-out.
              </p>
            </div>

            {/* Metric Counters Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-3.5 w-full lg:w-auto shrink-0">
              <div className="bg-slate-900/80 backdrop-blur border border-slate-700/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-center shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400 font-medium">Tổng Số Giải</span>
                  <Trophy className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white">{totalTournaments}</div>
                <div className="text-[11px] text-emerald-400 mt-1 font-semibold">Tất cả các mùa</div>
              </div>

              <div className="bg-slate-900/80 backdrop-blur border border-slate-700/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-center shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400 font-medium">Giải Đang Chạy</span>
                  <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-400">{activeTournaments}</div>
                <div className="text-[11px] text-slate-400 mt-1 font-semibold">Đang tiếp diễn</div>
              </div>

              <div className="bg-slate-900/80 backdrop-blur border border-slate-700/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-center shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400 font-medium">Đội Bóng</span>
                  <Users className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white">{totalTeams}</div>
                <div className="text-[11px] text-cyan-400 mt-1 font-semibold">Đã đăng ký</div>
              </div>

              <div className="bg-slate-900/80 backdrop-blur border border-slate-700/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-center shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400 font-medium">Trận Đấu</span>
                  <Radio className="w-4 h-4 text-rose-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white">{totalMatches}</div>
                <div className="text-[11px] text-rose-400 mt-1 font-semibold">Lịch & Kết quả</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search, Filter & Year Selection Toolbar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-slate-900/70 backdrop-blur border border-slate-800 p-4 rounded-2xl">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm giải đấu theo tên, năm, mã hiệu hoặc đơn vị tổ chức..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/80 transition-colors"
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
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              Tất Cả ({tournaments.length})
            </button>

            <button
              onClick={() => setStatusFilter('REGISTRATION')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                statusFilter === 'REGISTRATION'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              Đang Mở Đăng Ký
            </button>

            <button
              onClick={() => setStatusFilter('GROUP_STAGE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                statusFilter === 'GROUP_STAGE'
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              Vòng Bảng
            </button>

            <button
              onClick={() => setStatusFilter('COMPLETED')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                statusFilter === 'COMPLETED'
                  ? 'bg-slate-700 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
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
              {filteredTournaments.map((tour) => {
                const stats = tournamentStatsMap[tour.id] || { teamsCount: 0, matchesCount: 0 };
                const statusInfo = statusConfigs[tour.status || 'REGISTRATION'] || statusConfigs.REGISTRATION;
                const teamFillPercent = Math.min(100, Math.round((stats.teamsCount / (tour.maxTeams || 16)) * 100));

                return (
                  <div
                    key={tour.id}
                    className="group relative rounded-3xl bg-[#0B132B] border border-slate-800 hover:border-emerald-500/50 p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-1 overflow-hidden"
                  >
                    {/* Top ambient badge line */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 opacity-60 group-hover:opacity-100 transition-opacity"></div>

                    <div className="space-y-4">
                      {/* Status & Short Code Header */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] font-black tracking-widest text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-800/80">
                            {tour.shortCode || 'ITFTMS'}
                          </span>
                          <span className="text-xs font-bold text-slate-400 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
                            {tour.year || 2026}
                          </span>
                        </div>

                        {/* Status Badge */}
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusInfo.badgeClass}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotClass}`}></span>
                          <span>{statusInfo.label}</span>
                        </div>
                      </div>

                      {/* Tournament Name */}
                      <div>
                        <h4 
                          onClick={() => onSelectTournament(tour)}
                          className="text-lg font-black text-white group-hover:text-emerald-300 transition-colors line-clamp-2 cursor-pointer leading-tight"
                          title={tour.name}
                        >
                          {tour.name}
                        </h4>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span className="truncate">{tour.organizer || 'Khoa Công Nghệ Thông Tin'}</span>
                        </div>
                      </div>

                      {/* Format & Group Layout Pills */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        <div className="bg-slate-900/90 border border-slate-800 text-[11px] text-slate-300 px-2.5 py-1 rounded-lg font-medium">
                          ⚽ {tour.format || 'Bóng đá 5 người (Futsal)'} • {tour.matchDurationMinutes || 40} phút
                        </div>
                        <div className="bg-emerald-950/70 border border-emerald-500/30 text-[11px] text-emerald-400 px-2.5 py-1 rounded-lg font-bold">
                          {tour.numberOfGroups || 4} Bảng × {tour.teamsPerGroup || 4} Đội
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
                );
              })}
            </div>
          )}
        </div>

        {/* Feature Banner: 39-Point Specification Quality Guarantee */}
        <div className="bg-gradient-to-r from-slate-950 via-[#0B132B] to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>ĐẶC TẢ CHUẨN HÓA ITFTMS 2026 THEO QUY CHUẨN KHOA CNTT</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-2xl space-y-1">
              <div className="font-bold text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                16 Đội & 4 Bảng Đấu
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Mỗi bảng 4 đội đá vòng tròn 1 lượt, 2 đội đứng đầu vào Tứ Kết, Bán Kết, Tranh hạng 3 và Chung Kết (32 trận).
              </p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-2xl space-y-1">
              <div className="font-bold text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Luật Tích Lũy 2 Thẻ Vàng
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Cầu thủ tích lũy đủ 2 thẻ vàng bị tự động treo giò 1 trận tiếp theo (Điều 11), cảnh báo ngay trên danh sách ra sân.
              </p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-2xl space-y-1">
              <div className="font-bold text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Luân Lưu 6m & Khóa Khiếu Nại
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Hòa vòng Knockout sút penalty 6m (Điều 8). Cổng khiếu nại trọng tài tự động khóa sau 15 phút kết thúc trận (Điều 17).
              </p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-2xl space-y-1">
              <div className="font-bold text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Tài Chính & Ký Quỹ Độc Lập
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Tách bạch sổ quỹ Lệ phí đăng ký (500.000 VNĐ) và Tiền ký quỹ thẻ (50.000 VNĐ) theo dõi hoàn trả / tịch thu chuẩn xác.
              </p>
            </div>
          </div>
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
