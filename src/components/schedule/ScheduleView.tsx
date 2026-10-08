'use client';

import React, { useState } from 'react';
import { Match, Team, Venue, Referee, UserRole, Tournament, MatchStatus } from '@/types';
import { ScheduleEngine } from '@/services/scheduleEngine';
import { KnockoutEngine } from '@/services/knockoutEngine';
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
  RefreshCw,
  Edit3,
  Zap,
  X,
  Check,
  AlertTriangle,
  CalendarDays,
  ArrowUpDown,
  LayoutGrid,
  Sun,
  Sunset,
  Timer,
  Coffee,
  Trophy,
  ArrowLeftRight
} from 'lucide-react';

interface ScheduleViewProps {
  matches: Match[];
  teams: Team[];
  venues: Venue[];
  referees: Referee[];
  onMatchesUpdate: (matches: Match[]) => void;
  onSelectMatch: (matchId: string) => void;
  currentRole: UserRole;
  tournament?: Tournament;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  matches,
  teams,
  venues,
  referees,
  onMatchesUpdate,
  onSelectMatch,
  currentRole,
  tournament,
}) => {
  const [filterVenue, setFilterVenue] = useState<string>('ALL');
  const [filterRound, setFilterRound] = useState<string>('ALL');
  const [filterDate, setFilterDate] = useState<string>('ALL');
  const [filterTimeSlot, setFilterTimeSlot] = useState<string>('ALL');
  const [sortOrder, setSortOrder] = useState<'TIME_ASC' | 'TIME_DESC' | 'MATCH_NUM'>('TIME_ASC');
  const [viewLayout, setViewLayout] = useState<'GROUPED_BY_DATE' | 'GRID'>('GROUPED_BY_DATE');

  // Edit Single Match Modal State
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editVenueId, setEditVenueId] = useState('');
  const [editRefereeId, setEditRefereeId] = useState('');
  const [editStatus, setEditStatus] = useState<MatchStatus>('SCHEDULED');
  const [editHomeTeamId, setEditHomeTeamId] = useState('');
  const [editAwayTeamId, setEditAwayTeamId] = useState('');
  const [editIsCustomMatchup, setEditIsCustomMatchup] = useState(false);

  const canGenerate = currentRole === 'SUPER_ADMIN' || currentRole === 'ORGANIZER';

  // Conflict verification (Rule #18)
  const validationResult = ScheduleEngine.validateSchedule(matches);

  const getTeam = (teamId: string) => teams.find((t) => t.id === teamId);

  // Trigger Automatic Schedule Generator
  const handleAutoGenerate = () => {
    if (!canGenerate) return;
    try {
      const startDate = tournament?.startDate || '2026-10-15';
      const generated = ScheduleEngine.generateGroupSchedule(teams, venues, referees, startDate);
      const knockouts = ScheduleEngine.generateKnockoutSchedule(venues, referees, startDate);
      const allUpdated = [...generated, ...knockouts];

      onMatchesUpdate(allUpdated);
      StorageService.saveMatches(allUpdated);

      StorageService.logAction(
        currentRole,
        currentRole,
        'TỰ ĐỘNG LẬP LỊCH THI ĐẤU TRỌN GÓI 1 NGÀY (4 SÂN)',
        '32 Trận Đấu (16 Đội • 4 Bảng • 4 Sân)',
        `Tự động xếp 32 trận đấu trong 1 ngày duy nhất ${startDate}: 06:30 - 10:30 (24 trận vòng bảng trên 4 sân), 10:30 - 15:00 (nghỉ trưa & tổng hợp BXH), 15:00 - 17:35 (Tứ kết, Bán kết, Tranh hạng 3 & Chung kết), 17:35 - 18:15 (Lễ bế mạc & Trao cúp).`
      );

      alert(`Đã tạo thành công lịch thi đấu 32 trận trọn gói 1 ngày (${startDate})!\n\n• 06:30 – 10:30: 24 trận vòng bảng (6 ca thi đấu x 4 sân)\n• 10:30 – 15:00: Nghỉ trưa & tổng hợp BXH 4 bảng\n• 15:00 – 15:45: Tứ kết 1-2-3-4 (đồng thời trên 4 sân)\n• 15:45 – 15:55: Nghỉ 10 phút, chuẩn bị Bán kết\n• 15:55 – 16:40: Bán kết 1 & 2 (song song trên 2 sân)\n• 16:40 – 16:50: Nghỉ 10 phút, chuẩn bị Trận cuối\n• 16:50 – 17:35: Tranh Hạng 3 (Sân 1) & CHUNG KẾT (Sân 2)\n• 17:35 – 18:15: Lễ Bế Mạc & Trao Cúp Vô Địch\n\nTuyệt đối 0 xung đột sân bãi và giờ thi đấu!`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Có lỗi khi tạo lịch thi đấu.';
      alert(`Lỗi: ${msg}`);
    }
  };

  // Trigger Synchronization of all 32 matches to tournament start date
  const handleSyncAllSchedule = () => {
    if (!canGenerate) return;
    const startDate = tournament?.startDate || '2026-10-15';
    const confirmed = window.confirm(
      `Đồng bộ toàn bộ lịch 32 trận đấu theo mô hình TRỌN GÓI 1 NGÀY DUY NHẤT TRÊN 4 SÂN (${startDate})?\n\n• 06:30 – 10:30: 24 trận vòng bảng (6 ca x 4 sân)\n• 10:30 – 15:00: Nghỉ trưa + Tổng hợp xếp hạng 4 bảng A-B-C-D\n• 15:00 – 15:45: 4 trận Tứ kết thi đấu đồng thời trên 4 sân\n• 15:45 – 15:55: Nghỉ 10 phút\n• 15:55 – 16:40: 2 trận Bán kết song song (Sân 1 & Sân 2)\n• 16:40 – 16:50: Nghỉ 10 phút\n• 16:50 – 17:35: Tranh Hạng 3 (Sân 1) & CHUNG KẾT VÔ ĐỊCH (Sân 2)\n• 17:35 – 18:15: Lễ Bế Mạc & Trao Giải Cúp\n\nToàn bộ tỉ số và sự kiện đã diễn ra được bảo toàn nguyên vẹn.`
    );
    if (!confirmed) return;

    const syncedMatches = ScheduleEngine.synchronizeMatchTimes(
      matches,
      teams,
      venues,
      referees,
      startDate
    );
    onMatchesUpdate(syncedMatches);
    StorageService.saveMatches(syncedMatches);
    StorageService.logAction(
      currentRole,
      currentRole,
      'ĐỒNG BỘ LỊCH THI ĐẤU 1 NGÀY TOÀN GIẢI (4 SÂN)',
      '32 Trận Đấu',
      `Đồng bộ 32 trận đấu trọn gói ngày ${startDate} từ 06:30 đến 17:35 trên 4 sân không trùng lịch và tối ưu thời gian nghỉ.`
    );
    alert(`Đã đồng bộ lịch thi đấu 1 ngày thành công (${startDate})! 0 xung đột sân bãi.`);
  };

  // Open Edit Modal for a specific match
  const handleOpenEditMatch = (e: React.MouseEvent, m: Match) => {
    e.stopPropagation();
    setEditingMatch(m);
    setEditDate(m.date);
    setEditTime(m.time);
    setEditVenueId(m.venueId);
    setEditRefereeId(m.refereeId);
    setEditStatus(m.status);
    setEditHomeTeamId(m.homeTeamId || '');
    setEditAwayTeamId(m.awayTeamId || '');
    setEditIsCustomMatchup(Boolean(m.isCustomMatchup));
  };

  // Save changes from Edit Modal
  const handleSaveMatchSchedule = () => {
    if (!editingMatch) return;
    const selectedVenue = venues.find((v) => v.id === editVenueId);
    const selectedRef = referees.find((r) => r.id === editRefereeId);
    const homeTeamChanged = editingMatch.homeTeamId !== editHomeTeamId;
    const awayTeamChanged = editingMatch.awayTeamId !== editAwayTeamId;
    const isCustom = editIsCustomMatchup || homeTeamChanged || awayTeamChanged;

    const updated = matches.map((m) => {
      if (m.id === editingMatch.id) {
        return {
          ...m,
          homeTeamId: editHomeTeamId,
          awayTeamId: editAwayTeamId,
          isCustomMatchup: isCustom,
          date: editDate,
          time: editTime,
          venueId: editVenueId,
          venueName: selectedVenue?.name || m.venueName,
          refereeId: editRefereeId,
          refereeName: selectedRef?.name || m.refereeName,
          status: editStatus,
        };
      }
      return m;
    });

    onMatchesUpdate(updated);
    StorageService.saveMatches(updated);

    const homeName = getTeam(editHomeTeamId)?.name || 'Chưa xác định';
    const awayName = getTeam(editAwayTeamId)?.name || 'Chưa xác định';

    StorageService.logAction(
      currentRole,
      currentRole,
      'CẬP NHẬT LỊCH THI ĐẤU & CẶP ĐẤU',
      `Trận #${editingMatch.matchNumber} (${editingMatch.roundLabel})`,
      `Cập nhật cặp đấu [${homeName} VS ${awayName}] - Ngày ${editDate}, Giờ ${editTime}, Sân ${selectedVenue?.name || editVenueId}`
    );
    setEditingMatch(null);
  };

  // Detect conflicts in real-time during manual match edit
  const conflictMatch = editingMatch
    ? matches.find(
        (m) =>
          m.id !== editingMatch.id &&
          m.date === editDate &&
          m.time === editTime &&
          m.venueId === editVenueId
      )
    : null;

  const getVenueDetails = (venueId?: string, venueNameFallback?: string) => {
    const v = venues.find((item) => item.id === venueId);
    const fullName = v?.name || venueNameFallback || 'Sân 1 - Cỏ Nhân Tạo Ký Túc Xá';
    const matchPitch = fullName.match(/Sân\s*\d+/i);
    const shortPitch = matchPitch ? matchPitch[0] : (fullName.split(' - ')[0] || 'Sân 1');
    return { fullName, shortPitch, location: v?.location || 'Khu phức hợp thể thao' };
  };

  // Lấy danh sách các ngày thi đấu thực tế và sắp xếp tăng dần
  const availableDates = Array.from(
    new Set(matches.map((m) => m.date).filter(Boolean))
  ).sort();

  // Lấy danh sách các ca thi đấu / khung giờ thực tế
  const availableTimeSlots = Array.from(
    new Set(matches.map((m) => m.time).filter(Boolean))
  ).sort();

  const formatDateHeader = (dateStr: string) => {
    if (!dateStr || dateStr === 'UNSCHEDULED') return 'Chưa xếp ngày thi đấu';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10);
        const day = parseInt(parts[2], 10);
        const dateObj = new Date(year, month - 1, day);
        const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
        const dayName = days[dateObj.getDay()] || 'Ngày';
        return `${dayName}, ${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  const filteredMatches = matches.filter((m) => {
    if (filterVenue !== 'ALL' && m.venueId !== filterVenue) return false;
    if (filterRound !== 'ALL' && m.round !== filterRound) return false;
    if (filterDate !== 'ALL' && m.date !== filterDate) return false;
    if (filterTimeSlot !== 'ALL' && m.time !== filterTimeSlot) return false;
    return true;
  });

  // Sắp xếp lịch thi đấu chuẩn xác theo thời gian (Ngày ➔ Giờ ➔ Sân)
  const sortedMatches = [...filteredMatches].sort((a, b) => {
    if (sortOrder === 'MATCH_NUM') {
      return (a.matchNumber || 0) - (b.matchNumber || 0);
    }
    if (sortOrder === 'TIME_DESC') {
      const dateComp = (b.date || '').localeCompare(a.date || '');
      if (dateComp !== 0) return dateComp;
      const timeComp = (b.time || '').localeCompare(a.time || '');
      if (timeComp !== 0) return timeComp;
      const pitchA = (a.venueName || '').match(/\d+/)?.[0] || '0';
      const pitchB = (b.venueName || '').match(/\d+/)?.[0] || '0';
      if (pitchA !== pitchB) return parseInt(pitchA, 10) - parseInt(pitchB, 10);
      return (b.matchNumber || 0) - (a.matchNumber || 0);
    }
    // Mặc định: TIME_ASC (Sắp xếp theo thời gian từ sớm nhất đến muộn nhất)
    const dateComp = (a.date || '').localeCompare(b.date || '');
    if (dateComp !== 0) return dateComp;
    const timeComp = (a.time || '').localeCompare(b.time || '');
    if (timeComp !== 0) return timeComp;
    const pitchA = (a.venueName || '').match(/\d+/)?.[0] || '0';
    const pitchB = (b.venueName || '').match(/\d+/)?.[0] || '0';
    if (pitchA !== pitchB) return parseInt(pitchA, 10) - parseInt(pitchB, 10);
    return (a.matchNumber || 0) - (b.matchNumber || 0);
  });

  // Reusable Match Card Renderer
  const renderMatchCard = (m: Match) => {
    const home = getTeam(m.homeTeamId);
    const away = getTeam(m.awayTeamId);
    const { fullName, shortPitch } = getVenueDetails(m.venueId, m.venueName);

    // Phân màu nổi bật cho từng Sân đấu để dễ nhận diện khi đá cùng giờ
    const pitchNum = shortPitch.match(/\d+/)?.[0] || '1';
    const pitchColorMap: Record<string, { badge: string; border: string; text: string }> = {
      '1': {
        badge: 'bg-cyan-950/90 border-cyan-500/50 text-cyan-300',
        border: 'hover:border-cyan-500/60',
        text: 'text-cyan-400',
      },
      '2': {
        badge: 'bg-emerald-950/90 border-emerald-500/50 text-emerald-300',
        border: 'hover:border-emerald-500/60',
        text: 'text-emerald-400',
      },
      '3': {
        badge: 'bg-amber-950/90 border-amber-500/50 text-amber-300',
        border: 'hover:border-amber-500/60',
        text: 'text-amber-400',
      },
      '4': {
        badge: 'bg-purple-950/90 border-purple-500/50 text-purple-300',
        border: 'hover:border-purple-500/60',
        text: 'text-purple-400',
      },
    };
    const pitchStyle = pitchColorMap[pitchNum] || {
      badge: 'bg-slate-800 border-slate-700 text-slate-300',
      border: 'hover:border-emerald-500/50',
      text: 'text-slate-400',
    };

    return (
      <div
        key={m.id}
        onClick={() => onSelectMatch(m.id)}
        className={`bg-slate-900/75 backdrop-blur-md border border-slate-700/60 ${pitchStyle.border} rounded-2xl p-4 shadow-xl transition-all cursor-pointer hover:bg-slate-800/70 flex flex-col justify-between group`}
      >
        {/* Card Header: Match #, Round Label, Prominent PITCH BADGE & Match Status */}
        <div className="flex items-center justify-between text-[11px] pb-2.5 border-b border-slate-800/80 mb-3 gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-mono font-bold text-slate-400 bg-slate-800/90 px-1.5 py-0.5 rounded text-[10px] border border-slate-700">
              #{m.matchNumber || m.id}
            </span>
            <span className="font-extrabold text-emerald-400">{m.roundLabel}</span>
            {/* SỐ SÂN THI ĐẤU NỔI BẬT THEO MÀU SÂN */}
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-black tracking-wide border shadow-sm ${pitchStyle.badge}`}>
              <MapPin className={`w-3 h-3 ${pitchStyle.text} shrink-0`} />
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
              <span className="text-xs font-bold text-white truncate group-hover:text-emerald-300 transition-colors">
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
              <span className="text-xs font-bold text-white truncate group-hover:text-emerald-300 transition-colors">
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

        {/* Card Footer: Detailed Pitch / Venue & Synchronized Date/Time */}
        <div className="pt-2.5 border-t border-slate-800/80 mt-3 flex items-center justify-between text-[11px] gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 truncate max-w-[190px]" title={fullName}>
            <MapPin className={`w-3.5 h-3.5 ${pitchStyle.text} shrink-0`} />
            <span className="truncate font-semibold text-slate-300 group-hover:text-white transition-colors">{fullName}</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 font-mono text-[10px] text-slate-300 bg-slate-800/90 px-2 py-0.5 rounded border border-slate-700/80">
              <Calendar className="w-3 h-3 text-slate-400" />
              <span>{m.date}</span>
              <Clock className="w-3 h-3 text-emerald-400 ml-1" />
              <span className="font-bold text-emerald-400">{m.time}</span>
            </div>

            {canGenerate && (
              <button
                onClick={(e) => handleOpenEditMatch(e, m)}
                className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 hover:text-white text-[10px] font-bold flex items-center gap-1 transition-all active:scale-95"
                title="Chỉnh sửa ngày, giờ & sân thi đấu của trận này"
              >
                <Edit3 className="w-3 h-3 text-cyan-400" />
                <span>Sửa Lịch</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner Card */}
      <div className="bg-[#0B132B] border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-emerald-500/20 text-emerald-400 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
              LỊCH THI ĐẤU TRỌN GÓI 1 NGÀY • 32 TRẬN
            </span>
            <span className="text-xs text-slate-400">16 Đội • 4 Bảng • 4 Sân</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            {canGenerate ? 'Điều Hành Lịch Đấu 1 Ngày (06:30 – 17:35)' : 'Lịch Thi Đấu & Kết Quả (06:30 – 17:35)'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            06:30 – 10:30: 24 trận vòng bảng (6 ca x 4 sân) • 10:30 – 15:00: Nghỉ trưa &amp; tổng hợp BXH • 15:00 – 17:35: Tứ kết, Bán kết, Tranh hạng 3 &amp; Chung kết.
          </p>
        </div>

        {/* Schedule Generator & Conflict Status */}
        <div className="flex flex-wrap items-center gap-2">
          {canGenerate && (
            validationResult.valid ? (
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1.5 rounded-xl font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>0 Xung Đột Sân/Giờ</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-red-400 bg-red-950/60 border border-red-500/30 px-3 py-1.5 rounded-xl font-bold">
                <AlertCircle className="w-4 h-4" />
                <span>{validationResult.conflicts.length} Xung Đột</span>
              </div>
            )
          )}

          {canGenerate && (
            <>
              <button
                onClick={handleSyncAllSchedule}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 font-bold text-xs shadow-sm transition-all active:scale-95"
                title="Tự động đồng bộ toàn bộ ngày và giờ 32 trận đấu theo lịch 1 ngày (06:30 - 17:35)"
              >
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                <span>Đồng Bộ Giờ 1 Ngày</span>
              </button>

              <button
                onClick={handleAutoGenerate}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/25 transition-all active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Tự Động Tạo Lịch 32 Trận</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Quick Stage & Round Selector Pills */}
      <div className="bg-slate-900/75 backdrop-blur-md border border-slate-700/60 rounded-2xl p-3.5 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
            <CalendarDays className="w-4 h-4 text-emerald-400" />
            <span>Chọn Nhanh Giai Đoạn Thi Đấu (Lịch 1 Ngày • 4 Sân)</span>
          </div>
          {(filterRound !== 'ALL' || filterTimeSlot !== 'ALL' || filterDate !== 'ALL') && (
            <button
              onClick={() => {
                setFilterRound('ALL');
                setFilterTimeSlot('ALL');
                setFilterDate('ALL');
              }}
              className="text-[11px] text-cyan-400 hover:text-cyan-300 font-bold transition-colors flex items-center gap-1"
            >
              <span>← Xem toàn bộ 32 trận</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 scrollbar-thin">
          <button
            onClick={() => {
              setFilterRound('ALL');
              setFilterTimeSlot('ALL');
              setFilterDate('ALL');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
              filterRound === 'ALL' && filterTimeSlot === 'ALL' && filterDate === 'ALL'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20'
                : 'bg-slate-800 hover:bg-slate-700/80 text-slate-300 border border-slate-700/60'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Tất Cả 32 Trận</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/30 text-white/90 ml-0.5">
              {matches.length}
            </span>
          </button>

          {/* Quick Stage Filters */}
          <button
            onClick={() => {
              setFilterRound('GROUP');
              setFilterTimeSlot('ALL');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
              filterRound === 'GROUP'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20'
                : 'bg-slate-800 hover:bg-slate-700/80 text-slate-300 border border-slate-700/60 hover:text-white'
            }`}
          >
            <span>🌅 Vòng Bảng (06:30 – 10:30)</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-900 text-emerald-400 ml-0.5">
              24 trận
            </span>
          </button>

          <button
            onClick={() => {
              setFilterRound('QUARTER_FINAL');
              setFilterTimeSlot('ALL');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
              filterRound === 'QUARTER_FINAL'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20'
                : 'bg-slate-800 hover:bg-slate-700/80 text-slate-300 border border-slate-700/60 hover:text-white'
            }`}
          >
            <span>⚡ Tứ Kết (15:00 – 15:45)</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-900 text-cyan-400 ml-0.5">
              4 trận
            </span>
          </button>

          <button
            onClick={() => {
              setFilterRound('SEMI_FINAL');
              setFilterTimeSlot('ALL');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
              filterRound === 'SEMI_FINAL'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20'
                : 'bg-slate-800 hover:bg-slate-700/80 text-slate-300 border border-slate-700/60 hover:text-white'
            }`}
          >
            <span>🔥 Bán Kết (15:55 – 16:40)</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-900 text-amber-400 ml-0.5">
              2 trận
            </span>
          </button>

          <button
            onClick={() => {
              setFilterRound('FINAL');
              setFilterTimeSlot('ALL');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
              filterRound === 'FINAL' || filterRound === 'THIRD_PLACE'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20'
                : 'bg-slate-800 hover:bg-slate-700/80 text-slate-300 border border-slate-700/60 hover:text-white'
            }`}
          >
            <span>🏆 Chung Kết &amp; Tranh 3 (16:50 – 17:35)</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-900 text-rose-400 ml-0.5">
              2 trận
            </span>
          </button>
        </div>
      </div>

      {/* Filter & Sort Bar */}
      <div className="bg-slate-900/75 backdrop-blur-md border border-slate-700/60 rounded-2xl p-4 space-y-3 text-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-slate-400 font-bold uppercase tracking-wider">
            <Filter className="w-4 h-4 text-emerald-400" />
            <span>Bộ Lọc &amp; Sắp Xếp Lịch Thi Đấu</span>
          </div>

          {/* View Mode Toggle: Grouped by date vs Flat Grid */}
          <div className="flex items-center gap-1 bg-slate-800/90 p-1 rounded-xl border border-slate-700/60">
            <button
              onClick={() => setViewLayout('GROUPED_BY_DATE')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewLayout === 'GROUPED_BY_DATE'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Nhóm các trận đấu theo từng ngày thi đấu"
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Theo Ngày</span>
            </button>
            <button
              onClick={() => setViewLayout('GRID')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewLayout === 'GRID'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Hiển thị toàn bộ dưới dạng lưới"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Dạng Lưới</span>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          {/* Quick Pitch Filter Chips */}
          <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 overflow-x-auto max-w-full">
            <button
              onClick={() => setFilterVenue('ALL')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all shrink-0 ${
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

          {/* Time Slot Filter Dropdown */}
          <div className="relative">
            <select
              value={filterTimeSlot}
              onChange={(e) => setFilterTimeSlot(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-1.5 font-medium cursor-pointer hover:border-emerald-500/50 transition-colors"
            >
              <option value="ALL">⏰ Tất Cả Ca Đấu</option>
              {availableTimeSlots.map((time) => (
                <option key={time} value={time}>
                  ⏰ Ca {time}
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter Dropdown */}
          <div className="relative">
            <select
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-1.5 font-medium cursor-pointer hover:border-emerald-500/50 transition-colors"
            >
              <option value="ALL">📅 Tất Cả Các Ngày</option>
              {availableDates.map((d) => (
                <option key={d} value={d}>
                  📅 {formatDateHeader(d)} ({d})
                </option>
              ))}
            </select>
          </div>

          {/* Round Filter Dropdown */}
          <div className="relative">
            <select
              value={filterRound}
              onChange={(e) => setFilterRound(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-1.5 font-medium cursor-pointer hover:border-emerald-500/50 transition-colors"
            >
              <option value="ALL">🏆 Tất Cả Vòng Đấu</option>
              <option value="GROUP">Vòng Bảng (24 trận)</option>
              <option value="QUARTER_FINAL">Vòng Tứ Kết</option>
              <option value="SEMI_FINAL">Vòng Bán Kết</option>
              <option value="THIRD_PLACE">Tranh Hạng 3</option>
              <option value="FINAL">Chung Kết</option>
            </select>
          </div>

          {/* Sort Order Selector */}
          <div className="relative flex items-center">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'TIME_ASC' | 'TIME_DESC' | 'MATCH_NUM')}
              className="bg-slate-800 border border-slate-700 text-emerald-400 font-bold rounded-xl px-3 py-1.5 cursor-pointer hover:border-emerald-500/50 transition-colors"
            >
              <option value="TIME_ASC">⏱ Sắp Xếp: Giờ Sớm Đến Muộn (Mặc định)</option>
              <option value="TIME_DESC">⏱ Sắp Xếp: Giờ Muộn Đến Sớm</option>
              <option value="MATCH_NUM">🔢 Sắp Xếp: Số Trận Đấu (#1 - #32)</option>
            </select>
          </div>

          {/* Active Filter Clear if filters applied */}
          {(filterVenue !== 'ALL' || filterRound !== 'ALL' || filterDate !== 'ALL' || filterTimeSlot !== 'ALL' || sortOrder !== 'TIME_ASC') && (
            <button
              onClick={() => {
                setFilterVenue('ALL');
                setFilterRound('ALL');
                setFilterDate('ALL');
                setFilterTimeSlot('ALL');
                setSortOrder('TIME_ASC');
              }}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 border border-slate-700 transition-colors"
              title="Đặt lại bộ lọc về mặc định"
            >
              <RefreshCw className="w-3 h-3 text-slate-400" />
              <span>Đặt lại</span>
            </button>
          )}
        </div>
      </div>

      {/* Matches Display: Grouped by Date or Flat Grid */}
      {sortedMatches.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-800/80 text-slate-400 flex items-center justify-center mx-auto">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">Không tìm thấy trận đấu nào</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Không có trận đấu nào phù hợp với bộ lọc ngày, vòng đấu hoặc sân đã chọn. Vui lòng thử chọn bộ lọc khác.
          </p>
          <button
            onClick={() => {
              setFilterVenue('ALL');
              setFilterRound('ALL');
              setFilterDate('ALL');
              setSortOrder('TIME_ASC');
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-xs font-bold hover:bg-emerald-900/80 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Đặt lại tất cả bộ lọc</span>
          </button>
        </div>
      ) : viewLayout === 'GROUPED_BY_DATE' ? (
        <div className="space-y-8">
          {Array.from(new Set(sortedMatches.map((m) => m.date || 'UNSCHEDULED'))).map((dateStr) => {
            const dayMatches = sortedMatches.filter((m) => (m.date || 'UNSCHEDULED') === dateStr);
            const timesInDay = Array.from(new Set(dayMatches.map((m) => m.time || 'TBD'))).sort();

            return (
              <div key={dateStr} className="space-y-5 bg-slate-900/50 backdrop-blur-md p-4 sm:p-5 rounded-3xl border border-slate-700/60 shadow-xl">
                {/* Matchday Header Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800/80 gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                      <CalendarDays className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                        <span>{formatDateHeader(dateStr)}</span>
                        {dateStr !== 'UNSCHEDULED' && (
                          <span className="text-xs font-mono font-normal text-slate-400">
                            ({dateStr})
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5 mt-0.5">
                        <span>Gồm {timesInDay.length} ca thi đấu:</span>
                        <span className="text-emerald-400 font-semibold font-mono">
                          {timesInDay.map((t) => `Ca ${t}`).join(' • ')}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-center">
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-xl border border-emerald-500/30">
                      {dayMatches.length} trận đấu trong ngày
                    </span>
                  </div>
                </div>

                {/* Ca Thi Đấu (Time Slots) trong 1 ngày */}
                <div className="space-y-6">
                  {timesInDay.map((slotTime) => {
                    const slotMatches = dayMatches
                      .filter((m) => (m.time || 'TBD') === slotTime)
                      .sort((a, b) => {
                        const pitchA = (a.venueName || '').match(/\d+/)?.[0] || '0';
                        const pitchB = (b.venueName || '').match(/\d+/)?.[0] || '0';
                        if (pitchA !== pitchB) return parseInt(pitchA, 10) - parseInt(pitchB, 10);
                        return (a.matchNumber || 0) - (b.matchNumber || 0);
                      });

                    const hourNum = parseInt(slotTime.split(':')[0] || '0', 10);
                    const isMorning = hourNum < 12;
                    const sessionLabel = isMorning ? 'BUỔI SÁNG' : hourNum < 18 ? 'BUỔI CHIỀU' : 'BUỔI TỐI';
                    const pitchesUsed = Array.from(
                      new Set(slotMatches.map((m) => getVenueDetails(m.venueId, m.venueName).shortPitch))
                    );

                    return (
                      <React.Fragment key={slotTime}>
                        {/* Mốc Nghỉ Trưa & Tổng Hợp BXH Vòng Bảng (Trước Ca Tứ Kết 15:00) */}
                        {slotTime === '15:00' && (
                          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg shadow-amber-950/20 my-2">
                            <div className="flex items-center gap-3">
                              <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300">
                                <Coffee className="w-5 h-5" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-black text-amber-300 uppercase tracking-wider">
                                    10:30 – 15:00 • NGHỈ TRƯA &amp; TỔNG HỢP KẾT QUẢ VÒNG BẢNG
                                  </span>
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-200 border border-amber-500/30">
                                    Khoảng nghỉ 4 giờ 30 phút
                                  </span>
                                </div>
                                <p className="text-xs text-amber-100/80 mt-0.5">
                                  BTC hoàn tất nhập điểm 24 trận vòng bảng, công bố BXH 4 bảng A-B-C-D, xác định 8 đội vào Tứ kết &amp; các đội phục hồi thể lực chuẩn bị cho loạt knock-out buổi chiều.
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-300 bg-black/40 px-3 py-1.5 rounded-xl border border-amber-500/30 self-start sm:self-center shrink-0">
                              <Timer className="w-4 h-4 text-amber-400" />
                              <span>Hoàn tất 24/24 trận vòng bảng</span>
                            </div>
                          </div>
                        )}

                        {/* Nghỉ 10 phút trước Bán Kết */}
                        {slotTime === '15:55' && (
                          <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-blue-500/15 via-indigo-500/10 to-blue-500/15 border border-blue-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md my-2">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-xl bg-blue-500/20 border border-blue-500/40 text-blue-300">
                                <Timer className="w-4 h-4" />
                              </div>
                              <div>
                                <span className="text-xs font-black text-blue-300 uppercase tracking-wider block">
                                  15:45 – 15:55 • NGHỈ 10 PHÚT, CHUẨN BỊ BÁN KẾT (2 SÂN)
                                </span>
                                <p className="text-[11px] text-blue-100/80 mt-0.5">
                                  Bán kết 1 (Thắng TK1 vs Thắng TK3 - Sân 1) &amp; Bán kết 2 (Thắng TK2 vs Thắng TK4 - Sân 2).
                                </p>
                              </div>
                            </div>
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-200 border border-blue-500/30 shrink-0 self-start sm:self-center">
                              Nghỉ 10 phút
                            </span>
                          </div>
                        )}

                        {/* Nghỉ 10 phút trước Chung Kết & Tranh 3 */}
                        {slotTime === '16:50' && (
                          <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md my-2">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300">
                                <Trophy className="w-4 h-4" />
                              </div>
                              <div>
                                <span className="text-xs font-black text-amber-300 uppercase tracking-wider block">
                                  16:40 – 16:50 • NGHỈ 10 PHÚT, CHUẨN BỊ TRANH HẠNG 3 &amp; CHUNG KẾT
                                </span>
                                <p className="text-[11px] text-amber-100/80 mt-0.5">
                                  🥉 Sân 1: Tranh Hạng 3 (Thua BK1 vs Thua BK2) • 🏆 Sân 2: CHUNG KẾT VÔ ĐỊCH (Thắng BK1 vs Thắng BK2).
                                </p>
                              </div>
                            </div>
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-200 border border-amber-500/30 shrink-0 self-start sm:self-center">
                              Trận cuối cùng
                            </span>
                          </div>
                        )}

                        <div className="space-y-3">
                          {/* Ca Thi Đấu Sub-Header Banner */}
                          <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800/75 border border-slate-700/60 shadow-sm">
                            <div className="flex items-center gap-2.5">
                              <div
                                className={`p-1.5 rounded-lg ${
                                  isMorning
                                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                                    : 'bg-orange-500/10 text-orange-400 border border-orange-500/30'
                                }`}
                              >
                                {isMorning ? <Sun className="w-4 h-4" /> : <Sunset className="w-4 h-4" />}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-black text-white tracking-wide">
                                  CA {slotTime}
                                </span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-700 text-slate-300">
                                  {sessionLabel}
                                </span>
                              </div>
                              <span className="text-slate-500 hidden sm:inline">•</span>
                              <span className="text-[11px] text-slate-400 hidden sm:inline">
                                Thi đấu đồng thời trên:{' '}
                                <strong className="text-cyan-300 font-semibold">{pitchesUsed.join(', ')}</strong>
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-500/30 font-bold">
                                {slotMatches.length} trận cùng giờ
                              </span>
                            </div>
                          </div>

                          {/* Grid of Match Cards in this Ca */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {slotMatches.map((m) => renderMatchCard(m))}
                          </div>
                        </div>

                        {/* Mốc Lễ Bế Mạc & Trao Cúp Vô Địch (Sau Ca Chung Kết 16:50) */}
                        {slotTime === '16:50' && (
                          <div className="relative overflow-hidden p-4 sm:p-5 rounded-2xl border border-emerald-500/40 bg-slate-900/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xl mt-4">
                            <div 
                              className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-25 pointer-events-none"
                              style={{ backgroundImage: `url('/images/trophy-celebration.jpg')` }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-900/80 to-slate-950/60 pointer-events-none" />

                            <div className="relative z-10 flex items-center gap-3">
                              <div className="w-14 h-14 rounded-xl overflow-hidden border border-amber-400/60 shadow-md shrink-0">
                                <img src="/images/trophy-cup.jpg" alt="Cúp Vô Địch" className="w-full h-full object-cover" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-black text-amber-300 uppercase tracking-wider">
                                    17:35 – 18:15 • LỄ BẾ MẠC &amp; TRAO CÚP VÔ ĐỊCH
                                  </span>
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-200 border border-amber-500/30">
                                    Tổng kết giải
                                  </span>
                                </div>
                                <p className="text-xs text-slate-200 mt-0.5">
                                  Trao Cúp Vô địch, Huy chương Vàng - Bạc - Đồng, Cầu thủ xuất sắc nhất, Vua phá lưới &amp; Thủ môn xuất sắc nhất.
                                </p>
                              </div>
                            </div>
                            <div className="relative z-10 flex items-center gap-2 text-xs font-mono font-bold text-emerald-300 bg-black/60 px-3 py-1.5 rounded-xl border border-emerald-500/30 self-start sm:self-center shrink-0">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              <span>Hoàn thành 32/32 trận trọn gói 1 ngày</span>
                            </div>
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedMatches.map((m) => renderMatchCard(m))}
        </div>
      )}

      {/* Edit Match Schedule Modal */}
      {editingMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-400">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    Điều Chỉnh Giờ &amp; Sân Thi Đấu
                  </h3>
                  <p className="text-xs text-slate-400">
                    Trận #{editingMatch.matchNumber} • {editingMatch.roundLabel}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingMatch(null)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Match Teams Selector (Hỗ trợ BTC tự do điều chỉnh đội đấu Tứ kết & các vòng) */}
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-200 flex items-center gap-1.5 text-xs">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  <span>Chọn 2 Đội Thi Đấu ({editingMatch.roundLabel})</span>
                </label>
                {editingMatch.round !== 'GROUP' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Tự do ghép cặp Knockout</span>
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-center gap-2.5">
                {/* Home Team Selector */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Đội 1 (Đội Chủ Nhà)
                  </label>
                  <select
                    value={editHomeTeamId}
                    onChange={(e) => {
                      setEditHomeTeamId(e.target.value);
                      setEditIsCustomMatchup(true);
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white font-bold focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="">-- Chưa xác định / Chờ kết quả --</option>
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.shortName || (t.group ? `Bảng ${t.group}` : '')})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Swap Teams Button */}
                <div className="flex justify-center pt-2 sm:pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      const temp = editHomeTeamId;
                      setEditHomeTeamId(editAwayTeamId);
                      setEditAwayTeamId(temp);
                      setEditIsCustomMatchup(true);
                    }}
                    className="p-2 rounded-xl bg-slate-700 hover:bg-emerald-600 text-slate-300 hover:text-white transition-all shadow-sm active:scale-95"
                    title="Đổi vị trí 2 đội bóng"
                  >
                    <ArrowLeftRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Away Team Selector */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Đội 2 (Đội Khách)
                  </label>
                  <select
                    value={editAwayTeamId}
                    onChange={(e) => {
                      setEditAwayTeamId(e.target.value);
                      setEditIsCustomMatchup(true);
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white font-bold focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="">-- Chưa xác định / Chờ kết quả --</option>
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.shortName || (t.group ? `Bảng ${t.group}` : '')})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Trợ giúp & nút khôi phục ghép cặp tự động theo BXH */}
              {editingMatch.round !== 'GROUP' && (
                <div className="pt-2 border-t border-slate-700/60 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                  <span className="text-slate-400">
                    💡 <strong className="text-slate-300">Tùy biến:</strong> BTC có thể chọn bất kỳ cặp đấu nào (Ví dụ: bốc thăm phân cặp giữa các đội Nhất và Nhì bảng).
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const autoBracket = KnockoutEngine.generateOrUpdateBracket(teams, [
                        { ...editingMatch, isCustomMatchup: false },
                      ]);
                      const m = autoBracket.find((x) => x.id === editingMatch.id);
                      if (m) {
                        setEditHomeTeamId(m.homeTeamId || '');
                        setEditAwayTeamId(m.awayTeamId || '');
                        setEditIsCustomMatchup(false);
                      }
                    }}
                    className="text-emerald-400 hover:text-emerald-300 underline font-semibold cursor-pointer"
                  >
                    Khôi phục ghép cặp tự động (theo BXH)
                  </button>
                </div>
              )}
            </div>

            {/* Form Fields */}
            <div className="space-y-3 text-xs">
              {/* Date Input */}
              <div>
                <label className="font-bold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Ngày Thi Đấu</span>
                </label>
                <input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {/* Time Input & Quick Slots */}
              <div>
                <label className="font-bold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Giờ Thi Đấu</span>
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {['06:30', '07:10', '07:50', '08:30', '09:10', '09:50', '15:00', '15:55', '16:50'].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setEditTime(preset)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold font-mono transition-all ${
                        editTime === preset
                          ? 'bg-emerald-500 text-white shadow-sm'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
                <input
                  type="time"
                  value={editTime}
                  onChange={(e) => setEditTime(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {/* Venue Selection */}
              <div>
                <label className="font-bold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Sân Thi Đấu</span>
                </label>
                <select
                  value={editVenueId}
                  onChange={(e) => setEditVenueId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:border-cyan-500 focus:outline-none"
                >
                  {venues.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.location})
                    </option>
                  ))}
                </select>
              </div>

              {/* Referee Selection */}
              <div>
                <label className="font-bold text-slate-300 block mb-1.5">
                  Trọng Tài Phụ Trách
                </label>
                <select
                  value={editRefereeId}
                  onChange={(e) => setEditRefereeId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:border-cyan-500 focus:outline-none"
                >
                  {referees.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Match Status */}
              <div>
                <label className="font-bold text-slate-300 block mb-1.5">
                  Trạng Thái Trận
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as MatchStatus)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="SCHEDULED">Chưa Bắt Đầu (SCHEDULED)</option>
                  <option value="LIVE">Đang Diễn Ra (LIVE)</option>
                  <option value="FINISHED">Đã Kết Thúc (FINISHED)</option>
                </select>
              </div>
            </div>

            {/* Conflict Warning Alert */}
            {conflictMatch && (
              <div className="p-3 rounded-2xl bg-amber-950/60 border border-amber-500/50 text-amber-300 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="font-bold">Cảnh báo trùng sân &amp; giờ:</div>
                  <div className="text-[11px] text-amber-200/90">
                    Sân này lúc <strong>{editTime}</strong> ngày <strong>{editDate}</strong> đã được xếp cho <strong>Trận #{conflictMatch.matchNumber} ({conflictMatch.roundLabel})</strong>!
                  </div>
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setEditingMatch(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveMatchSchedule}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all active:scale-95"
              >
                Lưu Thay Đổi
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

