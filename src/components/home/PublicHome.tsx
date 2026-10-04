'use client';

import React from 'react';
import { Match, Team, FinancialTransaction, Complaint, UserRole, Tournament } from '@/types';
import { TabKey } from '../layout/Navigation';
import { 
  Trophy, 
  Radio, 
  Calendar, 
  Users, 
  Flame, 
  Sparkles, 
  ShieldAlert, 
  Clock, 
  BadgeDollarSign, 
  ArrowRight,
  TrendingUp,
  Shirt,
  Play
} from 'lucide-react';

interface PublicHomeProps {
  teams: Team[];
  matches: Match[];
  finances: FinancialTransaction[];
  complaints: Complaint[];
  onNavigate: (tab: TabKey) => void;
  onSelectMatch: (matchId: string) => void;
  currentRole: UserRole;
  tournament?: Tournament;
}

export const PublicHome: React.FC<PublicHomeProps> = ({
  teams,
  matches,
  finances,
  complaints,
  onNavigate,
  onSelectMatch,
  currentRole,
  tournament,
}) => {
  const liveMatches = matches.filter((m) => m.status === 'LIVE');
  const finishedMatches = matches.filter((m) => m.status === 'FINISHED');
  const scheduledMatches = matches.filter((m) => m.status === 'SCHEDULED');

  const totalGoals = matches.reduce(
    (sum, m) => sum + (m.status === 'FINISHED' || m.status === 'LIVE' ? m.homeScore + m.awayScore : 0),
    0
  );

  const totalYellowCards = matches.reduce((sum, m) => {
    return sum + m.events.filter((e) => e.type === 'CARD' && e.cardType === 'YELLOW').length;
  }, 0);

  const totalRedCards = matches.reduce((sum, m) => {
    return sum + m.events.filter((e) => e.type === 'CARD' && (e.cardType === 'RED' || e.cardType === 'SECOND_YELLOW')).length;
  }, 0);

  const totalIncome = finances
    .filter((f) => f.type === 'INCOME')
    .reduce((sum, f) => sum + f.amount, 0);

  const totalExpense = finances
    .filter((f) => f.type === 'EXPENSE')
    .reduce((sum, f) => sum + f.amount, 0);

  // Top scorers (Golden Boot)
  const allPlayers = teams.flatMap((t) => t.players);
  const topScorers = [...allPlayers]
    .filter((p) => p.goals > 0)
    .sort((a, b) => b.goals - a.goals)
    .slice(0, 5);

  const getTeam = (teamId: string) => teams.find((t) => t.id === teamId);

  return (
    <div className="space-y-8">
      
      {/* Hero Stadium Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-emerald-500/30 bg-gradient-to-r from-[#070B14] via-[#0B132B] to-[#111C38] p-6 sm:p-12 shadow-2xl">
        {/* Animated pitch overlay glow */}
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -left-20 -top-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-xs font-black px-3.5 py-1 rounded-full uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5 animate-bounce" />
            <span>{tournament?.shortCode || 'ITFTMS'} • {tournament?.year || 2026} • {tournament?.organizer || 'KHOA CÔNG NGHỆ THÔNG TIN'}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-none mb-4 uppercase">
            {tournament?.name || 'GIẢI BÓNG ĐÁ SINH VIÊN CNTT 2026'}
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-6 font-light">
            Chào mừng đến với cổng thông tin điện tử chính thức của <strong className="text-white font-bold">{tournament?.name || 'Giải bóng đá Khoa Công nghệ Thông tin 2026'}</strong>.
            Nơi hội tụ <strong className="text-white font-bold">{teams.length > 0 ? `${teams.length} đội bóng` : `${tournament?.maxTeams || 16} đội bóng`}</strong> xuất sắc, <strong className="text-white font-bold">{allPlayers.length > 0 ? `${allPlayers.length} cầu thủ sinh viên` : 'các cầu thủ sinh viên'}</strong> tranh tài qua <strong className="text-white font-bold">{matches.length > 0 ? `${matches.length} trận cầu` : 'các trận cầu'} đỉnh cao</strong> trên mặt sân cỏ nhân tạo.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('live')}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-xs sm:text-sm shadow-xl shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5"
            >
              <Radio className="w-4 h-4 animate-pulse" />
              <span>Xem Trực Tiếp (Live Match Center)</span>
            </button>

            <button
              onClick={() => onNavigate('standings')}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm border border-slate-700 transition-all"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Bảng Xếp Hạng 4 Bảng</span>
            </button>

            <button
              onClick={() => onNavigate('bracket')}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 font-bold text-xs sm:text-sm border border-slate-700 transition-all"
            >
              <span>Nhánh Knockout</span>
              <ArrowRight className="w-4 h-4 text-emerald-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Specification #31: BTC Dashboard Cards Bar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">
              CHỈ SỐ TỔNG THỂ GIẢI ĐẤU (BTC DASHBOARD • ĐIỀU 31)
            </h3>
          </div>
          <span className="text-[11px] text-slate-500">Cập nhật tự động thời gian thực</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          
          <div className="p-4 rounded-2xl bg-[#0B132B]/90 border border-slate-800 flex flex-col justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400">Số Đội Bóng</span>
            <span className="text-2xl font-black font-mono text-white mt-1">16 ĐỘI</span>
            <span className="text-[10px] text-emerald-400">4 Bảng A-B-C-D</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#0B132B]/90 border border-slate-800 flex flex-col justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400">Tổng Cầu Thủ</span>
            <span className="text-2xl font-black font-mono text-cyan-400 mt-1">192</span>
            <span className="text-[10px] text-slate-400">16 đội × 12 max</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#0B132B]/90 border border-slate-800 flex flex-col justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400">Tổng Số Trận</span>
            <span className="text-2xl font-black font-mono text-amber-400 mt-1">32 TRẬN</span>
            <span className="text-[10px] text-slate-400">24 Vòng bảng + 8 KO</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#0B132B]/90 border border-slate-800 flex flex-col justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400">Bàn Thắng</span>
            <span className="text-2xl font-black font-mono text-emerald-400 mt-1">{totalGoals} ⚽</span>
            <span className="text-[10px] text-slate-400">{finishedMatches.length} trận hoàn tất</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#0B132B]/90 border border-slate-800 flex flex-col justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400">Thẻ Phạt</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-lg font-black font-mono text-amber-400">{totalYellowCards}🟨</span>
              <span className="text-lg font-black font-mono text-red-400">{totalRedCards}🟥</span>
            </div>
            <span className="text-[10px] text-slate-400">Tích lũy 2 thẻ = Treo</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#0B132B]/90 border border-slate-800 flex flex-col justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400">Tài Chính Quỹ</span>
            <span className="text-base font-black font-mono text-emerald-400 mt-1">
              {(totalIncome - totalExpense).toLocaleString()} đ
            </span>
            <span className="text-[10px] text-slate-400">Thu {(totalIncome/1000000).toFixed(1)}M / Chi {(totalExpense/1000000).toFixed(1)}M</span>
          </div>

        </div>
      </div>

      {/* Two Columns: Live / Featured Matches & Golden Boot Race */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Live / Featured Matches (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-red-400" />
              <h3 className="text-sm font-black uppercase tracking-wider text-white">
                Trận Cầu Nổi Bật & Đang Diễn Ra
              </h3>
            </div>
            <button
              onClick={() => onNavigate('schedule')}
              className="text-xs text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>Xem tất cả lịch</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {matches.slice(0, 3).map((m) => {
              const home = getTeam(m.homeTeamId);
              const away = getTeam(m.awayTeamId);

              return (
                <div
                  key={m.id}
                  onClick={() => {
                    onSelectMatch(m.id);
                    onNavigate('live');
                  }}
                  className="bg-[#0B132B]/90 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-4 shadow-xl transition-all cursor-pointer hover:bg-slate-800/60"
                >
                  <div className="flex items-center justify-between text-[11px] mb-2 text-slate-400">
                    <span className="font-bold text-emerald-400">{m.roundLabel}</span>
                    {m.status === 'LIVE' ? (
                      <span className="bg-red-500/20 text-red-400 border border-red-500/40 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                        LIVE {m.currentMinute}&apos;
                      </span>
                    ) : m.status === 'FINISHED' ? (
                      <span className="text-emerald-400 font-bold">KẾT THÚC (FT)</span>
                    ) : (
                      <span>{m.time} • {m.date}</span>
                    )}
                  </div>

                  <div className="grid grid-cols-7 items-center py-2">
                    <div className="col-span-3 text-right">
                      <span className="text-xs sm:text-sm font-bold text-white block truncate">
                        {home?.name || 'TBD'}
                      </span>
                      <span className="text-[10px] text-slate-400">Lớp {home?.class}</span>
                    </div>

                    <div className="col-span-1 text-center font-mono font-black text-lg sm:text-xl text-emerald-400">
                      {m.status === 'FINISHED' || m.status === 'LIVE'
                        ? `${m.homeScore} - ${m.awayScore}`
                        : 'VS'}
                    </div>

                    <div className="col-span-3 text-left">
                      <span className="text-xs sm:text-sm font-bold text-white block truncate">
                        {away?.name || 'TBD'}
                      </span>
                      <span className="text-[10px] text-slate-400">Lớp {away?.class}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
                    <span>{m.venueName || 'Sân 1'}</span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <span>Bấm xem Live</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Golden Boot Top Scorers (5 Cols) */}
        <div className="lg:col-span-5 bg-[#0B132B]/90 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-black uppercase tracking-wider text-white">
                  Đua Vua Phá Lưới (Golden Boot)
                </h3>
              </div>
              <span className="text-xs font-mono text-amber-400">Điều 25</span>
            </div>

            <div className="space-y-3">
              {topScorers.map((p, idx) => {
                const team = getTeam(p.teamId);
                return (
                  <div
                    key={p.id}
                    className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center font-mono font-bold text-xs ${
                          idx === 0
                            ? 'bg-amber-500 text-slate-950 font-black'
                            : idx === 1
                            ? 'bg-slate-300 text-slate-950 font-black'
                            : idx === 2
                            ? 'bg-amber-700 text-white font-black'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {idx + 1}
                      </span>

                      <div>
                        <h4 className="text-xs font-bold text-white">{p.name}</h4>
                        <span className="text-[10px] text-slate-400">
                          #{p.jerseyNumber} • {team?.shortName} • Lớp {p.class}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-black font-mono text-emerald-400 block">
                        {p.goals} ⚽
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {p.assists || 0} kiến tạo
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tournament Regulations Summary */}
          <div className="mt-5 pt-4 border-t border-slate-800 text-xs text-slate-400 space-y-1.5">
            <div className="flex items-center justify-between">
              <span>Thể thức:</span>
              <strong className="text-white">Bóng đá 5 người (Futsal)</strong>
            </div>
            <div className="flex items-center justify-between">
              <span>Thời lượng:</span>
              <strong className="text-white">Hiệp 1 (20p) + Nghỉ (5p) + Hiệp 2 (20p)</strong>
            </div>
            <div className="flex items-center justify-between">
              <span>Hòa Knockout:</span>
              <strong className="text-amber-400">Không đá hiệp phụ ➔ Luân lưu 6m</strong>
            </div>
            <div className="flex items-center justify-between">
              <span>Kỷ luật:</span>
              <strong className="text-red-400">Nhận đủ 02 thẻ vàng ➔ Treo giò 01 trận</strong>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
