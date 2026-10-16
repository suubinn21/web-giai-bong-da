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
      <div className="bg-white border border-rose-200 rounded-3xl p-12 text-center space-y-4 shadow-xl text-slate-800">
        <div className="w-16 h-16 rounded-3xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-md">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <span className="text-xs uppercase tracking-widest font-black text-rose-700 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
            KHU VỰC BẢO MẬT NỘI BỘ
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
            Không Có Quyền Truy Cập Tài Chính
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
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
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-blue-200">
              QUẢN LÝ TÀI CHÍNH &amp; QUỸ GIẢI ĐẤU
            </span>
            <span className="text-xs text-slate-500 font-medium">Quy định Điều 16 &amp; Điều 27</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            Dashboard Thu Chi &amp; Lệ Phí Đội Bóng
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Quy định Điều 16: Lệ phí <strong className="text-slate-800">500.000 VNĐ / đội</strong>, Tiền ký quỹ <strong className="text-slate-800">50.000 VNĐ / đội</strong> (hạch toán riêng biệt).
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-sky-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs shadow-xs transition-all self-start md:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tạo Phiếu Thu / Chi Mới</span>
          </button>
        )}
      </div>

      {/* Financial Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Total Income */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              TỔNG THU (REVENUE)
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-600">
            {totalIncome.toLocaleString()} đ
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Lệ phí 16 đội, tiền ký quỹ, tài trợ từ Doanh nghiệp &amp; Đoàn Khoa.
          </p>
        </div>

        {/* Total Expense */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              TỔNG CHI (EXPENSES)
            </span>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-rose-600">
            {totalExpense.toLocaleString()} đ
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Thuê sân, thù lao trọng tài, cúp huy chương, in ấn, y tế và giải thưởng.
          </p>
        </div>

        {/* Balance */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              SỐ DƯ QUỸ (NET BALANCE)
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-blue-600">
            {balance >= 0 ? `+${balance.toLocaleString()}` : `${balance.toLocaleString()}`} đ
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Số dư an toàn phục vụ hoàn trả ký quỹ cho các đội và dự phòng.
          </p>
        </div>

      </div>

      {/* Team Fee Tracking Strip (Rule #16) */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-black text-slate-900">
              Theo Dõi Thu Lệ Phí &amp; Tiền Ký Quỹ 16 Đội (Điều 16)
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Đã thu: <strong className="text-slate-900">{teams.filter((t) => t.feeStatus === 'PAID').length}</strong> / 16 Đội
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {teams.map((t) => (
            <div
              key={t.id}
              className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between"
            >
              <div>
                <span className="text-xs font-bold text-slate-900 block truncate max-w-[150px]">
                  {t.name}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  500k LP + 50k KQ
                </span>
              </div>

              <button
                onClick={() => handleToggleTeamFee(t.id)}
                disabled={!canManage}
                className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition-all cursor-pointer ${
                  t.feeStatus === 'PAID'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                    : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                }`}
              >
                {t.feeStatus === 'PAID' ? '✓ ĐÃ NỘP' : 'CHƯA NỘP'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Transaction History Table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-blue-600" />
            <h4 className="text-sm font-black text-slate-900">
              Nhật Ký Thu Chi Chi Tiết ({filteredFinances.length} Khoản)
            </h4>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                filterType === 'ALL'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              Tất Cả
            </button>
            <button
              onClick={() => setFilterType('INCOME')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                filterType === 'INCOME'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              Khoản Thu (+)
            </button>
            <button
              onClick={() => setFilterType('EXPENSE')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                filterType === 'EXPENSE'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
              }`}
            >
              Khoản Chi (-)
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 text-[11px]">
              <tr>
                <th className="py-3 px-4 w-24">MÃ PHIẾU</th>
                <th className="py-3 px-3">DANH MỤC</th>
                <th className="py-3 px-4">NỘI DUNG THU CHI</th>
                <th className="py-3 px-3">ĐỐI TÁC / ĐƠN VỊ</th>
                <th className="py-3 px-3">NGÀY THỰC HIỆN</th>
                <th className="py-3 px-4 text-right">SỐ TIỀN (VNĐ)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredFinances.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-500">
                    {tx.id}
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-900">
                    {tx.categoryName}
                  </td>
                  <td className="py-3 px-4 text-slate-700">
                    {tx.description}
                  </td>
                  <td className="py-3 px-3 text-slate-500">
                    {tx.recipientOrPayer}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-500">
                    {tx.date}
                  </td>
                  <td
                    className={`py-3 px-4 text-right font-mono font-black text-sm ${
                      tx.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-4 text-slate-800">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <BadgeDollarSign className="w-5 h-5 text-blue-600" />
              Tạo Phiếu Thu / Chi Tài Chính Mới
            </h3>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Loại Nghiệp Vụ</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setTxType('INCOME');
                    setTxCategoryName('Lệ phí đăng ký giải');
                  }}
                  className={`p-2.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    txType === 'INCOME'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
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
                  className={`p-2.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    txType === 'EXPENSE'
                      ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  - Phiếu Chi (Expense)
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Danh Mục Khoản Thu/Chi</label>
              <input
                type="text"
                value={txCategoryName}
                onChange={(e) => setTxCategoryName(e.target.value)}
                placeholder="VD: Thuê sân cỏ, Thù lao trọng tài..."
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl p-2.5 focus:border-blue-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Số Tiền (VNĐ)</label>
              <input
                type="number"
                min={1000}
                step={50000}
                value={txAmount}
                onChange={(e) => setTxAmount(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl p-2.5 font-mono focus:border-blue-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Đối Tác / Người Nộp Hoặc Nhận</label>
              <input
                type="text"
                value={txPayerOrRecipient}
                onChange={(e) => setTxPayerOrRecipient(e.target.value)}
                placeholder="VD: BQL Sân Cỏ ĐHQG, Đội CNTT-K21..."
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl p-2.5 focus:border-blue-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Nội Dung Chi Tiết</label>
              <textarea
                rows={2}
                value={txDescription}
                onChange={(e) => setTxDescription(e.target.value)}
                placeholder="Mô tả hóa đơn, chứng từ liên quan..."
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl p-2.5 focus:border-blue-500 focus:bg-white focus:outline-none"
              ></textarea>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold border border-slate-200"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleCreateTransaction}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-sky-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-bold shadow-xs cursor-pointer"
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
