'use client';

import React, { useState } from 'react';
import { AuditLog, UserRole } from '@/types';
import { FileText, Shield, Search, Filter, Clock } from 'lucide-react';

interface AuditLogsViewProps {
  logs: AuditLog[];
  currentRole: UserRole;
}

export const AuditLogsView: React.FC<AuditLogsViewProps> = ({ logs, currentRole }) => {
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<string>('ALL');

  const filteredLogs = logs.filter((l) => {
    if (filterRole !== 'ALL' && l.actorRole !== filterRole) return false;
    if (
      search &&
      !l.action.toLowerCase().includes(search.toLowerCase()) &&
      !l.actorName.toLowerCase().includes(search.toLowerCase()) &&
      !l.target.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-[#0B132B] border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-red-500/20 text-red-400 text-xs font-bold px-2.5 py-0.5 rounded-full border border-red-500/30 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" />
              AUDIT LOG & BẢO MẬT HỆ THỐNG
            </span>
            <span className="text-xs text-slate-400">Quy định Điều 18 & 26</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Nhật Ký Thao Tác & Kiểm Soát Dữ Liệu
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Mọi thay đổi tỷ số, thẻ phạt sau trận đấu, xử lý bỏ cuộc, bốc thăm hoặc điều chỉnh lịch đều được ghi nhận vĩnh viễn kèm lý do.
          </p>
        </div>

        <div className="text-xs text-slate-400 bg-slate-900 px-4 py-2 rounded-xl border border-slate-800">
          Tổng số ghi nhận: <strong className="text-white font-mono">{logs.length} thao tác</strong>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo hành động, người thực hiện hoặc đối tượng..."
            className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl pl-9 pr-3 py-2.5 focus:border-red-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2"
          >
            <option value="ALL">Tất Cả Vai Trò (Roles)</option>
            <option value="SUPER_ADMIN">Super Admin</option>
            <option value="ORGANIZER">Ban Tổ Chức (BTC)</option>
            <option value="REFEREE">Trọng Tài</option>
            <option value="TEAM_MANAGER">Trưởng Đoàn</option>
          </select>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-[#0B132B]/90 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 font-bold border-b border-slate-800 text-[11px]">
              <tr>
                <th className="py-3 px-4 w-40">THỜI GIAN</th>
                <th className="py-3 px-3">NGƯỜI THỰC HIỆN</th>
                <th className="py-3 px-3">VAI TRÒ</th>
                <th className="py-3 px-4">HÀNH ĐỘNG</th>
                <th className="py-3 px-4">ĐỐI TƯỢNG</th>
                <th className="py-3 px-4">CHI TIẾT & LÝ DO THAY ĐỔI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-slate-400 whitespace-nowrap">
                    {log.timestamp}
                  </td>

                  <td className="py-3.5 px-3 font-semibold text-white">
                    {log.actorName}
                  </td>

                  <td className="py-3.5 px-3">
                    <span className="text-[10px] font-mono font-bold bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                      {log.actorRole}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-bold text-amber-400">
                    {log.action}
                  </td>

                  <td className="py-3.5 px-4 text-emerald-400 font-medium">
                    {log.target}
                  </td>

                  <td className="py-3.5 px-4 text-slate-300">
                    <div>{log.details}</div>
                    {log.reason && (
                      <div className="mt-1 text-[11px] text-amber-300/80 italic">
                        Lý do: &quot;{log.reason}&quot;
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
