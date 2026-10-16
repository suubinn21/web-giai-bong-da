'use client';

import React, { useState, useEffect } from 'react';
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
  const [numberOfVenues, setNumberOfVenues] = useState<number>(currentTournament.numberOfVenues || 4);
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

  useEffect(() => {
    if (isOpen && currentTournament) {
      setName(currentTournament.name || 'Giải Bóng Đá Khoa Công Nghệ Thông Tin 2026');
      setShortCode(currentTournament.shortCode || 'ITFTMS-2026');
      setYear(currentTournament.year || 2026);
      setOrganizer(currentTournament.organizer || 'Đoàn - Hội Khoa Công Nghệ Thông Tin');
      setFormat(currentTournament.format || 'Bóng đá 5 người (Futsal)');
      setNumberOfGroups(currentTournament.numberOfGroups || 4);
      setTeamsPerGroup(currentTournament.teamsPerGroup || 4);
      setNumberOfVenues(currentTournament.numberOfVenues || 4);
      setMaxTeams(currentTournament.maxTeams || 16);
      setMaxPlayersPerTeam(currentTournament.maxPlayersPerTeam || 12);
      setMatchDurationMinutes(currentTournament.matchDurationMinutes || 40);
      setBreakDurationMinutes(currentTournament.breakDurationMinutes || 5);
      setRegistrationFee(currentTournament.registrationFee || 500000);
      setDepositFee(currentTournament.depositFee || 50000);
      setStartDate(currentTournament.startDate || '2026-10-15');
      setEndDate(currentTournament.endDate || '2026-10-25');
      setInitialStatus(currentTournament.status || 'REGISTRATION');
      setDescription(currentTournament.description || 'Giải bóng đá thường niên sinh viên Khoa Công nghệ Thông tin.');
    }
  }, [isOpen, currentTournament]);

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
      numberOfVenues,
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
      colors: ['#0284C7', '#2563EB', '#06B6D4', '#F59E0B', '#FFFFFF'],
    });

    onSubmit(newTournament, preloadDemo);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto relative text-slate-800">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 via-sky-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-black text-sky-700 uppercase tracking-widest block">
                {mode === 'edit' ? 'CHỈNH SỬA THÔNG SỐ GIẢI' : 'KHỞI TẠO MÙA GIẢI MỚI'}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                {mode === 'edit' ? 'Cấu Hình Giải Đấu & Số Bảng' : 'Tạo Mới Giải Đấu Bóng Đá'}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Tournament Name */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Tên Giải Đấu Chính Thức <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Giải Bóng Đá Khoa Công Nghệ Thông Tin 2026"
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm font-bold rounded-xl p-3 focus:border-blue-500 focus:bg-white focus:outline-none transition-colors"
            />
          </div>

          {/* Code, Year, Organizer */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Mã Viết Tắt (Code)
              </label>
              <input
                type="text"
                required
                value={shortCode}
                onChange={(e) => setShortCode(e.target.value)}
                placeholder="VD: ITFTMS-2026"
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono font-bold rounded-xl p-2.5 uppercase focus:border-blue-500 focus:bg-white focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Năm Tổ Chức
              </label>
              <input
                type="number"
                required
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono font-bold rounded-xl p-2.5 focus:border-blue-500 focus:bg-white focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Giai Đoạn Khởi Đầu
              </label>
              <select
                value={initialStatus}
                onChange={(e) => setInitialStatus(e.target.value as TournamentStatus)}
                className="w-full bg-slate-50 border border-slate-200 text-blue-700 text-xs font-bold rounded-xl p-2.5 focus:border-blue-500 focus:bg-white focus:outline-none transition-colors cursor-pointer"
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
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Đơn Vị Tổ Chức / Ban Tổ Chức
            </label>
            <input
              type="text"
              value={organizer}
              onChange={(e) => setOrganizer(e.target.value)}
              placeholder="VD: Khoa Công Nghệ Thông Tin • Ban Thể Thao Đoàn - Hội"
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl p-2.5 focus:border-blue-500 focus:bg-white focus:outline-none transition-colors"
            />
          </div>

          {/* Cấu Hình Số Bảng Đấu & Số Đội 1 Bảng */}
          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-blue-800 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-blue-600" />
                Cấu Hình Số Bảng Đấu &amp; Số Đội 1 Bảng
              </span>
              <span className="text-xs font-mono font-black text-blue-700 bg-blue-100 px-2.5 py-1 rounded-lg border border-blue-300">
                {numberOfGroups} Bảng × {teamsPerGroup} Đội = {maxTeams} Đội • {numberOfVenues} Sân
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="text-[11px] text-slate-700 font-semibold block mb-1">
                  Số lượng bảng đấu
                </label>
                <select
                  value={numberOfGroups}
                  onChange={(e) => handleGroupCountChange(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 text-blue-700 font-bold text-xs rounded-xl p-2.5 focus:outline-none focus:border-blue-500 cursor-pointer shadow-xs"
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
                <label className="text-[11px] text-slate-700 font-semibold block mb-1">
                  Số đội trong 1 bảng
                </label>
                <select
                  value={teamsPerGroup}
                  onChange={(e) => handleTeamsPerGroupChange(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 text-blue-700 font-bold text-xs rounded-xl p-2.5 focus:outline-none focus:border-blue-500 cursor-pointer shadow-xs"
                >
                  <option value={3}>3 Đội / bảng</option>
                  <option value={4}>4 Đội / bảng (Chuẩn ITFTMS)</option>
                  <option value={5}>5 Đội / bảng</option>
                  <option value={6}>6 Đội / bảng</option>
                  <option value={8}>8 Đội / bảng</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-700 font-semibold block mb-1">
                  Số sân thi đấu
                </label>
                <select
                  value={numberOfVenues}
                  onChange={(e) => setNumberOfVenues(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 text-sky-700 font-bold text-xs rounded-xl p-2.5 focus:outline-none focus:border-sky-500 cursor-pointer shadow-xs"
                >
                  <option value={2}>2 Sân</option>
                  <option value={3}>3 Sân</option>
                  <option value={4}>4 Sân (Chuẩn 4 sân 1 ngày)</option>
                  <option value={5}>5 Sân</option>
                  <option value={6}>6 Sân</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-700 font-semibold block mb-1">
                  Tổng số đội giải đấu
                </label>
                <input
                  type="number"
                  value={maxTeams}
                  onChange={(e) => setMaxTeams(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 text-slate-900 font-mono font-bold text-xs rounded-xl p-2.5 focus:outline-none focus:border-blue-500 shadow-xs"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] text-slate-600">
              <span className="text-slate-500 font-medium">Bảng đấu sẽ tạo:</span>
              {getGroupLetters(numberOfGroups).map((g) => (
                <span key={g} className="px-2 py-0.5 rounded bg-white text-blue-700 font-black border border-blue-200 shadow-xs">
                  Bảng {g}
                </span>
              ))}
            </div>
          </div>

          {/* Competition Rules & Format */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block">
              Quy Chế Thi Đấu (Theo Đặc Tả Kỹ Thuật ITFTMS)
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="text-[11px] text-slate-500 block mb-1">Thể thức</label>
                <input
                  type="text"
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="w-full bg-white border border-slate-200 text-slate-900 text-xs rounded-lg p-2 font-medium focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-500 block mb-1">Số đội tối đa</label>
                <input
                  type="number"
                  value={maxTeams}
                  onChange={(e) => setMaxTeams(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 text-slate-900 text-xs rounded-lg p-2 font-mono font-bold focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-500 block mb-1">Cầu thủ max/đội</label>
                <input
                  type="number"
                  value={maxPlayersPerTeam}
                  onChange={(e) => setMaxPlayersPerTeam(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 text-slate-900 text-xs rounded-lg p-2 font-mono font-bold focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-500 block mb-1">Thời gian trận</label>
                <input
                  type="text"
                  value={`${matchDurationMinutes} phút (${matchDurationMinutes/2}p x 2)`}
                  readOnly
                  className="w-full bg-slate-100 border border-slate-200 text-slate-600 text-xs rounded-lg p-2 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Financial Regulations */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200">
              <label className="text-xs font-bold text-blue-700 block mb-1">
                Lệ Phí Tham Dự / Đội (Điều 16)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step={50000}
                  value={registrationFee}
                  onChange={(e) => setRegistrationFee(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 text-slate-900 font-mono font-bold text-sm rounded-xl p-2 focus:border-blue-500 focus:outline-none"
                />
                <span className="text-xs text-slate-500 font-mono">VNĐ</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-sky-50/70 border border-sky-200">
              <label className="text-xs font-bold text-sky-700 block mb-1">
                Tiền Ký Quỹ Điều Lệ / Đội (Điều 16)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step={10000}
                  value={depositFee}
                  onChange={(e) => setDepositFee(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 text-slate-900 font-mono font-bold text-sm rounded-xl p-2 focus:border-sky-500 focus:outline-none"
                />
                <span className="text-xs text-slate-500 font-mono">VNĐ</span>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Ngày Khai Mạc Dự Kiến
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl p-2.5 font-mono focus:border-blue-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Ngày Bế Mạc &amp; Trao Cúp
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl p-2.5 font-mono focus:border-blue-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Initial Data Option */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-xs font-bold text-slate-800 block">Tùy Chọn Dữ Liệu Khởi Đầu:</span>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <label
                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                  !preloadDemo
                    ? 'bg-white border-blue-500 text-slate-900 shadow-xs'
                    : 'bg-slate-100 border-slate-200 text-slate-500'
                }`}
              >
                <input
                  type="radio"
                  name="initDataChoice"
                  checked={!preloadDemo}
                  onChange={() => setPreloadDemo(false)}
                  className="mt-0.5 text-blue-600"
                />
                <div>
                  <span className="text-xs font-bold block">⚪ Khởi Tạo Trắng Sạch (Clean Slate)</span>
                  <span className="text-[10px] text-slate-500">
                    Bắt đầu giải đấu thật từ đầu: 0 đội bóng, sẵn sàng tiếp nhận đăng ký mới.
                  </span>
                </div>
              </label>

              <label
                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                  preloadDemo
                    ? 'bg-white border-amber-500 text-slate-900 shadow-xs'
                    : 'bg-slate-100 border-slate-200 text-slate-500'
                }`}
              >
                <input
                  type="radio"
                  name="initDataChoice"
                  checked={preloadDemo}
                  onChange={() => setPreloadDemo(true)}
                  className="mt-0.5 text-amber-600"
                />
                <div>
                  <span className="text-xs font-bold block">🔵 Nạp Sẵn 16 Đội Mẫu (Demo Data)</span>
                  <span className="text-[10px] text-slate-500">
                    Nạp sẵn 16 đội sinh viên và lịch đấu để kiểm tra tính năng nhanh chóng.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-sky-600 to-cyan-600 hover:from-blue-700 hover:to-sky-700 text-white text-xs sm:text-sm font-black shadow-md shadow-blue-500/20 transition-all flex items-center gap-2"
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
