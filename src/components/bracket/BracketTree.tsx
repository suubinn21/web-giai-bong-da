'use client';

import React from 'react';
import { Match, Team } from '@/types';
import { Trophy, Award, Sparkles, ChevronRight, Radio, MapPin } from 'lucide-react';

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
        className={`w-full sm:w-64 md:w-72 rounded-2xl border transition-all cursor-pointer shadow-sm hover:shadow-md ${
          isFinal
            ? 'bg-gradient-to-b from-amber-50 to-white border-amber-400 hover:border-amber-500 sm:scale-105'
            : 'bg-white border-slate-200 hover:border-blue-400'
        }`}
      >
        {/* Header of Match Card */}
        <div className="px-3.5 py-2 border-b border-slate-100 flex items-center justify-between text-[11px] gap-1.5 bg-slate-50/70 rounded-t-2xl">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-blue-800">{label || match.roundLabel}</span>
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-black bg-sky-50 text-sky-700 border border-sky-200">
              <MapPin className="w-2.5 h-2.5 text-sky-600 shrink-0" />
              <span>{(match.venueName ? match.venueName.match(/Sân\s*\d+/i)?.[0] || match.venueName.split(' - ')[0] : 'Sân 1').toUpperCase()}</span>
            </span>
            {match.isCustomMatchup && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                Tự chỉnh
              </span>
            )}
          </div>
          {match.status === 'LIVE' && (
            <span className="flex items-center gap-1 text-red-600 font-bold animate-pulse text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
              LIVE
            </span>
          )}
          {match.status === 'FINISHED' && (
            <span className="text-emerald-700 font-bold text-[10px]">FT</span>
          )}
          {match.status === 'SCHEDULED' && (
            <span className="text-slate-600 font-mono text-[10px] font-semibold">{match.time}</span>
          )}
        </div>

        {/* Home Team */}
        <div
          className={`p-3 flex items-center justify-between border-b border-slate-100 ${
            isHomeWinner ? 'bg-emerald-50 text-emerald-800 font-black' : 'text-slate-800 font-semibold'
          }`}
        >
          <div className="flex items-center gap-2 truncate">
            {home ? (
              <span
                className="w-3.5 h-3.5 rounded-full border flex-shrink-0"
                style={{ backgroundColor: home.primaryColor, borderColor: home.secondaryColor }}
              ></span>
            ) : (
              <span className="w-3.5 h-3.5 rounded-full bg-slate-200 border border-slate-300 flex-shrink-0"></span>
            )}
            <span className={`truncate text-xs ${!home ? 'text-slate-500 italic font-medium' : ''}`}>
              {home?.name || placeholderHome || 'Chưa xác định'}
            </span>
          </div>

          <div className="flex items-center gap-2 font-mono font-bold text-sm text-slate-900">
            {match.status === 'FINISHED' || match.status === 'LIVE' ? (
              <span>{match.homeScore}</span>
            ) : (
              <span className="text-slate-400">-</span>
            )}
            {match.penaltyShootout && (
              <span className="text-[10px] text-amber-700 font-mono">
                ({match.penaltyShootout.homeScore}p)
              </span>
            )}
          </div>
        </div>

        {/* Away Team */}
        <div
          className={`p-3 flex items-center justify-between rounded-b-2xl ${
            isAwayWinner ? 'bg-emerald-50 text-emerald-800 font-black' : 'text-slate-800 font-semibold'
          }`}
        >
          <div className="flex items-center gap-2 truncate">
            {away ? (
              <span
                className="w-3.5 h-3.5 rounded-full border flex-shrink-0"
                style={{ backgroundColor: away.primaryColor, borderColor: away.secondaryColor }}
              ></span>
            ) : (
              <span className="w-3.5 h-3.5 rounded-full bg-slate-200 border border-slate-300 flex-shrink-0"></span>
            )}
            <span className={`truncate text-xs ${!away ? 'text-slate-500 italic font-medium' : ''}`}>
              {away?.name || placeholderAway || 'Chưa xác định'}
            </span>
          </div>

          <div className="flex items-center gap-2 font-mono font-bold text-sm text-slate-900">
            {match.status === 'FINISHED' || match.status === 'LIVE' ? (
              <span>{match.awayScore}</span>
            ) : (
              <span className="text-slate-400">-</span>
            )}
            {match.penaltyShootout && (
              <span className="text-[10px] text-amber-700 font-mono">
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
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 text-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-blue-200">
              VÒNG ĐẤU LOẠI TRỰC TIẾP
            </span>
            <span className="text-xs text-slate-500">Điều lệ Điều 5 &amp; Điều 22</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            Nhánh Đấu Tứ Kết ➔ Bán Kết ➔ Chung Kết
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Hòa sau 40 phút thi đấu chính thức: Không đá hiệp phụ, tiến hành đá luân lưu 6m (Điều 8).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>Đội Thắng Đi Tiếp</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>Đá Luân Lưu 6m</span>
          </div>
        </div>
      </div>

      {/* Mobile Stage Selector Tabs (only visible on mobile phones) */}
      <div className="flex sm:hidden items-center justify-between gap-1 p-1 bg-slate-100 border border-slate-200 rounded-2xl overflow-x-auto text-xs">
        <button
          onClick={() => setMobileStage('ALL')}
          className={`flex-1 py-1.5 px-2 rounded-xl font-bold text-center transition-all ${
            mobileStage === 'ALL' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Sơ Đồ Ngang
        </button>
        <button
          onClick={() => setMobileStage('QF')}
          className={`flex-1 py-1.5 px-2 rounded-xl font-bold text-center transition-all ${
            mobileStage === 'QF' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Tứ Kết
        </button>
        <button
          onClick={() => setMobileStage('SF')}
          className={`flex-1 py-1.5 px-2 rounded-xl font-bold text-center transition-all ${
            mobileStage === 'SF' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Bán Kết
        </button>
        <button
          onClick={() => setMobileStage('FINAL')}
          className={`flex-1 py-1.5 px-2 rounded-xl font-bold text-center transition-all ${
            mobileStage === 'FINAL' ? 'bg-amber-500 text-white font-black shadow-xs' : 'text-slate-600 hover:text-slate-900'
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
              <div className="text-xs font-black text-blue-700 uppercase tracking-widest flex items-center justify-between">
                <span>4 TRẬN VÒNG TỨ KẾT</span>
                <span className="text-[10px] text-slate-500 font-normal">Chạm trận để vào Live Center</span>
              </div>
              <div className="flex flex-col gap-3">
                {renderBracketMatch(tk1, 'TỨ KẾT 1', 'Nhất bảng A', 'Nhì bảng B')}
                {renderBracketMatch(tk2, 'TỨ KẾT 2', 'Nhất bảng B', 'Nhì bảng A')}
                {renderBracketMatch(tk3, 'TỨ KẾT 3', 'Nhất bảng C', 'Nhì bảng D')}
                {renderBracketMatch(tk4, 'TỨ KẾT 4', 'Nhất bảng D', 'Nhì bảng C')}
              </div>
            </div>
          )}

          {mobileStage === 'SF' && (
            <div className="space-y-3">
              <div className="text-xs font-black text-blue-700 uppercase tracking-widest flex items-center justify-between">
                <span>2 TRẬN VÒNG BÁN KẾT</span>
                <span className="text-[10px] text-slate-500 font-normal">Chạm trận để vào Live Center</span>
              </div>
              <div className="flex flex-col gap-3">
                {renderBracketMatch(bk1, 'BÁN KẾT 1', 'Thắng Tứ kết 1', 'Thắng Tứ kết 2')}
                {renderBracketMatch(bk2, 'BÁN KẾT 2', 'Thắng Tứ kết 3', 'Thắng Tứ kết 4')}
              </div>
            </div>
          )}

          {mobileStage === 'FINAL' && (
            <div className="space-y-4">
              <div className="text-xs font-black text-amber-600 uppercase tracking-widest flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-500" />
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
            <div className="text-xs font-black text-blue-700 uppercase tracking-widest text-center mb-1">
              VÒNG TỨ KẾT (4 TRẬN)
            </div>
            
            {renderBracketMatch(tk1, 'TỨ KẾT 1', 'Nhất bảng A', 'Nhì bảng B')}
            {renderBracketMatch(tk2, 'TỨ KẾT 2', 'Nhất bảng B', 'Nhì bảng A')}
            {renderBracketMatch(tk3, 'TỨ KẾT 3', 'Nhất bảng C', 'Nhì bảng D')}
            {renderBracketMatch(tk4, 'TỨ KẾT 4', 'Nhất bảng D', 'Nhì bảng C')}
          </div>

          {/* SVG Connector Lines Left -> Center */}
          <div className="hidden lg:flex flex-col justify-around h-[550px] w-12 text-slate-400">
            <ChevronRight className="w-8 h-8 text-blue-500/50" />
            <ChevronRight className="w-8 h-8 text-blue-500/50" />
          </div>

          {/* Column 2: Semi Finals (Bán kết) */}
          <div className="flex flex-col justify-around h-[550px] flex-shrink-0 space-y-12">
            <div className="text-xs font-black text-sky-700 uppercase tracking-widest text-center mb-1">
              VÒNG BÁN KẾT (2 TRẬN)
            </div>
            {renderBracketMatch(bk1, 'BÁN KẾT 1', 'Thắng Tứ kết 1', 'Thắng Tứ kết 2')}
            {renderBracketMatch(bk2, 'BÁN KẾT 2', 'Thắng Tứ kết 3', 'Thắng Tứ kết 4')}
          </div>

          {/* SVG Connector Lines Center -> Finals */}
          <div className="hidden lg:flex flex-col justify-center h-[550px] w-12 text-slate-400">
            <ChevronRight className="w-8 h-8 text-amber-500/70" />
          </div>

          {/* Column 3: Grand Final & 3rd Place */}
          <div className="flex flex-col justify-center items-center h-[550px] flex-shrink-0 space-y-8">
            <div className="text-xs font-black text-amber-600 uppercase tracking-widest text-center flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>TRẬN CHUNG KẾT VÔ ĐỊCH</span>
            </div>
            
            {renderBracketMatch(grandFinal, '🏆 CHUNG KẾT (FINAL)', 'Thắng Bán kết 1', 'Thắng Bán kết 2', true)}

            {/* Third Place Match */}
            <div className="pt-4 border-t border-slate-200 w-full flex flex-col items-center">
              <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1">
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
