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
  MapPin,
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

  // Sắp xếp danh sách trận đấu trên thanh chọn: LIVE trước -> sắp đá theo thời gian sớm nhất -> đã kết thúc
  const sortedStripMatches = [...matches].sort((a, b) => {
    if (a.status === 'LIVE' && b.status !== 'LIVE') return -1;
    if (b.status === 'LIVE' && a.status !== 'LIVE') return 1;
    if (a.status === 'SCHEDULED' && b.status === 'FINISHED') return -1;
    if (b.status === 'SCHEDULED' && a.status === 'FINISHED') return 1;
    const dateComp = (a.date || '').localeCompare(b.date || '');
    if (dateComp !== 0) return dateComp;
    const timeComp = (a.time || '').localeCompare(b.time || '');
    if (timeComp !== 0) return timeComp;
    return (a.matchNumber || 0) - (b.matchNumber || 0);
  });

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
        {sortedStripMatches.map((m) => {
          const h = teams.find((t) => t.id === m.homeTeamId);
          const a = teams.find((t) => t.id === m.awayTeamId);
          const isSelected = m.id === activeMatch.id;
          return (
            <button
              key={m.id}
              onClick={() => setActiveMatchId(m.id)}
              className={`flex-shrink-0 px-3.5 py-2.5 rounded-xl border text-xs text-left transition-all cursor-pointer ${
                isSelected
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-700 border-2 border-emerald-300 shadow-lg shadow-emerald-500/30 text-white font-black scale-[1.02]'
                  : 'bg-slate-900/90 border border-slate-700/80 text-slate-300 hover:bg-slate-800 hover:text-white hover:border-emerald-500/50 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between gap-2 text-[10px] text-slate-300 mb-1">
                <div className="flex items-center gap-1">
                  <span className="font-bold">{m.roundLabel}</span>
                  <span className="font-extrabold text-cyan-300 bg-cyan-950 px-1.5 py-0.5 rounded text-[9px] border border-cyan-500/60 shadow-xs">
                    {(m.venueName ? m.venueName.match(/Sân\s*\d+/i)?.[0] || m.venueName.split(' - ')[0] : 'Sân 1').toUpperCase()}
                  </span>
                </div>
                {m.status === 'LIVE' && (
                  <span className="flex items-center gap-1 text-red-400 font-black animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                    LIVE
                  </span>
                )}
                {m.status === 'FINISHED' && (
                  <span className="text-emerald-400 font-extrabold">FT</span>
                )}
              </div>
              <div className="font-bold flex items-center justify-between gap-4">
                <span className="text-white">{h?.shortName || 'TBD'} vs {a?.shortName || 'TBD'}</span>
                <span className="text-emerald-400 font-mono font-black">
                  {m.homeScore} - {m.awayScore}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Stadium Live Scoreboard Card */}
      <div className="relative rounded-3xl overflow-hidden border-2 border-emerald-500/40 shadow-[0_12px_50px_rgba(0,0,0,0.7)] bg-[#071322] backdrop-blur-md">
        {/* Stadium Action Photo Overlay with balanced floodlights */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20 transform scale-105 pointer-events-none mix-blend-luminosity"
          style={{ backgroundImage: `url('/images/tournament-hero.jpg')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#071526]/95 via-[#06101c]/92 to-[#030810]/98 pointer-events-none" />
        
        {/* Stadium lighting glow overlays */}
        <div className="absolute top-0 left-1/4 right-1/4 h-32 bg-emerald-500/25 blur-3xl pointer-events-none"></div>
        <div className="absolute -top-10 left-10 w-48 h-48 bg-cyan-500/15 blur-3xl pointer-events-none"></div>
        <div className="absolute -top-10 right-10 w-48 h-48 bg-emerald-500/15 blur-3xl pointer-events-none"></div>

        {/* Top Info Bar */}
        <div className="px-6 py-3.5 border-b border-slate-700/80 flex flex-wrap items-center justify-between gap-3 text-xs bg-[#071322]/90 backdrop-blur-sm">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="font-extrabold text-emerald-300 bg-emerald-950/90 border border-emerald-500/50 px-3 py-1 rounded-lg uppercase tracking-wider text-xs shadow-sm">
              {activeMatch.roundLabel}
            </span>
            <span className="inline-flex items-center gap-1.5 font-extrabold text-cyan-300 bg-cyan-950/90 border border-cyan-400/50 px-3 py-1 rounded-lg text-xs shadow-sm">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              Sân: {activeMatch.venueName || 'Sân 1 - Cỏ Nhân Tạo KTX'}
            </span>
            <span className="inline-flex items-center gap-1.5 font-bold text-slate-200 bg-slate-900/90 border border-slate-700 px-3 py-1 rounded-lg text-xs shadow-sm">
              Trọng tài: {activeMatch.refereeName || 'BTC'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {activeMatch.status === 'LIVE' && (
              <span className="inline-flex items-center gap-1.5 bg-red-600 text-white border-2 border-red-400 px-3.5 py-1 rounded-full font-black animate-pulse text-xs shadow-lg shadow-red-600/30">
                <span className="w-2.5 h-2.5 rounded-full bg-white"></span>
                ĐANG DIỄN RA (HIỆP {activeMatch.half})
              </span>
            )}
            {activeMatch.status === 'HALFTIME' && (
              <span className="inline-flex items-center gap-1.5 bg-amber-500 text-slate-950 border-2 border-amber-300 px-3.5 py-1 rounded-full font-black text-xs shadow-lg shadow-amber-500/30">
                <Coffee className="w-4 h-4" />
                NGHỈ GIỮA HIỆP (5 PHÚT)
              </span>
            )}
            {activeMatch.status === 'FINISHED' && (
              <span className="inline-flex items-center gap-1.5 bg-emerald-600 text-white border-2 border-emerald-300 px-3.5 py-1 rounded-full font-black text-xs shadow-lg shadow-emerald-600/30">
                <CheckCircle2 className="w-4 h-4" />
                KẾT THÚC TRẬN ĐẤU (FULL TIME)
              </span>
            )}
            {activeMatch.status === 'SCHEDULED' && (
              <span className="inline-flex items-center gap-1.5 bg-blue-600 text-white border-2 border-blue-300 px-3.5 py-1 rounded-full font-black text-xs shadow-lg shadow-blue-600/30">
                <Clock className="w-4 h-4" />
                CHƯA BẮT ĐẦU ({activeMatch.time})
              </span>
            )}

            {/* Post match edit button for Organizer (Rule 26) */}
            {activeMatch.status === 'FINISHED' && canEdit && (
              <button
                onClick={() => setPostEditModalOpen(true)}
                className="ml-2 flex items-center gap-1.5 text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 px-3 py-1 rounded-lg border border-amber-400/50 transition-colors shadow-sm cursor-pointer"
                title="Sửa biên bản sau trận theo Điều 26"
              >
                <FileEdit className="w-3.5 h-3.5" />
                <span>Sửa Biên Bản (Audit)</span>
              </button>
            )}
          </div>
        </div>

        {/* Score & Teams Display - Balanced 12-Column Full Width Broadcast Layout */}
        <div className="px-4 py-8 sm:px-10 sm:py-12 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-6 lg:gap-8">
            
            {/* Home Team (5 columns on desktop, text-right) */}
            <div className="col-span-1 md:col-span-5 flex flex-col items-center md:items-end text-center md:text-right">
              {/* Crest with glowing ring */}
              <div className="relative group mb-3">
                <div 
                  className="absolute -inset-1 rounded-3xl blur-lg opacity-80 group-hover:opacity-100 transition duration-300"
                  style={{ backgroundColor: homeTeam?.primaryColor || '#1e3a8a' }}
                />
                <div 
                  className="relative w-20 h-20 sm:w-28 sm:h-28 rounded-2xl sm:rounded-3xl flex items-center justify-center text-3xl sm:text-5xl font-extrabold shadow-2xl border-2 border-white/50 backdrop-blur-md"
                  style={{ 
                    background: `linear-gradient(135deg, ${homeTeam?.primaryColor || '#1e3a8a'} 0%, #08111e 100%)`, 
                    borderColor: homeTeam?.secondaryColor || '#34d399' 
                  }}
                >
                  <span className="drop-shadow-lg transform group-hover:scale-110 transition-transform">⚽</span>
                  <div className="absolute -bottom-2.5 px-3 py-0.5 rounded-full bg-[#081525] border-2 border-emerald-400 text-[10px] sm:text-xs font-black text-emerald-300 uppercase tracking-widest shadow-md">
                    Chủ Nhà
                  </div>
                </div>
              </div>

              {/* Team Name */}
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-wide uppercase drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
                {homeTeam?.name || 'Đội Nhà'}
              </h2>

              {/* Badges: Class & Captain */}
              <div className="mt-2.5 flex flex-wrap items-center justify-center md:justify-end gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#071c2f]/90 border border-emerald-500/50 text-emerald-300 text-xs font-bold shadow-md">
                  <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Lớp {homeTeam?.class || 'N/A'} • {homeTeam?.department || 'Khoa CNTT'}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900/95 border border-amber-400/60 text-amber-300 text-xs font-bold shadow-md">
                  <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Đội trưởng: #{homeTeam?.captainName || 'Cầu thủ'}</span>
                </span>
              </div>
            </div>

            {/* Score & Live Clock Center (2 columns on desktop, perfectly centered) */}
            <div className="col-span-1 md:col-span-2 flex flex-col items-center justify-center my-4 md:my-0">
              
              {/* Live Digital Clock Badge */}
              <div className="relative mb-3 group">
                <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 opacity-70 blur-md group-hover:opacity-100 transition duration-300"></div>
                <div className="relative bg-[#030c18] px-5 sm:px-6 py-1.5 rounded-full border-2 border-emerald-400 flex items-center gap-2 shadow-2xl">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                  <span className="text-emerald-300 font-mono text-sm sm:text-xl font-black tracking-widest drop-shadow-[0_0_12px_rgba(52,211,153,0.9)]">
                    {formatMinSec(seconds)}
                  </span>
                </div>
              </div>

              {/* Big Stadium LED Scoreboard Display */}
              <div className="flex items-center gap-2.5 sm:gap-4 my-1">
                {/* Home Score Box */}
                <div className="w-20 h-24 sm:w-26 sm:h-32 rounded-2xl bg-gradient-to-b from-[#0e2744] via-[#061424] to-[#02070f] border-2 border-emerald-400/80 shadow-[0_0_35px_rgba(16,185,129,0.35)] flex items-center justify-center">
                  <span className="text-5xl sm:text-7xl font-mono font-black text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.8)]">
                    {activeMatch.homeScore}
                  </span>
                </div>

                {/* Center Colon / VS Separator */}
                <div className="flex flex-col items-center justify-center px-1">
                  <span className="text-2xl sm:text-4xl font-mono font-black text-emerald-400 animate-pulse">:</span>
                  <span className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest">VS</span>
                </div>

                {/* Away Score Box */}
                <div className="w-20 h-24 sm:w-26 sm:h-32 rounded-2xl bg-gradient-to-b from-[#0e2744] via-[#061424] to-[#02070f] border-2 border-emerald-400/80 shadow-[0_0_35px_rgba(16,185,129,0.35)] flex items-center justify-center">
                  <span className="text-5xl sm:text-7xl font-mono font-black text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.8)]">
                    {activeMatch.awayScore}
                  </span>
                </div>
              </div>

              {/* Penalty shootout badge if exists (Rule #8) */}
              {activeMatch.penaltyShootout && (
                <div className="mt-3 bg-amber-500/20 border-2 border-amber-400 text-amber-200 px-4 py-1 rounded-full text-xs font-black flex items-center gap-1.5 text-center shadow-lg shadow-amber-500/25">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>PEN: {activeMatch.penaltyShootout.homeScore} - {activeMatch.penaltyShootout.awayScore}</span>
                </div>
              )}
            </div>

            {/* Away Team (5 columns on desktop, text-left) */}
            <div className="col-span-1 md:col-span-5 flex flex-col items-center md:items-start text-center md:text-left">
              {/* Crest with glowing ring */}
              <div className="relative group mb-3">
                <div 
                  className="absolute -inset-1 rounded-3xl blur-lg opacity-80 group-hover:opacity-100 transition duration-300"
                  style={{ backgroundColor: awayTeam?.primaryColor || '#059669' }}
                />
                <div 
                  className="relative w-20 h-20 sm:w-28 sm:h-28 rounded-2xl sm:rounded-3xl flex items-center justify-center text-3xl sm:text-5xl font-extrabold shadow-2xl border-2 border-white/50 backdrop-blur-md"
                  style={{ 
                    background: `linear-gradient(135deg, ${awayTeam?.primaryColor || '#059669'} 0%, #08111e 100%)`, 
                    borderColor: awayTeam?.secondaryColor || '#38bdf8' 
                  }}
                >
                  <span className="drop-shadow-lg transform group-hover:scale-110 transition-transform">⚽</span>
                  <div className="absolute -bottom-2.5 px-3 py-0.5 rounded-full bg-[#081525] border-2 border-cyan-400 text-[10px] sm:text-xs font-black text-cyan-300 uppercase tracking-widest shadow-md">
                    Đội Khách
                  </div>
                </div>
              </div>

              {/* Team Name */}
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-wide uppercase drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
                {awayTeam?.name || 'Đội Khách'}
              </h2>

              {/* Badges: Class & Captain */}
              <div className="mt-2.5 flex flex-wrap items-center justify-center md:justify-start gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#071c2f]/90 border border-emerald-500/50 text-emerald-300 text-xs font-bold shadow-md">
                  <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Lớp {awayTeam?.class || 'N/A'} • {awayTeam?.department || 'Khoa CNTT'}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900/95 border border-amber-400/60 text-amber-300 text-xs font-bold shadow-md">
                  <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Đội trưởng: #{awayTeam?.captainName || 'Cầu thủ'}</span>
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Live Match Operational Control Bar for Organizer / Referee */}
        {canEdit && (
          <div className="px-5 sm:px-6 py-3.5 sm:py-4 bg-[#071322]/95 backdrop-blur-xl border-t-2 border-emerald-500/40 flex flex-wrap items-center justify-between gap-3 shadow-2xl">
            
            {/* Timer controls */}
            <div className="flex flex-wrap items-center gap-2.5">
              {activeMatch.status !== 'LIVE' ? (
                <button
                  onClick={handleStartResume}
                  className="flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-xs sm:text-sm shadow-xl shadow-emerald-500/35 border border-emerald-300 ring-2 ring-emerald-400/20 active:scale-95 transition-all cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>{activeMatch.status === 'SCHEDULED' ? 'Bắt Đầu Trận' : 'Tiếp Tục'}</span>
                </button>
              ) : (
                <button
                  onClick={handlePause}
                  className="flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-500/35 border border-amber-200 ring-2 ring-amber-400/20 active:scale-95 transition-all cursor-pointer"
                >
                  <Pause className="w-4 h-4 fill-current" />
                  <span>Tạm Dừng</span>
                </button>
              )}

              {activeMatch.status === 'LIVE' && activeMatch.half === 1 && (
                <button
                  onClick={handleSetHalftime}
                  className="flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-600/30 border border-blue-300 ring-2 ring-blue-400/20 active:scale-95 transition-all cursor-pointer"
                >
                  <Coffee className="w-4 h-4" />
                  <span>Nghỉ Giữa Hiệp</span>
                </button>
              )}

              {activeMatch.status !== 'FINISHED' && (
                <button
                  onClick={handleFinishMatch}
                  className="flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-red-600/30 border border-rose-300 ring-2 ring-rose-400/20 active:scale-95 transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Kết Thúc Trận</span>
                </button>
              )}
            </div>

            {/* Quick Match Action Triggers */}
            {activeMatch.status !== 'FINISHED' && (
              <div className="flex flex-wrap items-center gap-2.5">
                
                {/* Goal Button */}
                <button
                  onClick={() => {
                    setEventTeamId(homeTeam?.id || '');
                    setGoalModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-black text-xs sm:text-sm shadow-xl shadow-emerald-500/35 border-2 border-emerald-300 active:scale-95 transition-all cursor-pointer ring-2 ring-emerald-400/25"
                >
                  <PlusCircle className="w-4 h-4 text-white" />
                  <span>+ Bàn Thắng</span>
                </button>

                {/* Card Button */}
                <button
                  onClick={() => {
                    setEventTeamId(homeTeam?.id || '');
                    setCardModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-500/35 border-2 border-amber-200 active:scale-95 transition-all cursor-pointer ring-2 ring-amber-400/25"
                >
                  <AlertTriangle className="w-4 h-4 text-slate-950" />
                  <span>Phạt Thẻ</span>
                </button>

                {/* Substitution Button (Rule #6.2) */}
                <button
                  onClick={() => {
                    setEventTeamId(homeTeam?.id || '');
                    setSubModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-xs sm:text-sm shadow-xl shadow-cyan-500/35 border-2 border-cyan-200 active:scale-95 transition-all cursor-pointer ring-2 ring-cyan-400/25"
                >
                  <ArrowRightLeft className="w-4 h-4 text-white" />
                  <span>Thay Người</span>
                </button>

                {/* Knockout Penalty Shootout Button (Rule #8) */}
                {activeMatch.round !== 'GROUP' && (
                  <button
                    onClick={() => setPenaltyModalOpen(true)}
                    className="flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs sm:text-sm shadow-xl shadow-purple-600/35 border-2 border-purple-300 active:scale-95 transition-all cursor-pointer ring-2 ring-purple-400/25"
                  >
                    <Award className="w-4 h-4 text-white" />
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
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setGoalModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white text-xs font-bold border border-slate-700 transition-all cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveGoal}
                disabled={!selectedPlayerId}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-black shadow-lg shadow-emerald-500/30 border border-emerald-300 transition-all cursor-pointer"
              >
                ⚽ Xác Nhận Bàn Thắng
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
                  className={`p-2 rounded-xl text-xs font-black border transition-colors flex items-center justify-center gap-1.5 ${
                    cardType === 'YELLOW'
                      ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 border-amber-300 shadow-md'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                >
                  <span>🟨</span> Thẻ Vàng (Tích Lũy)
                </button>
                <button
                  type="button"
                  onClick={() => setCardType('RED')}
                  className={`p-2 rounded-xl text-xs font-black border transition-colors flex items-center justify-center gap-1.5 ${
                    cardType === 'RED'
                      ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white border-red-400 shadow-md'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
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
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setCardModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white text-xs font-bold border border-slate-700 transition-all cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveCard}
                disabled={!selectedPlayerId}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 text-xs font-black shadow-lg shadow-amber-500/30 border border-amber-300 transition-all cursor-pointer"
              >
                ⚠️ Xác Nhận Thẻ Phạt
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
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSubModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white text-xs font-bold border border-slate-700 transition-all cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveSubstitution}
                disabled={!selectedPlayerOutId || !selectedPlayerInId}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-black shadow-lg shadow-cyan-500/30 border border-cyan-300 transition-all cursor-pointer"
              >
                🔄 Xác Nhận Thay Người
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
            <p className="text-xs text-slate-300 bg-purple-950/40 p-2.5 rounded-lg border border-purple-500/30">
              Trận đấu knockout hòa sau 40 phút chính thức: Không đá hiệp phụ, tiến hành đá luân lưu 6m để xác định đội đi tiếp.
            </p>

            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="p-4 rounded-xl bg-slate-800 text-center border border-slate-700">
                <span className="text-xs text-slate-300 font-bold block mb-2">{homeTeam?.shortName}</span>
                <input
                  type="number"
                  min={0}
                  max={20}
                  value={penHome}
                  onChange={(e) => setPenHome(Number(e.target.value))}
                  className="w-16 h-12 text-center text-2xl font-black bg-slate-900 text-white rounded-lg border-2 border-purple-400 mx-auto"
                />
              </div>

              <div className="p-4 rounded-xl bg-slate-800 text-center border border-slate-700">
                <span className="text-xs text-slate-300 font-bold block mb-2">{awayTeam?.shortName}</span>
                <input
                  type="number"
                  min={0}
                  max={20}
                  value={penAway}
                  onChange={(e) => setPenAway(Number(e.target.value))}
                  className="w-16 h-12 text-center text-2xl font-black bg-slate-900 text-white rounded-lg border-2 border-purple-400 mx-auto"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setPenaltyModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white text-xs font-bold border border-slate-700 transition-all cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSavePenalty}
                disabled={penHome === penAway}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-black shadow-lg shadow-purple-600/30 border border-purple-300 transition-all cursor-pointer"
              >
                🥅 Xác Nhận Tỷ Số Penalty
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
                <label className="text-xs text-slate-300 font-semibold block mb-1">Tỷ số {homeTeam?.shortName}</label>
                <input
                  type="number"
                  min={0}
                  value={activeMatch.homeScore}
                  onChange={(e) => {
                    activeMatch.homeScore = Number(e.target.value);
                    onMatchesUpdate([...matches]);
                  }}
                  className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-xl p-2 font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">Tỷ số {awayTeam?.shortName}</label>
                <input
                  type="number"
                  min={0}
                  value={activeMatch.awayScore}
                  onChange={(e) => {
                    activeMatch.awayScore = Number(e.target.value);
                    onMatchesUpdate([...matches]);
                  }}
                  className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-xl p-2 font-mono font-bold"
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

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setPostEditModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white text-xs font-bold border border-slate-700 transition-all cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSavePostEdit}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/30 border border-amber-300 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <FileEdit className="w-3.5 h-3.5" />
                <span>Xác Nhận & Ghi Audit Log</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
