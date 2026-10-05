'use client';

import React, { useState, useEffect } from 'react';
import { Team, Player, UserRole, PlayerPosition, TeamStatus, Tournament, getGroupLetters, UserAccount } from '@/types';
import { StorageService } from '@/services/storage';
import { AuthService } from '@/services/auth';
import { 
  Users, 
  Shirt, 
  Plus, 
  ShieldAlert, 
  Phone, 
  Mail, 
  UserCheck, 
  AlertCircle, 
  CreditCard,
  Ban,
  CheckCircle2,
  X,
  Sparkles,
  Edit3,
  Trash2,
  KeyRound,
  Copy,
  Check,
  ShieldCheck,
  ArrowRight,
  LogIn
} from 'lucide-react';

interface TeamsViewProps {
  teams: Team[];
  onTeamsUpdate: (teams: Team[]) => void;
  currentRole: UserRole;
  tournament?: Tournament;
  currentUser?: UserAccount | null;
  onOpenAuthModal?: (notice?: string, initialUsername?: string, initialPassword?: string) => void;
}

export const TeamsView: React.FC<TeamsViewProps> = ({
  teams,
  onTeamsUpdate,
  currentRole,
  tournament,
  currentUser,
  onOpenAuthModal,
}) => {
  const groups = getGroupLetters(tournament?.numberOfGroups || 4);
  const [selectedTeamId, setSelectedTeamId] = useState<string>(teams[0]?.id || '');
  const [filterGroup, setFilterGroup] = useState<string>('ALL');

  // Team registration modal state (Rule #14) - Chỉ dành cho BTC
  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamShortName, setNewTeamShortName] = useState('');
  const [newTeamClass, setNewTeamClass] = useState('');
  const [newTeamDept, setNewTeamDept] = useState('Khoa Công nghệ Thông tin');
  const [newTeamLeader, setNewTeamLeader] = useState('');
  const [newTeamCaptain, setNewTeamCaptain] = useState('');
  const [newTeamPhone, setNewTeamPhone] = useState('');
  const [newTeamEmail, setNewTeamEmail] = useState('');
  const [newTeamPrimaryColor, setNewTeamPrimaryColor] = useState('#2563EB');
  const [newTeamSecondaryColor, setNewTeamSecondaryColor] = useState('#FFFFFF');
  const [newTeamGroup, setNewTeamGroup] = useState<string>('NONE');
  const [newCaptainUsername, setNewCaptainUsername] = useState('');
  const [newCaptainPassword, setNewCaptainPassword] = useState('123');

  // Modal thông báo tạo tài khoản Đội trưởng thành công cho BTC
  const [createdCaptainModal, setCreatedCaptainModal] = useState<{
    open: boolean;
    teamName: string;
    shortName: string;
    captainName: string;
    username: string;
    password: string;
  } | null>(null);
  const [copiedCaptainCreds, setCopiedCaptainCreds] = useState(false);
  const [headerCopied, setHeaderCopied] = useState(false);

  // Player registration modal state (Rule #15)
  const [playerModalOpen, setPlayerModalOpen] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerStudentId, setNewPlayerStudentId] = useState('');
  const [newPlayerClass, setNewPlayerClass] = useState('');
  const [newPlayerCohort, setNewPlayerCohort] = useState('K23');
  const [newPlayerDob, setNewPlayerDob] = useState('2004-05-15');
  const [newPlayerJersey, setNewPlayerJersey] = useState<number>(10);
  const [newPlayerPos, setNewPlayerPos] = useState<PlayerPosition>('FW');

  // Edit player modal state
  const [editPlayerModalOpen, setEditPlayerModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [editPlayerName, setEditPlayerName] = useState('');
  const [editPlayerStudentId, setEditPlayerStudentId] = useState('');
  const [editPlayerCohort, setEditPlayerCohort] = useState('K23');
  const [editPlayerClass, setEditPlayerClass] = useState('');
  const [editPlayerDob, setEditPlayerDob] = useState('2004-05-15');
  const [editPlayerJersey, setEditPlayerJersey] = useState<number>(10);
  const [editPlayerPos, setEditPlayerPos] = useState<PlayerPosition>('FW');

  // Edit team modal state
  const [editTeamModalOpen, setEditTeamModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editShortName, setEditShortName] = useState('');
  const [editClass, setEditClass] = useState('');
  const [editGroup, setEditGroup] = useState<string>('NONE');
  const [editLeader, setEditLeader] = useState('');
  const [editCaptain, setEditCaptain] = useState('');
  const [editPrimaryColor, setEditPrimaryColor] = useState('#2563EB');
  const [editSecondaryColor, setEditSecondaryColor] = useState('#FFFFFF');

  const selectedTeam = teams.find((t) => t.id === selectedTeamId) || teams[0];

  // Phân quyền chuẩn hóa
  const isOrganizerOrAdmin = currentRole === 'SUPER_ADMIN' || currentRole === 'ORGANIZER';
  const isCaptain = currentRole === 'TEAM_MANAGER';
  const captainAcc = selectedTeam ? AuthService.getCaptainAccountForTeam(selectedTeam.id) : null;
  const captainUsername = captainAcc?.username || (selectedTeam ? `captain_${(selectedTeam.shortName || selectedTeam.name).toLowerCase().replace(/[^a-z0-9]/g, '')}` : '');
  const isMyTeam =
    isCaptain &&
    currentUser != null &&
    (currentUser.teamId === selectedTeam?.id ||
      (currentUser.teamName &&
        selectedTeam?.name &&
        currentUser.teamName.toLowerCase().trim() === selectedTeam.name.toLowerCase().trim()) ||
      (captainUsername && currentUser.username?.toLowerCase() === captainUsername.toLowerCase()));

  // Quyền quản lý thành viên (Cầu thủ): BTC toàn quyền, Đội trưởng chỉ đội mình
  const canManageThisTeamPlayers = isOrganizerOrAdmin || isMyTeam;

  // Tự động định vị về đội bóng của Đội trưởng khi đăng nhập
  useEffect(() => {
    if (isCaptain && currentUser?.teamId) {
      const myTeam = teams.find((t) => t.id === currentUser.teamId);
      if (myTeam) {
        setSelectedTeamId(myTeam.id);
      }
    }
  }, [isCaptain, currentUser?.teamId, teams]);

  // Cập nhật gợi ý username khi nhập tên viết tắt đội
  const handleShortNameChange = (val: string) => {
    setNewTeamShortName(val);
    setNewCaptainUsername(AuthService.generateCaptainUsername(val));
  };

  const handleOpenEditTeam = () => {
    if (!selectedTeam) return;
    setEditName(selectedTeam.name);
    setEditShortName(selectedTeam.shortName);
    setEditClass(selectedTeam.class);
    setEditGroup(selectedTeam.group || 'NONE');
    setEditLeader(selectedTeam.leaderName);
    setEditCaptain(selectedTeam.captainName);
    setEditPrimaryColor(selectedTeam.primaryColor);
    setEditSecondaryColor(selectedTeam.secondaryColor);
    setEditTeamModalOpen(true);
  };

  const handleSaveEditTeam = () => {
    if (!selectedTeam) return;
    const updated = teams.map((t) => {
      if (t.id === selectedTeam.id) {
        return {
          ...t,
          name: editName,
          shortName: editShortName.toUpperCase(),
          class: editClass,
          group: editGroup !== 'NONE' ? editGroup : undefined,
          leaderName: editLeader,
          captainName: editCaptain,
          primaryColor: editPrimaryColor,
          secondaryColor: editSecondaryColor,
        };
      }
      return t;
    });

    onTeamsUpdate(updated);
    StorageService.saveTeams(updated);
    setEditTeamModalOpen(false);

    StorageService.logAction(
      currentRole,
      currentRole,
      'CẬP NHẬT THÔNG TIN & BẢNG ĐẤU ĐỘI BÓNG',
      selectedTeam.name,
      `Cập nhật: Bảng ${editGroup}, Lớp ${editClass}, Trưởng đoàn: ${editLeader}`
    );
  };

  // Toggle Withdrawn / Disqualified Status (Rule #13)
  const handleToggleWithdrawn = (teamId: string) => {
    if (currentRole !== 'SUPER_ADMIN' && currentRole !== 'ORGANIZER') {
      alert('Chỉ có BTC mới có quyền xác nhận đội bỏ cuộc!');
      return;
    }

    const team = teams.find((t) => t.id === teamId);
    if (!team) return;

    const newStatus: TeamStatus = team.status === 'WITHDRAWN' ? 'APPROVED' : 'WITHDRAWN';
    const updated = teams.map((t) => (t.id === teamId ? { ...t, status: newStatus } : t));

    onTeamsUpdate(updated);
    StorageService.saveTeams(updated);

    StorageService.logAction(
      currentRole,
      currentRole,
      newStatus === 'WITHDRAWN' ? 'XÁC NHẬN ĐỘI BỎ CUỘC' : 'PHỤC HỒI TRẠNG THÁI ĐỘI BÓNG',
      team.name,
      `Chuyển trạng thái sang ${newStatus}. Kích hoạt quy định Điều 13: Các đội cùng bảng được cộng 3 điểm.`
    );
  };

  // Add new team (Rule #14) - CHỈ DÀNH CHO BTC
  const handleCreateTeam = () => {
    if (!isOrganizerOrAdmin) {
      alert('Chỉ Ban Tổ Chức (BTC) mới có quyền tạo và thêm đội bóng mới!');
      return;
    }

    if (!newTeamName || !newTeamShortName || !newTeamClass) {
      alert('Vui lòng nhập đầy đủ tên đội, tên viết tắt và chi đoàn lớp!');
      return;
    }

    if (teams.length >= 16) {
      alert('Giải đấu đã đạt giới hạn tối đa 16 đội bóng theo Điều 3.1!');
      return;
    }

    const newId = `T${String(teams.length + 1).padStart(2, '0')}`;
    const newTeam: Team = {
      id: newId,
      name: newTeamName.trim(),
      shortName: newTeamShortName.trim().toUpperCase(),
      logo: `⚽ ${newTeamShortName.trim().toUpperCase()}`,
      class: newTeamClass.trim(),
      department: newTeamDept,
      leaderName: newTeamLeader.trim() || 'Trưởng đoàn',
      captainName: newTeamCaptain.trim() || 'Đội trưởng',
      phoneNumber: newTeamPhone.trim() || '0900000000',
      email: newTeamEmail.trim() || `${newTeamShortName.toLowerCase()}@uit.edu.vn`,
      primaryColor: newTeamPrimaryColor,
      secondaryColor: newTeamSecondaryColor,
      status: 'APPROVED',
      feeStatus: 'UNPAID',
      registrationFee: 500000,
      depositFee: 50000,
      group: newTeamGroup !== 'NONE' ? newTeamGroup : undefined,
      players: [],
    };

    // Tự động tạo tài khoản Đội Trưởng cho đội bóng vừa tạo
    const captainAcc = AuthService.createCaptainAccountForTeam(
      newTeam,
      newCaptainUsername,
      newCaptainPassword || '123'
    );

    const updated = [...teams, newTeam];
    onTeamsUpdate(updated);
    StorageService.saveTeams(updated);
    setSelectedTeamId(newTeam.id);

    setTeamModalOpen(false);
    setNewTeamName('');
    setNewTeamShortName('');
    setNewTeamClass('');
    setNewTeamLeader('');
    setNewTeamCaptain('');
    setNewCaptainUsername('');
    setNewCaptainPassword('123');

    // Hiển thị modal thông báo tài khoản cho BTC sao chép bàn giao
    setCreatedCaptainModal({
      open: true,
      teamName: newTeam.name,
      shortName: newTeam.shortName,
      captainName: newTeam.captainName,
      username: captainAcc.username,
      password: captainAcc.password || '123',
    });

    StorageService.logAction(
      currentUser?.fullName || currentRole,
      currentRole,
      'BTC TẠO ĐỘI BÓNG & SINH TÀI KHOẢN ĐỘI TRƯỞNG',
      newTeam.name,
      `BTC tạo thành công đội ${newTeam.name} (${newTeam.shortName}). Hệ thống đã tự động cấp tài khoản @${captainAcc.username} cho Đội trưởng.`
    );
  };

  // Add new player to team (Rule #15: max 12 players, no duplicate jersey numbers)
  const handleAddPlayer = () => {
    if (!selectedTeam) return;

    if (!canManageThisTeamPlayers) {
      alert('Bạn không có quyền thêm thành viên cho đội bóng này!');
      return;
    }

    if (selectedTeam.players.length >= 12) {
      alert('Đội bóng đã đủ 12 cầu thủ tối đa theo quy định Điều 6.1 & 15!');
      return;
    }

    if (selectedTeam.players.some((p) => p.jerseyNumber === newPlayerJersey)) {
      alert(`Số áo ${newPlayerJersey} đã có cầu thủ khác sử dụng trong đội! Vui lòng chọn số áo khác.`);
      return;
    }

    const duplicateInOtherTeam = teams.some((t) =>
      t.players.some((p) => p.studentId === newPlayerStudentId)
    );
    if (duplicateInOtherTeam) {
      alert(`Mã sinh viên ${newPlayerStudentId} đã được đăng ký ở một đội bóng khác! Một cầu thủ chỉ thuộc về một đội.`);
      return;
    }

    const newPlayer: Player = {
      id: `PL-${selectedTeam.id}-${Date.now().toString().slice(-4)}`,
      teamId: selectedTeam.id,
      name: newPlayerName.trim(),
      studentId: newPlayerStudentId.trim(),
      class: newPlayerClass.trim() || selectedTeam.class,
      cohort: newPlayerCohort,
      dateOfBirth: newPlayerDob,
      jerseyNumber: newPlayerJersey,
      position: newPlayerPos,
      yellowCards: 0,
      redCards: 0,
      isSuspended: false,
      goals: 0,
      assists: 0,
    };

    selectedTeam.players.push(newPlayer);
    const updated = [...teams];
    onTeamsUpdate(updated);
    StorageService.saveTeams(updated);

    setPlayerModalOpen(false);
    setNewPlayerName('');
    setNewPlayerStudentId('');

    StorageService.logAction(
      currentUser?.fullName || currentRole,
      currentRole,
      'ĐĂNG KÝ CẦU THỦ MỚI',
      selectedTeam.name,
      `Thêm cầu thủ: ${newPlayer.name} (#${newPlayer.jerseyNumber} - ${newPlayer.position}), MSSV: ${newPlayer.studentId}`
    );
  };

  // Xóa cầu thủ khỏi đội bóng (chỉ BTC hoặc Đội trưởng đội mình)
  const handleDeletePlayer = (playerId: string) => {
    if (!selectedTeam) return;
    if (!canManageThisTeamPlayers) {
      alert('Bạn không có quyền xóa thành viên của đội bóng này!');
      return;
    }

    const player = selectedTeam.players.find((p) => p.id === playerId);
    if (!player) return;

    if (!confirm(`Bạn có chắc chắn muốn xóa cầu thủ ${player.name} (#${player.jerseyNumber}) khỏi đội ${selectedTeam.name}?`)) {
      return;
    }

    const updatedPlayers = selectedTeam.players.filter((p) => p.id !== playerId);
    const updated = teams.map((t) => (t.id === selectedTeam.id ? { ...t, players: updatedPlayers } : t));
    onTeamsUpdate(updated);
    StorageService.saveTeams(updated);

    StorageService.logAction(
      currentUser?.fullName || currentRole,
      currentRole,
      'XÓA THÀNH VIÊN ĐỘI BÓNG',
      selectedTeam.name,
      `Xóa cầu thủ: ${player.name} (#${player.jerseyNumber}), MSSV: ${player.studentId}`
    );
  };

  // Mở modal sửa cầu thủ
  const handleOpenEditPlayer = (player: Player) => {
    if (!canManageThisTeamPlayers) {
      alert('Bạn không có quyền chỉnh sửa thành viên của đội bóng này!');
      return;
    }
    setEditingPlayer(player);
    setEditPlayerName(player.name);
    setEditPlayerStudentId(player.studentId);
    setEditPlayerCohort(player.cohort || 'K23');
    setEditPlayerClass(player.class || selectedTeam?.class || '');
    setEditPlayerDob(player.dateOfBirth || '2004-05-15');
    setEditPlayerJersey(player.jerseyNumber);
    setEditPlayerPos(player.position);
    setEditPlayerModalOpen(true);
  };

  // Lưu chỉnh sửa cầu thủ
  const handleSaveEditPlayer = () => {
    if (!selectedTeam || !editingPlayer) return;
    if (!canManageThisTeamPlayers) {
      alert('Bạn không có quyền chỉnh sửa thành viên của đội bóng này!');
      return;
    }

    if (!editPlayerName || !editPlayerStudentId) {
      alert('Vui lòng nhập họ tên và mã sinh viên!');
      return;
    }

    if (selectedTeam.players.some((p) => p.id !== editingPlayer.id && p.jerseyNumber === editPlayerJersey)) {
      alert(`Số áo ${editPlayerJersey} đã có cầu thủ khác trong đội sử dụng! Vui lòng chọn số khác.`);
      return;
    }

    const duplicateInOtherTeam = teams.some(
      (t) => t.id !== selectedTeam.id && t.players.some((p) => p.studentId === editPlayerStudentId)
    );
    if (duplicateInOtherTeam) {
      alert(`Mã sinh viên ${editPlayerStudentId} đã được đăng ký ở một đội bóng khác!`);
      return;
    }

    const updatedPlayers = selectedTeam.players.map((p) => {
      if (p.id === editingPlayer.id) {
        return {
          ...p,
          name: editPlayerName.trim(),
          studentId: editPlayerStudentId.trim(),
          cohort: editPlayerCohort,
          class: editPlayerClass.trim(),
          dateOfBirth: editPlayerDob,
          jerseyNumber: editPlayerJersey,
          position: editPlayerPos,
        };
      }
      return p;
    });

    const updated = teams.map((t) => (t.id === selectedTeam.id ? { ...t, players: updatedPlayers } : t));
    onTeamsUpdate(updated);
    StorageService.saveTeams(updated);
    setEditPlayerModalOpen(false);
    setEditingPlayer(null);

    StorageService.logAction(
      currentUser?.fullName || currentRole,
      currentRole,
      'CẬP NHẬT THÀNH VIÊN ĐỘI BÓNG',
      selectedTeam.name,
      `Cập nhật: ${editPlayerName} (#${editPlayerJersey} - ${editPlayerPos}), MSSV: ${editPlayerStudentId}`
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner Card */}
      <div className="bg-[#0B132B] border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-emerald-500/20 text-emerald-400 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
              HỒ SƠ ĐỘI BÓNG & CẦU THỦ
            </span>
            <span className="text-xs text-slate-400">Quy định Điều 14, 15 & 16</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Danh Sách Đội & Đăng Ký Cầu Thủ
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Quy tắc: Tối đa 16 đội, 12 cầu thủ/đội, không trùng số áo, một cầu thủ chỉ được đá cho một đội duy nhất.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Nút thêm đội bóng: CHỈ DÀNH RIÊNG CHO BTC/ADMIN theo yêu cầu */}
          {isOrganizerOrAdmin && (
            <button
              onClick={() => {
                setNewCaptainUsername(AuthService.generateCaptainUsername(newTeamShortName || ''));
                setTeamModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>+ Đăng Ký Đội Mới (BTC)</span>
            </button>
          )}

          {/* Group Filter */}
          <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 flex-wrap">
            <button
              onClick={() => setFilterGroup('ALL')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                filterGroup === 'ALL'
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Tất Cả ({groups.length} Bảng)
            </button>
            {groups.map((g) => (
              <button
                key={g}
                onClick={() => setFilterGroup(g)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  filterGroup === g
                    ? 'bg-emerald-500 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Bảng {g}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* When 0 teams exist: Friendly Empty State */}
      {teams.length === 0 ? (
        <div className="bg-[#0B132B]/90 border border-slate-800 rounded-3xl p-12 text-center shadow-xl space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto text-3xl">
            ⚽
          </div>
          <h3 className="text-xl font-bold text-white">Chưa Có Đội Bóng Nào Trong Cơ Sở Dữ Liệu</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {isOrganizerOrAdmin
              ? 'Dữ liệu giải đấu đang chờ tạo. Là Ban Tổ Chức, bạn có thể tạo trước các đội bóng tham gia và hệ thống sẽ tự động cấp tài khoản cho từng Đội trưởng.'
              : 'Ban Tổ Chức đang trong quá trình khởi tạo danh sách các đội bóng tham dự giải.'}
          </p>
          {isOrganizerOrAdmin && (
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setTeamModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>+ Đăng Ký Đội Bóng Đầu Tiên (BTC)</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Main Layout: Left Team Selector & Right Selected Team Profile */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Team List (4 Cols) */}
          <div className="lg:col-span-4 space-y-2.5 max-h-[750px] overflow-y-auto pr-1">
            {teams
              .filter((t) => filterGroup === 'ALL' || t.group === filterGroup)
              .map((t) => {
                const isSelected = t.id === selectedTeam?.id;
                const isWithdrawn = t.status === 'WITHDRAWN';
                const isThisMyTeam = isCaptain && currentUser?.teamId === t.id;

                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTeamId(t.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? isThisMyTeam
                          ? 'bg-emerald-950/40 border-emerald-400 shadow-lg shadow-emerald-500/20'
                          : 'bg-slate-800/90 border-emerald-500 shadow-lg shadow-emerald-500/10'
                        : isThisMyTeam
                        ? 'bg-emerald-950/20 border-emerald-600/40 hover:bg-emerald-900/30'
                        : 'bg-[#0B132B]/80 border-slate-800 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3.5 h-3.5 rounded-full border"
                          style={{ backgroundColor: t.primaryColor, borderColor: t.secondaryColor }}
                        ></span>
                        <span className="text-xs font-black text-white">{t.name}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {isThisMyTeam && (
                          <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-emerald-500 text-slate-950 shadow-sm animate-pulse">
                            ⭐ ĐỘI CỦA BẠN
                          </span>
                        )}
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-900 text-emerald-400 border border-slate-700">
                          Bảng {t.group || '?'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Lớp {t.class}</span>
                      <div className="flex items-center gap-2">
                        <span>{t.players.length}/12 cầu thủ</span>
                        {isWithdrawn && (
                          <span className="text-[9px] bg-red-500/20 text-red-400 px-1 rounded font-bold">
                            BỎ CUỘC
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Right: Selected Team Detail & Jersey Showcase (8 Cols) */}
          {selectedTeam && (
            <div className="lg:col-span-8 space-y-6">
              
              {/* Alert thông báo phân quyền cho Đội trưởng khi đang xem đội khác */}
              {isCaptain && !isMyTeam && (
                <div className="p-3.5 rounded-2xl bg-amber-950/60 border border-amber-500/40 text-amber-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
                    <div>
                      <strong>Chế độ xem chỉ đọc:</strong> Bạn là Đội trưởng của đội <strong>{currentUser?.teamName || 'đội khác'}</strong>. Theo phân quyền, bạn không được phép thêm hoặc sửa thành viên của đội bóng khác.
                    </div>
                  </div>
                  {currentUser?.teamId && (
                    <button
                      onClick={() => setSelectedTeamId(currentUser.teamId!)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold whitespace-nowrap text-xs flex items-center gap-1.5 self-start sm:self-auto transition-all"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                      <span>« Chuyển Về Đội Của Bạn</span>
                    </button>
                  )}
                </div>
              )}

              {/* Team Hero Header with athletic match photo */}
              <div className="relative rounded-3xl overflow-hidden border-2 border-slate-700/80 bg-slate-950 p-6 shadow-2xl backdrop-blur-md">
                <div 
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20 transform scale-105 pointer-events-none"
                  style={{ backgroundImage: `url('/images/futsal-action.jpg')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-900/80 pointer-events-none" />

                <div className="relative z-10 space-y-4">
                  {/* Top Row: Team Identity & Action Buttons */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      {/* Jersey Visualizer Graphic */}
                      <div 
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex flex-col items-center justify-center border-2 shadow-xl shrink-0"
                        style={{ backgroundColor: selectedTeam.primaryColor, borderColor: selectedTeam.secondaryColor }}
                      >
                        <Shirt className="w-6 h-6 text-white drop-shadow" />
                        <span className="text-[11px] font-black font-mono text-white drop-shadow">#10</span>
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-xl sm:text-2xl font-black text-white tracking-wide">
                            {selectedTeam.name}
                          </h3>
                          <span className="text-xs bg-emerald-950 text-emerald-300 border border-emerald-500/50 px-2.5 py-0.5 rounded font-mono font-bold">
                            BẢNG {selectedTeam.group || 'CHƯA GÁN'}
                          </span>
                          {isMyTeam && (
                            <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/60 px-2.5 py-0.5 rounded-full font-bold">
                              ⭐ ĐỘI CỦA BẠN (Toàn quyền quản lý)
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-300 mt-1 font-medium">
                          {selectedTeam.department?.toLowerCase().startsWith('khoa') ? selectedTeam.department : `Khoa ${selectedTeam.department}`} • Lớp {selectedTeam.class}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-200">
                          <span>Trưởng đoàn: <strong className="text-white">{selectedTeam.leaderName}</strong></span>
                          <span className="text-slate-500">•</span>
                          <span>Đội trưởng: <strong className="text-white">{selectedTeam.captainName}</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* Team Controls: Phân quyền rõ ràng */}
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Sửa đội / Đổi bảng: CHỈ DÀNH CHO BTC/ADMIN */}
                      {isOrganizerOrAdmin && (
                        <button
                          onClick={handleOpenEditTeam}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs border border-slate-700 transition-all shadow-md"
                          title="BTC sửa tên đội, đổi bảng đấu, màu áo"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Sửa Đội / Đổi Bảng</span>
                        </button>
                      )}

                      {/* Thêm cầu thủ: BTC HOẶC Đội trưởng đội mình */}
                      {canManageThisTeamPlayers && (
                        <button
                          onClick={() => setPlayerModalOpen(true)}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>{isMyTeam ? '+ Thêm Cầu Thủ Đội Mình' : '+ Thêm Cầu Thủ'}</span>
                        </button>
                      )}

                      {/* Báo bỏ cuộc: CHỈ DÀNH CHO BTC */}
                      {isOrganizerOrAdmin && (
                        <button
                          onClick={() => handleToggleWithdrawn(selectedTeam.id)}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                            selectedTeam.status === 'WITHDRAWN'
                              ? 'bg-emerald-950 text-emerald-400 border-emerald-500/40 hover:bg-emerald-900/60'
                              : 'bg-red-950/80 text-red-300 border-red-500/50 hover:bg-red-900/60'
                          }`}
                          title="Quy định Điều 13: Xử lý đội bỏ cuộc"
                        >
                          <Ban className="w-3.5 h-3.5" />
                          <span>{selectedTeam.status === 'WITHDRAWN' ? 'Hồi Phục Đội' : 'Báo Bỏ Cuộc (Điều 13)'}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Section: Hộp Tài Khoản Đội Trưởng & Trạng Thái Quyền */}
                  {isMyTeam ? (
                    <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/90 via-emerald-900/50 to-teal-950/90 border-2 border-emerald-500/60 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/40">
                          <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-white">⭐ BẠN ĐANG ĐĂNG NHẬP VỚI TƯ CÁCH ĐỘI TRƯỞNG</span>
                            <span className="px-2 py-0.5 rounded-md bg-emerald-500/30 text-emerald-300 border border-emerald-500/50 text-[10px] font-bold">
                              ĐÃ KÍCH HOẠT
                            </span>
                          </div>
                          <p className="text-xs text-emerald-200/90 mt-0.5">
                            Bạn có toàn quyền thêm mới, cập nhật số áo, vị trí và thông tin cầu thủ cho đội <strong>{selectedTeam.name}</strong>.
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setPlayerModalOpen(true)}
                        className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/30 flex items-center gap-1.5 self-start sm:self-auto transition-all active:scale-95"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Thêm Cầu Thủ</span>
                      </button>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-2xl bg-slate-950/90 border-2 border-emerald-500/40 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                      <div className="flex items-start sm:items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/40 mt-0.5 sm:mt-0">
                          <KeyRound className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs sm:text-sm font-bold text-white">Tài khoản Đội trưởng:</span>
                            <code className="px-2.5 py-1 rounded-lg bg-emerald-950/90 text-emerald-300 border border-emerald-500/50 font-mono font-bold text-xs sm:text-sm tracking-wide">
                              {captainUsername}
                            </code>
                            <span className="text-slate-500">•</span>
                            <span className="text-xs sm:text-sm font-medium text-slate-300">Mật khẩu:</span>
                            <code className="px-2.5 py-1 rounded-lg bg-slate-900 text-amber-300 border border-amber-500/50 font-mono font-bold text-xs sm:text-sm">
                              123
                            </code>
                          </div>
                          <p className="text-[11px] text-slate-300 mt-1">
                            💡 Đội trưởng có thể đăng nhập bằng tài khoản <strong className="text-emerald-400 font-mono">{captainUsername}</strong> hoặc nhập trực tiếp tên đội <strong className="text-emerald-400 font-mono">"{selectedTeam.name}"</strong> (mật khẩu: 123) để vào thêm/sửa cầu thủ.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-start lg:self-auto shrink-0">
                        <button
                          onClick={() => {
                            const text = `TÀI KHOẢN ĐỘI TRƯỞNG - ĐỘI ${selectedTeam.name.toUpperCase()}\nTài khoản: ${captainUsername}\nMật khẩu: 123\nĐội trưởng có thể đăng nhập bằng tài khoản hoặc tên đội "${selectedTeam.name}" để cập nhật danh sách cầu thủ.`;
                            navigator.clipboard.writeText(text);
                            setHeaderCopied(true);
                            setTimeout(() => setHeaderCopied(false), 2000);
                          }}
                          className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all"
                          title="Sao chép tài khoản và mật khẩu cho Đội trưởng"
                        >
                          {headerCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{headerCopied ? 'Đã Sao Chép' : 'Sao Chép'}</span>
                        </button>

                        {onOpenAuthModal && (
                          <button
                            onClick={() => onOpenAuthModal(undefined, captainUsername, '123')}
                            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/30 flex items-center gap-1.5 transition-all active:scale-95"
                            title="Đăng nhập ngay vào tài khoản Đội trưởng đội này"
                          >
                            <LogIn className="w-3.5 h-3.5" />
                            <span>Đăng Nhập Đội Trưởng</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Section: 4 Stat Cards hiển thị rõ ràng, tương phản cao, sắc nét */}
                  <div className="pt-2 border-t border-slate-700/60 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    {/* Đội Hình Đăng Ký */}
                    <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-700/80 shadow-lg hover:border-emerald-500/50 transition-all flex flex-col justify-between">
                      <div className="flex items-center justify-between text-slate-300 mb-1.5">
                        <span className="text-xs font-semibold text-slate-300">Đội Hình Đăng Ký</span>
                        <Users className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
                          {selectedTeam.players.length}
                        </span>
                        <span className="text-xs font-semibold text-slate-300 font-mono">/ 12 Cầu thủ</span>
                      </div>
                      <span className="text-[10px] font-medium text-emerald-300/80 mt-1 block">
                        {selectedTeam.players.length >= 5 ? '✓ Đủ tối thiểu 5 cầu thủ' : 'Cần tối thiểu 5 cầu thủ'}
                      </span>
                    </div>

                    {/* Bảng Thi Đấu */}
                    <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-700/80 shadow-lg hover:border-cyan-500/50 transition-all flex flex-col justify-between">
                      <div className="flex items-center justify-between text-slate-300 mb-1.5">
                        <span className="text-xs font-semibold text-slate-300">Bảng Thi Đấu</span>
                        <Shirt className="w-4 h-4 text-cyan-400" />
                      </div>
                      <div className="text-lg sm:text-xl font-black text-cyan-300 font-mono">
                        {selectedTeam.group ? `BẢNG ${selectedTeam.group}` : 'CHƯA CHIA BẢNG'}
                      </div>
                      <span className="text-[10px] font-medium text-cyan-300/80 mt-1 block">
                        {selectedTeam.group ? 'Vòng Bảng Chính Thức' : 'Chờ bốc thăm chia bảng'}
                      </span>
                    </div>

                    {/* Hồ Sơ Đội Bóng */}
                    <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-700/80 shadow-lg hover:border-emerald-500/50 transition-all flex flex-col justify-between">
                      <div className="flex items-center justify-between text-slate-300 mb-1.5">
                        <span className="text-xs font-semibold text-slate-300">Hồ Sơ Đội Bóng</span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div>
                        {selectedTeam.status === 'APPROVED' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-950/90 text-emerald-300 border border-emerald-500/50 font-bold text-xs">
                            ✓ ĐÃ DUYỆT HỢP LỆ
                          </span>
                        ) : selectedTeam.status === 'WITHDRAWN' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-950/90 text-red-300 border border-red-500/50 font-bold text-xs">
                            BỎ CUỘC (ĐIỀU 13)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-950/90 text-amber-300 border border-amber-500/50 font-bold text-xs">
                            CHỜ PHÊ DUYỆT
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-medium text-slate-400 mt-1 block">
                        Theo Điều lệ Giải đấu
                      </span>
                    </div>

                    {/* Chi Đoàn / Lớp */}
                    <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-700/80 shadow-lg hover:border-blue-500/50 transition-all flex flex-col justify-between">
                      <div className="flex items-center justify-between text-slate-300 mb-1.5">
                        <span className="text-xs font-semibold text-slate-300">Chi Đoàn / Đơn Vị</span>
                        <Users className="w-4 h-4 text-blue-400" />
                      </div>
                      <div className="text-sm font-black text-white truncate" title={selectedTeam.class || 'Khoa CNTT'}>
                        {selectedTeam.class || 'Khoa CNTT'}
                      </div>
                      <span className="text-[10px] font-medium text-slate-300 truncate mt-1 block" title={selectedTeam.department}>
                        {selectedTeam.department?.toLowerCase().startsWith('khoa') ? selectedTeam.department : `Khoa ${selectedTeam.department}`}
                      </span>
                    </div>
                  </div>

                  {/* Strip Tài Chính: Chỉ hiển thị cho Super Admin & BTC */}
                  {isOrganizerOrAdmin && (
                    <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="p-3 rounded-2xl bg-slate-950/90 border border-slate-800 shadow-md">
                        <span className="text-[11px] font-semibold text-slate-400 block mb-1">Lệ Phí Thi Đấu</span>
                        <span className="font-mono font-bold text-base text-emerald-400 block">
                          {selectedTeam.registrationFee.toLocaleString()} đ
                        </span>
                        <span className="text-[10px] text-slate-500">Quy định Điều lệ</span>
                      </div>
                      <div className="p-3 rounded-2xl bg-slate-950/90 border border-slate-800 shadow-md">
                        <span className="text-[11px] font-semibold text-slate-400 block mb-1">Ký Quỹ Điều Lệ</span>
                        <span className="font-mono font-bold text-base text-cyan-400 block">
                          {selectedTeam.depositFee.toLocaleString()} đ
                        </span>
                        <span className="text-[10px] text-slate-500">Ký quỹ kỷ luật</span>
                      </div>
                      <div className="p-3 rounded-2xl bg-slate-950/90 border border-slate-800 shadow-md">
                        <span className="text-[11px] font-semibold text-slate-400 block mb-1">Trạng Thái Đóng Phí</span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md font-bold text-xs ${
                          selectedTeam.feeStatus === 'PAID'
                            ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-500/40'
                            : 'bg-amber-950/90 text-amber-300 border border-amber-500/40'
                        }`}>
                          {selectedTeam.feeStatus === 'PAID' ? '✓ Đã Thanh Toán' : 'Chưa Thanh Toán'}
                        </span>
                        <span className="text-[10px] text-slate-500 block mt-1">BTC xác nhận</span>
                      </div>
                      <div className="p-3 rounded-2xl bg-slate-950/90 border border-slate-800 shadow-md">
                        <span className="text-[11px] font-semibold text-slate-400 block mb-1">Chỉ Số Nhân Sự</span>
                        <span className="font-mono font-bold text-base text-white block">
                          {selectedTeam.players.length} / 12 Cầu thủ
                        </span>
                        <span className="text-[10px] text-slate-500">Tối đa 12 người</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Players Table */}
              <div className="bg-[#0B132B]/90 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-sm font-black text-white">
                      Danh Sách Đăng Ký Cầu Thủ ({selectedTeam.players.length}/12)
                    </h4>
                  </div>
                  <span className="text-xs text-slate-400">
                    {canManageThisTeamPlayers ? 'Bạn có quyền quản lý thành viên đội này' : 'Chế độ chỉ đọc'}
                  </span>
                </div>

                {selectedTeam.players.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-xs">
                    Chưa có cầu thủ nào trong danh sách.
                    {canManageThisTeamPlayers && (
                      <span> Bấm <strong>&quot;+ Thêm Cầu Thủ&quot;</strong> để đăng ký thành viên.</span>
                    )}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-950/60 text-slate-400 font-bold border-b border-slate-800 text-[11px]">
                        <tr>
                          <th className="py-3 px-3 text-center w-12">SỐ ÁO</th>
                          <th className="py-3 px-3">HỌ VÀ TÊN</th>
                          <th className="py-3 px-3">MSSV</th>
                          <th className="py-3 px-2 text-center">VỊ TRÍ</th>
                          <th className="py-3 px-2 text-center">KHÓA</th>
                          <th className="py-3 px-2 text-center">BÀN THẮNG</th>
                          <th className="py-3 px-2 text-center">THẺ PHẠT</th>
                          <th className="py-3 px-3 text-center">TRẠNG THÁI</th>
                          {canManageThisTeamPlayers && (
                            <th className="py-3 px-3 text-center w-24">THAO TÁC</th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {selectedTeam.players.map((p) => (
                          <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                            <td className="py-3 px-3 text-center font-mono font-black text-emerald-400">
                              #{p.jerseyNumber}
                            </td>
                            <td className="py-3 px-3 font-semibold text-white">
                              {p.name}
                            </td>
                            <td className="py-3 px-3 font-mono text-slate-400">{p.studentId}</td>
                            <td className="py-3 px-2 text-center">
                              <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-slate-800 text-cyan-300">
                                {p.position}
                              </span>
                            </td>
                            <td className="py-3 px-2 text-center text-slate-400">{p.cohort}</td>
                            <td className="py-3 px-2 text-center font-mono font-bold text-emerald-400">
                              {p.goals > 0 ? `⚽ ${p.goals}` : '-'}
                            </td>
                            <td className="py-3 px-2 text-center font-mono">
                              {p.yellowCards > 0 && <span className="text-amber-400 mr-1">{p.yellowCards}🟨</span>}
                              {p.redCards > 0 && <span className="text-red-400">{p.redCards}🟥</span>}
                              {p.yellowCards === 0 && p.redCards === 0 && <span className="text-slate-600">-</span>}
                            </td>
                            <td className="py-3 px-3 text-center">
                              {p.isSuspended ? (
                                <span 
                                  className="inline-flex items-center gap-1 text-[10px] font-bold text-red-400 bg-red-950/60 border border-red-500/40 px-2 py-0.5 rounded-full"
                                  title={p.suspensionReason}
                                >
                                  🔒 TREO GIÒ
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                                  ✓ HỢP LỆ
                                </span>
                              )}
                            </td>
                            {canManageThisTeamPlayers && (
                              <td className="py-3 px-3 text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    onClick={() => handleOpenEditPlayer(p)}
                                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition-colors"
                                    title="Sửa thông tin cầu thủ"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeletePlayer(p.id)}
                                    className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 text-red-400 border border-red-500/30 transition-colors"
                                    title="Xóa cầu thủ khỏi đội"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>
      )}

      {/* Modal 1: Register New Team (Rule #14) */}
      {teamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Shirt className="w-5 h-5 text-emerald-400" />
                Đăng Ký Đội Bóng Mới (Điều 14)
              </h3>
              <button
                onClick={() => setTeamModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Tên Đội Bóng</label>
              <input
                type="text"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                placeholder="VD: CNTT K22 Chiến Binh"
                className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl p-2.5"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Tên Viết Tắt (Short Name)</label>
                <input
                  type="text"
                  value={newTeamShortName}
                  onChange={(e) => handleShortNameChange(e.target.value)}
                  placeholder="VD: CNTT-K22"
                  className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl p-2.5 font-bold uppercase"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Chi Đoàn / Lớp</label>
                <input
                  type="text"
                  value={newTeamClass}
                  onChange={(e) => setNewTeamClass(e.target.value)}
                  placeholder="VD: 22CNTT1"
                  className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl p-2.5"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Trưởng Đoàn</label>
                <input
                  type="text"
                  value={newTeamLeader}
                  onChange={(e) => setNewTeamLeader(e.target.value)}
                  placeholder="VD: ThS. Lê Văn Hùng"
                  className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl p-2.5"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Đội Trưởng</label>
                <input
                  type="text"
                  value={newTeamCaptain}
                  onChange={(e) => setNewTeamCaptain(e.target.value)}
                  placeholder="VD: Nguyễn Văn Nam"
                  className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl p-2.5"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Số Điện Thoại</label>
                <input
                  type="text"
                  value={newTeamPhone}
                  onChange={(e) => setNewTeamPhone(e.target.value)}
                  placeholder="09..."
                  className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl p-2.5"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Bảng Đấu (Tùy Chọn)</label>
                <select
                  value={newTeamGroup}
                  onChange={(e) => setNewTeamGroup(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl p-2.5"
                >
                  <option value="NONE">Chờ Bốc Thăm Sau</option>
                  {groups.map((g) => (
                    <option key={g} value={g}>Bảng {g}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Màu Áo Chính (Hex)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={newTeamPrimaryColor}
                    onChange={(e) => setNewTeamPrimaryColor(e.target.value)}
                    className="w-9 h-9 rounded cursor-pointer bg-transparent"
                  />
                  <span className="font-mono text-xs text-slate-300">{newTeamPrimaryColor}</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Màu Áo Phụ / Viền</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={newTeamSecondaryColor}
                    onChange={(e) => setNewTeamSecondaryColor(e.target.value)}
                    className="w-9 h-9 rounded cursor-pointer bg-transparent"
                  />
                  <span className="font-mono text-xs text-slate-300">{newTeamSecondaryColor}</span>
                </div>
              </div>
            </div>

            {/* Khung Tự Động Tạo Tài Khoản Cho Đội Trưởng */}
            <div className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 space-y-2">
              <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs">
                <KeyRound className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Tự Động Cấp Tài Khoản Cho Đội Trưởng Đội Bóng</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Hệ thống sẽ tự động tạo tài khoản này với vai trò Đội Trưởng để bàn giao cho đội bóng vào tự thêm thành viên của đội mình:
              </p>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Tài khoản (Username)</label>
                  <input
                    type="text"
                    value={newCaptainUsername}
                    onChange={(e) => setNewCaptainUsername(e.target.value)}
                    placeholder="captain_..."
                    className="w-full bg-slate-900 border border-slate-700 text-cyan-300 font-mono text-xs rounded-xl p-2 font-bold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Mật khẩu khởi tạo</label>
                  <input
                    type="text"
                    value={newCaptainPassword}
                    onChange={(e) => setNewCaptainPassword(e.target.value)}
                    placeholder="123"
                    className="w-full bg-slate-900 border border-slate-700 text-emerald-400 font-mono text-xs rounded-xl p-2 font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setTeamModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleCreateTeam}
                disabled={!newTeamName || !newTeamShortName}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 active:scale-95"
              >
                Tạo Đội Bóng &amp; Cấp Tài Khoản Đội Trưởng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Thông Báo Tạo Đội & Tài Khoản Đội Trưởng Thành Công (Cho BTC copy gửi Đội trưởng) */}
      {createdCaptainModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 shadow-2xl space-y-4 text-center animate-in fade-in zoom-in-95">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto text-2xl">
              🎉
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Đã Tạo Đội Bóng &amp; Cấp Tài Khoản Đội Trưởng!</h3>
              <p className="text-xs text-slate-400 mt-1">
                Đội bóng <strong>{createdCaptainModal.teamName}</strong> đã được lưu thành công vào cơ sở dữ liệu.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-left space-y-2 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Tên đội bóng:</span>
                <span className="font-bold text-white">{createdCaptainModal.teamName}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Đội trưởng:</span>
                <span className="font-bold text-white">{createdCaptainModal.captainName || 'Chưa đặt tên'}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Tên đăng nhập:</span>
                <span className="font-mono font-black text-cyan-300">@{createdCaptainModal.username}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400">Mật khẩu đăng nhập:</span>
                <span className="font-mono font-black text-emerald-400">{createdCaptainModal.password}</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400">
              Hãy bấm nút bên dưới để sao chép thông tin tài khoản và gửi cho Đội trưởng. Đội trưởng có quyền thêm và chỉnh sửa thành viên của đội mình.
            </p>

            <div className="flex flex-col gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  const text = `TÀI KHOẢN ĐỘI TRƯỞNG - GIẢI BÓNG ĐÁ ITFTMS 2026\nĐội bóng: ${createdCaptainModal.teamName}\nTài khoản: ${createdCaptainModal.username}\nMật khẩu: ${createdCaptainModal.password}\nĐội trưởng đăng nhập vào website để cập nhật danh sách cầu thủ của đội mình.`;
                  navigator.clipboard.writeText(text);
                  setCopiedCaptainCreds(true);
                  setTimeout(() => setCopiedCaptainCreds(false), 2500);
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all active:scale-95"
              >
                {copiedCaptainCreds ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
                <span>{copiedCaptainCreds ? '✓ Đã Sao Chép Vào Bộ Nhớ Tạm!' : 'Sao Chép Thông Tin Bàn Giao Cho Đội Trưởng'}</span>
              </button>

              <button
                type="button"
                onClick={() => setCreatedCaptainModal(null)}
                className="w-full py-2 px-4 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Add Player (Rule #15) */}
      {playerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-400" />
                Đăng Ký Cầu Thủ Mới (Điều 15)
              </h3>
              <button
                onClick={() => setPlayerModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Họ và tên cầu thủ</label>
              <input
                type="text"
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                placeholder="VD: Nguyễn Văn Hoàng"
                className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl p-2.5"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Mã sinh viên (MSSV)</label>
                <input
                  type="text"
                  value={newPlayerStudentId}
                  onChange={(e) => setNewPlayerStudentId(e.target.value)}
                  placeholder="VD: 23520099"
                  className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl p-2.5 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Khóa sinh viên</label>
                <select
                  value={newPlayerCohort}
                  onChange={(e) => setNewPlayerCohort(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl p-2.5"
                >
                  <option value="K23">Khóa K23 (2023)</option>
                  <option value="K24">Khóa K24 (2024)</option>
                  <option value="K25">Khóa K25 (2025)</option>
                  <option value="K26">Khóa K26 (2026)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Số áo (1 - 99)</label>
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={newPlayerJersey}
                  onChange={(e) => setNewPlayerJersey(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl p-2.5 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Vị trí thi đấu</label>
                <select
                  value={newPlayerPos}
                  onChange={(e) => setNewPlayerPos(e.target.value as PlayerPosition)}
                  className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl p-2.5"
                >
                  <option value="GK">Thủ Môn (GK)</option>
                  <option value="DF">Hậu Vệ (DF)</option>
                  <option value="MF">Tiền Vệ (MF)</option>
                  <option value="FW">Tiền Đạo (FW)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPlayerModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleAddPlayer}
                disabled={!newPlayerName || !newPlayerStudentId}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 active:scale-95"
              >
                Lưu Hồ Sơ Cầu Thủ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Edit Team & Group - CHỈ DÀNH CHO BTC */}
      {editTeamModalOpen && isOrganizerOrAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-cyan-400" />
                Chỉnh Sửa Đội Bóng &amp; Bảng Đấu (BTC)
              </h3>
              <button
                onClick={() => setEditTeamModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Tên Đội Bóng</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl p-2.5 font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Tên Viết Tắt</label>
                <input
                  type="text"
                  value={editShortName}
                  onChange={(e) => setEditShortName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl p-2.5 font-mono uppercase"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Chi Đoàn / Lớp</label>
                <input
                  type="text"
                  value={editClass}
                  onChange={(e) => setEditClass(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl p-2.5"
                />
              </div>
            </div>

            {/* Direct Group Selection! */}
            <div className="p-3 rounded-xl bg-slate-950/80 border border-cyan-500/40 space-y-1">
              <label className="text-xs font-bold text-cyan-300 block">
                Phân Bảng Đấu ({groups.join(', ')})
              </label>
              <select
                value={editGroup}
                onChange={(e) => setEditGroup(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl p-2.5 font-bold"
              >
                <option value="NONE">-- Chưa Phân Bảng (Hộp Chờ) --</option>
                {groups.map((g) => (
                  <option key={g} value={g}>BẢNG {g}</option>
                ))}
              </select>
              <p className="text-[10px] text-slate-400">
                Bạn có thể tự do chỉ định hoặc đổi bảng đấu cho đội bóng này bất cứ lúc nào.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Trưởng Đoàn</label>
                <input
                  type="text"
                  value={editLeader}
                  onChange={(e) => setEditLeader(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl p-2.5"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Đội Trưởng</label>
                <input
                  type="text"
                  value={editCaptain}
                  onChange={(e) => setEditCaptain(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl p-2.5"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Màu Áo Chính</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={editPrimaryColor}
                    onChange={(e) => setEditPrimaryColor(e.target.value)}
                    className="w-9 h-9 rounded cursor-pointer bg-transparent"
                  />
                  <span className="font-mono text-xs text-slate-300">{editPrimaryColor}</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Màu Áo Phụ</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={editSecondaryColor}
                    onChange={(e) => setEditSecondaryColor(e.target.value)}
                    className="w-9 h-9 rounded cursor-pointer bg-transparent"
                  />
                  <span className="font-mono text-xs text-slate-300">{editSecondaryColor}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setEditTeamModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveEditTeam}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold shadow-lg"
              >
                Lưu Thay Đổi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 4: Edit Player (Cầu thủ) - Cho BTC hoặc Đội trưởng đội mình */}
      {editPlayerModalOpen && editingPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-cyan-400" />
                Chỉnh Sửa Thông Tin Cầu Thủ
              </h3>
              <button
                onClick={() => {
                  setEditPlayerModalOpen(false);
                  setEditingPlayer(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Họ và tên cầu thủ</label>
              <input
                type="text"
                value={editPlayerName}
                onChange={(e) => setEditPlayerName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl p-2.5 font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Mã sinh viên (MSSV)</label>
                <input
                  type="text"
                  value={editPlayerStudentId}
                  onChange={(e) => setEditPlayerStudentId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl p-2.5 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Khóa sinh viên</label>
                <select
                  value={editPlayerCohort}
                  onChange={(e) => setEditPlayerCohort(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl p-2.5"
                >
                  <option value="K23">Khóa K23 (2023)</option>
                  <option value="K24">Khóa K24 (2024)</option>
                  <option value="K25">Khóa K25 (2025)</option>
                  <option value="K26">Khóa K26 (2026)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Số áo (1 - 99)</label>
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={editPlayerJersey}
                  onChange={(e) => setEditPlayerJersey(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl p-2.5 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Vị trí thi đấu</label>
                <select
                  value={editPlayerPos}
                  onChange={(e) => setEditPlayerPos(e.target.value as PlayerPosition)}
                  className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl p-2.5"
                >
                  <option value="GK">Thủ Môn (GK)</option>
                  <option value="DF">Hậu Vệ (DF)</option>
                  <option value="MF">Tiền Vệ (MF)</option>
                  <option value="FW">Tiền Đạo (FW)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setEditPlayerModalOpen(false);
                  setEditingPlayer(null);
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveEditPlayer}
                disabled={!editPlayerName || !editPlayerStudentId}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold shadow-lg active:scale-95"
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
