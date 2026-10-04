'use client';

import React from 'react';
import { Match, Team } from '@/types';
import { Trophy, Award, Sparkles, ChevronRight, Radio } from 'lucide-react';

interface BracketTreeProps {
  matches: Match[];
  teams: Team[];
  onSelectMatch: (matchId: string) => void;
}

export const BracketTree: React.FC<BracketTreeProps> = ({
  matches,
  teams,
  onSelectMatch,
}) => {
  // Quarterfinals
  const tk1 = matches.find((m) => m.id === 'M25');
  const tk2 = matches.find((m) => m.id === 'M26');
  const tk3 = matches.find((m) => m.id === 'M27');
  const tk4 = matches.find((m) => m.id === 'M28');

  // Semifinals
  const bk1 = matches.find((m) => m.id === 'M29');
  const bk2 = matches.find((m) => m.id === 'M30');

  // Third Place & Final
  const thirdPlace = matches.find((m) => m.id === 'M31');
  const grandFinal = matches.find((m) => m.id === 'M32');

  const getTeam = (teamId?: string) => teams.find((t) => t.id === teamId);

  // Helper render for single match block in bracket
  const renderBracketMatch = (
    match?: Match,
    label?: string,
    placeholderHome?: string,
    placeholderAway?: string,
    isFinal?: boolean
  ) => {
    if (!match) return null;

    const home = getTeam(match.homeTeamId);
    const away = getTeam(match.awayTeamId);

    const isHomeWinner =
      match.status === 'FINISHED' &&
      (match.winnerTeamId === match.homeTeamId ||
        (match.homeScore > match.awayScore && !match.winnerTeamId));

    const isAwayWinner =
      match.status === 'FINISHED' &&
      (match.winnerTeamId === match.awayTeamId ||
        (match.awayScore > match.homeScore && !match.winnerTeamId));

    return (
      <div
        onClick={() => onSelectMatch(match.id)}
        className={`w-full sm:w-64 md:w-72 rounded-2xl border transition-all cursor-pointer shadow-xl ${
          isFinal
            ? 'bg-gradient-to-b from-amber-950/60 to-slate-900 border-amber-500/60 hover:border-amber-400 glow-amber sm:scale-105'
            : 'bg-[#0B132B]/90 border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800/80'
        }`}
      >
        {/* Header of Match Card */}
        <div className="px-3.5 py-2 border-b border-slate-800 flex items-center justify-between text-[11px]">
          <span className="font-extrabold text-slate-300">{label || match.roundLabel}</span>
          {match.status === 'LIVE' && (
            <span className="flex items-center gap-1 text-red-400 font-bold animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
              LIVE
            </span>
          )}
          {match.status === 'FINISHED' && (
            <span className="text-emerald-400 font-bold">FT</span>
          )}
          {match.status === 'SCHEDULED' && (
            <span className="text-slate-500">{match.time}</span>
          )}
        </div>

        {/* Home Team */}
        <div
          className={`p-3 flex items-center justify-between border-b border-slate-800/60 ${
            isHomeWinner ? 'bg-emerald-950/40 text-emerald-300 font-black' : 'text-slate-300'
          }`}
        >
          <div className="flex items-center gap-2 truncate">
            {home ? (
              <span
                className="w-3.5 h-3.5 rounded-full border flex-shrink-0"
                style={{ backgroundColor: home.primaryColor, borderColor: home.secondaryColor }}
              ></span>
            ) : (
              <span className="w-3.5 h-3.5 rounded-full bg-slate-800 flex-shrink-0"></span>
            )}
            <span className="truncate text-xs">
              {home?.name || placeholderHome || 'Chưa xác định'}
            </span>
          </div>

          <div className="flex items-center gap-2 font-mono font-bold text-sm">
            {match.status === 'FINISHED' || match.status === 'LIVE' ? (
              <span>{match.homeScore}</span>
            ) : (
              <span className="text-slate-600">-</span>
            )}
            {match.penaltyShootout && (
              <span className="text-[10px] text-amber-400 font-mono">
                ({match.penaltyShootout.homeScore}p)
              </span>
            )}
          </div>
        </div>

        {/* Away Team */}
        <div
          className={`p-3 flex items-center justify-between ${
            isAwayWinner ? 'bg-emerald-950/40 text-emerald-300 font-black' : 'text-slate-300'
          }`}
        >
          <div className="flex items-center gap-2 truncate">
            {away ? (
              <span
                className="w-3.5 h-3.5 rounded-full border flex-shrink-0"
                style={{ backgroundColor: away.primaryColor, borderColor: away.secondaryColor }}
              ></span>
            ) : (
              <span className="w-3.5 h-3.5 rounded-full bg-slate-800 flex-shrink-0"></span>
            )}
            <span className="truncate text-xs">
              {away?.name || placeholderAway || 'Chưa xác định'}
            </span>
          </div>

          <div className="flex items-center gap-2 font-mono font-bold text-sm">
            {match.status === 'FINISHED' || match.status === 'LIVE' ? (
              <span>{match.awayScore}</span>
            ) : (
              <span className="text-slate-600">-</span>
            )}
            {match.penaltyShootout && (
              <span className="text-[10px] text-amber-400 font-mono">
                ({match.penaltyShootout.awayScore}p)
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  const [mobileStage, setMobileStage] = React.useState<'ALL' | 'QF' | 'SF' | 'FINAL'>('ALL');

  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <div className="bg-[#0B132B] border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-emerald-500/20 text-emerald-400 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
              VÒNG ĐẤU LOẠI TRỰC TIẾP
            </span>
            <span className="text-xs text-slate-400">Điều lệ Điều 5 & Điều 22</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Nhánh Đấu Tứ Kết ➔ Bán Kết ➔ Chung Kết
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Hòa sau 40 phút thi đấu chính thức: Không đá hiệp phụ, tiến hành đá luân lưu 6m (Điều 8).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>Đội Thắng Đi Tiếp</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <span>Đá Luân Lưu 6m</span>
          </div>
        </div>
      </div>

      {/* Mobile Stage Selector Tabs (only visible on mobile phones) */}
      <div className="flex sm:hidden items-center justify-between gap-1 p-1 bg-slate-900 border border-slate-800 rounded-2xl overflow-x-auto text-xs">
        <button
          onClick={() => setMobileStage('ALL')}
          className={`flex-1 py-1.5 px-2 rounded-xl font-bold text-center transition-all ${
            mobileStage === 'ALL' ? 'bg-emerald-500 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          Sơ Đồ Ngang
        </button>
        <button
          onClick={() => setMobileStage('QF')}
          className={`flex-1 py-1.5 px-2 rounded-xl font-bold text-center transition-all ${
            mobileStage === 'QF' ? 'bg-emerald-500 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          Tứ Kết
        </button>
        <button
          onClick={() => setMobileStage('SF')}
          className={`flex-1 py-1.5 px-2 rounded-xl font-bold text-center transition-all ${
            mobileStage === 'SF' ? 'bg-emerald-500 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          Bán Kết
        </button>
        <button
          onClick={() => setMobileStage('FINAL')}
          className={`flex-1 py-1.5 px-2 rounded-xl font-bold text-center transition-all ${
            mobileStage === 'FINAL' ? 'bg-amber-500 text-slate-950 font-black shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          Chung Kết 🏆
        </button>
      </div>

      {/* Mobile Selected Round Cards Stack (clean vertical view on phones) */}
      {mobileStage !== 'ALL' && (
        <div className="sm:hidden space-y-4 pt-2">
          {mobileStage === 'QF' && (
            <div className="space-y-3">
              <div className="text-xs font-black text-emerald-400 uppercase tracking-widest flex items-center justify-between">
                <span>4 TRẬN VÒNG TỨ KẾT</span>
                <span className="text-[10px] text-slate-400 font-normal">Chạm trận để vào Live Center</span>
              </div>
              <div className="flex flex-col gap-3">
                {renderBracketMatch(tk1, 'TỨ KẾT 1', 'Nhất bảng A', 'Nhì bảng B')}
                {renderBracketMatch(tk3, 'TỨ KẾT 3', 'Nhất bảng C', 'Nhì bảng D')}
                {renderBracketMatch(tk2, 'TỨ KẾT 2', 'Nhất bảng B', 'Nhì bảng A')}
                {renderBracketMatch(tk4, 'TỨ KẾT 4', 'Nhất bảng D', 'Nhì bảng C')}
              </div>
            </div>
          )}

          {mobileStage === 'SF' && (
            <div className="space-y-3">
              <div className="text-xs font-black text-cyan-400 uppercase tracking-widest flex items-center justify-between">
                <span>2 TRẬN VÒNG BÁN KẾT</span>
                <span className="text-[10px] text-slate-400 font-normal">Chạm trận để vào Live Center</span>
              </div>
              <div className="flex flex-col gap-3">
                {renderBracketMatch(bk1, 'BÁN KẾT 1', 'Thắng Tứ kết 1', 'Thắng Tứ kết 3')}
                {renderBracketMatch(bk2, 'BÁN KẾT 2', 'Thắng Tứ kết 2', 'Thắng Tứ kết 4')}
              </div>
            </div>
          )}

          {mobileStage === 'FINAL' && (
            <div className="space-y-4">
              <div className="text-xs font-black text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>TRẬN CHUNG KẾT &amp; TRANH HẠNG BA</span>
              </div>
              <div className="flex flex-col gap-4">
                {renderBracketMatch(grandFinal, '🏆 CHUNG KẾT (FINAL)', 'Thắng Bán kết 1', 'Thắng Bán kết 2', true)}
                {renderBracketMatch(thirdPlace, '🥉 TRANH HẠNG 3', 'Thua Bán kết 1', 'Thua Bán kết 2')}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bracket Tree Flow Chart Visualizer (hidden on mobile if user chose a specific stage tab) */}
      <div className={`overflow-x-auto pb-6 pt-2 ${mobileStage !== 'ALL' ? 'hidden sm:block' : 'block'}`}>
        <div className="min-w-[900px] flex items-center justify-between gap-8 py-4 px-2">
          
          {/* Column 1: Quarter Finals (Tứ kết) */}
          <div className="flex flex-col space-y-8 flex-shrink-0">
            <div className="text-xs font-black text-emerald-400 uppercase tracking-widest text-center mb-1">
              VÒNG TỨ KẾT (4 TRẬN)
            </div>
            
            {renderBracketMatch(tk1, 'TỨ KẾT 1', 'Nhất bảng A', 'Nhì bảng B')}
            {renderBracketMatch(tk3, 'TỨ KẾT 3', 'Nhất bảng C', 'Nhì bảng D')}
            {renderBracketMatch(tk2, 'TỨ KẾT 2', 'Nhất bảng B', 'Nhì bảng A')}
            {renderBracketMatch(tk4, 'TỨ KẾT 4', 'Nhất bảng D', 'Nhì bảng C')}
          </div>

          {/* SVG Connector Lines Left -> Center */}
          <div className="hidden lg:flex flex-col justify-around h-[550px] w-12 text-slate-600">
            <ChevronRight className="w-8 h-8 text-emerald-500/40" />
            <ChevronRight className="w-8 h-8 text-emerald-500/40" />
          </div>

          {/* Column 2: Semi Finals (Bán kết) */}
          <div className="flex flex-col justify-around h-[550px] flex-shrink-0 space-y-12">
            <div className="text-xs font-black text-cyan-400 uppercase tracking-widest text-center mb-1">
              VÒNG BÁN KẾT (2 TRẬN)
            </div>
            {renderBracketMatch(bk1, 'BÁN KẾT 1', 'Thắng Tứ kết 1', 'Thắng Tứ kết 3')}
            {renderBracketMatch(bk2, 'BÁN KẾT 2', 'Thắng Tứ kết 2', 'Thắng Tứ kết 4')}
          </div>

          {/* SVG Connector Lines Center -> Finals */}
          <div className="hidden lg:flex flex-col justify-center h-[550px] w-12 text-slate-600">
            <ChevronRight className="w-8 h-8 text-amber-500/60" />
          </div>

          {/* Column 3: Grand Final & 3rd Place */}
          <div className="flex flex-col justify-center items-center h-[550px] flex-shrink-0 space-y-8">
            <div className="text-xs font-black text-amber-400 uppercase tracking-widest text-center flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>TRẬN CHUNG KẾT VÔ ĐỊCH</span>
            </div>
            
            {renderBracketMatch(grandFinal, '🏆 CHUNG KẾT (FINAL)', 'Thắng Bán kết 1', 'Thắng Bán kết 2', true)}

            {/* Third Place Match */}
            <div className="pt-4 border-t border-slate-800 w-full flex flex-col items-center">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-amber-600" />
                <span>TRANH HẠNG BA</span>
              </div>
              {renderBracketMatch(thirdPlace, '🥉 TRANH HẠNG 3', 'Thua Bán kết 1', 'Thua Bán kết 2')}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
