'use client';

import React, { useState, useEffect } from 'react';
import {
  Team,
  Match,
  Venue,
  Referee,
  Complaint,
  FinancialTransaction,
  TournamentAward,
  AuditLog,
  UserRole,
  TournamentStatus,
  Tournament,
  UserAccount,
} from '@/types';
import { StorageService, defaultCleanAwards } from '@/services/storage';
import { AuthService } from '@/services/auth';
import { AuthModal } from '@/components/auth/AuthModal';
import {
  subscribeTournamentCloud,
  pushTournamentCloud,
  subscribeTournamentsListCloud,
  pushTournamentsListCloud,
  ensureTournamentInitializedInCloud,
  deleteTournamentCloud,
} from '@/services/dbSync';
import { Header } from '@/components/layout/Header';
import { Navigation, TabKey } from '@/components/layout/Navigation';
import { PublicHome } from '@/components/home/PublicHome';
import { LiveMatchCenter } from '@/components/live/LiveMatchCenter';
import { ScheduleView } from '@/components/schedule/ScheduleView';
import { StandingsView } from '@/components/standings/StandingsView';
import { BracketTree } from '@/components/bracket/BracketTree';
import { TeamsView } from '@/components/teams/TeamsView';
import { DrawStudio } from '@/components/draw/DrawStudio';
import { DisciplineView } from '@/components/discipline/DisciplineView';
import { ComplaintsView } from '@/components/complaints/ComplaintsView';
import { FinanceView } from '@/components/finance/FinanceView';
import { AwardsView } from '@/components/awards/AwardsView';
import { AuditLogsView } from '@/components/audit/AuditLogsView';
import { CreateTournamentModal } from '@/components/tournament/CreateTournamentModal';
import { TournamentPortal } from '@/components/portal/TournamentPortal';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { MobileMenuDrawer } from '@/components/layout/MobileMenuDrawer';

