'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Tournament, TournamentStatus, getGroupLetters } from '@/types';
import { SoundFX } from '@/utils/soundEffects';
import { 
  Trophy, 
  Sparkles, 
  Calendar, 
  DollarSign, 
  Users, 
  Clock, 
  MapPin, 
  X,
  CheckCircle2,
  Database,
  Layers
} from 'lucide-react';

interface CreateTournamentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (tournament: Tournament, preloadDemoTeams: boolean) => void;
  currentTournament: Tournament;
  mode?: 'create' | 'edit';
}

export const CreateTournamentModal: React.FC<CreateTournamentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  currentTournament,
  mode = 'create',
}) => {
  const [name, setName] = useState(currentTournament.name || 'Giải Bóng Đá Khoa Công Nghệ Thông Tin 2026');
  const [shortCode, setShortCode] = useState(currentTournament.shortCode || 'ITFTMS-2026');
  const [year, setYear] = useState<number>(currentTournament.year || 2026);
  const [organizer, setOrganizer] = useState(currentTournament.organizer || 'Đoàn - Hội Khoa Công Nghệ Thông Tin');
  const [format, setFormat] = useState(currentTournament.format || 'Bóng đá 5 người (Futsal)');
  const [numberOfGroups, setNumberOfGroups] = useState<number>(currentTournament.numberOfGroups || 4);
  const [teamsPerGroup, setTeamsPerGroup] = useState<number>(currentTournament.teamsPerGroup || 4);
  const [maxTeams, setMaxTeams] = useState<number>(currentTournament.maxTeams || 16);
  const [maxPlayersPerTeam, setMaxPlayersPerTeam] = useState<number>(currentTournament.maxPlayersPerTeam || 12);
  const [matchDurationMinutes, setMatchDurationMinutes] = useState<number>(currentTournament.matchDurationMinutes || 40);
  const [breakDurationMinutes, setBreakDurationMinutes] = useState<number>(currentTournament.breakDurationMinutes || 5);
  const [registrationFee, setRegistrationFee] = useState<number>(currentTournament.registrationFee || 500000);
  const [depositFee, setDepositFee] = useState<number>(currentTournament.depositFee || 50000);
  const [startDate, setStartDate] = useState(currentTournament.startDate || '2026-10-15');
  const [endDate, setEndDate] = useState(currentTournament.endDate || '2026-10-25');
  const [initialStatus, setInitialStatus] = useState<TournamentStatus>(currentTournament.status || 'REGISTRATION');
  const [description, setDescription] = useState(currentTournament.description || 'Giải bóng đá thường niên sinh viên Khoa Công nghệ Thông tin.');
  
  // Choice of initial data state
  const [preloadDemo, setPreloadDemo] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleGroupCountChange = (val: number) => {
    setNumberOfGroups(val);
    setMaxTeams(val * teamsPerGroup);
  };

  const handleTeamsPerGroupChange = (val: number) => {
    setTeamsPerGroup(val);
    setMaxTeams(numberOfGroups * val);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert('Vui lòng nhập tên giải đấu!');
      return;
    }

    const newTournament: Tournament = {
      id: mode === 'edit' ? currentTournament.id : `TOUR-${year}-${Date.now().toString().slice(-4)}`,
      name: name.trim(),
      shortCode: shortCode.trim().toUpperCase() || 'ITFTMS',
      year,
      organizer: organizer.trim(),
      format,
      maxTeams,
      numberOfGroups,
      teamsPerGroup,
      maxPlayersPerTeam,
      matchDurationMinutes,
      breakDurationMinutes,
      registrationFee,
      depositFee,
      startDate,
      endDate,
      status: initialStatus,
      description: description.trim(),
    };

    SoundFX.playGoalFanfare();
    confetti({
      particleCount: 150,
      spread: 90,
      origin: { y: 0.5 },
      colors: ['#10B981', '#00F5D4', '#F59E0B', '#6366F1', '#FFFFFF'],
    });

    onSubmit(newTournament, preloadDemo);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-gradient-to-b from-[#0F1E36] via-[#0B132B] to-[#070B14] border border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto relative">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/25">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-black text-emerald-400 uppercase tracking-widest block">
                {mode === 'edit' ? 'CHỈNH SỬA THÔNG SỐ GIẢI' : 'KHỞI TẠO MÙA GIẢI MỚI'}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                {mode === 'edit' ? 'Cấu Hình Giải Đấu & Số Bảng' : 'Tạo Mới Giải Đấu Bóng Đá'}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Tournament Name */}
          <div>
            <label className="text-xs font-bold text-white block mb-1">
              Tên Giải Đấu Chính Thức <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Giải Bóng Đá Khoa Công Nghệ Thông Tin 2026"
              className="w-full bg-slate-800/90 border border-slate-700 text-white text-sm font-bold rounded-xl p-3 focus:border-emerald-500 focus:outline-none shadow-inner"
            />
          </div>

          {/* Code, Year, Organizer */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Mã Viết Tắt (Code)
              </label>
              <input
                type="text"
                required
                value={shortCode}
                onChange={(e) => setShortCode(e.target.value)}
                placeholder="VD: ITFTMS-2026"
                className="w-full bg-slate-800/90 border border-slate-700 text-white text-xs font-mono font-bold rounded-xl p-2.5 uppercase"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Năm Tổ Chức
              </label>
              <input
                type="number"
                required
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full bg-slate-800/90 border border-slate-700 text-white text-xs font-mono font-bold rounded-xl p-2.5"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Giai Đoạn Khởi Đầu
              </label>
              <select
                value={initialStatus}
                onChange={(e) => setInitialStatus(e.target.value as TournamentStatus)}
                className="w-full bg-slate-800/90 border border-slate-700 text-emerald-400 text-xs font-bold rounded-xl p-2.5"
              >
                <option value="REGISTRATION">Mở Đăng Ký Đội (Registration)</option>
                <option value="DRAFT">Bản Nháp (Draft)</option>
                <option value="DRAWING">Sẵn Sàng Bốc Thăm (Drawing)</option>
                <option value="GROUP_STAGE">Vòng Bảng (Group Stage)</option>
              </select>
            </div>
          </div>

          {/* Organizer */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Đơn Vị Tổ Chức / Ban Tổ Chức
            </label>
            <input
              type="text"
              value={organizer}
              onChange={(e) => setOrganizer(e.target.value)}
              placeholder="VD: Khoa Công Nghệ Thông Tin • Ban Thể Thao Đoàn - Hội"
              className="w-full bg-slate-800/90 border border-slate-700 text-white text-xs rounded-xl p-2.5"
            />
          </div>

          {/* Cấu Hình Số Bảng Đấu & Số Đội 1 Bảng (Yêu cầu mới) */}
          <div className="p-4 rounded-2xl bg-emerald-950/25 border border-emerald-500/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-400" />
                Cấu Hình Số Bảng Đấu & Số Đội 1 Bảng
              </span>
              <span className="text-xs font-mono font-black text-emerald-300 bg-emerald-900/60 px-2.5 py-1 rounded-lg border border-emerald-700/60">
                {numberOfGroups} Bảng × {teamsPerGroup} Đội = {maxTeams} Đội
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="text-[11px] text-slate-300 font-semibold block mb-1">
                  Số lượng bảng đấu
                </label>
                <select
                  value={numberOfGroups}
                  onChange={(e) => handleGroupCountChange(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 text-emerald-400 font-bold text-xs rounded-xl p-2.5 focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value={2}>2 Bảng (Bảng A, B)</option>
                  <option value={3}>3 Bảng (Bảng A, B, C)</option>
                  <option value={4}>4 Bảng (Bảng A, B, C, D - Chuẩn ITFTMS)</option>
                  <option value={5}>5 Bảng (Bảng A, B, C, D, E)</option>
                  <option value={6}>6 Bảng (Bảng A, B, C, D, E, F)</option>
                  <option value={8}>8 Bảng (Bảng A ➔ Bảng H)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-300 font-semibold block mb-1">
                  Số đội trong 1 bảng
                </label>
                <select
                  value={teamsPerGroup}
                  onChange={(e) => handleTeamsPerGroupChange(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 text-emerald-400 font-bold text-xs rounded-xl p-2.5 focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value={3}>3 Đội / bảng</option>
                  <option value={4}>4 Đội / bảng (Chuẩn ITFTMS)</option>
                  <option value={5}>5 Đội / bảng</option>
                  <option value={6}>6 Đội / bảng</option>
                  <option value={8}>8 Đội / bảng</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-300 font-semibold block mb-1">
                  Tổng số đội giải đấu
                </label>
                <input
                  type="number"
                  value={maxTeams}
                  onChange={(e) => setMaxTeams(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 text-white font-mono font-bold text-xs rounded-xl p-2.5"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] text-slate-400">
              <span className="text-slate-500 font-medium">Bảng đấu sẽ tạo:</span>
              {getGroupLetters(numberOfGroups).map((g) => (
                <span key={g} className="px-2 py-0.5 rounded bg-slate-800/90 text-emerald-400 font-black border border-slate-700">
                  Bảng {g}
                </span>
              ))}
            </div>
          </div>

          {/* Competition Rules & Format */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
              Quy Chế Thi Đấu (Theo Đặc Tả Kỹ Thuật ITFTMS)
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Thể thức</label>
                <input
                  type="text"
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-lg p-2 font-medium"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Số đội tối đa</label>
                <input
                  type="number"
                  value={maxTeams}
                  onChange={(e) => setMaxTeams(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-lg p-2 font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Cầu thủ max/đội</label>
                <input
                  type="number"
                  value={maxPlayersPerTeam}
                  onChange={(e) => setMaxPlayersPerTeam(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-lg p-2 font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Thời gian trận</label>
                <input
                  type="text"
                  value={`${matchDurationMinutes} phút (${matchDurationMinutes/2}p x 2)`}
                  readOnly
                  className="w-full bg-slate-950 border border-slate-800 text-slate-400 text-xs rounded-lg p-2 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Financial Regulations */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30">
              <label className="text-xs font-bold text-emerald-400 block mb-1">
                Lệ Phí Tham Dự / Đội (Điều 16)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step={50000}
                  value={registrationFee}
                  onChange={(e) => setRegistrationFee(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 text-white font-mono font-bold text-sm rounded-xl p-2"
                />
                <span className="text-xs text-slate-400 font-mono">VNĐ</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-500/30">
              <label className="text-xs font-bold text-cyan-400 block mb-1">
                Tiền Ký Quỹ Điều Lệ / Đội (Điều 16)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step={10000}
                  value={depositFee}
                  onChange={(e) => setDepositFee(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 text-white font-mono font-bold text-sm rounded-xl p-2"
                />
                <span className="text-xs text-slate-400 font-mono">VNĐ</span>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Ngày Khai Mạc Dự Kiến
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-800/90 border border-slate-700 text-white text-xs rounded-xl p-2.5 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Ngày Bế Mạc &amp; Trao Cúp
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-800/90 border border-slate-700 text-white text-xs rounded-xl p-2.5 font-mono"
              />
            </div>
          </div>

          {/* Initial Data Option */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-white block">Tùy Chọn Dữ Liệu Khởi Đầu:</span>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <label
                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                  !preloadDemo
                    ? 'bg-emerald-950/60 border-emerald-500 text-white'
                    : 'bg-slate-950/40 border-slate-800 text-slate-400'
                }`}
              >
                <input
                  type="radio"
                  name="initDataChoice"
                  checked={!preloadDemo}
                  onChange={() => setPreloadDemo(false)}
                  className="mt-0.5 text-emerald-500"
                />
                <div>
                  <span className="text-xs font-bold block">⚪ Khởi Tạo Trắng Sạch (Clean Slate)</span>
                  <span className="text-[10px] text-slate-400">
                    Bắt đầu giải đấu thật từ đầu: 0 đội bóng, sẵn sàng tiếp nhận đăng ký mới.
                  </span>
                </div>
              </label>

              <label
                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                  preloadDemo
                    ? 'bg-amber-950/60 border-amber-500 text-white'
                    : 'bg-slate-950/40 border-slate-800 text-slate-400'
                }`}
              >
                <input
                  type="radio"
                  name="initDataChoice"
                  checked={preloadDemo}
                  onChange={() => setPreloadDemo(true)}
                  className="mt-0.5 text-amber-500"
                />
                <div>
                  <span className="text-xs font-bold block">🔵 Nạp Sẵn 16 Đội Mẫu (Demo Data)</span>
                  <span className="text-[10px] text-slate-400">
                    Nạp sẵn 16 đội sinh viên và lịch đấu để kiểm tra tính năng nhanh chóng.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs sm:text-sm font-black shadow-xl shadow-emerald-500/25 transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{mode === 'edit' ? 'Lưu Cấu Hình Thay Đổi' : 'Khởi Tạo Giải Đấu Mới!'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
