'use client';

import React, { useState } from 'react';
import { Team, Player, UserRole, PlayerPosition, TeamStatus, Tournament, getGroupLetters } from '@/types';
import { StorageService } from '@/services/storage';
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
  Edit3
} from 'lucide-react';

interface TeamsViewProps {
  teams: Team[];
  onTeamsUpdate: (teams: Team[]) => void;
  currentRole: UserRole;
  tournament?: Tournament;
}

export const TeamsView: React.FC<TeamsViewProps> = ({
  teams,
  onTeamsUpdate,
  currentRole,
  tournament,
}) => {
  const groups = getGroupLetters(tournament?.numberOfGroups || 4);
  const [selectedTeamId, setSelectedTeamId] = useState<string>(teams[0]?.id || '');
  const [filterGroup, setFilterGroup] = useState<string>('ALL');

  // Team registration modal state (Rule #14)
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

  // Player registration modal state (Rule #15)
  const [playerModalOpen, setPlayerModalOpen] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerStudentId, setNewPlayerStudentId] = useState('');
  const [newPlayerClass, setNewPlayerClass] = useState('');
  const [newPlayerCohort, setNewPlayerCohort] = useState('K23');
  const [newPlayerDob, setNewPlayerDob] = useState('2004-05-15');
  const [newPlayerJersey, setNewPlayerJersey] = useState<number>(10);
  const [newPlayerPos, setNewPlayerPos] = useState<PlayerPosition>('FW');

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
  const canManage = currentRole === 'SUPER_ADMIN' || currentRole === 'ORGANIZER' || currentRole === 'TEAM_MANAGER';

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

  // Add new team (Rule #14)
  const handleCreateTeam = () => {
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
      name: newTeamName,
      shortName: newTeamShortName.toUpperCase(),
      logo: `⚽ ${newTeamShortName.toUpperCase()}`,
      class: newTeamClass,
      department: newTeamDept,
      leaderName: newTeamLeader || 'Trưởng đoàn',
      captainName: newTeamCaptain || 'Đội trưởng',
      phoneNumber: newTeamPhone || '0900000000',
      email: newTeamEmail || `${newTeamShortName.toLowerCase()}@uit.edu.vn`,
      primaryColor: newTeamPrimaryColor,
      secondaryColor: newTeamSecondaryColor,
      status: 'APPROVED',
      feeStatus: 'UNPAID',
      registrationFee: 500000,
      depositFee: 50000,
      group: newTeamGroup !== 'NONE' ? newTeamGroup : undefined,
      players: [],
    };

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

    StorageService.logAction(
      currentRole,
      currentRole,
      'ĐĂNG KÝ ĐỘI BÓNG MỚI',
      newTeam.name,
      `Đăng ký thành công đội ${newTeam.name} (${newTeam.shortName}), Lớp ${newTeam.class}, Khoa ${newTeam.department}.`
    );
  };

  // Add new player to team (Rule #15: max 12 players, no duplicate jersey numbers)
  const handleAddPlayer = () => {
    if (!selectedTeam) return;

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
      name: newPlayerName,
      studentId: newPlayerStudentId,
      class: newPlayerClass || selectedTeam.class,
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
      currentRole,
      currentRole,
      'ĐĂNG KÝ CẦU THỦ MỚI',
      selectedTeam.name,
      `Thêm cầu thủ: ${newPlayer.name} (#${newPlayer.jerseyNumber} - ${newPlayer.position}), MSSV: ${newPlayer.studentId}`
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
          {canManage && (
            <button
              onClick={() => setTeamModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>+ Đăng Ký Đội Mới (Điều 14)</span>
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
            Dữ liệu mẫu đã được xóa sạch. Bạn có thể bắt đầu đăng ký các đội bóng sinh viên mới tham gia giải, hoặc nhấn nút nạp dữ liệu mẫu trên thanh Header để kiểm tra thử nghiệm.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setTeamModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>+ Đăng Ký Đội Bóng Đầu Tiên</span>
            </button>
          </div>
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

                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTeamId(t.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-slate-800/90 border-emerald-500 shadow-lg shadow-emerald-500/10'
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

                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-900 text-emerald-400 border border-slate-700">
                        Bảng {t.group || '?'}
                      </span>
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
              
              {/* Team Hero Header */}
              <div className="bg-[#0B132B]/90 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  
                  <div className="flex items-center gap-4">
                    {/* Jersey Visualizer Graphic */}
                    <div 
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex flex-col items-center justify-center border-2 shadow-xl"
                      style={{ backgroundColor: selectedTeam.primaryColor, borderColor: selectedTeam.secondaryColor }}
                    >
                      <Shirt className="w-6 h-6 text-white drop-shadow" />
                      <span className="text-[11px] font-black font-mono text-white drop-shadow">#10</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl sm:text-2xl font-black text-white">
                          {selectedTeam.name}
                        </h3>
                        <span className="text-xs bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded font-mono font-bold">
                          BẢNG {selectedTeam.group || 'CHƯA GÁN'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        Khoa {selectedTeam.department} • Lớp {selectedTeam.class}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-300">
                        <span>Trưởng đoàn: <strong>{selectedTeam.leaderName}</strong></span>
                        <span>•</span>
                        <span>Đội trưởng: <strong>{selectedTeam.captainName}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Team Controls */}
                  <div className="flex flex-wrap items-center gap-2">
                    {canManage && (
                      <>
                        <button
                          onClick={handleOpenEditTeam}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs border border-slate-700 transition-all"
                          title="Sửa tên đội, đổi bảng đấu, màu áo"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Sửa Đội / Đổi Bảng</span>
                        </button>
                        <button
                          onClick={() => setPlayerModalOpen(true)}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>+ Thêm Cầu Thủ</span>
                        </button>
                      </>
                    )}

                    {(currentRole === 'SUPER_ADMIN' || currentRole === 'ORGANIZER') && (
                      <button
                        onClick={() => handleToggleWithdrawn(selectedTeam.id)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                          selectedTeam.status === 'WITHDRAWN'
                            ? 'bg-emerald-950 text-emerald-400 border-emerald-500/40 hover:bg-emerald-900/60'
                            : 'bg-red-950/60 text-red-300 border-red-500/40 hover:bg-red-900/60'
                        }`}
                        title="Quy định Điều 13: Xử lý đội bỏ cuộc"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        <span>{selectedTeam.status === 'WITHDRAWN' ? 'Hồi Phục Đội' : 'Báo Bỏ Cuộc (Điều 13)'}</span>
                      </button>
                    )}
                  </div>

                </div>

                {/* Financial & Fee Status Strip */}
                <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Lệ Phí Thi Đấu</span>
                    <span className="font-mono font-bold text-emerald-400">
                      {selectedTeam.registrationFee.toLocaleString()} đ
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Ký Quỹ Điều Lệ</span>
                    <span className="font-mono font-bold text-cyan-400">
                      {selectedTeam.depositFee.toLocaleString()} đ
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Trạng Thái Đóng Phí</span>
                    <span className={`font-bold ${selectedTeam.feeStatus === 'PAID' ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {selectedTeam.feeStatus === 'PAID' ? '✓ Đã Thanh Toán' : 'Chưa Thanh Toán'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Tổng Cầu Thủ</span>
                    <span className="font-mono font-bold text-white">
                      {selectedTeam.players.length} / 12 Cầu thủ
                    </span>
                  </div>
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
                  <span className="text-xs text-slate-400">Quy định Điều 15</span>
                </div>

                {selectedTeam.players.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-xs">
                    Chưa có cầu thủ nào trong danh sách. Bấm <strong>&quot;+ Thêm Cầu Thủ&quot;</strong> để đăng ký.
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
                  onChange={(e) => setNewTeamShortName(e.target.value)}
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
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-emerald-500/20"
              >
                Hoàn Tất Đăng Ký Đội
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
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-emerald-500/20"
              >
                Lưu Hồ Sơ Cầu Thủ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Edit Team & Group */}
      {editTeamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-cyan-400" />
                Chỉnh Sửa Đội Bóng &amp; Bảng Đấu
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

    </div>
  );
};