export default function Home() {
  const [mounted, setMounted] = useState(false);

  // User Authentication state
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authNotice, setAuthNotice] = useState<string | undefined>(undefined);

  // Portal vs Single Tournament view mode
  const [viewMode, setViewMode] = useState<'portal' | 'tournament'>('portal');
  const [allTournaments, setAllTournaments] = useState<Tournament[]>([]);

  // Mobile navigation drawer
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Core application states
  const [tournament, setTournament] = useState<Tournament>(StorageService.getTournament());
  const [createTournamentOpen, setCreateTournamentOpen] = useState(false);
  const [editTournamentOpen, setEditTournamentOpen] = useState(false);
  const [editingTournament, setEditingTournament] = useState<Tournament | undefined>(undefined);
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [referees, setReferees] = useState<Referee[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [finances, setFinances] = useState<FinancialTransaction[]>([]);
  const [awards, setAwards] = useState<TournamentAward[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Cloud sync status
  const [cloudStatus, setCloudStatus] = useState<'connected' | 'connecting' | 'offline'>('connecting');

  // RBAC & Tournament Status
  const [currentRole, setCurrentRole] = useState<UserRole>('ORGANIZER');
  const [tournamentStatus, setTournamentStatus] = useState<TournamentStatus>('GROUP_STAGE');

  // Navigation
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [selectedMatchId, setSelectedMatchId] = useState<string>('');

  // Initial local data loading + Cloud Tournaments List subscription
  useEffect(() => {
    const all = StorageService.getAllTournaments();
    setAllTournaments(all);
    const curr = StorageService.getTournament();
    setTournament(curr);
    const cleaned = StorageService.cleanExcessGroupsData(curr);
    setTeams(cleaned.teams);
    setMatches(cleaned.matches);
    setVenues(StorageService.getVenues());
    setReferees(StorageService.getReferees());
    setComplaints(StorageService.getComplaints());
    setFinances(StorageService.getFinances());
    setAwards(StorageService.getAwards());
    setAuditLogs(StorageService.getAuditLogs());
    const user = AuthService.getCurrentUser();
    setCurrentUser(user);
    if (user) {
      setCurrentRole(user.role);
    } else {
      setCurrentRole(StorageService.getCurrentRole());
    }
    setTournamentStatus(StorageService.getTournamentStatus());
    setMounted(true);

    // Lắng nghe danh sách các giải đấu trên Firestore
    const unsubList = subscribeTournamentsListCloud((cloudList) => {
      if (cloudList && cloudList.length > 0) {
        setAllTournaments(cloudList);
        StorageService.saveAllTournaments(cloudList);
      }
    });

    return () => {
      unsubList();
    };
  }, []);

  // Lắng nghe cập nhật thời gian thực (Real-time) cho giải đấu đang chọn
  useEffect(() => {
    if (!tournament.id) return;

    // Đảm bảo dữ liệu ban đầu đã có trên Cloud
    ensureTournamentInitializedInCloud(tournament.id, {
      tournament,
      teams: StorageService.getTeams(),
      matches: StorageService.getMatches(),
      venues: StorageService.getVenues(),
      referees: StorageService.getReferees(),
      complaints: StorageService.getComplaints(),
      finances: StorageService.getFinances(),
      awards: StorageService.getAwards(),
      auditLogs: StorageService.getAuditLogs(),
      status: StorageService.getTournamentStatus(),
    });

    // Lắng nghe thời gian thực Firestore
    const unsub = subscribeTournamentCloud(
      tournament.id,
      (cloudData) => {
        setCloudStatus('connected');
        if (cloudData.tournament) {
          setTournament(cloudData.tournament);
        }
        if (Array.isArray(cloudData.teams)) {
          setTeams(cloudData.teams);
          StorageService.saveTeams(cloudData.teams);
        }
        if (Array.isArray(cloudData.matches)) {
          setMatches(cloudData.matches);
          StorageService.saveMatches(cloudData.matches);
        }
        if (Array.isArray(cloudData.venues)) {
          setVenues(cloudData.venues);
          StorageService.saveVenues(cloudData.venues);
        }
        if (Array.isArray(cloudData.referees)) {
          setReferees(cloudData.referees);
          StorageService.saveReferees(cloudData.referees);
        }
        if (Array.isArray(cloudData.complaints)) {
          setComplaints(cloudData.complaints);
          StorageService.saveComplaints(cloudData.complaints);
        }
        if (Array.isArray(cloudData.finances)) {
          setFinances(cloudData.finances);
          StorageService.saveFinances(cloudData.finances);
        }
        if (Array.isArray(cloudData.awards)) {
          setAwards(cloudData.awards);
          StorageService.saveAwards(cloudData.awards);
        }
        if (Array.isArray(cloudData.auditLogs)) {
          setAuditLogs(cloudData.auditLogs);
          StorageService.saveAuditLogs(cloudData.auditLogs);
        }
        if (cloudData.status) {
          setTournamentStatus(cloudData.status);
          StorageService.setTournamentStatus(cloudData.status);
        }
      },
      () => {
        setCloudStatus('offline');
      }
    );

    return () => {
      unsub();
    };
  }, [tournament.id]);

  const handleRoleChange = (newRole: UserRole) => {
    setCurrentRole(newRole);
    StorageService.setCurrentRole(newRole);
    StorageService.logAction(
      newRole,
      newRole,
      'CHUYỂN VAI TRÒ HỆ THỐNG',
      'RBAC Session',
      `Người dùng chuyển sang góc nhìn quyền: ${newRole}`
    );
    const updatedLogs = StorageService.getAuditLogs();
    setAuditLogs(updatedLogs);
    pushTournamentCloud(tournament.id, { auditLogs: updatedLogs });
  };

  const handleStatusChange = (newStatus: TournamentStatus) => {
    setTournamentStatus(newStatus);
    StorageService.setTournamentStatus(newStatus);
    StorageService.logAction(
      currentRole,
      currentRole,
      'CHUYỂN TRẠNG THÁI GIẢI ĐẤU',
      'Tournament State Machine',
      `Giai đoạn giải đấu chuyển sang: ${newStatus}`
    );
    const updatedLogs = StorageService.getAuditLogs();
    setAuditLogs(updatedLogs);
    pushTournamentCloud(tournament.id, {
      status: newStatus,
      auditLogs: updatedLogs,
    });
  };

  const handleSelectTournament = (tour: Tournament) => {
    StorageService.setActiveTournamentId(tour.id);
    setTournament(tour);
    setTeams(StorageService.getTeams());
    setMatches(StorageService.getMatches());
    setVenues(StorageService.getVenues());
    setReferees(StorageService.getReferees());
    setFinances(StorageService.getFinances());
    setComplaints(StorageService.getComplaints());
    setAwards(StorageService.getAwards());
    setAuditLogs(StorageService.getAuditLogs());
    setTournamentStatus(tour.status || StorageService.getTournamentStatus());
    setViewMode('tournament');
    setActiveTab('home');
  };

  const handleDeleteTournament = (tourId: string) => {
    StorageService.deleteTournament(tourId);
    const updatedList = StorageService.getAllTournaments().filter((t) => t.id !== tourId);
    setAllTournaments(updatedList);
    if (tournament.id === tourId && updatedList.length > 0) {
      setTournament(updatedList[0]);
    }
    deleteTournamentCloud(tourId);
    pushTournamentsListCloud(updatedList);
  };

  const handleClearData = () => {
    if (confirm('Xác nhận: Bạn có muốn XÓA SẠCH toàn bộ dữ liệu mẫu (đội bóng, lịch thi đấu, tỷ số, khiếu nại, thu chi) để bắt đầu giải đấu mới?')) {
      StorageService.clearAllData();
      setTournament(StorageService.getTournament());
      const updatedList = StorageService.getAllTournaments();
      setAllTournaments(updatedList);
      setTeams([]);
      setMatches([]);
      setComplaints([]);
      setFinances([]);
      setAwards(StorageService.getAwards());
      const updatedLogs = StorageService.getAuditLogs();
      setAuditLogs(updatedLogs);
      setTournamentStatus('REGISTRATION');
      pushTournamentCloud(tournament.id, {
        teams: [],
        matches: [],
        complaints: [],
        finances: [],
        awards: defaultCleanAwards,
        status: 'REGISTRATION',
        auditLogs: updatedLogs,
      });
      alert('Đã xóa sạch dữ liệu mẫu thành công! Cơ sở dữ liệu đám mây hiện đã trắng.');
    }
  };

  const handleLoadDemo = () => {
    if (confirm('Nạp 16 đội bóng và 32 trận đấu mẫu để thử nghiệm tính năng?')) {
      const demo = StorageService.loadDemoData();
      setTournament(StorageService.getTournament());
      setAllTournaments(StorageService.getAllTournaments());
      setTeams(demo.teams);
      setMatches(demo.matches);
      setFinances(demo.finances);
      setComplaints(demo.complaints);
      const updatedLogs = StorageService.getAuditLogs();
      setAuditLogs(updatedLogs);
      setTournamentStatus('GROUP_STAGE');
      pushTournamentCloud(tournament.id, {
        teams: demo.teams,
        matches: demo.matches,
        finances: demo.finances,
        complaints: demo.complaints,
        status: 'GROUP_STAGE',
        auditLogs: updatedLogs,
      });
      alert('Đã nạp 16 đội bóng và 32 trận đấu mẫu thành công lên đám mây!');
    }
  };

  const handleCreateNewTournament = (newTour: Tournament, preloadDemo: boolean) => {
    StorageService.createNewTournament(newTour, preloadDemo);
    setTournament(newTour);
    const updatedList = StorageService.getAllTournaments();
    setAllTournaments(updatedList);
    const initialTeams = StorageService.getTeams();
    const initialMatches = StorageService.getMatches();
    const initialVenues = StorageService.getVenues();
    const initialReferees = StorageService.getReferees();
    const initialFinances = StorageService.getFinances();
    const initialComplaints = StorageService.getComplaints();
    const initialAwards = StorageService.getAwards();
    const initialLogs = StorageService.getAuditLogs();
    const initialStatus = newTour.status || 'REGISTRATION';

    setTeams(initialTeams);
    setMatches(initialMatches);
    setVenues(initialVenues);
    setReferees(initialReferees);
    setFinances(initialFinances);
    setComplaints(initialComplaints);
    setAwards(initialAwards);
    setAuditLogs(initialLogs);
    setTournamentStatus(initialStatus);
    setCreateTournamentOpen(false);
    setViewMode('tournament');
    setActiveTab('home');

    // Đồng bộ lên Cloud
    pushTournamentsListCloud(updatedList, newTour.id);
    pushTournamentCloud(newTour.id, {
      tournament: newTour,
      teams: initialTeams,
      matches: initialMatches,
      venues: initialVenues,
      referees: initialReferees,
      finances: initialFinances,
      complaints: initialComplaints,
      awards: initialAwards,
      auditLogs: initialLogs,
      status: initialStatus,
    });
  };

  const handleTournamentUpdate = (updatedTour: Tournament) => {
    StorageService.updateTournament(updatedTour);
    setTournament(updatedTour);
    const updatedList = StorageService.getAllTournaments();
    setAllTournaments(updatedList);
    const updatedLogs = StorageService.getAuditLogs();
    setAuditLogs(updatedLogs);
    pushTournamentsListCloud(updatedList);
    pushTournamentCloud(updatedTour.id, {
      tournament: updatedTour,
      auditLogs: updatedLogs,
    });
  };

  const handleOpenEditTournament = (tourToEdit: Tournament) => {
    setEditingTournament(tourToEdit);
    setEditTournamentOpen(true);
  };

  const handleSaveEditedTournament = (updatedTour: Tournament) => {
    StorageService.updateTournament(updatedTour);
    if (tournament.id === updatedTour.id) {
      setTournament(updatedTour);
    }
    const cleaned = StorageService.cleanExcessGroupsData(updatedTour);
    setTeams(cleaned.teams);
    setMatches(cleaned.matches);
    const updatedList = StorageService.getAllTournaments();
    setAllTournaments(updatedList);
    const updatedLogs = StorageService.getAuditLogs();
    setAuditLogs(updatedLogs);
    setEditTournamentOpen(false);
    setEditingTournament(undefined);
    pushTournamentsListCloud(updatedList);
    pushTournamentCloud(updatedTour.id, {
      tournament: updatedTour,
      teams: cleaned.teams,
      matches: cleaned.matches,
      auditLogs: updatedLogs,
    });
    alert(`Đã cập nhật cấu hình giải đấu "${updatedTour.name}" thành công!`);
  };

  // Đồng bộ cập nhật Trận đấu
  const handleMatchesUpdate = (newMatches: Match[]) => {
    setMatches(newMatches);
    StorageService.saveMatches(newMatches);
    const updatedTeams = StorageService.getTeams();
    setTeams(updatedTeams);
    const updatedLogs = StorageService.getAuditLogs();
    setAuditLogs(updatedLogs);
    pushTournamentCloud(tournament.id, {
      matches: newMatches,
      teams: updatedTeams,
      auditLogs: updatedLogs,
    });
  };

  // Đồng bộ cập nhật Đội bóng & Cầu thủ
  const handleTeamsUpdate = (newTeams: Team[]) => {
    setTeams(newTeams);
    StorageService.saveTeams(newTeams);
    const updatedLogs = StorageService.getAuditLogs();
    setAuditLogs(updatedLogs);
    pushTournamentCloud(tournament.id, {
      teams: newTeams,
      auditLogs: updatedLogs,
    });
  };

  // Đồng bộ cập nhật Khiếu nại
  const handleComplaintsUpdate = (newComplaints: Complaint[]) => {
    setComplaints(newComplaints);
    StorageService.saveComplaints(newComplaints);
    const updatedLogs = StorageService.getAuditLogs();
    setAuditLogs(updatedLogs);
    pushTournamentCloud(tournament.id, {
      complaints: newComplaints,
      auditLogs: updatedLogs,
    });
  };

  // Đồng bộ cập nhật Tài chính
  const handleFinancesUpdate = (newFinances: FinancialTransaction[]) => {
    setFinances(newFinances);
    StorageService.saveFinances(newFinances);
    const updatedLogs = StorageService.getAuditLogs();
    setAuditLogs(updatedLogs);
    pushTournamentCloud(tournament.id, {
      finances: newFinances,
      auditLogs: updatedLogs,
    });
  };

  // Đồng bộ cập nhật Giải thưởng
  const handleAwardsUpdate = (newAwards: TournamentAward[]) => {
    setAwards(newAwards);
    StorageService.saveAwards(newAwards);
    const updatedLogs = StorageService.getAuditLogs();
    setAuditLogs(updatedLogs);
    pushTournamentCloud(tournament.id, {
      awards: newAwards,
      auditLogs: updatedLogs,
    });
  };

  // Quick navigation to live match
  const handleSelectMatchAndNavigateLive = (matchId: string) => {
    setSelectedMatchId(matchId);
    setActiveTab('live');
  };

  // User Authentication handlers
  const handleLoginSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    setCurrentRole(user.role);
    StorageService.setCurrentRole(user.role);
    setAuthModalOpen(false);
  };

  const handleLogout = () => {
    AuthService.logout();
    setCurrentUser(null);
    setCurrentRole('STUDENT');
    StorageService.setCurrentRole('STUDENT');
  };

  const handleOpenAuthModal = (notice?: string) => {
    setAuthNotice(notice);
    setAuthModalOpen(true);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#070B14] flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <div className="text-sm font-bold text-emerald-400">Đang khởi tạo ITFTMS 2026...</div>
      </div>
    );
  }

  // View: Outer Portal of All Created Tournaments
  if (viewMode === 'portal') {
    return (
      <div className="min-h-screen bg-[#070B14]">
        <TournamentPortal
          tournaments={allTournaments}
          onSelectTournament={handleSelectTournament}
          onCreateTournament={() => setCreateTournamentOpen(true)}
          onEditTournament={handleOpenEditTournament}
          onDeleteTournament={handleDeleteTournament}
          currentRole={currentRole}
          onRoleChange={handleRoleChange}
          cloudStatus={cloudStatus}
          currentUser={currentUser}
          onOpenAuthModal={() => handleOpenAuthModal()}
          onLogout={handleLogout}
        />
        <CreateTournamentModal
          isOpen={createTournamentOpen}
          onClose={() => setCreateTournamentOpen(false)}
          onSubmit={handleCreateNewTournament}
          currentTournament={tournament}
          mode="create"
        />
        <CreateTournamentModal
          isOpen={editTournamentOpen}
          onClose={() => {
            setEditTournamentOpen(false);
            setEditingTournament(undefined);
          }}
          onSubmit={handleSaveEditedTournament}
          currentTournament={editingTournament || tournament}
          mode="edit"
        />
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          onLoginSuccess={handleLoginSuccess}
          messageNotice={authNotice}
        />
      </div>
    );
  }

  const liveMatches = matches.filter((m) => m.status === 'LIVE');
  const activeComplaints = complaints.filter((c) => c.status === 'PENDING' || c.status === 'UNDER_REVIEW');
  const suspendedPlayers = teams.flatMap((t) => t.players).filter((p) => p.isSuspended);

  return (
    <div className="min-h-screen flex flex-col bg-[#070B14] text-slate-100">
      
      {/* Header with Role Switcher, Tournament Stage, Sound FX, Clear & Load Data */}
      <Header
        currentRole={currentRole}
        onRoleChange={handleRoleChange}
        tournamentStatus={tournamentStatus}
        onStatusChange={handleStatusChange}
        onClearData={handleClearData}
        onLoadDemo={handleLoadDemo}
        liveMatchCount={liveMatches.length}
        onNavigateToLive={() => setActiveTab('live')}
        tournament={tournament}
        onOpenCreateTournament={() => setCreateTournamentOpen(true)}
        onEditTournament={() => handleOpenEditTournament(tournament)}
        onBackToPortal={() => setViewMode('portal')}
        cloudStatus={cloudStatus}
        onOpenMobileMenu={() => setMobileMenuOpen(true)}
        currentUser={currentUser}
        onOpenAuthModal={() => handleOpenAuthModal()}
        onLogout={handleLogout}
      />

      {/* Navigation Tabs Bar */}
      <Navigation
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setAuditLogs(StorageService.getAuditLogs());
        }}
        liveMatchCount={liveMatches.length}
        activeComplaintsCount={activeComplaints.length}
        suspendedPlayersCount={suspendedPlayers.length}
        onBackToPortal={() => setViewMode('portal')}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-28 md:py-8">
        
        {activeTab === 'home' && (
          <PublicHome
            teams={teams}
            matches={matches}
            finances={finances}
            complaints={complaints}
            onNavigate={(tab) => setActiveTab(tab)}
            onSelectMatch={handleSelectMatchAndNavigateLive}
            currentRole={currentRole}
            tournament={tournament}
          />
        )}

        {activeTab === 'live' && (
          <LiveMatchCenter
            matches={matches}
            teams={teams}
            onMatchesUpdate={handleMatchesUpdate}
            currentRole={currentRole}
            selectedMatchId={selectedMatchId}
          />
        )}

        {activeTab === 'schedule' && (
          <ScheduleView
            matches={matches}
            teams={teams}
            venues={venues}
            referees={referees}
            onMatchesUpdate={handleMatchesUpdate}
            onSelectMatch={handleSelectMatchAndNavigateLive}
            currentRole={currentRole}
          />
        )}

        {activeTab === 'standings' && (
          <StandingsView
            teams={teams}
            matches={matches}
            currentRole={currentRole}
            tournament={tournament}
            onRefresh={() => {
              setTeams(StorageService.getTeams());
              setMatches(StorageService.getMatches());
              setAuditLogs(StorageService.getAuditLogs());
            }}
          />
        )}

        {activeTab === 'bracket' && (
          <BracketTree
            matches={matches}
            teams={teams}
            onSelectMatch={handleSelectMatchAndNavigateLive}
          />
        )}

        {activeTab === 'teams' && (
          <TeamsView
            teams={teams}
            onTeamsUpdate={handleTeamsUpdate}
            currentRole={currentRole}
            tournament={tournament}
          />
        )}

        {activeTab === 'draw' && (
          <DrawStudio
            teams={teams}
            onTeamsUpdate={handleTeamsUpdate}
            currentRole={currentRole}
            tournament={tournament}
            onTournamentUpdate={handleTournamentUpdate}
          />
        )}

        {activeTab === 'discipline' && (
          <DisciplineView
            teams={teams}
            matches={matches}
            onTeamsUpdate={handleTeamsUpdate}
            currentRole={currentRole}
          />
        )}

        {activeTab === 'complaints' && (
          <ComplaintsView
            complaints={complaints}
            matches={matches}
            teams={teams}
            onComplaintsUpdate={handleComplaintsUpdate}
            currentRole={currentRole}
          />
        )}

        {activeTab === 'finance' && (
          <FinanceView
            finances={finances}
            teams={teams}
            onFinancesUpdate={handleFinancesUpdate}
            onTeamsUpdate={handleTeamsUpdate}
            currentRole={currentRole}
          />
        )}

        {activeTab === 'awards' && (
          <AwardsView
            awards={awards}
            onAwardsUpdate={handleAwardsUpdate}
            currentRole={currentRole}
          />
        )}

        {activeTab === 'audit' && (
          <AuditLogsView
            logs={auditLogs}
            currentRole={currentRole}
          />
        )}

      </main>

      {/* Footer */}
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
            <span>Luật 2 thẻ vàng Điều 11</span>
          </div>

          <div className="text-slate-400">
            Hệ Thống Quản Lý & Điều Hành Giải Bóng Đá CNTT 2026
          </div>
        </div>
      </footer>

      {/* Modal: Tạo Mới Giải Đấu */}
      <CreateTournamentModal
        isOpen={createTournamentOpen}
        onClose={() => setCreateTournamentOpen(false)}
        onSubmit={handleCreateNewTournament}
        currentTournament={tournament}
        mode="create"
      />

      {/* Modal: Chỉnh Sửa Giải Đấu (Số Bảng, Số Đội 1 Bảng, Lệ Phí, Format) */}
      <CreateTournamentModal
        isOpen={editTournamentOpen}
        onClose={() => {
          setEditTournamentOpen(false);
          setEditingTournament(undefined);
        }}
        onSubmit={handleSaveEditedTournament}
        currentTournament={editingTournament || tournament}
        mode="edit"
      />

      {/* Mobile Smartphone Floating Bottom Navigation Bar */}
      <MobileBottomNav
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setAuditLogs(StorageService.getAuditLogs());
        }}
        liveMatchCount={liveMatches.length}
        activeComplaintsCount={activeComplaints.length}
        suspendedPlayersCount={suspendedPlayers.length}
        onOpenMobileMenu={() => setMobileMenuOpen(true)}
      />

      {/* Mobile Full Screen Menu Drawer */}
      <MobileMenuDrawer
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setAuditLogs(StorageService.getAuditLogs());
        }}
        tournament={tournament}
        currentRole={currentRole}
        onRoleChange={handleRoleChange}
        tournamentStatus={tournamentStatus}
        onStatusChange={handleStatusChange}
        onOpenCreateTournament={() => setCreateTournamentOpen(true)}
        liveMatchCount={liveMatches.length}
        activeComplaintsCount={activeComplaints.length}
        suspendedPlayersCount={suspendedPlayers.length}
        onOpenEditTournament={() => handleOpenEditTournament(tournament)}
        onBackToPortal={() => setViewMode('portal')}
        onClearData={handleClearData}
        onLoadDemo={handleLoadDemo}
        currentUser={currentUser}
        onOpenAuthModal={() => handleOpenAuthModal()}
        onLogout={handleLogout}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        messageNotice={authNotice}
      />

    </div>
  );
}
