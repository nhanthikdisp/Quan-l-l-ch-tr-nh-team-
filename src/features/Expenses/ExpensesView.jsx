import React from 'react';
import { useTrip } from '../../store/TripContext';

export default function ExpensesView() {
  const { events, members, calculateExpenses } = useTrip();
  const { totalTripCost, memberStats, settlements } = calculateExpenses();
  const expenseEvents = events.filter(e => e.cost > 0 && e.status !== 'Hủy' && e.status !== 'Chờ duyệt');

  return (
    <div className="space-y-6">

      <div className="bg-surface-container-lowest rounded-3xl p-6 lg:p-8 shadow-tactile border-2 border-cow-spot relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="px-3 py-1 bg-pastel-green text-green-900 font-extrabold text-xs rounded-full border border-green-300">
              💰 TỔNG QUAN THU CHI CHUYẾN ĐỊ
            </span>
            <h2 className="text-3xl font-extrabold text-cow-spot mt-2">
              {totalTripCost.toLocaleString('vi-VN')} VNĐ
            </h2>
            <p className="text-xs text-on-surface-variant font-medium">
              Chi phí được tính dựa trên các sự kiện chính thức đã được duyệt và thực hiện
            </p>
          </div>

          <div className="flex flex-wrap gap-4 bg-surface-container-low p-4 rounded-2xl border border-surface-variant">
            <div className="text-center px-4 border-r border-surface-variant">
              <p className="text-[11px] font-bold text-on-surface-variant uppercase">Sự kiện có phí</p>
              <p className="text-lg font-extrabold text-cow-spot">{expenseEvents.length}</p>
            </div>
            <div className="text-center px-4 border-r border-surface-variant">
              <p className="text-[11px] font-bold text-on-surface-variant uppercase">Trung bình / người</p>
              <p className="text-lg font-extrabold text-tertiary">
                {members.length > 0 ? Math.round(totalTripCost / members.length).toLocaleString('vi-VN') : 0} VNĐ
              </p>
            </div>
            <div className="text-center px-4">
              <p className="text-[11px] font-bold text-on-surface-variant uppercase">Thành viên</p>
              <p className="text-lg font-extrabold text-cow-spot">{members.length} người</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-tactile border border-surface-variant">
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-tertiary text-2xl">account_balance_wallet</span>
          <div>
            <h3 className="text-base font-extrabold text-cow-spot">BẢNG TÍNH "AI NỢ AI BAO NHIÊU"</h3>
            <p className="text-xs text-on-surface-variant font-medium">Chi tiết Đã ứng – Phải trả = Dư / Nợ cho từng thành viên</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-surface-container-high text-cow-spot text-xs font-bold uppercase tracking-wider border-b border-surface-variant">
                <th className="p-3.5 rounded-l-2xl">Thành Viên</th>
                <th className="p-3.5">Đã Ứng Trả (Paid)</th>
                <th className="p-3.5">Phải Chịu (Share)</th>
                <th className="p-3.5 rounded-r-2xl">Kết Quả (Dư / Nợ)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-variant text-xs font-semibold">
              {memberStats.map(stat => {
                const isCreditor = stat.netBalance > 0;
                const isDebtor = stat.netBalance < 0;

                return (
                  <tr key={stat.member.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="p-3.5 flex items-center gap-3">
                      <img src={stat.member.avatar} alt={stat.member.name} className="w-8 h-8 rounded-full bg-soft-pink" />
                      <div>
                        <p className="font-bold text-cow-spot">{stat.member.name}</p>
                        <span className="text-[10px] text-on-surface-variant">{stat.member.skillRole}</span>
                      </div>
                    </td>
                    <td className="p-3.5 font-bold text-green-800">
                      {stat.totalPaid.toLocaleString('vi-VN')} VNĐ
                    </td>
                    <td className="p-3.5 font-bold text-on-surface-variant">
                      {stat.totalShare.toLocaleString('vi-VN')} VNĐ
                    </td>
                    <td className="p-3.5">
                      {isCreditor && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-pastel-green text-green-900 font-extrabold rounded-full border border-green-300">
                          <span className="material-symbols-outlined text-xs">arrow_downward</span>
                          Được nhận lại +{stat.netBalance.toLocaleString('vi-VN')} VNĐ
                        </span>
                      )}
                      {isDebtor && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-rose-100 text-rose-900 font-extrabold rounded-full border border-rose-300">
                          <span className="material-symbols-outlined text-xs">arrow_upward</span>
                          Cần trả thêm -{Math.abs(stat.netBalance).toLocaleString('vi-VN')} VNĐ
                        </span>
                      )}
                      {stat.netBalance === 0 && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-700 font-bold rounded-full border border-slate-300">
                          Đã hòa vốn
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-tactile border border-surface-variant">
        <h3 className="text-base font-extrabold text-cow-spot flex items-center gap-2 mb-3">
          <span className="material-symbols-outlined text-tertiary">swap_horiz</span>
          Gợi Ý Chuyển Khoản Quyết Toán Tối Ưu
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {settlements.map((s, idx) => (
            <div key={idx} className="p-4 bg-surface-container-low rounded-2xl border border-surface-variant flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-800 flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined">send</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-cow-spot">
                    <strong>{s.fromMember.name}</strong> chuyển cho <strong>{s.toMember.name}</strong>
                  </p>
                  <p className="text-[11px] text-on-surface-variant font-medium">Quyết toán số dư chuyến đi</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-extrabold text-tertiary bg-white px-3 py-1 rounded-full border border-tertiary shadow-xs">
                  {s.amount.toLocaleString('vi-VN')} VNĐ
                </span>
              </div>
            </div>
          ))}

          {settlements.length === 0 && (
            <div className="col-span-2 text-center py-6 text-xs text-on-surface-variant font-semibold">
              Tất cả các chi phí đã được cân bằng hoàn toàn! Không có giao dịch nợ nào cần xử lý.
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
