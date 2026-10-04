'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Match, Team, Player, MatchEvent, CardType, UserRole } from '@/types';
import { StorageService } from '@/services/storage';
import { SoundFX } from '@/utils/soundEffects';
import { DisciplineEngine } from '@/services/disciplineEngine';
import { KnockoutEngine } from '@/services/knockoutEngine';
import {
  Play,
  Pause,
  Coffee,
  CheckCircle2,
  Clock,
  PlusCircle,
  RotateCcw,
  Shield,
  AlertTriangle,
  Shirt,
  Flame,
  FileEdit,
  ArrowRightLeft,
  Award,
} from 'lucide-react';

interface LiveMatchCenterProps {
  matches: Match[];
  teams: Team[];
  onMatchesUpdate: (matches: Match[]) => void;
  currentRole: UserRole;
  selectedMatchId?: string;
}

export const LiveMatchCenter: React.FC<LiveMatchCenterProps> = ({
  matches,
  teams,
  onMatchesUpdate,
  currentRole,
  selectedMatchId,
}) => {
  // Find current match or default to first LIVE match or first match
  const defaultMatchId =
    selectedMatchId ||
    matches.find((m) => m.status === 'LIVE')?.id ||
    matches[0]?.id ||
    '';

  const [activeMatchId, setActiveMatchId] = useState<string>(defaultMatchId);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);
  const [seconds, setSeconds] = useState<number>(0);

  // Modals state
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [cardModalOpen, setCardModalOpen] = useState(false);
  const [subModalOpen, setSubModalOpen] = useState(false);
  const [penaltyModalOpen, setPenaltyModalOpen] = useState(false);
  const [postEditModalOpen, setPostEditModalOpen] = useState(false);
  const [postEditReason, setPostEditReason] = useState('');

  // Selected team for event creation
  const [eventTeamId, setEventTeamId] = useState<string>('');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('');
  const [selectedAssistId, setSelectedAssistId] = useState<string>('');
  const [selectedPlayerOutId, setSelectedPlayerOutId] = useState<string>('');
  const [selectedPlayerInId, setSelectedPlayerInId] = useState<string>('');
  const [cardType, setCardType] = useState<CardType>('YELLOW');
  const [cardReason, setCardReason] = useState<string>('Phạm lỗi tranh chấp');
  const [isOwnGoal, setIsOwnGoal] = useState<boolean>(false);
  const [eventMinute, setEventMinute] = useState<number>(1);

  // Penalty shootout state
  const [penHome, setPenHome] = useState<number>(4);
  const [penAway, setPenAway] = useState<number>(3);

  const activeMatch = matches.find((m) => m.id === activeMatchId);
  const homeTeam = teams.find((t) => t.id === activeMatch?.homeTeamId);
  const awayTeam = teams.find((t) => t.id === activeMatch?.awayTeamId);

  // Synchronize timer with match state
  useEffect(() => {
    if (activeMatch) {
      setSeconds(activeMatch.currentMinute * 60);
      setTimerRunning(activeMatch.status === 'LIVE');
      setEventMinute(Math.max(1, activeMatch.currentMinute));
    }
  }, [activeMatchId, activeMatch?.currentMinute, activeMatch?.status]);

  // Live timer interval (simulates match time)
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerRunning && activeMatch && activeMatch.status === 'LIVE') {
      interval = setInterval(() => {
        setSeconds((prev) => {
          const next = prev + 1;
          const min = Math.floor(next / 60);
          // Check halftime (minute 20) or fulltime (minute 40)
          if (min === 20 && activeMatch.half === 1) {
            handleSetHalftime();
          } else if (min >= 40) {
            handleFinishMatch();
          }
          return next;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerRunning, activeMatch?.half, activeMatch?.status]);

  const canEdit =
    currentRole === 'SUPER_ADMIN' ||
    currentRole === 'ORGANIZER' ||
    currentRole === 'REFEREE';

  // Trigger goal confetti and fanfare
  const triggerCelebration = () => {
    SoundFX.playGoalFanfare();
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10B981', '#00F5D4', '#F59E0B', '#EF4444', '#FFFFFF'],
    });
  };

  // Match control actions
  const handleStartResume = () => {
    if (!activeMatch) return;
    SoundFX.playWhistle();
    const updated = matches.map((m) =>
      m.id === activeMatch.id ? { ...m, status: 'LIVE' as const } : m
    );
    onMatchesUpdate(updated);
    StorageService.saveMatches(updated);
    setTimerRunning(true);
    StorageService.logAction(
      currentRole,
      currentRole,
      'BẮT ĐẦU / TIẾP TỤC TRẬN ĐẤU',
      activeMatch.roundLabel,
      `Bắt đầu hiệp ${activeMatch.half} lúc phút ${Math.floor(seconds / 60)}`
    );
  };

  const handlePause = () => {
    if (!activeMatch) return;
    setTimerRunning(false);
    StorageService.logAction(
      currentRole,
      currentRole,
      'TẠM DỪNG TRẬN ĐẤU',
      activeMatch.roundLabel,
      `Tạm dừng trận đấu ở phút ${Math.floor(seconds / 60)}`
    );
  };

  const handleSetHalftime = () => {
    if (!activeMatch) return;
    SoundFX.playWhistle();
    const updated = matches.map((m) =>
      m.id === activeMatch.id
        ? {
            ...m,
            status: 'HALFTIME' as const,
            half: 2 as const,
            currentMinute: 20,
          }
        : m
    );
    onMatchesUpdate(updated);
    StorageService.saveMatches(updated);
    setTimerRunning(false);
  };

  const handleFinishMatch = () => {
    if (!activeMatch) return;
    SoundFX.playWhistle();
    setTimerRunning(false);

    // If knockout and tied -> require penalty shootout modal per Rule #8
    const isKnockout = activeMatch.round !== 'GROUP';
    const isTied = activeMatch.homeScore === activeMatch.awayScore;

    if (isKnockout && isTied && !activeMatch.penaltyShootout) {
      setPenaltyModalOpen(true);
      return;
    }

    const updated = matches.map((m) =>
      m.id === activeMatch.id
        ? {
            ...m,
            status: 'FINISHED' as const,
            currentMinute: 40,
            completedAt: new Date().toISOString(),
          }
        : m
    );

    // Update knockout bracket if needed
    const finalMatches = KnockoutEngine.generateOrUpdateBracket(teams, updated);
    onMatchesUpdate(finalMatches);
    StorageService.saveMatches(finalMatches);

    // Also update rankings & discipline
    DisciplineEngine.evaluateAllPlayers(teams, finalMatches);

    StorageService.logAction(
      currentRole,
      currentRole,
      'KẾT THÚC TRẬN ĐẤU (FULL TIME)',
      activeMatch.roundLabel,
      `Tỷ số chung cuộc: ${homeTeam?.name} ${activeMatch.homeScore} - ${activeMatch.awayScore} ${awayTeam?.name}. Cửa sổ khiếu nại 15 phút bắt đầu.`
    );
  };

  // Add Goal Handler
  const handleSaveGoal = () => {
    if (!activeMatch || !eventTeamId || !selectedPlayerId) return;

    const scoringTeam = eventTeamId === homeTeam?.id ? homeTeam : awayTeam;
    const player = scoringTeam?.players.find((p) => p.id === selectedPlayerId);
    const assist = scoringTeam?.players.find((p) => p.id === selectedAssistId);

    const isHome = eventTeamId === homeTeam?.id;
    const newHomeScore = isHome ? activeMatch.homeScore + 1 : activeMatch.homeScore;
    const newAwayScore = !isHome ? activeMatch.awayScore + 1 : activeMatch.awayScore;

    const newEvent: MatchEvent = {
      id: `EV-${Date.now()}`,
      matchId: activeMatch.id,
      type: 'GOAL',
      minute: eventMinute,
      teamId: eventTeamId,
      playerId: player?.id,
      playerName: player?.name || 'Cầu thủ',
      assistPlayerId: assist?.id,
      assistPlayerName: assist?.name,
      isOwnGoal,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    const updated = matches.map((m) =>
      m.id === activeMatch.id
        ? {
            ...m,
            homeScore: newHomeScore,
            awayScore: newAwayScore,
            events: [...m.events, newEvent],
          }
        : m
    );

    // Update player goals
    if (player && !isOwnGoal) {
      player.goals = (player.goals || 0) + 1;
      if (assist) assist.assists = (assist.assists || 0) + 1;
      StorageService.saveTeams(teams);
    }

    onMatchesUpdate(updated);
    StorageService.saveMatches(updated);
    setGoalModalOpen(false);
    triggerCelebration();

    StorageService.logAction(
      currentRole,
      currentRole,
      'GHI BÀN THẮNG',
      activeMatch.roundLabel,
      `Bàn thắng phút ${eventMinute}: ${player?.name} (${scoringTeam?.name}). Tỷ số: ${newHomeScore} - ${newAwayScore}`
    );
  };

  // Add Card Handler (Rule #11 & #12: Accumulation & Automatic Suspension)
  const handleSaveCard = () => {
    if (!activeMatch || !eventTeamId || !selectedPlayerId) return;

    const cardedTeam = eventTeamId === homeTeam?.id ? homeTeam : awayTeam;
    const player = cardedTeam?.players.find((p) => p.id === selectedPlayerId);
    if (!player) return;

    let finalCardType = cardType;
    let autoSuspensionTriggered = false;

    // Check yellow accumulation rule:
    if (cardType === 'YELLOW') {
      if (player.yellowCards >= 1) {
        // Second yellow in match/tournament -> converted to SECOND_YELLOW + RED + SUSPENDED
        finalCardType = 'SECOND_YELLOW';
        player.yellowCards += 1;
        player.redCards += 1;
        player.isSuspended = true;
        player.suspensionReason = 'Tích lũy 2 thẻ vàng (Điều 11) - Treo giò 01 trận tiếp theo';
        autoSuspensionTriggered = true;
      } else {
        player.yellowCards += 1;
      }
    } else if (cardType === 'RED') {
      player.redCards += 1;
      player.isSuspended = true;
      player.suspensionReason = 'Thẻ đỏ trực tiếp - Treo giò theo quyết định BTC';
      autoSuspensionTriggered = true;
    }

    const newEvent: MatchEvent = {
      id: `EV-${Date.now()}`,
      matchId: activeMatch.id,
      type: 'CARD',
      minute: eventMinute,
      teamId: eventTeamId,
      playerId: player.id,
      playerName: player.name,
      cardType: finalCardType,
      reason: cardReason,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    const updated = matches.map((m) =>
      m.id === activeMatch.id ? { ...m, events: [...m.events, newEvent] } : m
    );

    StorageService.saveTeams(teams);
    onMatchesUpdate(updated);
    StorageService.saveMatches(updated);
    setCardModalOpen(false);

    SoundFX.playCardAlert();

    StorageService.logAction(
      currentRole,
      currentRole,
      'PHẠT THẺ',
      activeMatch.roundLabel,
      `Phút ${eventMinute}: ${finalCardType} cho ${player.name} (#${player.jerseyNumber} - ${cardedTeam?.name}). ${
        autoSuspensionTriggered ? '⚠️ KÍCH HOẠT ÁN TREO GIÒ 01 TRẬN!' : ''
      }`
    );
  };

  // Add Substitution Handler (Rule #6.2: Unlimited Substitutions)
  const handleSaveSubstitution = () => {
    if (!activeMatch || !eventTeamId || !selectedPlayerOutId || !selectedPlayerInId) return;

    const subTeam = eventTeamId === homeTeam?.id ? homeTeam : awayTeam;
    const playerOut = subTeam?.players.find((p) => p.id === selectedPlayerOutId);
    const playerIn = subTeam?.players.find((p) => p.id === selectedPlayerInId);

    if (playerIn?.isSuspended) {
      alert(`Không thể thay người! Cầu thủ ${playerIn.name} đang bị TREO GIÒ (🔒 ${playerIn.suspensionReason})`);
      return;
    }

    const newEvent: MatchEvent = {
      id: `EV-${Date.now()}`,
      matchId: activeMatch.id,
      type: 'SUBSTITUTION',
      minute: eventMinute,
      teamId: eventTeamId,
      playerOutId: playerOut?.id,
      playerOutName: playerOut?.name,
      playerInId: playerIn?.id,
      playerInName: playerIn?.name,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    const updated = matches.map((m) =>
      m.id === activeMatch.id ? { ...m, events: [...m.events, newEvent] } : m
    );

    onMatchesUpdate(updated);
    StorageService.saveMatches(updated);
    setSubModalOpen(false);

    StorageService.logAction(
      currentRole,
      currentRole,
      'THAY NGƯỜI (SUBSTITUTION)',
      activeMatch.roundLabel,
      `Phút ${eventMinute} (${subTeam?.name}): Ra sân: #${playerOut?.jerseyNumber} ${playerOut?.name} ➔ Vào sân: #${playerIn?.jerseyNumber} ${playerIn?.name}`
    );
  };

  // Penalty shootout submit (Rule #8)
  const handleSavePenalty = () => {
    if (!activeMatch) return;
    KnockoutEngine.recordPenaltyShootout(activeMatch.id, penHome, penAway, currentRole);
    const updated = StorageService.getMatches();
    onMatchesUpdate(updated);
    setPenaltyModalOpen(false);
    triggerCelebration();
  };

  // Post-match Edit with Audit Log (Rule #26)
  const handleSavePostEdit = () => {
    if (!activeMatch || !postEditReason) {
      alert('Vui lòng nhập lý do chỉnh sửa biên bản theo Điều 26!');
      return;
    }

    StorageService.logAction(
      currentRole,
      currentRole,
      'CHỈNH SỬA BIÊN BẢN TRẬN ĐÃ KẾT THÚC (POST-EDIT)',
      activeMatch.roundLabel,
      `Tỷ số mới: ${activeMatch.homeScore} - ${activeMatch.awayScore}`,
      postEditReason
    );

    setPostEditModalOpen(false);
    setPostEditReason('');
    alert('Biên bản đã được cập nhật và ghi nhận vào Audit Log hệ thống.');
  };

  const formatMinSec = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  if (!activeMatch) {
    return (
      <div className="bg-[#0B132B]/90 border border-slate-800 rounded-3xl p-12 text-center shadow-xl space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-700 text-slate-400 flex items-center justify-center mx-auto text-3xl">
          ⚡
        </div>
        <h3 className="text-xl font-bold text-white">Chưa Có Trận Đấu Nào Được Thiết Lập</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Cơ sở dữ liệu hiện đang sạch. Bạn có thể vào tab <strong>&quot;Đội Bóng &amp; Cầu Thủ&quot;</strong> để đăng ký các đội bóng, sau đó vào tab <strong>&quot;Lịch &amp; Kết Quả&quot;</strong> để tạo lịch 24 trận vòng bảng, hoặc bấm <strong>&quot;Nạp Demo&quot;</strong> trên thanh Header để trải nghiệm nhanh.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Match Selector Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {matches.slice(0, 12).map((m) => {
          const h = teams.find((t) => t.id === m.homeTeamId);
          const a = teams.find((t) => t.id === m.awayTeamId);
          const isSelected = m.id === activeMatch.id;
          return (
            <button
              key={m.id}
              onClick={() => setActiveMatchId(m.id)}
              className={`flex-shrink-0 px-3 py-2 rounded-xl border text-xs text-left transition-all ${
                isSelected
                  ? 'bg-emerald-950/80 border-emerald-500 shadow-md shadow-emerald-500/20 text-white font-bold'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center justify-between gap-3 text-[10px] text-slate-400 mb-1">
                <span>{m.roundLabel}</span>
                {m.status === 'LIVE' && (
                  <span className="flex items-center gap-1 text-red-400 font-extrabold animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                    LIVE
                  </span>
                )}
                {m.status === 'FINISHED' && (
                  <span className="text-emerald-400 font-semibold">FT</span>
                )}
              </div>
              <div className="font-bold flex items-center justify-between gap-4">
                <span>{h?.shortName || 'TBD'} vs {a?.shortName || 'TBD'}</span>
                <span className="text-emerald-400 font-mono">
                  {m.homeScore} - {m.awayScore}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Stadium Live Scoreboard Card */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-gradient-to-b from-[#0F1E36] via-[#0B132B] to-[#070B14]">
        
        {/* Stadium lighting glow top overlay */}
        <div className="absolute top-0 left-1/4 right-1/4 h-24 bg-emerald-500/10 blur-3xl pointer-events-none"></div>

        {/* Top Info Bar */}
        <div className="px-6 py-3 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <span className="font-bold text-emerald-400 uppercase tracking-wider">{activeMatch.roundLabel}</span>
            <span>•</span>
            <span>Sân: {activeMatch.venueName || 'Sân 1'}</span>
            <span>•</span>
            <span>Trọng tài: {activeMatch.refereeName || 'BTC'}</span>
          </div>

          <div className="flex items-center gap-2">
            {activeMatch.status === 'LIVE' && (
              <span className="inline-flex items-center gap-1.5 bg-red-500/20 text-red-400 border border-red-500/40 px-3 py-0.5 rounded-full font-bold animate-pulse text-[11px]">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                ĐANG DIỄN RA (HIỆP {activeMatch.half})
              </span>
            )}
            {activeMatch.status === 'HALFTIME' && (
              <span className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-400 border border-amber-500/40 px-3 py-0.5 rounded-full font-bold text-[11px]">
                <Coffee className="w-3.5 h-3.5" />
                NGHỈ GIỮA HIỆP (5 PHÚT)
              </span>
            )}
            {activeMatch.status === 'FINISHED' && (
              <span className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-3 py-0.5 rounded-full font-bold text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                KẾT THÚC TRẬN ĐẤU (FULL TIME)
              </span>
            )}
            {activeMatch.status === 'SCHEDULED' && (
              <span className="inline-flex items-center gap-1.5 bg-blue-500/20 text-blue-400 border border-blue-500/40 px-3 py-0.5 rounded-full font-bold text-[11px]">
                <Clock className="w-3.5 h-3.5" />
                CHƯA BẮT ĐẦU ({activeMatch.time})
              </span>
            )}

            {/* Post match edit button for Organizer (Rule 26) */}
            {activeMatch.status === 'FINISHED' && canEdit && (
              <button
                onClick={() => setPostEditModalOpen(true)}
                className="ml-2 flex items-center gap-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-amber-300 px-2.5 py-1 rounded border border-amber-500/30 transition-colors"
                title="Sửa biên bản sau trận theo Điều 26"
              >
                <FileEdit className="w-3 h-3" />
                <span>Sửa Biên Bản (Audit)</span>
              </button>
            )}
          </div>
        </div>

        {/* Score & Teams Display */}
        <div className="p-6 sm:p-10">
          <div className="grid grid-cols-1 md:grid-cols-7 items-center gap-6">
            
            {/* Home Team */}
            <div className="md:col-span-3 flex flex-col items-center md:items-end text-center md:text-right">
              <div 
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-3xl font-extrabold shadow-xl border-2 mb-3"
                style={{ backgroundColor: homeTeam?.primaryColor || '#1e3a8a', borderColor: homeTeam?.secondaryColor || '#ffffff' }}
              >
                ⚽
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
                {homeTeam?.name || 'Đội Nhà'}
              </h2>
              <p className="text-xs text-slate-400 mt-1">Lớp {homeTeam?.class} • {homeTeam?.department}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[11px] bg-slate-800 px-2 py-0.5 rounded text-slate-300 font-mono">
                  Đội trưởng: #{homeTeam?.captainName}
                </span>
              </div>
            </div>

            {/* Score & Live Clock Center */}
            <div className="md:col-span-1 flex flex-col items-center justify-center my-2 md:my-0">
              <div className="bg-slate-950/80 px-4 py-1.5 rounded-full border border-slate-800 text-emerald-400 font-mono text-base font-extrabold tracking-widest mb-3 shadow-inner">
                {formatMinSec(seconds)}
              </div>

              <div className="flex items-center gap-3">
                <span className="text-4xl sm:text-6xl font-black font-mono text-white tracking-tight drop-shadow-md">
                  {activeMatch.homeScore}
                </span>
                <span className="text-2xl sm:text-3xl font-bold text-slate-500">-</span>
                <span className="text-4xl sm:text-6xl font-black font-mono text-white tracking-tight drop-shadow-md">
                  {activeMatch.awayScore}
                </span>
              </div>

              {/* Penalty shootout badge if exists (Rule #8) */}
              {activeMatch.penaltyShootout && (
                <div className="mt-3 bg-amber-500/20 border border-amber-500/40 text-amber-300 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5" />
                  <span>Penalty 6m: {activeMatch.penaltyShootout.homeScore} - {activeMatch.penaltyShootout.awayScore}</span>
                </div>
              )}
            </div>

            {/* Away Team */}
            <div className="md:col-span-3 flex flex-col items-center md:items-start text-center md:text-left">
              <div 
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-3xl font-extrabold shadow-xl border-2 mb-3"
                style={{ backgroundColor: awayTeam?.primaryColor || '#059669', borderColor: awayTeam?.secondaryColor || '#ffffff' }}
              >
                ⚽
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
                {awayTeam?.name || 'Đội Khách'}
              </h2>
              <p className="text-xs text-slate-400 mt-1">Lớp {awayTeam?.class} • {awayTeam?.department}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[11px] bg-slate-800 px-2 py-0.5 rounded text-slate-300 font-mono">
                  Đội trưởng: #{awayTeam?.captainName}
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Live Match Operational Control Bar for Organizer / Referee */}
        {canEdit && (
          <div className="px-6 py-4 bg-slate-900/90 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
            
            {/* Timer controls */}
            <div className="flex items-center gap-2">
              {activeMatch.status !== 'LIVE' ? (
                <button
                  onClick={handleStartResume}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/25 transition-all"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>{activeMatch.status === 'SCHEDULED' ? 'Bắt Đầu Trận' : 'Tiếp Tục'}</span>
                </button>
              ) : (
                <button
                  onClick={handlePause}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-lg shadow-amber-500/25 transition-all"
                >
                  <Pause className="w-4 h-4 fill-current" />
                  <span>Tạm Dừng</span>
                </button>
              )}

              {activeMatch.status === 'LIVE' && activeMatch.half === 1 && (
                <button
                  onClick={handleSetHalftime}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 transition-all"
                >
                  <Coffee className="w-3.5 h-3.5" />
                  <span>Nghỉ Giữa Hiệp</span>
                </button>
              )}

              {activeMatch.status !== 'FINISHED' && (
                <button
                  onClick={handleFinishMatch}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-600/80 hover:bg-red-600 text-white font-bold text-xs transition-all"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Kết Thúc Trận</span>
                </button>
              )}
            </div>

            {/* Quick Match Action Triggers */}
            {activeMatch.status !== 'FINISHED' && (
              <div className="flex flex-wrap items-center gap-2">
                
                {/* Goal Button */}
                <button
                  onClick={() => {
                    setEventTeamId(homeTeam?.id || '');
                    setGoalModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60 font-bold text-xs transition-all"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>+ Bàn Thắng</span>
                </button>

                {/* Card Button */}
                <button
                  onClick={() => {
                    setEventTeamId(homeTeam?.id || '');
                    setCardModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-950 border border-amber-500/40 text-amber-300 hover:bg-amber-900/60 font-bold text-xs transition-all"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Phạt Thẻ</span>
                </button>

                {/* Substitution Button (Rule #6.2) */}
                <button
                  onClick={() => {
                    setEventTeamId(homeTeam?.id || '');
                    setSubModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/60 font-bold text-xs transition-all"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>Thay Người</span>
                </button>

                {/* Knockout Penalty Shootout Button (Rule #8) */}
                {activeMatch.round !== 'GROUP' && (
                  <button
                    onClick={() => setPenaltyModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-950 border border-purple-500/40 text-purple-300 hover:bg-purple-900/60 font-bold text-xs transition-all"
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>Luân Lưu 6m</span>
                  </button>
                )}

              </div>
            )}

          </div>
        )}

      </div>

      {/* Two Columns: 5-a-side Pitch Visualizer & Real-time Event Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: 5-a-side Tactical Pitch Diagram */}
        <div className="lg:col-span-7 bg-[#0B132B]/80 rounded-2xl border border-slate-800 p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Shirt className="w-5 h-5 text-emerald-400" />
              <h3 className="font-extrabold text-white text-sm">
                Sơ Đồ Chiến Thuật 5 Người (Futsal / Mini Football)
              </h3>
            </div>
            <span className="text-xs text-slate-400">Đội hình tiêu chuẩn: 1 GK - 2 DF - 1 MF - 1 FW</span>
          </div>

          {/* Grass Field Canvas */}
          <div className="relative w-full h-80 rounded-xl pitch-pattern border-2 border-emerald-500/30 overflow-hidden flex flex-col justify-between p-4 shadow-inner">
            
            {/* Center Line and Circle */}
            <div className="pitch-half-line"></div>
            <div className="pitch-center-circle"></div>

            {/* Top Half: Home Team Formation */}
            <div className="relative z-10 flex flex-col justify-between h-[45%]">
              <div className="text-[10px] font-bold text-white/80 uppercase tracking-widest text-center">
                {homeTeam?.name} (Sân Nhà)
              </div>
              {/* Formation 1 GK, 2 DF, 1 MF, 1 FW */}
              <div className="flex justify-around items-center">
                {homeTeam?.players.slice(0, 5).map((p, idx) => (
                  <div key={p.id} className="flex flex-col items-center group cursor-pointer">
                    <div 
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-lg border-2 transition-transform group-hover:scale-125 ${
                        p.isSuspended ? 'bg-red-600 border-red-300' : 'bg-blue-600 border-white text-white'
                      }`}
                    >
                      {p.isSuspended ? '🔒' : p.jerseyNumber}
                    </div>
                    <span className="text-[10px] text-white font-medium mt-1 drop-shadow bg-black/60 px-1 rounded">
                      {p.name.split(' ').pop()}
                    </span>
                    <span className="text-[8px] text-emerald-300 font-mono uppercase">{p.position}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Half: Away Team Formation */}
            <div className="relative z-10 flex flex-col justify-between h-[45%]">
              <div className="flex justify-around items-center">
                {awayTeam?.players.slice(0, 5).map((p, idx) => (
                  <div key={p.id} className="flex flex-col items-center group cursor-pointer">
                    <div 
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-lg border-2 transition-transform group-hover:scale-125 ${
                        p.isSuspended ? 'bg-red-600 border-red-300' : 'bg-emerald-600 border-white text-white'
                      }`}
                    >
                      {p.isSuspended ? '🔒' : p.jerseyNumber}
                    </div>
                    <span className="text-[10px] text-white font-medium mt-1 drop-shadow bg-black/60 px-1 rounded">
                      {p.name.split(' ').pop()}
                    </span>
                    <span className="text-[8px] text-cyan-300 font-mono uppercase">{p.position}</span>
                  </div>
                ))}
              </div>
              <div className="text-[10px] font-bold text-white/80 uppercase tracking-widest text-center">
                {awayTeam?.name} (Sân Khách)
              </div>
            </div>

          </div>

          {/* Quick squad suspension warning banner */}
          {(homeTeam?.players.some((p) => p.isSuspended) || awayTeam?.players.some((p) => p.isSuspended)) && (
            <div className="mt-3 p-2.5 rounded-lg bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>
                Cảnh báo kỷ luật Điều 11 & 12: Có cầu thủ bị treo giò 🔒 (không được phép đăng ký vào sân hoặc ghi bàn).
              </span>
            </div>
          )}
        </div>

        {/* Right: Live Match Event Feed / Timeline */}
        <div className="lg:col-span-5 bg-[#0B132B]/80 rounded-2xl border border-slate-800 p-5 shadow-xl flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-400" />
              <h3 className="font-extrabold text-white text-sm">
                Diễn Biến & Nhật Ký Trực Tiếp
              </h3>
            </div>
            <span className="text-xs text-slate-400">{activeMatch.events.length} sự kiện</span>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-80 pr-1">
            {activeMatch.events.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                Chưa có diễn biến nào. Nhấn "+ Bàn Thắng", "Phạt Thẻ" hoặc "Thay Người" để cập nhật.
              </div>
            ) : (
              activeMatch.events
                .slice()
                .reverse()
                .map((ev) => {
                  const evTeam = teams.find((t) => t.id === ev.teamId);
                  const isHome = ev.teamId === homeTeam?.id;

                  return (
                    <div
                      key={ev.id}
                      className="p-3 rounded-xl bg-slate-900/70 border border-slate-800/80 flex items-start gap-3 hover:border-slate-700 transition-colors"
                    >
                      <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center font-mono font-bold text-xs text-emerald-400 border border-slate-700">
                        {ev.minute}&apos;
                      </div>

                      <div className="flex-1 text-xs">
                        <div className="flex items-center justify-between font-bold text-white">
                          <span className="flex items-center gap-1.5">
                            {ev.type === 'GOAL' && '⚽ BÀN THẮNG!'}
                            {ev.type === 'CARD' && (ev.cardType === 'YELLOW' ? '🟨 THẺ VÀNG' : '🟥 THẺ ĐỎ')}
                            {ev.type === 'SUBSTITUTION' && '🔄 THAY NGƯỜI'}
                          </span>
                          <span className="text-[10px] text-slate-400">{evTeam?.shortName}</span>
                        </div>

                        {ev.type === 'GOAL' && (
                          <div className="text-slate-300 mt-1">
                            <span className="font-semibold text-emerald-300">{ev.playerName}</span>
                            {ev.isOwnGoal && <span className="text-red-400 ml-1">(Phản lưới nhà)</span>}
                            {ev.assistPlayerName && (
                              <span className="text-slate-400 ml-1">
                                (Kiến tạo: {ev.assistPlayerName})
                              </span>
                            )}
                          </div>
                        )}

                        {ev.type === 'CARD' && (
                          <div className="text-slate-300 mt-1">
                            <span className="font-semibold text-amber-300">{ev.playerName}</span>
                            {ev.reason && <span className="text-slate-400 ml-1">- {ev.reason}</span>}
                          </div>
                        )}

                        {ev.type === 'SUBSTITUTION' && (
                          <div className="text-slate-300 mt-1 flex items-center gap-1">
                            <span className="text-red-400">Ra: {ev.playerOutName}</span>
                            <span>➔</span>
                            <span className="text-emerald-400">Vào: {ev.playerInName}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>

      </div>

      {/* MODAL 1: Add Goal */}
      {goalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>⚽</span> Ghi Nhận Bàn Thắng Mới
            </h3>

            {/* Team Picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Chọn Đội Ghi Bàn</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setEventTeamId(homeTeam?.id || '')}
                  className={`p-2 rounded-xl text-xs font-bold border transition-colors ${
                    eventTeamId === homeTeam?.id
                      ? 'bg-blue-600 text-white border-blue-400'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {homeTeam?.name}
                </button>
                <button
                  type="button"
                  onClick={() => setEventTeamId(awayTeam?.id || '')}
                  className={`p-2 rounded-xl text-xs font-bold border transition-colors ${
                    eventTeamId === awayTeam?.id
                      ? 'bg-emerald-600 text-white border-emerald-400'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {awayTeam?.name}
                </button>
              </div>
            </div>

            {/* Player Scorer (Filters out suspended players!) */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Cầu Thủ Ghi Bàn (Không cho phép cầu thủ bị treo giò)
              </label>
              <select
                value={selectedPlayerId}
                onChange={(e) => setSelectedPlayerId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl p-2.5 focus:border-emerald-500 focus:outline-none"
              >
                <option value="">-- Chọn cầu thủ ghi bàn --</option>
                {(eventTeamId === homeTeam?.id ? homeTeam?.players : awayTeam?.players)?.map((p) => (
                  <option key={p.id} value={p.id} disabled={p.isSuspended}>
                    #{p.jerseyNumber} - {p.name} ({p.position}) {p.isSuspended ? '🔒 BỊ TREO GIÒ' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Assist Player */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Cầu Thủ Kiến Tạo (Tùy chọn)</label>
              <select
                value={selectedAssistId}
                onChange={(e) => setSelectedAssistId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl p-2.5 focus:border-emerald-500 focus:outline-none"
              >
                <option value="">-- Không có kiến tạo --</option>
                {(eventTeamId === homeTeam?.id ? homeTeam?.players : awayTeam?.players)?.map((p) => (
                  <option key={p.id} value={p.id}>
                    #{p.jerseyNumber} - {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Minute */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Phút ghi bàn (1-40)</label>
                <input
                  type="number"
                  min={1}
                  max={45}
                  value={eventMinute}
                  onChange={(e) => setEventMinute(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl p-2.5"
                />
              </div>

              <div className="flex items-center pt-5">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={isOwnGoal}
                    onChange={(e) => setIsOwnGoal(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-700 text-emerald-500"
                  />
                  <span>Phản lưới nhà (OG)</span>
                </label>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setGoalModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveGoal}
                disabled={!selectedPlayerId}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-emerald-500/20"
              >
                Xác Nhận Bàn Thắng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Add Card */}
      {cardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>⚠️</span> Phạt Thẻ Trọng Tài (Điều 11 & 12)
            </h3>

            {/* Team Picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Chọn Đội Phạt Thẻ</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setEventTeamId(homeTeam?.id || '')}
                  className={`p-2 rounded-xl text-xs font-bold border transition-colors ${
                    eventTeamId === homeTeam?.id
                      ? 'bg-blue-600 text-white border-blue-400'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {homeTeam?.name}
                </button>
                <button
                  type="button"
                  onClick={() => setEventTeamId(awayTeam?.id || '')}
                  className={`p-2 rounded-xl text-xs font-bold border transition-colors ${
                    eventTeamId === awayTeam?.id
                      ? 'bg-emerald-600 text-white border-emerald-400'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {awayTeam?.name}
                </button>
              </div>
            </div>

            {/* Player */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Cầu Thủ Nhận Thẻ</label>
              <select
                value={selectedPlayerId}
                onChange={(e) => setSelectedPlayerId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl p-2.5"
              >
                <option value="">-- Chọn cầu thủ --</option>
                {(eventTeamId === homeTeam?.id ? homeTeam?.players : awayTeam?.players)?.map((p) => (
                  <option key={p.id} value={p.id}>
                    #{p.jerseyNumber} - {p.name} (Đã có {p.yellowCards}🟨, {p.redCards}🟥)
                  </option>
                ))}
              </select>
            </div>

            {/* Card Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Loại Thẻ</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCardType('YELLOW')}
                  className={`p-2 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center gap-1.5 ${
                    cardType === 'YELLOW'
                      ? 'bg-amber-500 text-slate-950 border-amber-400'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  <span>🟨</span> Thẻ Vàng (Tích Lũy)
                </button>
                <button
                  type="button"
                  onClick={() => setCardType('RED')}
                  className={`p-2 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center gap-1.5 ${
                    cardType === 'RED'
                      ? 'bg-red-600 text-white border-red-400'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  <span>🟥</span> Thẻ Đỏ Trực Tiếp
                </button>
              </div>
            </div>

            {/* Card Reason */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Lý Do Phạt Thẻ</label>
              <input
                type="text"
                value={cardReason}
                onChange={(e) => setCardReason(e.target.value)}
                placeholder="VD: Phạm lỗi kéo người, phản ứng trọng tài..."
                className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl p-2.5"
              />
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCardModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveCard}
                disabled={!selectedPlayerId}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 text-xs font-bold shadow-lg"
              >
                Xác Nhận Thẻ Phạt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Substitution (Rule #6.2: Unlimited Substitutions) */}
      {subModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>🔄</span> Thay Người (Không Giới Hạn - Điều 6.2)
            </h3>

            {/* Team Picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Chọn Đội Thay Người</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setEventTeamId(homeTeam?.id || '')}
                  className={`p-2 rounded-xl text-xs font-bold border transition-colors ${
                    eventTeamId === homeTeam?.id
                      ? 'bg-blue-600 text-white border-blue-400'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {homeTeam?.name}
                </button>
                <button
                  type="button"
                  onClick={() => setEventTeamId(awayTeam?.id || '')}
                  className={`p-2 rounded-xl text-xs font-bold border transition-colors ${
                    eventTeamId === awayTeam?.id
                      ? 'bg-emerald-600 text-white border-emerald-400'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {awayTeam?.name}
                </button>
              </div>
            </div>

            {/* Player Out */}
            <div>
              <label className="block text-xs font-semibold text-red-400 mb-1">Cầu Thủ Rời Sân (OUT)</label>
              <select
                value={selectedPlayerOutId}
                onChange={(e) => setSelectedPlayerOutId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl p-2.5"
              >
                <option value="">-- Chọn cầu thủ ra sân --</option>
                {(eventTeamId === homeTeam?.id ? homeTeam?.players : awayTeam?.players)?.map((p) => (
                  <option key={p.id} value={p.id}>
                    #{p.jerseyNumber} - {p.name} ({p.position})
                  </option>
                ))}
              </select>
            </div>

            {/* Player In */}
            <div>
              <label className="block text-xs font-semibold text-emerald-400 mb-1">Cầu Thủ Vào Sân (IN)</label>
              <select
                value={selectedPlayerInId}
                onChange={(e) => setSelectedPlayerInId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl p-2.5"
              >
                <option value="">-- Chọn cầu thủ vào sân --</option>
                {(eventTeamId === homeTeam?.id ? homeTeam?.players : awayTeam?.players)?.map((p) => (
                  <option key={p.id} value={p.id} disabled={p.isSuspended}>
                    #{p.jerseyNumber} - {p.name} ({p.position}) {p.isSuspended ? '🔒 BỊ TREO GIÒ' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSubModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveSubstitution}
                disabled={!selectedPlayerOutId || !selectedPlayerInId}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 text-xs font-bold shadow-lg"
              >
                Xác Nhận Thay Người
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Penalty Shootout 6m for Knockout (Rule #8) */}
      {penaltyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-purple-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>🥅</span> Luân Lưu 6m - Phân Định Thắng Thua (Điều 8)
            </h3>
            <p className="text-xs text-slate-400">
              Trận đấu knockout hòa sau 40 phút chính thức: Không đá hiệp phụ, tiến hành đá luân lưu 6m để xác định đội đi tiếp.
            </p>

            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="p-4 rounded-xl bg-slate-800 text-center">
                <span className="text-xs text-slate-400 block mb-2">{homeTeam?.shortName}</span>
                <input
                  type="number"
                  min={0}
                  max={20}
                  value={penHome}
                  onChange={(e) => setPenHome(Number(e.target.value))}
                  className="w-16 h-12 text-center text-2xl font-black bg-slate-900 text-white rounded-lg border border-purple-500 mx-auto"
                />
              </div>

              <div className="p-4 rounded-xl bg-slate-800 text-center">
                <span className="text-xs text-slate-400 block mb-2">{awayTeam?.shortName}</span>
                <input
                  type="number"
                  min={0}
                  max={20}
                  value={penAway}
                  onChange={(e) => setPenAway(Number(e.target.value))}
                  className="w-16 h-12 text-center text-2xl font-black bg-slate-900 text-white rounded-lg border border-purple-500 mx-auto"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPenaltyModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSavePenalty}
                disabled={penHome === penAway}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg"
              >
                Xác Nhận Tỷ Số Penalty
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: Post-Match Edit with Audit Log (Rule #26) */}
      {postEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-amber-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FileEdit className="w-5 h-5 text-amber-400" />
              Chỉnh Sửa Dữ Liệu Sau Trận Đấu (Điều 26)
            </h3>
            <p className="text-xs text-amber-300 bg-amber-950/40 p-2.5 rounded-lg border border-amber-500/30">
              Quy định nghiêm ngặt: Trận đấu đã FINISHED. Mọi chỉnh sửa bắt buộc phải ghi rõ lý do và được lưu trữ vĩnh viễn trong Audit Log của BTC.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Tỷ số {homeTeam?.shortName}</label>
                <input
                  type="number"
                  min={0}
                  value={activeMatch.homeScore}
                  onChange={(e) => {
                    activeMatch.homeScore = Number(e.target.value);
                    onMatchesUpdate([...matches]);
                  }}
                  className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-xl p-2 font-mono"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Tỷ số {awayTeam?.shortName}</label>
                <input
                  type="number"
                  min={0}
                  value={activeMatch.awayScore}
                  onChange={(e) => {
                    activeMatch.awayScore = Number(e.target.value);
                    onMatchesUpdate([...matches]);
                  }}
                  className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-xl p-2 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-white block mb-1">
                Lý Do Chỉnh Sửa (Bắt buộc theo Điều 26)
              </label>
              <textarea
                rows={3}
                value={postEditReason}
                onChange={(e) => setPostEditReason(e.target.value)}
                placeholder="VD: Nhập sai biên bản giấy do trọng tài ghi nhầm phút 35..."
                className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl p-2.5 focus:border-amber-500 focus:outline-none"
              ></textarea>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPostEditModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSavePostEdit}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-lg"
              >
                Xác Nhận & Ghi Audit Log
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
