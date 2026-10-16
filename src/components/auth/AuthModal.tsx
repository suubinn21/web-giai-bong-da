'use client';

import React, { useState } from 'react';
import { 
  X, 
  LogIn, 
  UserPlus, 
  Trophy, 
  Lock, 
  Mail, 
  User, 
  Eye, 
  EyeOff, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  GraduationCap,
  Scale
} from 'lucide-react';
import { UserAccount, UserRole } from '@/types';
import { AuthService } from '@/services/auth';
import { SoundFX } from '@/utils/soundEffects';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserAccount) => void;
  initialMode?: 'login' | 'register';
  messageNotice?: string;
  initialIdentifier?: string;
  initialPassword?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialMode = 'login',
  messageNotice,
  initialIdentifier = '',
  initialPassword = '',
}) => {
  const [tab, setTab] = useState<'login' | 'register'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState(initialIdentifier);
  const [loginPassword, setLoginPassword] = useState(initialPassword);

  React.useEffect(() => {
    if (isOpen) {
      if (initialIdentifier) setLoginIdentifier(initialIdentifier);
      if (initialPassword) setLoginPassword(initialPassword);
      if (initialMode) setTab(initialMode);
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [isOpen, initialIdentifier, initialPassword, initialMode]);

  // Register form state
  const [regFullName, setRegFullName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('STUDENT');
  const [regStudentId, setRegStudentId] = useState('');
  const [regClass, setRegClass] = useState('');
  const [regTeamName, setRegTeamName] = useState('');
  const [regPhone, setRegPhone] = useState('');

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    setTimeout(() => {
      const res = AuthService.login(loginIdentifier, loginPassword);
      setLoading(false);
      if (res.success && res.user) {
        SoundFX.playGoalCheer();
        setSuccessMsg(`Chào mừng trở lại, ${res.user.fullName}!`);
        setTimeout(() => {
          onLoginSuccess(res.user!);
          onClose();
        }, 600);
      } else {
        SoundFX.playWhistle();
        setErrorMsg(res.error || 'Đăng nhập không thành công');
      }
    }, 300);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    setTimeout(() => {
      const res = AuthService.register({
        fullName: regFullName,
        username: regUsername,
        email: regEmail,
        password: regPassword,
        role: regRole,
        studentId: regStudentId,
        class: regClass,
        teamName: regTeamName,
        phone: regPhone,
      });
      setLoading(false);
      if (res.success && res.user) {
        SoundFX.playGoalCheer();
        setSuccessMsg(`Đăng ký thành công! Chào mừng ${res.user.fullName} gia nhập giải đấu.`);
        setTimeout(() => {
          onLoginSuccess(res.user!);
          onClose();
        }, 800);
      } else {
        SoundFX.playWhistle();
        setErrorMsg(res.error || 'Đăng ký thất bại');
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 overflow-y-auto">
      <div 
        className="relative w-full max-w-xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden my-auto text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Header Background */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-r from-blue-500/10 via-sky-500/10 to-cyan-500/10 pointer-events-none" />

        {/* Modal Top Bar */}
        <div className="relative px-6 pt-6 pb-4 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 via-sky-600 to-cyan-500 flex items-center justify-center shadow-md shadow-blue-500/20 text-white font-black text-xl">
              ⚽
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                  ITFTMS 2026 Auth
                </span>
                <span className="text-xs text-slate-500">Hệ Thống Xác Thực</span>
              </div>
              <h2 className="text-lg font-black text-slate-900">
                {tab === 'login' ? 'Đăng Nhập Tài Khoản' : 'Đăng Ký Thành Viên Mới'}
              </h2>
            </div>
          </div>

          <button
            onClick={() => {
              SoundFX.playClick();
              onClose();
            }}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice Message if any */}
        {messageNotice && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{messageNotice}</span>
          </div>
        )}

        {/* Success or Error Alert */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5 animate-shake">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-medium">{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successMsg}</span>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="px-6 pt-4">
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl border border-slate-200">
            <button
              onClick={() => {
                SoundFX.playClick();
                setTab('login');
                setErrorMsg(null);
              }}
              className={`flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl transition-all ${
                tab === 'login'
                  ? 'bg-gradient-to-r from-blue-600 to-sky-600 text-white shadow-md shadow-blue-500/20 font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>ĐĂNG NHẬP</span>
            </button>

            <button
              onClick={() => {
                SoundFX.playClick();
                setTab('register');
                setErrorMsg(null);
              }}
              className={`flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl transition-all ${
                tab === 'register'
                  ? 'bg-gradient-to-r from-blue-600 to-sky-600 text-white shadow-md shadow-blue-500/20 font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>ĐĂNG KÝ MỚI</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {tab === 'login' ? (
            <div>
              {/* Login Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Tên đăng nhập, Email hoặc Tên Đội Bóng
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      onBlur={() => setLoginIdentifier((prev) => prev.trim())}
                      placeholder="Nhập tên đăng nhập, email hoặc tên đội bóng..."
                      autoComplete="username"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                      maxLength={80}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Mật khẩu
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      onBlur={() => setLoginPassword((prev) => prev.trim())}
                      placeholder="Nhập mật khẩu..."
                      autoComplete="current-password"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                      maxLength={100}
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 via-sky-600 to-cyan-600 hover:from-blue-700 hover:to-sky-700 text-white font-black text-sm shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
                >
                  {loading ? (
                    <span className="inline-block animate-spin">⏳ Đang xác thực...</span>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>Xác Nhận Đăng Nhập</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5 max-h-[60vh] overflow-y-auto pr-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Họ và tên người dùng <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    placeholder="Ví dụ: Nguyễn Thành Danh"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tên tài khoản (Username) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="vd: nguyendanh_it"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email liên hệ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="vd: danh@student.uit.edu.vn"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                  />
                </div>
              </div>

              {/* Registration Account Type Notice */}
              <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 shrink-0">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Tài khoản: Sinh Viên / Cổ Động Viên</div>
                  <div className="text-[11px] text-slate-500">Theo dõi lịch thi đấu, diễn biến trực tiếp và bảng xếp hạng giải đấu</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mã Sinh Viên (MSSV)
                  </label>
                  <input
                    type="text"
                    value={regStudentId}
                    onChange={(e) => setRegStudentId(e.target.value)}
                    placeholder="vd: 22520123"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Lớp sinh hoạt
                  </label>
                  <input
                    type="text"
                    value={regClass}
                    onChange={(e) => setRegClass(e.target.value)}
                    placeholder="vd: KHMT2022"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mật khẩu bảo vệ <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Mật khẩu tối thiểu 3 ký tự..."
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 via-sky-600 to-cyan-600 hover:from-blue-700 hover:to-sky-700 text-white font-bold text-sm shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <span className="inline-block animate-spin">⏳</span>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Hoàn Tất Đăng Ký &amp; Đăng Nhập</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
