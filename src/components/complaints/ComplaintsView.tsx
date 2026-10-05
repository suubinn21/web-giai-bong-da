'use client';

import React, { useState, useEffect } from 'react';
import { Complaint, Match, Team, UserRole, ComplaintType, ComplaintStatus, UserAccount } from '@/types';
import { StorageService } from '@/services/storage';
import { 
  Clock, 
  AlertCircle, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  Lock, 
  MessageSquare, 
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';

interface ComplaintsViewProps {
  complaints: Complaint[];
  matches: Match[];
  teams: Team[];
  onComplaintsUpdate: (complaints: Complaint[]) => void;
  currentRole: UserRole;
  currentUser?: UserAccount | null;
}

export const ComplaintsView: React.FC<ComplaintsViewProps> = ({
  complaints,
  matches,
  teams,
  onComplaintsUpdate,
  currentRole,
  currentUser,
}) => {
  // Recently finished match eligible for complaints
  const finishedMatches = matches.filter((m) => m.status === 'FINISHED' && m.completedAt);
  
  // Phân quyền đội trưởng
  const isCaptain = currentRole === 'TEAM_MANAGER';
  const myTeam = isCaptain && currentUser?.teamId
    ? teams.find((t) => t.id === currentUser.teamId) || { id: currentUser.teamId, name: currentUser.teamName || 'Đội của bạn' }
    : null;

  // Timer state for 15-minute countdown
  const [timeLeftSec, setTimeLeftSec] = useState<number>(0);
  const [selectedMatchForComplaint, setSelectedMatchForComplaint] = useState<Match | null>(
    finishedMatches[0] || null
  );

  // New complaint form state
  const [modalOpen, setModalOpen] = useState(false);
  const [formTeamId, setFormTeamId] = useState('');
  const [formType, setFormType] = useState<ComplaintType>('REFEREE_DECISION');
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formEvidenceUrl, setFormEvidenceUrl] = useState('');

  // Review modal state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [reviewStatus, setReviewStatus] = useState<ComplaintStatus>('RESOLVED');
  const [reviewResponse, setReviewResponse] = useState('');

  const canReview = currentRole === 'SUPER_ADMIN' || currentRole === 'ORGANIZER';
  const canSubmit = currentRole === 'SUPER_ADMIN' || currentRole === 'ORGANIZER' || currentRole === 'TEAM_MANAGER';

  // Live 15-minute countdown calculation
  useEffect(() => {
    const updateCountdown = () => {
      if (!selectedMatchForComplaint || !selectedMatchForComplaint.completedAt) {
        setTimeLeftSec(0);
        return;
      }

      const completedTime = new Date(selectedMatchForComplaint.completedAt).getTime();
      const expiresTime = completedTime + 15 * 60 * 1000; // 15 mins window per Rule #17
      const now = Date.now();
      const diffSec = Math.max(0, Math.floor((expiresTime - now) / 1000));
      setTimeLeftSec(diffSec);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [selectedMatchForComplaint]);

  const isWindowExpired = timeLeftSec <= 0;

  const handleCreateComplaint = () => {
    const targetTeamId = isCaptain && currentUser?.teamId ? currentUser.teamId : formTeamId;

    if (!selectedMatchForComplaint || !targetTeamId || !formTitle || !formContent) {
      alert('Vui lòng điền đầy đủ tiêu đề và nội dung khiếu nại!');
      return;
    }

    if (isWindowExpired) {
      alert('Đã quá thời hạn 15 phút sau khi trận đấu kết thúc! Hệ thống tự động khóa chức năng gửi khiếu nại theo Điều 17.');
      return;
    }

    // Đội trưởng chỉ được khiếu nại trận đấu có đội mình thi đấu
    if (isCaptain && currentUser?.teamId) {
      const matchInvolvesMyTeam =
        selectedMatchForComplaint.homeTeamId === currentUser.teamId ||
        selectedMatchForComplaint.awayTeamId === currentUser.teamId;
      if (!matchInvolvesMyTeam) {
        alert(
          `Theo Điều 17 Điều lệ giải, chỉ 2 đội trực tiếp thi đấu trong trận (${selectedMatchForComplaint.roundLabel}) mới có quyền gửi khiếu nại. Đội của bạn không tham gia trận này!`
        );
        return;
      }
    }

    const team = teams.find((t) => t.id === targetTeamId);
    const newComplaint: Complaint = {
      id: `CMP-${Date.now().toString().slice(-4)}`,
      matchId: selectedMatchForComplaint.id,
      teamId: targetTeamId,
      teamName: team?.name || currentUser?.teamName || 'Đội khiếu nại',
      submittedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + timeLeftSec * 1000).toISOString(),
      type: formType,
      title: formTitle,
      content: formContent,
      evidenceUrls: formEvidenceUrl ? [formEvidenceUrl] : [],
      status: 'PENDING',
    };

    const updated = [newComplaint, ...complaints];
    onComplaintsUpdate(updated);
    StorageService.saveComplaints(updated);

    setModalOpen(false);
    setFormTitle('');
    setFormContent('');
    setFormEvidenceUrl('');

    StorageService.logAction(
      currentUser?.fullName || currentRole,
      currentRole,
      'GỬI ĐƠN KHIẾU NẠI TRẬN ĐẤU (ĐIỀU 17)',
      selectedMatchForComplaint.roundLabel,
      `Đội ${team?.name || targetTeamId} khiếu nại: "${newComplaint.title}" trong khung giờ 15 phút hợp lệ.`
    );
  };

  const handleSaveReview = () => {
    if (!selectedComplaint) return;

    selectedComplaint.status = reviewStatus;
    selectedComplaint.reviewerResponse = reviewResponse;
    selectedComplaint.resolvedAt = new Date().toISOString();

    const updated = [...complaints];
    onComplaintsUpdate(updated);
    StorageService.saveComplaints(updated);

    setReviewModalOpen(false);

    StorageService.logAction(
      currentRole,
      currentRole,
      'GIẢI QUYẾT KHIẾU NẠI TRẬN ĐẤU',
      `Đơn khiếu nại #${selectedComplaint.id}`,
      `Kết luận: ${reviewStatus}. Phản hồi của BTC: ${reviewResponse}`
    );
  };

  const formatMinSec = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner Card with 15-min Live Countdown Timer */}
      <div className="bg-[#0B132B] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-cyan-500/20 text-cyan-400 text-xs font-bold px-3 py-1 rounded-full border border-cyan-500/30 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                CỔNG KHIẾU NẠI 15 PHÚT SAU TRẬN ĐẤU
              </span>
              <span className="text-xs text-slate-400">Quy định Điều 17</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Quyền Khiếu Nại Của Các Đội Bóng
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Đội bóng có quyền gửi khiếu nại trong vòng đúng <strong>15 phút</strong> sau khi trận đấu kết thúc.
              Hệ thống tự động đếm ngược và khóa vĩnh viễn khi hết giờ.
            </p>
          </div>

          {/* Real-time 15-Minute Countdown Display */}
          <div className="flex items-center gap-4 bg-slate-900/90 p-4 rounded-2xl border border-slate-800 self-start md:self-auto">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-slate-400">
                Thời Hạn Khiếu Nại Trận Gần Nhất
              </span>
              <span className="text-xs text-emerald-400 font-semibold">
                {selectedMatchForComplaint?.roundLabel || 'Trận 01'}
              </span>
            </div>

            <div
              className={`px-4 py-2 rounded-xl font-mono text-xl font-black flex items-center gap-2 shadow-inner border ${
                !isWindowExpired
                  ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/50 animate-pulse'
                  : 'bg-red-950/80 text-red-400 border-red-500/40'
              }`}
            >
              {!isWindowExpired ? (
                <>
                  <Clock className="w-5 h-5 animate-spin-slow" />
                  <span>{formatMinSec(timeLeftSec)}</span>
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  <span className="text-xs font-sans font-bold">HẾT HẠN (ĐÃ KHÓA)</span>
                </>
              )}
            </div>

            {/* Submit button */}
            <button
              onClick={() => {
                if (!canSubmit) {
                  alert('Chỉ Đội Trưởng hoặc Ban Tổ Chức mới có thẩm quyền gửi khiếu nại trận đấu theo Điều lệ!');
                  return;
                }
                if (isWindowExpired) {
                  alert('Cửa sổ khiếu nại 15 phút đã khép lại!');
                  return;
                }
                if (isCaptain && currentUser?.teamId) {
                  setFormTeamId(currentUser.teamId);
                } else {
                  setFormTeamId(selectedMatchForComplaint?.homeTeamId || teams[0]?.id || '');
                }
                setModalOpen(true);
              }}
              disabled={isWindowExpired || !canSubmit}
              title={!canSubmit ? 'Chỉ dành cho Đội trưởng hoặc Ban Tổ Chức' : undefined}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-slate-950 font-bold text-xs shadow-lg transition-all"
            >
              + Gửi Khiếu Nại
            </button>
          </div>

        </div>
      </div>

      {/* Complaints List */}
      <div className="bg-[#0B132B]/90 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            <h4 className="text-sm font-black text-white">
              Danh Sách Đơn Khiếu Nại Đã Nhận ({complaints.length})
            </h4>
          </div>
          <span className="text-xs text-slate-400">Trạng thái: PENDING ➔ UNDER_REVIEW ➔ RESOLVED</span>
        </div>

        <div className="divide-y divide-slate-800/60">
          {complaints.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              Chưa có đơn khiếu nại nào được gửi.
            </div>
          ) : (
            complaints.map((c) => {
              const statusBadges: Record<ComplaintStatus, { label: string; color: string }> = {
                PENDING: { label: 'Chờ Tiếp Nhận', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
                UNDER_REVIEW: { label: 'Đang Xem Xét (Tổ VAR)', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' },
                APPROVED: { label: 'Chấp Thuận Khiếu Nại', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
                REJECTED: { label: 'Bác Bỏ Khiếu Nại', color: 'bg-red-500/20 text-red-300 border-red-500/40' },
                RESOLVED: { label: 'Đã Giải Quyết', color: 'bg-purple-500/20 text-purple-300 border-purple-500/40' },
              };

              return (
                <div key={c.id} className="p-5 hover:bg-slate-800/30 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-slate-400 font-bold">{c.id}</span>
                      <span className="text-sm font-bold text-white">{c.title}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          statusBadges[c.status].color
                        }`}
                      >
                        {statusBadges[c.status].label}
                      </span>

                      {canReview && (
                        <button
                          onClick={() => {
                            setSelectedComplaint(c);
                            setReviewResponse(c.reviewerResponse || '');
                            setReviewStatus(c.status);
                            setReviewModalOpen(true);
                          }}
                          className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-lg border border-slate-700 transition-colors"
                        >
                          Xử Lý BTC
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 mb-2">{c.content}</p>

                  <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/60">
                    <div className="flex items-center gap-3">
                      <span>Đội gửi: <strong className="text-white">{c.teamName}</strong></span>
                      <span>•</span>
                      <span>Loại: {c.type}</span>
                    </div>
                    <span>Gửi lúc: {new Date(c.submittedAt).toLocaleTimeString('vi-VN')}</span>
                  </div>

                  {c.reviewerResponse && (
                    <div className="mt-3 p-3 rounded-xl bg-slate-900/80 border border-purple-500/30 text-xs">
                      <span className="font-bold text-purple-300 block mb-1">
                        Kết Luận Chính Thức Của Ban Tổ Chức:
                      </span>
                      <span className="text-slate-300">{c.reviewerResponse}</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal 1: Submit Complaint */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-cyan-400" />
              Gửi Đơn Khiếu Nại (Điều 17)
            </h3>
            <p className="text-xs text-cyan-300 bg-cyan-950/40 p-2.5 rounded-lg border border-cyan-500/30">
              Thời gian còn lại: <strong>{formatMinSec(timeLeftSec)}</strong>. Đơn khiếu nại sẽ được Ban Tổ Chức và Tổ VAR tiếp nhận ngay lập tức.
            </p>

            <div>
              <label className="text-xs font-semibold text-white block mb-1">Đội Khiếu Nại</label>
              {isCaptain && currentUser?.teamId ? (
                <div className="w-full bg-slate-800 border border-emerald-500/40 text-emerald-400 font-bold text-xs rounded-xl p-2.5 flex items-center justify-between">
                  <span>{myTeam?.name || currentUser.teamName || 'Đội của bạn'}</span>
                  <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800">
                    Đội của bạn (Đã khóa)
                  </span>
                </div>
              ) : (
                <select
                  value={formTeamId}
                  onChange={(e) => setFormTeamId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl p-2.5"
                >
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Cảnh báo nếu Đội trưởng chọn trận đấu không có đội mình thi đấu */}
            {isCaptain && currentUser?.teamId && selectedMatchForComplaint && (
              selectedMatchForComplaint.homeTeamId !== currentUser.teamId &&
              selectedMatchForComplaint.awayTeamId !== currentUser.teamId
            ) && (
              <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-300 text-xs flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  Trận đấu <strong>{selectedMatchForComplaint.roundLabel}</strong> không có sự tham gia của đội bạn ({myTeam?.name}). Theo Điều 17 Điều lệ giải, chỉ 2 đội trực tiếp thi đấu mới được gửi khiếu nại.
                </span>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-white block mb-1">Loại Khiếu Nại</label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value as ComplaintType)}
                className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl p-2.5"
              >
                <option value="REFEREE_DECISION">Quyết định của Trọng tài (Bàn thắng/Thẻ phạt)</option>
                <option value="PLAYER_ELIGIBILITY">Tư cách cầu thủ (Gian lận sinh viên/Treo giò)</option>
                <option value="UNSPORTSMANLIKE">Hành vi phi thể thao / Bạo lực sân cỏ</option>
                <option value="FACILITY">Cơ sở vật chất / Sân bãi</option>
                <option value="OTHER">Lý do khác</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-white block mb-1">Tiêu Đề Khiếu Nại</label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="VD: Khiếu nại tình huống thẻ vàng phút 25..."
                className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl p-2.5"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-white block mb-1">Nội Dung Chi Tiết</label>
              <textarea
                rows={3}
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                placeholder="Mô tả chi tiết tình huống, phút diễn ra, cầu thủ liên quan..."
                className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl p-2.5"
              ></textarea>
            </div>

            <div>
              <label className="text-xs font-semibold text-white block mb-1">Link Ảnh / Video Bằng Chứng</label>
              <input
                type="text"
                value={formEvidenceUrl}
                onChange={(e) => setFormEvidenceUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl p-2.5"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleCreateComplaint}
                disabled={
                  Boolean(isCaptain &&
                  currentUser?.teamId &&
                  selectedMatchForComplaint &&
                  selectedMatchForComplaint.homeTeamId !== currentUser.teamId &&
                  selectedMatchForComplaint.awayTeamId !== currentUser.teamId)
                }
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 text-xs font-bold shadow-lg transition-all"
              >
                Nộp Đơn Khiếu Nại
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: BTC Review */}
      {reviewModalOpen && selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-purple-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-purple-400" />
              Giải Quyết Khiếu Nại (Ban Tổ Chức)
            </h3>

            <div>
              <label className="text-xs font-semibold text-white block mb-1">Cập Nhật Trạng Thái</label>
              <select
                value={reviewStatus}
                onChange={(e) => setReviewStatus(e.target.value as ComplaintStatus)}
                className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl p-2.5 font-bold"
              >
                <option value="UNDER_REVIEW">Đang Kiểm Tra Lại Băng Hình</option>
                <option value="APPROVED">Chấp Thuận Khiếu Nại (Sửa Biên Bản)</option>
                <option value="REJECTED">Bác Bỏ Khiếu Nại (Giữ Nguyên Quyết Định)</option>
                <option value="RESOLVED">Đã Xử Lý Xong</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-white block mb-1">Ý Kiến Kết Luận Của BTC</label>
              <textarea
                rows={3}
                value={reviewResponse}
                onChange={(e) => setReviewResponse(e.target.value)}
                placeholder="Nhập thông báo kết luận gửi cho các đội bóng..."
                className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl p-2.5"
              ></textarea>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setReviewModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={handleSaveReview}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg"
              >
                Lưu Kết Luận & Ghi Audit Log
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
