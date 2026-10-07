'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  UserPlus,
  Users,
  ShieldCheck,
  Scale,
  KeyRound,
  Lock,
  Trash2,
  Search,
  Copy,
  Check,
  Eye,
  EyeOff,
  User,
  Phone,
  Mail,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import { UserAccount, UserRole, Referee } from '@/types';
import { AuthService } from '@/services/auth';
import { StorageService } from '@/services/storage';
import { SoundFX } from '@/utils/soundEffects';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: UserAccount | null;
  currentRole: UserRole;
  onRefereesUpdated?: (newReferees: Referee[]) => void;
  onAccountsUpdated?: () => void;
}

export const UserManagementModal: React.FC<UserManagementModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  currentRole,
  onRefereesUpdated,
  onAccountsUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list');
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<'ALL' | 'ORGANIZER' | 'REFEREE' | 'TEAM_MANAGER'>('ALL');
  
  // Create account form state
  const [targetRole, setTargetRole] = useState<'ORGANIZER' | 'REFEREE'>('REFEREE');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('123');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [refereeCode, setRefereeCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Status states
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successCreatedUser, setSuccessCreatedUser] = useState<UserAccount | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Reload user list when modal opens
  const loadUsers = () => {
    const list = AuthService.getAllUsers();
    setUsers(list);
  };

  useEffect(() => {
    if (isOpen) {
      loadUsers();
      setErrorMsg(null);
      setSuccessCreatedUser(null);
      setActionSuccessMsg(null);
    }
  }, [isOpen]);

  // Auto suggest username and referee code based on full name
  const handleFullNameChange = (val: string) => {
    setFullName(val);
    if (!username || username.startsWith('referee_') || username.startsWith('btc_') || username.startsWith('tt_')) {
      const clean = val
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '');
      const parts = clean.split(' ').filter(Boolean);
      const lastName = parts[parts.length - 1] || clean;
      if (lastName) {
        if (targetRole === 'REFEREE') {
          setUsername(`referee_${lastName}`);
        } else {
          setUsername(`btc_${lastName}`);
        }
      }
    }
  };

  // Suggest referee code when role is REFEREE
  useEffect(() => {
    if (targetRole === 'REFEREE') {
      const refs = StorageService.getReferees();
      setRefereeCode(`TT-${String(refs.length + 1).padStart(2, '0')}`);
      if (username.startsWith('btc_')) {
        setUsername(username.replace('btc_', 'referee_'));
      }
    } else {
      if (username.startsWith('referee_')) {
        setUsername(username.replace('referee_', 'btc_'));
      }
    }
  }, [targetRole]);

  if (!isOpen) return null;

  const canManage = currentRole === 'SUPER_ADMIN' || currentRole === 'ORGANIZER';
  if (!canManage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <div className="bg-[#0B132B] border border-red-500/50 rounded-3xl p-6 max-w-md w-full text-center">
          <ShieldAlert className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <h3 className="text-lg font-black text-white mb-2">Quyền Truy Cập Bị Từ Chối</h3>
          <p className="text-xs text-slate-400 mb-4">
            Chức năng quản lý và cấp tài khoản Ban Tổ Chức & Trọng tài chỉ dành riêng cho quyền Admin (Ban Tổ Chức).
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold"
          >
            Đóng
          </button>
        </div>
      </div>
    );
  }

  // Handle Form Submit: Create Account
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessCreatedUser(null);

    const res = AuthService.createStaffAccount({
      fullName,
      username,
      password,
      role: targetRole,
      phone,
      email,
      refereeCode: targetRole === 'REFEREE' ? refereeCode : undefined,
      creatorName: currentUser?.fullName || 'Ban Tổ Chức',
    });

    if (res.success && res.user) {
      SoundFX.playGoalCheer();
      setSuccessCreatedUser(res.user);
      loadUsers();
      onAccountsUpdated?.();
      if (targetRole === 'REFEREE') {
        onRefereesUpdated?.(StorageService.getReferees());
      }
      // Reset form
      setFullName('');
      setUsername('');
      setPassword('123');
      setPhone('');
      setEmail('');
    } else {
      SoundFX.playWhistle();
      setErrorMsg(res.error || 'Không thể tạo tài khoản, vui lòng thử lại!');
    }
  };

  // Handle Copy Credentials
  const handleCopyCredentials = (u: UserAccount) => {
    const isDefault = AuthService.isDefaultPassword(u.password);
    const text = `Tài khoản: @${u.username}\nMật khẩu: ${
      isDefault ? '123' : '[Mật khẩu riêng - Đã mã hóa băm]'
    }\nTrạng thái: Đã mã hóa băm SHA-256 an toàn\nVai trò: ${
      u.role === 'REFEREE' ? 'Trọng Tài' : u.role === 'ORGANIZER' ? 'Ban Tổ Chức' : 'Đội Trưởng'
    }\nĐăng nhập tại: ${window.location.origin}`;
    navigator.clipboard.writeText(text);
    setCopiedId(u.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Handle Reset Password
  const handleResetPassword = (u: UserAccount) => {
    if (confirm(`Xác nhận đặt lại mật khẩu của tài khoản @${u.username} (${u.fullName}) về mặc định "123"? Mật khẩu sẽ được băm SHA-256 an toàn.`)) {
      const res = AuthService.resetUserPassword(u.id, '123', currentUser?.fullName);
      if (res.success) {
        loadUsers();
        setActionSuccessMsg(`Đã đặt lại mật khẩu của @${u.username} về "123" (Mã băm SHA-256)!`);
        setTimeout(() => setActionSuccessMsg(null), 3000);
      }
    }
  };

  // Handle Delete Account
  const handleDeleteUser = (u: UserAccount) => {
    if (confirm(`Bạn có chắc chắn muốn XÓA tài khoản @${u.username} (${u.fullName}) khỏi hệ thống?`)) {
      const res = AuthService.deleteUserAccount(u.id, currentUser?.id, currentUser?.fullName);
      if (res.success) {
        SoundFX.playWhistle();
        loadUsers();
        onAccountsUpdated?.();
        if (u.role === 'REFEREE') {
          onRefereesUpdated?.(StorageService.getReferees());
        }
        setActionSuccessMsg(`Đã xóa tài khoản @${u.username} thành công!`);
        setTimeout(() => setActionSuccessMsg(null), 3000);
      } else {
        alert(res.error || 'Không thể xóa tài khoản!');
      }
    }
  };

  // Filtered users list
  const filteredUsers = users.filter((u) => {
    if (filterRole !== 'ALL' && u.role !== filterRole) return false;
    if (
      search &&
      !u.fullName.toLowerCase().includes(search.toLowerCase()) &&
      !u.username.toLowerCase().includes(search.toLowerCase()) &&
      !(u.phone && u.phone.includes(search)) &&
      !(u.email && u.email.toLowerCase().includes(search.toLowerCase())) &&
      !(u.teamName && u.teamName.toLowerCase().includes(search.toLowerCase()))
    ) {
      return false;
    }
    return true;
  });

  const btcCount = users.filter((u) => u.role === 'ORGANIZER' || u.role === 'SUPER_ADMIN').length;
  const refereeCount = users.filter((u) => u.role === 'REFEREE').length;
  const captainCount = users.filter((u) => u.role === 'TEAM_MANAGER').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-[#0A1128] border border-slate-700/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">
                  Quản Lý Tài Khoản & Phân Quyền
                </h2>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Admin Control
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400">
                Tạo và cấp tài khoản đăng nhập cho Ban Tổ Chức (BTC) & Trọng Tài điều hành giải đấu
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 active:scale-95 transition-all"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 pt-3 border-b border-slate-800 bg-slate-900/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('list')}
              className={`px-4 py-2.5 rounded-t-xl text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'list'
                  ? 'border-emerald-500 text-emerald-400 bg-slate-800/60 font-black'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Danh Sách Tài Khoản</span>
              <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded-full text-slate-300 font-mono">
                {users.length}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab('create');
                setErrorMsg(null);
                setSuccessCreatedUser(null);
              }}
              className={`px-4 py-2.5 rounded-t-xl text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'create'
                  ? 'border-emerald-500 text-emerald-400 bg-slate-800/60 font-black'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserPlus className="w-4 h-4 text-emerald-400" />
              <span>Tạo Tài Khoản Mới</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-bold">
                Mới
              </span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400">
            <span>Mật khẩu mặc định: <strong className="text-white font-mono bg-slate-800 px-1.5 py-0.5 rounded">123</strong></span>
          </div>
        </div>

        {/* Notification Toast */}
        {actionSuccessMsg && (
          <div className="mx-5 mt-3 p-3 rounded-2xl bg-emerald-950/80 border border-emerald-500/60 flex items-center gap-2 text-xs font-bold text-emerald-300 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionSuccessMsg}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">

          {/* TAB 1: DANH SÁCH TÀI KHOẢN */}
          {activeTab === 'list' && (
            <div className="space-y-4">
              
              {/* Filter & Search Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Tìm theo họ tên, @username, SĐT, email..."
                    className="w-full bg-slate-900/90 border border-slate-700/80 text-white text-xs rounded-xl pl-9 pr-3 py-2.5 focus:border-emerald-500 focus:outline-none transition-colors"
                  />
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
                  <button
                    onClick={() => setFilterRole('ALL')}
                    className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors ${
                      filterRole === 'ALL'
                        ? 'bg-slate-700 text-white'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    Tất cả ({users.length})
                  </button>

                  <button
                    onClick={() => setFilterRole('ORGANIZER')}
                    className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                      filterRole === 'ORGANIZER'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/60'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>BTC ({btcCount})</span>
                  </button>

                  <button
                    onClick={() => setFilterRole('REFEREE')}
                    className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                      filterRole === 'REFEREE'
                        ? 'bg-amber-600 text-white'
                        : 'bg-amber-950/40 text-amber-400 border border-amber-800/60'
                    }`}
                  >
                    <Scale className="w-3.5 h-3.5" />
                    <span>Trọng Tài ({refereeCount})</span>
                  </button>

                  <button
                    onClick={() => setFilterRole('TEAM_MANAGER')}
                    className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors ${
                      filterRole === 'TEAM_MANAGER'
                        ? 'bg-cyan-600 text-white'
                        : 'bg-cyan-950/40 text-cyan-400 border border-cyan-800/60'
                    }`}
                  >
                    Đội Trưởng ({captainCount})
                  </button>
                </div>
              </div>

              {/* Accounts Table / Cards */}
              {filteredUsers.length === 0 ? (
                <div className="py-12 text-center bg-slate-900/40 border border-slate-800 rounded-2xl">
                  <Users className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                  <p className="text-xs text-slate-400 font-medium">Không tìm thấy tài khoản phù hợp</p>
                  <button
                    onClick={() => setActiveTab('create')}
                    className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition-all"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Tạo tài khoản mới ngay</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredUsers.map((u) => {
                    const isReferee = u.role === 'REFEREE';
                    const isBTC = u.role === 'ORGANIZER' || u.role === 'SUPER_ADMIN';
                    const isCaptain = u.role === 'TEAM_MANAGER';
                    const isSelf = currentUser?.id === u.id;
                    const isPermanent = u.id === 'USR-BTC-SUBIN';

                    return (
                      <div
                        key={u.id}
                        className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                          isReferee
                            ? 'bg-amber-950/15 border-amber-800/40 hover:border-amber-600/60'
                            : isBTC
                            ? 'bg-emerald-950/15 border-emerald-800/40 hover:border-emerald-600/60'
                            : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {/* Top Info */}
                        <div className="flex items-start gap-3">
                          <img
                            src={u.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.username}`}
                            alt={u.fullName}
                            className={`w-11 h-11 rounded-2xl object-cover border-2 shrink-0 ${
                              isReferee
                                ? 'border-amber-500/50'
                                : isBTC
                                ? 'border-emerald-500/50'
                                : 'border-cyan-500/40'
                            }`}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs sm:text-sm font-black text-white truncate">
                                {u.fullName}
                              </span>
                              {isSelf && (
                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40">
                                  Bạn
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="font-mono text-xs font-bold text-emerald-400">
                                @{u.username}
                              </span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                                  isReferee
                                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                    : isBTC
                                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                    : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                                }`}
                              >
                                {isReferee
                                  ? 'Trọng Tài'
                                  : isBTC
                                  ? 'Ban Tổ Chức'
                                  : `Đội: ${u.teamName || 'Đội bóng'}`}
                              </span>
                            </div>

                            {/* Contact Info */}
                            <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-400 truncate">
                              {u.phone && (
                                <span className="flex items-center gap-1 font-mono">
                                  <Phone className="w-3 h-3 text-slate-500" />
                                  {u.phone}
                                </span>
                              )}
                              {u.email && (
                                <span className="flex items-center gap-1 truncate">
                                  <Mail className="w-3 h-3 text-slate-500" />
                                  <span className="truncate">{u.email}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Bottom Actions */}
                        <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-2">
                          <div className="text-[11px] text-slate-400 flex items-center gap-1.5 flex-wrap">
                            <span className="text-slate-500">Mật khẩu:</span>
                            {(() => {
                              const info = AuthService.formatPasswordDisplay(u.password);
                              return (
                                <span
                                  className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded border flex items-center gap-1 ${
                                    info.isDefault
                                      ? 'bg-emerald-950/60 border-emerald-800/80 text-emerald-300'
                                      : 'bg-amber-950/60 border-amber-800/80 text-amber-300'
                                  }`}
                                  title={`Mã băm SHA-256: ${u.password}`}
                                >
                                  <Lock className="w-3 h-3" />
                                  <span>{info.isDefault ? '123 (Mã băm SHA-256)' : '●●●●●●●● (Mã băm SHA-256)'}</span>
                                </span>
                              );
                            })()}
                          </div>

                          <div className="flex items-center gap-1.5">
                            {/* Copy Info Button */}
                            <button
                              onClick={() => handleCopyCredentials(u)}
                              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 transition-all active:scale-95"
                              title="Sao chép tài khoản & mật khẩu"
                            >
                              {copiedId === u.id ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                  <span className="text-emerald-400 font-bold">Đã chép</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                                  <span>Sao chép</span>
                                </>
                              )}
                            </button>

                            {/* Reset Password Button */}
                            <button
                              onClick={() => handleResetPassword(u)}
                              className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-amber-400 border border-amber-500/30 transition-all active:scale-95"
                              title="Đặt lại mật khẩu về 123"
                            >
                              <KeyRound className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete User Button */}
                            {!isSelf && !isPermanent && (
                              <button
                                onClick={() => handleDeleteUser(u)}
                                className="p-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-500/30 transition-all active:scale-95"
                                title="Xóa tài khoản"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: TẠO TÀI KHOẢN MỚI */}
          {activeTab === 'create' && (
            <div className="max-w-2xl mx-auto space-y-4">
              
              {/* Success Result Banner */}
              {successCreatedUser && (
                <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/80 shadow-lg space-y-3 animate-in fade-in">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/40">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white">
                        Tạo Tài Khoản Thành Công!
                      </h4>
                      <p className="text-xs text-emerald-300">
                        Đã cấp tài khoản cho {successCreatedUser.role === 'REFEREE' ? 'Trọng tài' : 'Ban Tổ Chức'}{' '}
                        <strong>{successCreatedUser.fullName}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-emerald-800/60 text-xs font-mono space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Tên đăng nhập:</span>
                      <strong className="text-emerald-400">@{successCreatedUser.username}</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Mật khẩu khởi tạo:</span>
                      <strong className="text-white bg-slate-800 px-2 py-0.5 rounded font-bold">123 (Mặc định)</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Trạng thái mã băm:</span>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Đã băm Salted SHA-256
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Vai trò:</span>
                      <strong className="text-amber-400">
                        {successCreatedUser.role === 'REFEREE' ? 'Trọng Tài' : 'Ban Tổ Chức (BTC)'}
                      </strong>
                    </div>
                    <div className="pt-1 text-[10px] text-slate-500 font-mono truncate border-t border-slate-900" title={successCreatedUser.password}>
                      Hash: {successCreatedUser.password}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyCredentials(successCreatedUser)}
                      className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Sao Chép Thông Tin Gửi Qua Zalo</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('list')}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-all"
                    >
                      Xem Danh Sách
                    </button>
                  </div>
                </div>
              )}

              {/* Creation Form */}
              <form onSubmit={handleCreateSubmit} className="space-y-4">
                
                {/* Role Choice Cards */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2">
                    1. Chọn vai trò tài khoản muốn tạo <span className="text-red-400">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    
                    {/* Option: REFEREE */}
                    <div
                      onClick={() => setTargetRole('REFEREE')}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                        targetRole === 'REFEREE'
                          ? 'bg-amber-950/50 border-amber-500 shadow-md shadow-amber-500/10'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 opacity-70'
                      }`}
                    >
                      <div
                        className={`p-2.5 rounded-xl border shrink-0 ${
                          targetRole === 'REFEREE'
                            ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                            : 'bg-slate-800 border-slate-700 text-slate-400'
                        }`}
                      >
                        <Scale className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-white">Tài Khoản Trọng Tài</span>
                          {targetRole === 'REFEREE' && (
                            <span className="text-[10px] bg-amber-500 text-black px-1.5 py-0.2 rounded font-black">
                              Đang chọn
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                          Biên bản trận đấu, nhập tỷ số trực tiếp, rút thẻ phạt và tự động đồng bộ vào danh sách điều hành trận.
                        </p>
                      </div>
                    </div>

                    {/* Option: ORGANIZER */}
                    <div
                      onClick={() => setTargetRole('ORGANIZER')}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                        targetRole === 'ORGANIZER'
                          ? 'bg-emerald-950/50 border-emerald-500 shadow-md shadow-emerald-500/10'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 opacity-70'
                      }`}
                    >
                      <div
                        className={`p-2.5 rounded-xl border shrink-0 ${
                          targetRole === 'ORGANIZER'
                            ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                            : 'bg-slate-800 border-slate-700 text-slate-400'
                        }`}
                      >
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-white">Tài Khoản Ban Tổ Chức (BTC)</span>
                          {targetRole === 'ORGANIZER' && (
                            <span className="text-[10px] bg-emerald-500 text-black px-1.5 py-0.2 rounded font-black">
                              Đang chọn
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                          Toàn quyền điều hành giải đấu, bốc thăm bảng, xếp lịch, thu chi tài chính và giải quyết khiếu nại.
                        </p>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Full Name & Username */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Họ và tên nhân sự <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => handleFullNameChange(e.target.value)}
                        placeholder={targetRole === 'REFEREE' ? 'Ví dụ: Trần Văn Hùng' : 'Ví dụ: Nguyễn Thành Công'}
                        className="w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Tên đăng nhập (@username) <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      placeholder={targetRole === 'REFEREE' ? 'vd: referee_hung' : 'vd: btc_thanhcong'}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm font-mono text-emerald-400 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Password & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Mật khẩu khởi tạo <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Mặc định: 123"
                        className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Khuyến nghị giữ mật khẩu mặc định là <strong className="text-emerald-400">123</strong>. Mật khẩu sẽ tự động được băm bảo mật bằng thuật toán Salted SHA-256 trước khi lưu vào hệ thống.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Số điện thoại liên hệ
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Ví dụ: 0901 234 567"
                        className="w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Email & Referee Code (if Referee) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Email (Tùy chọn)
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={username ? `${username}@itftms.vn` : 'email@itftms.vn'}
                        className="w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {targetRole === 'REFEREE' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Mã trọng tài (Hiển thị biên bản)
                      </label>
                      <input
                        type="text"
                        value={refereeCode}
                        onChange={(e) => setRefereeCode(e.target.value)}
                        placeholder="Ví dụ: TT-01, TT-02..."
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-amber-500/50 rounded-xl text-xs sm:text-sm font-mono text-amber-300 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  )}
                </div>

                {/* Error Banner */}
                {errorMsg && (
                  <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/60 flex items-center gap-2 text-xs text-red-300 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className={`w-full py-3 rounded-xl font-black text-xs sm:text-sm shadow-xl transition-all flex items-center justify-center gap-2 active:scale-98 ${
                      targetRole === 'REFEREE'
                        ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-black shadow-amber-500/20'
                        : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-emerald-500/20'
                    }`}
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>
                      {targetRole === 'REFEREE'
                        ? 'Xác Nhận Tạo Tài Khoản Trọng Tài'
                        : 'Xác Nhận Tạo Tài Khoản Ban Tổ Chức (BTC)'}
                    </span>
                  </button>
                </div>

              </form>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
