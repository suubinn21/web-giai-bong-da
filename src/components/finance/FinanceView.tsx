'use client';

import React, { useState } from 'react';
import { FinancialTransaction, Team, UserRole, RevenueCategory, ExpenseCategory, PaymentStatus } from '@/types';
import { StorageService } from '@/services/storage';
import { 
  BadgeDollarSign, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Plus, 
  Receipt, 
  CheckCircle2, 
  AlertCircle,
  FileSpreadsheet,
  Lock
} from 'lucide-react';

interface FinanceViewProps {
  finances: FinancialTransaction[];
  teams: Team[];
  onFinancesUpdate: (finances: FinancialTransaction[]) => void;
  onTeamsUpdate: (teams: Team[]) => void;
  currentRole: UserRole;
}

export const FinanceView: React.FC<FinanceViewProps> = ({
  finances,
  teams,
  onFinancesUpdate,
  onTeamsUpdate,
  currentRole,
}) => {
  const [filterType, setFilterType] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
  const [modalOpen, setModalOpen] = useState(false);

  // New Transaction Form
  const [txType, setTxType] = useState<'INCOME' | 'EXPENSE'>('INCOME');
  const [txCategoryName, setTxCategoryName] = useState('Lệ phí thi đấu');
  const [txAmount, setTxAmount] = useState<number>(500000);
  const [txDescription, setTxDescription] = useState('');
  const [txPayerOrRecipient, setTxPayerOrRecipient] = useState('');

  const canManage = currentRole === 'SUPER_ADMIN' || currentRole === 'ORGANIZER';

  if (!canManage) {
    return (
      <div className="bg-[#0B132B] border border-red-500/30 rounded-3xl p-12 text-center space-y-4 shadow-xl">
        <div className="w-16 h-16 rounded-3xl bg-red-950/80 border border-red-500/40 text-red-400 flex items-center justify-center mx-auto shadow-lg shadow-red-500/10">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <span className="text-xs uppercase tracking-widest font-black text-red-400 bg-red-950/60 px-3 py-1 rounded-full border border-red-500/30">
            KHU VỰC BẢO MẬT NỘI BỘ
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-2">
            Không Có Quyền Truy Cập Tài Chính
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
          Thông tin thu / chi, tiền ký quỹ và quyết toán lệ phí là dữ liệu tài chính nội bộ chỉ dành riêng cho <strong>Ban Tổ Chức (BTC)</strong> và <strong>Super Admin</strong>. Trọng tài, Đội trưởng và Sinh viên không được cấp quyền xem dữ liệu này.
        </p>
      </div>
    );
  }

  const totalIncome = finances
    .filter((f) => f.type === 'INCOME')
    .reduce((acc, cur) => acc + cur.amount, 0);

  const totalExpense = finances
    .filter((f) => f.type === 'EXPENSE')
    .reduce((acc, cur) => acc + cur.amount, 0);

  const balance = totalIncome - totalExpense;

  const handleCreateTransaction = () => {
    if (!txDescription || !txPayerOrRecipient || txAmount <= 0) {
      alert('Vui lòng điền đầy đủ số tiền, người nộp/nhận và mô tả khoản thu chi!');
      return;
    }

    const newTx: FinancialTransaction = {
      id: `FIN-${Date.now().toString().slice(-4)}`,
      type: txType,
      category: txType === 'INCOME' ? 'REGISTRATION_FEE' : 'OTHER',
      categoryName: txCategoryName,
      amount: txAmount,
      date: new Date().toISOString().split('T')[0],
      description: txDescription,
      recipientOrPayer: txPayerOrRecipient,
    };

    const updated = [newTx, ...finances];
    onFinancesUpdate(updated);
    StorageService.saveFinances(updated);

    setModalOpen(false);
    setTxDescription('');
    setTxPayerOrRecipient('');

    StorageService.logAction(
      currentRole,
      currentRole,
      'GHI NHẬN THU CHI TÀI CHÍNH',
      `${txType === 'INCOME' ? 'Thu' : 'Chi'}: ${txAmount.toLocaleString()} VNĐ`,
      `${txCategoryName}: ${txDescription} (${txPayerOrRecipient})`
    );
  };

  // Toggle Team Fee Payment Status (Rule #16)
  const handleToggleTeamFee = (teamId: string) => {
    if (!canManage) return;
    const team = teams.find((t) => t.id === teamId);
    if (!team) return;

    const nextStatus: PaymentStatus = team.feeStatus === 'PAID' ? 'UNPAID' : 'PAID';
    const updated = teams.map((t) => (t.id === teamId ? { ...t, feeStatus: nextStatus } : t));

    onTeamsUpdate(updated);
    StorageService.saveTeams(updated);

    StorageService.logAction(
      currentRole,
      currentRole,
      'CẬP NHẬT ĐÓNG LỆ PHÍ ĐỘI',
      team.name,
      `Chuyển trạng thái đóng lệ phí (500k) & ký quỹ (50k) sang: ${nextStatus}`
    );
  };

  const filteredFinances = finances.filter((f) => {
    if (filterType !== 'ALL' && f.type !== filterType) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner Card */}
      <div className="bg-[#0B132B] border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-emerald-500/20 text-emerald-400 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
              QUẢN LÝ TÀI CHÍNH & QUỸ GIẢI ĐẤU
            </span>
            <span className="text-xs text-slate-400">Quy định Điều 16 & Điều 27</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Dashboard Thu Chi & Lệ Phí Đội Bóng
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Quy định Điều 16: Lệ phí <strong>500.000 VNĐ / đội</strong>, Tiền ký quỹ <strong>50.000 VNĐ / đội</strong> (hạch toán riêng biệt).
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/25 transition-all self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tạo Phiếu Thu / Chi Mới</span>
          </button>
        )}
      </div>

      {/* Financial Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Total Income */}
        <div className="p-6 rounded-3xl bg-[#0B132B]/90 border border-emerald-500/30 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              TỔNG THU (REVENUE)
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">
            {totalIncome.toLocaleString()} đ
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Lệ phí 16 đội, tiền ký quỹ, tài trợ từ Doanh nghiệp & Đoàn Khoa.
          </p>
        </div>

        {/* Total Expense */}
        <div className="p-6 rounded-3xl bg-[#0B132B]/90 border border-red-500/30 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              TỔNG CHI (EXPENSES)
            </span>
            <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-red-400">
            {totalExpense.toLocaleString()} đ
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Thuê sân, thù lao trọng tài, cúp huy chương, in ấn, y tế và giải thưởng.
          </p>
        </div>

        {/* Balance */}
        <div className="p-6 rounded-3xl bg-[#0B132B]/90 border border-cyan-500/30 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              SỐ DƯ QUỸ (NET BALANCE)
            </span>
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-cyan-400">
            {balance >= 0 ? `+${balance.toLocaleString()}` : `${balance.toLocaleString()}`} đ
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Số dư an toàn phục vụ hoàn trả ký quỹ cho các đội và dự phòng.
          </p>
        </div>

      </div>

      {/* Team Fee Tracking Strip (Rule #16) */}
      <div className="bg-[#0B132B]/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-black text-white">
              Theo Dõi Thu Lệ Phí & Tiền Ký Quỹ 16 Đội (Điều 16)
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Đã thu: {teams.filter((t) => t.feeStatus === 'PAID').length} / 16 Đội
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {teams.map((t) => (
            <div
              key={t.id}
              className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between"
            >
              <div>
                <span className="text-xs font-bold text-white block truncate max-w-[150px]">
                  {t.name}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  500k LP + 50k KQ
                </span>
              </div>

              <button
                onClick={() => handleToggleTeamFee(t.id)}
                disabled={!canManage}
                className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition-all ${
                  t.feeStatus === 'PAID'
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                    : 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                }`}
              >
                {t.feeStatus === 'PAID' ? '✓ ĐÃ NỘP' : 'CHƯA NỘP'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Transaction History Table */}
      <div className="bg-[#0B132B]/90 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <h4 className="text-sm font-black text-white">
              Nhật Ký Thu Chi Chi Tiết ({filteredFinances.length} Khoản)
            </h4>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-3 py-1 rounded-xl font-bold transition-all ${
                filterType === 'ALL'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Tất Cả
            </button>
            <button
              onClick={() => setFilterType('INCOME')}
              className={`px-3 py-1 rounded-xl font-bold transition-all ${
                filterType === 'INCOME'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Khoản Thu (+)
            </button>
            <button
              onClick={() => setFilterType('EXPENSE')}
              className={`px-3 py-1 rounded-xl font-bold transition-all ${
                filterType === 'EXPENSE'
                  ? 'bg-red-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Khoản Chi (-)
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 font-bold border-b border-slate-800 text-[11px]">
              <tr>
                <th className="py-3 px-4 w-24">MÃ PHIẾU</th>
                <th className="py-3 px-3">DANH MỤC</th>
                <th className="py-3 px-4">NỘI DUNG THU CHI</th>
                <th className="py-3 px-3">ĐỐI TÁC / ĐƠN VỊ</th>
                <th className="py-3 px-3">NGÀY THỰC HIỆN</th>
                <th className="py-3 px-4 text-right">SỐ TIỀN (VNĐ)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredFinances.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-400">
                    {tx.id}
                  </td>
                  <td className="py-3 px-3 font-semibold text-white">
                    {tx.categoryName}
                  </td>
                  <td className="py-3 px-4 text-slate-300">
                    {tx.description}
                  </td>
                  <td className="py-3 px-3 text-slate-400">
                    {tx.recipientOrPayer}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-500">
                    {tx.date}
                  </td>
                  <td
                    className={`py-3 px-4 text-right font-mono font-black text-sm ${
                      tx.type === 'INCOME' ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {tx.type === 'INCOME' ? `+${tx.amount.toLocaleString()}` : `-${tx.amount.toLocaleString()}`} đ
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add Financial Transaction */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <BadgeDollarSign className="w-5 h-5 text-emerald-400" />
              Tạo Phiếu Thu / Chi Tài Chính Mới
            </h3>

            <div>
              <label className="text-xs font-semibold text-white block mb-1">Loại Nghiệp Vụ</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setTxType('INCOME');
                    setTxCategoryName('Lệ phí đăng ký giải');
                  }}
                  className={`p-2.5 rounded-xl text-xs font-bold border transition-colors ${
                    txType === 'INCOME'
                      ? 'bg-emerald-600 text-white border-emerald-400'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  + Phiếu Thu (Income)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTxType('EXPENSE');
                    setTxCategoryName('Chi phí thuê sân');
                  }}
                  className={`p-2.5 rounded-xl text-xs font-bold border transition-colors ${
                    txType === 'EXPENSE'
                      ? 'bg-red-600 text-white border-red-400'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  - Phiếu Chi (Expense)
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-white block mb-1">Danh Mục Khoản Thu/Chi</label>
              <input
                type="text"
                value={txCategoryName}
                onChange={(e) => setTxCategoryName(e.target.value)}
                placeholder="VD: Thuê sân cỏ, Thù lao trọng tài..."
                className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl p-2.5"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-white block mb-1">Số Tiền (VNĐ)</label>
              <input
                type="number"
                min={1000}
                step={50000}
                value={txAmount}
                onChange={(e) => setTxAmount(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl p-2.5 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-white block mb-1">Đối Tác / Người Nộp Hoặc Nhận</label>
              <input
                type="text"
                value={txPayerOrRecipient}
                onChange={(e) => setTxPayerOrRecipient(e.target.value)}
                placeholder="VD: BQL Sân Cỏ ĐHQG, Đội CNTT-K21..."
                className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl p-2.5"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-white block mb-1">Nội Dung Chi Tiết</label>
              <textarea
                rows={2}
                value={txDescription}
                onChange={(e) => setTxDescription(e.target.value)}
                placeholder="Mô tả hóa đơn, chứng từ liên quan..."
                className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl p-2.5"
              ></textarea>
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
                onClick={handleCreateTransaction}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold shadow-lg"
              >
                Lưu Phiếu Thu Chi
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
