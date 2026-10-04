'use client';

import React, { useState } from 'react';
import { Match, Team, Venue, Referee, UserRole } from '@/types';
import { ScheduleEngine } from '@/services/scheduleEngine';
import { StorageService } from '@/services/storage';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  Radio, 
  AlertCircle,
  Filter,
  RefreshCw
} from 'lucide-react';

interface ScheduleViewProps {
  matches: Match[];
  teams: Team[];
  venues: Venue[];
  referees: Referee[];
  onMatchesUpdate: (matches: Match[]) => void;
  onSelectMatch: (matchId: string) => void;
  currentRole: UserRole;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  matches,
  teams,
  venues,
  referees,
  onMatchesUpdate,
  onSelectMatch,
  currentRole,
}) => {
  const [filterVenue, setFilterVenue] = useState<string>('ALL');
  const [filterRound, setFilterRound] = useState<string>('ALL');
  const [filterDate, setFilterDate] = useState<string>('ALL');

  const canGenerate = currentRole === 'SUPER_ADMIN' || currentRole === 'ORGANIZER';

  // Conflict verification (Rule #18)
  const validationResult = ScheduleEngine.validateSchedule(matches);

  const getTeam = (teamId: string) => teams.find((t) => t.id === teamId);

  // Trigger Automatic Schedule Generator
  const handleAutoGenerate = () => {
    if (!canGenerate) return;
    try {
      const generated = ScheduleEngine.generateGroupSchedule(teams, venues, referees);
      // Combine with existing knockout slots
      const knockoutMatches = matches.filter((m) => m.round !== 'GROUP');
      const allUpdated = [...generated, ...knockoutMatches];

      onMatchesUpdate(allUpdated);
      StorageService.saveMatches(allUpdated);

      StorageService.logAction(
        currentRole,
        currentRole,
        'TỰ ĐỘNG LẬP LỊCH THI ĐẤU (SCHEDULE ENGINE)',
        '24 Trận Vòng Bảng',
        'Tự động phân bổ 24 trận đấu vào 3 cụm sân từ 06:30 - 17:00, không trùng sân, không trùng giờ và không trùng đội.'
      );

      alert('Đã tạo thành công lịch thi đấu 24 trận vòng bảng chuẩn xác, không có xung đột sân bãi!');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Có lỗi khi tạo lịch thi đấu.';
      alert(`Lỗi: ${msg}`);
    }
  };

  const getVenueDetails = (venueId?: string, venueNameFallback?: string) => {
    const v = venues.find((item) => item.id === venueId);
    const fullName = v?.name || venueNameFallback || 'Sân 1 - Cỏ Nhân Tạo Ký Túc Xá';
    const matchPitch = fullName.match(/Sân\s*\d+/i);
    const shortPitch = matchPitch ? matchPitch[0] : (fullName.split(' - ')[0] || 'Sân 1');
    return { fullName, shortPitch, location: v?.location || 'Khu phức hợp thể thao' };
  };

  const filteredMatches = matches.filter((m) => {
    if (filterVenue !== 'ALL' && m.venueId !== filterVenue) return false;
    if (filterRound !== 'ALL' && m.round !== filterRound) return false;
    if (filterDate !== 'ALL' && m.date !== filterDate) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner Card */}
      <div className="bg-[#0B132B] border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-emerald-500/20 text-emerald-400 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
              LỊCH THI ĐẤU & KẾT QUẢ 32 TRẬN
            </span>
            <span className="text-xs text-slate-400">Quy định Điều 18 & 19</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Điều Hành Lịch & Kết Quả Giải Đấu
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Thi đấu tại 3 cụm sân cỏ nhân tạo từ 06:30 – 17:00. Tối ưu thời gian nghỉ và kiểm soát xung đột tự động.
          </p>
        </div>

        {/* Schedule Generator & Conflict Status */}
        <div className="flex flex-wrap items-center gap-2">
          {validationResult.valid ? (
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1.5 rounded-xl font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>0 Xung Đột Sân/Giờ</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-red-400 bg-red-950/60 border border-red-500/30 px-3 py-1.5 rounded-xl font-bold">
              <AlertCircle className="w-4 h-4" />
              <span>{validationResult.conflicts.length} Xung Đột</span>
            </div>
          )}

          {canGenerate && (
            <button
              onClick={handleAutoGenerate}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/25 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Tự Động Tạo Lịch 24 Trận</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar with Quick Pitch Filter Chips */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2 text-slate-400 font-bold uppercase">
          <Filter className="w-4 h-4 text-emerald-400" />
          <span>Bộ Lọc Trận Đấu &amp; Sân:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Quick Pitch Filter Chips */}
          <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 overflow-x-auto">
            <button
              onClick={() => setFilterVenue('ALL')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                filterVenue === 'ALL'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Tất Cả Sân
            </button>
            {venues.map((v) => {
              const short = v.name.match(/Sân\s*\d+/i)?.[0] || v.name.split(' - ')[0] || v.name;
              const isActive = filterVenue === v.id;
              return (
                <button
                  key={v.id}
                  onClick={() => setFilterVenue(v.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 shrink-0 ${
                    isActive
                      ? 'bg-cyan-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <MapPin className="w-2.5 h-2.5" />
                  <span>{short}</span>
                </button>
              );
            })}
          </div>

          {/* Round Filter */}
          <select
            value={filterRound}
            onChange={(e) => setFilterRound(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-1.5 font-medium"
          >
            <option value="ALL">Tất Cả Các Vòng</option>
            <option value="GROUP">Vòng Bảng (24 trận)</option>
            <option value="QUARTER_FINAL">Vòng Tứ Kết</option>
            <option value="SEMI_FINAL">Vòng Bán Kết</option>
            <option value="THIRD_PLACE">Tranh Hạng 3</option>
            <option value="FINAL">Chung Kết</option>
          </select>
        </div>
      </div>

      {/* Match Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMatches.map((m) => {
          const home = getTeam(m.homeTeamId);
          const away = getTeam(m.awayTeamId);
          const { fullName, shortPitch } = getVenueDetails(m.venueId, m.venueName);

          return (
            <div
              key={m.id}
              onClick={() => onSelectMatch(m.id)}
              className="bg-[#0B132B]/90 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-4 shadow-xl transition-all cursor-pointer hover:bg-slate-800/60 flex flex-col justify-between"
            >
              {/* Card Header: Match #, Round Label, Prominent PITCH BADGE & Match Status */}
              <div className="flex items-center justify-between text-[11px] pb-2.5 border-b border-slate-800/80 mb-3 gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-mono font-bold text-slate-400 bg-slate-800/90 px-1.5 py-0.5 rounded text-[10px] border border-slate-700">
                    #{m.matchNumber || m.id}
                  </span>
                  <span className="font-extrabold text-emerald-400">{m.roundLabel}</span>
                  {/* SỐ SÂN THI ĐẤU NỔI BẬT */}
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-black tracking-wide bg-cyan-950/90 border border-cyan-500/50 text-cyan-300 shadow-sm">
                    <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
                    <span>{shortPitch.toUpperCase()}</span>
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {m.status === 'LIVE' && (
                    <span className="flex items-center gap-1 font-bold text-red-400 animate-pulse text-[10px] bg-red-950/70 border border-red-500/40 px-2 py-0.5 rounded-lg">
                      <Radio className="w-3 h-3" /> LIVE {m.currentMinute}&apos;
                    </span>
                  )}
                  {m.status === 'FINISHED' && (
                    <span className="text-emerald-400 font-bold text-[10px] bg-emerald-950/70 border border-emerald-500/40 px-2 py-0.5 rounded-lg">
                      KẾT THÚC
                    </span>
                  )}
                  {m.status === 'SCHEDULED' && (
                    <span className="text-slate-300 font-mono text-[10px] bg-slate-800/80 border border-slate-700 px-2 py-0.5 rounded-lg flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" /> {m.time}
                    </span>
                  )}
                </div>
              </div>

              {/* Match Teams & Score */}
              <div className="space-y-2 py-1">
                {/* Home */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 truncate">
                    {home ? (
                      <span
                        className="w-3 h-3 rounded-full border flex-shrink-0"
                        style={{ backgroundColor: home.primaryColor, borderColor: home.secondaryColor }}
                      ></span>
                    ) : (
                      <span className="w-3 h-3 rounded-full bg-slate-800 flex-shrink-0"></span>
                    )}
                    <span className="text-xs font-bold text-white truncate">
                      {home?.name || 'Đội chờ xác định'}
                    </span>
                  </div>

                  <span className="font-mono font-black text-sm text-white">
                    {m.status === 'FINISHED' || m.status === 'LIVE' ? m.homeScore : '-'}
                  </span>
                </div>

                {/* Away */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 truncate">
                    {away ? (
                      <span
                        className="w-3 h-3 rounded-full border flex-shrink-0"
                        style={{ backgroundColor: away.primaryColor, borderColor: away.secondaryColor }}
                      ></span>
                    ) : (
                      <span className="w-3 h-3 rounded-full bg-slate-800 flex-shrink-0"></span>
                    )}
                    <span className="text-xs font-bold text-white truncate">
                      {away?.name || 'Đội chờ xác định'}
                    </span>
                  </div>

                  <span className="font-mono font-black text-sm text-white">
                    {m.status === 'FINISHED' || m.status === 'LIVE' ? m.awayScore : '-'}
                  </span>
                </div>
              </div>

              {/* Penalty shootout if applicable */}
              {m.penaltyShootout && (
                <div className="my-2 p-1.5 bg-amber-500/10 border border-amber-500/30 rounded-lg text-[10px] text-amber-300 text-center font-bold">
                  Luân lưu 6m: {m.penaltyShootout.homeScore} - {m.penaltyShootout.awayScore}
                </div>
              )}

              {/* Card Footer: Detailed Pitch / Venue & Date */}
              <div className="pt-2.5 border-t border-slate-800/80 mt-3 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 truncate max-w-[210px]" title={fullName}>
                  <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="truncate font-semibold text-cyan-300">{fullName}</span>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-[10px] text-slate-400 shrink-0">
                  <Calendar className="w-3 h-3 text-slate-500" />
                  <span>{m.date}</span>
                  {m.time && <span>• {m.time}</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
