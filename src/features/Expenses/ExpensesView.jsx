import React, { useState } from 'react';
import { useTrip } from '../../store/TripContext';
import { useAuth } from '../../store/AuthContext';

export default function ExpensesView() {
  const { events, members, calculateExpenses, addParticipantByEmail, removeParticipantFromEvent, addEventPayment, removeEventPayment } = useTrip();
  const { isLead } = useAuth();
  
  const { totalTripCost, eventStats = [], memberStats = [], settlements = [] } = calculateExpenses();
  
  // Selected Event State for detailed inspection & email input
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [inputEmail, setInputEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [emailSuccess, setEmailSuccess] = useState('');

  // Payment item creation state
  const [paymentTitle, setPaymentTitle] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentPayerEmail, setPaymentPayerEmail] = useState('');
  const [paymentError, setPaymentError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState('');

  // Selected Event detail object
  const selectedEventStat = eventStats.find(es => es.event.id === selectedEventId) || (eventStats.length > 0 ? eventStats[0] : null);

  const handleAddEmail = async (e) => {
    e.preventDefault();
    if (!selectedEventStat) return;
    setEmailError('');
    setEmailSuccess('');

    try {
      await addParticipantByEmail(selectedEventStat.event.id, inputEmail);
      setEmailSuccess(`Đã thêm thành viên (${inputEmail.trim()}) vào sự kiện thành công!`);
      setInputEmail('');
    } catch (err) {
      setEmailError(err.message || 'Lỗi thêm thành viên vào sự kiện!');
    }
  };

  const handleRemoveParticipant = async (targetIdOrEmail) => {
    if (!selectedEventStat) return;
    if (!window.confirm('Bạn có chắc chắn muốn xóa thành viên này khỏi sự kiện?')) return;
    try {
      await removeParticipantFromEvent(selectedEventStat.event.id, targetIdOrEmail);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddPayment = async (e) => {
    e.preventDefault();
    if (!selectedEventStat) return;
    setPaymentError('');
    setPaymentSuccess('');

    try {
      const selectedPayer = paymentPayerEmail || (selectedEventStat.participants[0]?.email || selectedEventStat.participants[0]?.id || '');
      await addEventPayment(selectedEventStat.event.id, {
        title: paymentTitle,
        amount: paymentAmount,
        payerEmail: selectedPayer
      });
      setPaymentSuccess(`Đã phân bổ khoản chi "${paymentTitle}" (${Number(paymentAmount).toLocaleString('vi-VN')} VNĐ) thành công!`);
      setPaymentTitle('');
      setPaymentAmount('');
    } catch (err) {
      setPaymentError(err.message || 'Lỗi khi thêm khoản chi tiêu!');
    }
  };

  const handleRemovePayment = async (payId) => {
    if (!selectedEventStat) return;
    if (!window.confirm('Bạn có chắc muốn xóa khoản chi này khỏi sự kiện?')) return;
    try {
      await removeEventPayment(selectedEventStat.event.id, payId);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">

      {/* TỔNG QUAN THU CHI */}
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
              Chi phí được tính dựa trên các sự kiện chính thức đã duyệt và phân chia thực tế
            </p>
          </div>

          <div className="flex flex-wrap gap-4 bg-surface-container-low p-4 rounded-2xl border border-surface-variant">
            <div className="text-center px-4 border-r border-surface-variant">
              <p className="text-[11px] font-bold text-on-surface-variant uppercase">Sự kiện có phí</p>
              <p className="text-lg font-extrabold text-cow-spot">{eventStats.length}</p>
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

      {/* DANH SÁCH EVENT KÈM NGÀY & CHI TIẾT SỰ KIỆN */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* CỘT TRÁI: Danh sách Event kèm Ngày */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-cow-spot flex items-center gap-2">
              <span className="material-symbols-outlined text-tertiary">event_note</span>
              Danh Sách Sự Kiện Theo Ngày
            </h3>
            <span className="text-xs text-on-surface-variant font-bold">{eventStats.length} sự kiện</span>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {eventStats.map(stat => {
              const isSelected = selectedEventStat?.event.id === stat.event.id;
              const hasMultiplePayments = stat.payments && stat.payments.length > 0;

              return (
                <div
                  key={stat.event.id}
                  onClick={() => setSelectedEventId(stat.event.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-50/80 border-tertiary shadow-md ring-2 ring-tertiary/30'
                      : 'bg-surface-container-lowest border-surface-variant hover:border-tertiary/50 hover:bg-surface-container-low'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-0.5 bg-tertiary/10 text-tertiary text-[11px] font-bold rounded-lg border border-tertiary/20 flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">calendar_today</span>
                      {stat.event.date}
                    </span>
                    <span className="text-xs font-extrabold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                      {stat.cost.toLocaleString('vi-VN')} VNĐ
                    </span>
                  </div>

                  <h4 className="font-extrabold text-cow-spot text-sm line-clamp-1 mb-1">
                    {stat.event.title}
                  </h4>

                  <div className="flex items-center justify-between text-xs text-on-surface-variant font-medium mt-2 pt-2 border-t border-surface-variant/60">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs text-amber-700">payments</span>
                      {hasMultiplePayments ? (
                        <span className="text-emerald-800 font-bold">{stat.payments.length} khoản chi</span>
                      ) : (
                        <span>Trả bởi: <strong>{stat.event.createdByName || 'Tài khoản'}</strong></span>
                      )}
                    </span>
                    <span className="flex items-center gap-1 bg-surface-container-high px-2 py-0.5 rounded-full font-bold text-cow-spot">
                      <span className="material-symbols-outlined text-xs text-tertiary">groups</span>
                      {stat.count} người tham gia
                    </span>
                  </div>
                </div>
              );
            })}

            {eventStats.length === 0 && (
              <div className="p-8 text-center bg-surface-container-lowest rounded-2xl border border-surface-variant text-xs font-semibold text-on-surface-variant">
                Chưa có sự kiện có chi phí nào trong chuyến đi.
              </div>
            )}
          </div>
        </div>

        {/* CỘT PHẢI: Chi tiết Event chọn & Quản lý Khoản Chi Multi-Payer */}
        <div className="lg:col-span-7">
          {selectedEventStat ? (
            <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-tactile border-2 border-tertiary/30 space-y-6">
              
              {/* Header Event detail */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-surface-variant">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 bg-tertiary text-white font-bold text-xs rounded-md">
                      📅 {selectedEventStat.event.date}
                    </span>
                    <span className="text-xs font-semibold text-on-surface-variant">
                      {selectedEventStat.event.startTime} - {selectedEventStat.event.endTime}
                    </span>
                  </div>
                  <h3 className="text-xl font-extrabold text-cow-spot">
                    {selectedEventStat.event.title}
                  </h3>
                </div>
                <div className="text-right bg-amber-50 p-3 rounded-2xl border border-amber-200">
                  <p className="text-[10px] uppercase font-bold text-amber-800">Tổng Chi Phí Sự Kiện</p>
                  <p className="text-lg font-black text-rose-700">
                    {selectedEventStat.cost.toLocaleString('vi-VN')} VNĐ
                  </p>
                </div>
              </div>

              {/* Thông số Chia Đều */}
              <div className="p-4 bg-surface-container-low rounded-2xl border border-surface-variant flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-tertiary/10 text-tertiary flex items-center justify-center font-bold">
                    <span className="material-symbols-outlined">calculate</span>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-on-surface-variant uppercase">Mức Chia Đều / Mỗi Người Tham Gia</p>
                    <p className="text-base font-black text-tertiary">
                      {selectedEventStat.perPersonShare.toLocaleString('vi-VN')} VNĐ / người
                    </p>
                  </div>
                </div>
                <div className="text-right text-xs font-semibold text-on-surface-variant">
                  ({selectedEventStat.cost.toLocaleString('vi-VN')} ÷ {selectedEventStat.count} người)
                </div>
              </div>

              {/* PHẦN 1: QUẢN LÝ CÁC KHOẢN CHI TIÊU (Nhiều người trả) */}
              <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-300/80 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-800 text-xl">receipt_long</span>
                    <h4 className="text-xs font-extrabold text-emerald-900 uppercase tracking-wide">
                      Phân Bổ Các Khoản Chi Tiêu Trong Sự Kiện ({selectedEventStat.payments.length} khoản)
                    </h4>
                  </div>
                  {isLead && (
                    <span className="px-2 py-0.5 bg-emerald-200 text-emerald-900 font-extrabold text-[10px] rounded-md">
                      Quyền Leader Phân Bổ
                    </span>
                  )}
                </div>

                {/* Danh sách các khoản chi hiện tại */}
                <div className="space-y-2">
                  {selectedEventStat.payments.map((pay) => (
                    <div key={pay.id} className="p-3 bg-white rounded-xl border border-emerald-200 flex items-center justify-between gap-3 text-xs shadow-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                          💰
                        </div>
                        <div>
                          <p className="font-bold text-cow-spot">{pay.title}</p>
                          <p className="text-[10px] text-emerald-800 font-semibold">
                            Người trả: <strong>{pay.payerName}</strong> ({pay.payerEmail})
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-extrabold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                          +{Number(pay.amount).toLocaleString('vi-VN')} VNĐ
                        </span>
                        {isLead && (
                          <button
                            onClick={() => handleRemovePayment(pay.id)}
                            title="Xóa khoản chi này"
                            className="w-7 h-7 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 flex items-center justify-center transition-colors"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {selectedEventStat.payments.length === 0 && (
                    <div className="p-3 bg-white/80 rounded-xl border border-dashed border-emerald-300 text-center text-xs text-slate-600 font-medium">
                      Chưa phân bổ khoản chi cụ thể. {isLead ? 'Hãy nhập bên dưới để thêm khoản chi đầu tiên!' : ''}
                    </div>
                  )}
                </div>

                {/* Form thêm khoản chi mới dành cho Leader */}
                {isLead && (
                  <form onSubmit={handleAddPayment} className="pt-3 border-t border-emerald-200/80 space-y-2">
                    <p className="text-[11px] font-bold text-emerald-900 uppercase">+ Leader Thêm Khoản Chi Mới:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        required
                        placeholder="Tên khoản (vd: Tiền vé, Nước...)"
                        value={paymentTitle}
                        onChange={(e) => setPaymentTitle(e.target.value)}
                        className="px-3 py-2 text-xs rounded-xl border border-emerald-300 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-tertiary"
                      />
                      <input
                        type="number"
                        required
                        min="1000"
                        step="1000"
                        placeholder="Số tiền (VNĐ)"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        className="px-3 py-2 text-xs rounded-xl border border-emerald-300 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-tertiary"
                      />
                      <select
                        value={paymentPayerEmail}
                        onChange={(e) => setPaymentPayerEmail(e.target.value)}
                        className="px-3 py-2 text-xs rounded-xl border border-emerald-300 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-tertiary cursor-pointer"
                      >
                        <option value="">-- Chọn người đã ứng tiền --</option>
                        {selectedEventStat.participants.map(p => (
                          <option key={p.id} value={p.email || p.id}>
                            {p.name} ({p.email || p.skillRole})
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md hover:bg-emerald-800 transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">add_circle</span>
                      Xác Nhận Phân Bổ Khoản Chi
                    </button>
                  </form>
                )}

                {paymentError && (
                  <p className="text-xs font-bold text-rose-700 bg-rose-50 p-2 rounded-lg border border-rose-200">
                    ⚠️ {paymentError}
                  </p>
                )}
                {paymentSuccess && (
                  <p className="text-xs font-bold text-emerald-800 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                    ✅ {paymentSuccess}
                  </p>
                )}
              </div>

              {/* PHẦN 2: THÊM THÀNH VIÊN BẰNG EMAIL */}
              <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-300/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-800 text-xl">group_add</span>
                    <h4 className="text-xs font-extrabold text-amber-900 uppercase tracking-wide">
                      Leader Thêm Thành Viên Tham Gia Bằng Email
                    </h4>
                  </div>
                  {!isLead && (
                    <span className="text-[11px] font-semibold text-slate-500 italic">
                      (Chỉ Leader có quyền thêm)
                    </span>
                  )}
                </div>

                {isLead && (
                  <form onSubmit={handleAddEmail} className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="email"
                      required
                      placeholder="Nhập email thành viên tham gia (vd: thanhvien2@chronos.vn)"
                      value={inputEmail}
                      onChange={(e) => setInputEmail(e.target.value)}
                      className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-amber-300 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-tertiary"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-tertiary text-white font-extrabold text-xs rounded-xl shadow-md hover:bg-tertiary/90 transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">person_add</span>
                      Thêm Thành Viên
                    </button>
                  </form>
                )}

                {emailError && (
                  <p className="text-xs font-bold text-rose-700 bg-rose-50 p-2 rounded-lg border border-rose-200">
                    ⚠️ {emailError}
                  </p>
                )}
                {emailSuccess && (
                  <p className="text-xs font-bold text-emerald-800 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                    ✅ {emailSuccess}
                  </p>
                )}
              </div>

              {/* PHẦN 3: BẢNG TÍNH TOÁN DƯ / NỢ TRONG EVENT */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-cow-spot uppercase tracking-wider">
                    Phân Tích Đóng Góp & Chênh Lệch Trong Event ({selectedEventStat.count} người)
                  </h4>
                  <span className="text-[11px] text-on-surface-variant font-medium">Đã Ứng vs Mức Chia Đều</span>
                </div>

                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {selectedEventStat.participantBreakdown.map(pb => {
                    const isCreditor = pb.net > 0;
                    const isDebtor = pb.net < 0;

                    return (
                      <div
                        key={pb.member.id}
                        className="p-3 bg-surface-container-low rounded-xl border border-surface-variant flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={pb.member.avatar}
                            alt={pb.member.name}
                            className="w-9 h-9 rounded-full bg-soft-pink border border-surface-variant"
                          />
                          <div>
                            <p className="font-bold text-cow-spot">{pb.member.name}</p>
                            <p className="text-[10px] text-on-surface-variant font-medium">
                              {pb.member.email || pb.member.skillRole}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-[11px] font-bold text-green-800">
                              Đã ứng: {pb.paid.toLocaleString('vi-VN')} VNĐ
                            </p>
                            <p className="text-[10px] font-medium text-on-surface-variant">
                              Phải chịu: {pb.share.toLocaleString('vi-VN')} VNĐ
                            </p>
                          </div>

                          <div className="min-w-[120px] text-right">
                            {isCreditor && (
                              <span className="px-2 py-1 bg-pastel-green text-green-900 font-extrabold text-[11px] rounded-lg border border-green-300 inline-block">
                                +{pb.net.toLocaleString('vi-VN')} VNĐ
                              </span>
                            )}
                            {isDebtor && (
                              <span className="px-2 py-1 bg-rose-100 text-rose-900 font-extrabold text-[11px] rounded-lg border border-rose-300 inline-block">
                                -{Math.abs(pb.net).toLocaleString('vi-VN')} VNĐ
                              </span>
                            )}
                            {pb.net === 0 && (
                              <span className="px-2 py-1 bg-slate-100 text-slate-700 font-bold text-[11px] rounded-lg border border-slate-300 inline-block">
                                Hòa vốn
                              </span>
                            )}
                          </div>

                          {isLead && selectedEventStat.count > 1 && (
                            <button
                              onClick={() => handleRemoveParticipant(pb.member.email || pb.member.id)}
                              title="Xóa khỏi sự kiện"
                              className="w-7 h-7 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 flex items-center justify-center transition-colors cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-sm">remove_circle_outline</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          ) : (
            <div className="p-8 text-center bg-surface-container-lowest rounded-3xl border border-surface-variant text-xs font-semibold text-on-surface-variant">
              Chọn một sự kiện bên trái để xem chi tiết thanh toán và phân bổ khoản chi.
            </div>
          )}
        </div>

      </div>

      {/* BẢNG TÍNH TỔNG HỢP "AI NỢ AI BAO NHIÊU" TOÀN CHUYẾN ĐỊ */}
      <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-tactile border border-surface-variant">
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-tertiary text-2xl">account_balance_wallet</span>
          <div>
            <h3 className="text-base font-extrabold text-cow-spot">BẢNG TÍNH TỔNG HỢP "AI NỢ AI BAO NHIÊU"</h3>
            <p className="text-xs text-on-surface-variant font-medium">
              Tổng kết Đã ứng trả – Phải chịu = Kết quả Dư / Nợ cuối cùng của từng thành viên
            </p>
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
                        <span className="text-[10px] text-on-surface-variant">{stat.member.email || stat.member.skillRole}</span>
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

      {/* GỢI Ý CHUYỂN KHOẢN QUYẾT TOÁN TỐI ƯU */}
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

