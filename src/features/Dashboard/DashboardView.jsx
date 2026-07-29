import React from 'react';
import { useAuth } from '../../store/AuthContext';
import { useTrip } from '../../store/TripContext';

export default function DashboardView({ setActiveTab }) {
  const { currentUser, isLead } = useAuth();
  const { events, members, currentOngoingEvent, calculateExpenses } = useTrip();

  const { totalTripCost } = calculateExpenses();
  const pendingEvents = events.filter(e => e.status === 'Chờ duyệt');
  const upcomingEvents = events.filter(e => e.status === 'Sắp tới');
  const completedEvents = events.filter(e => e.status === 'Đã xong' || e.completed);

  return (
    <div className="space-y-6">
      
      {/* 1. REALTIME WIDGET: SỰ KIỆN ĐANG DIỄN RA */}
      <div className="bg-surface-container-lowest rounded-3xl p-6 lg:p-8 shadow-tactile border-2 border-cow-spot relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-surface-variant">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-pastel-purple flex items-center justify-center text-purple-800 font-bold border border-purple-300 animate-pulse">
              <span className="material-symbols-outlined text-3xl">play_circle</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-ping"></span>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-purple-900">
                  REALTIME ENGINE • SỰ KIỆN ĐANG DIỄN RA
                </h3>
              </div>
              <p className="text-xs text-on-surface-variant font-medium">Hệ thống tự động cập nhật theo giờ thực tế</p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('schedule')}
            className="self-start md:self-auto px-4 py-2 bg-surface-container text-cow-spot rounded-full text-xs font-bold hover:bg-surface-container-high transition-colors cursor-pointer"
          >
            Xem toàn bộ lịch trình →
          </button>
        </div>

        {currentOngoingEvent ? (
          <div className="mt-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-pastel-purple/50 rounded-2xl p-6 border border-purple-200">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-purple-600 text-white font-extrabold text-xs rounded-full shadow-sm">
                  {currentOngoingEvent.activityType || 'Hoạt động'}
                </span>
                <span className="text-xs font-bold text-purple-900 bg-white/80 px-3 py-1 rounded-full border border-purple-200">
                  🕒 {currentOngoingEvent.startTime} – {currentOngoingEvent.endTime}
                </span>
              </div>
              <h4 className="text-xl lg:text-2xl font-extrabold text-cow-spot">
                {currentOngoingEvent.title}
              </h4>
              <p className="text-sm text-on-surface-variant">
                {currentOngoingEvent.description || 'Không có mô tả chi tiết'}
              </p>
              <div className="flex items-center gap-2 text-xs font-semibold text-purple-900 pt-1">
                <span className="material-symbols-outlined text-base">location_on</span>
                <span>{currentOngoingEvent.location || 'Chưa cập nhật địa điểm'}</span>
              </div>
            </div>

            <div className="bg-white/90 rounded-2xl p-4 border border-purple-200 space-y-3 min-w-[240px]">
              <p className="text-xs font-bold text-cow-spot uppercase">Thành viên tham gia:</p>
              <div className="flex flex-wrap gap-2">
                {members
                  .filter(m => currentOngoingEvent.assignedMembers?.includes(m.id))
                  .map(m => (
                    <span key={m.id} className="inline-flex items-center gap-1.5 px-3 py-1 bg-pastel-purple text-purple-900 rounded-full text-xs font-bold border border-purple-200">
                      <img src={m.avatar} alt={m.name} className="w-4 h-4 rounded-full" />
                      <span>{m.name}</span>
                    </span>
                  ))}
              </div>
              <div className="pt-2 border-t border-purple-100 flex justify-between text-xs font-bold text-purple-900">
                <span>Người ứng tiền:</span>
                <span>{members.find(m => m.id === currentOngoingEvent.payerId)?.name || 'Chưa chọn'}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-6 text-center py-10 bg-surface-container-low rounded-2xl border border-dashed border-outline-variant">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2">event_busy</span>
            <p className="text-sm font-bold text-cow-spot">Hiện tại không có sự kiện nào đang diễn ra</p>
            <p className="text-xs text-on-surface-variant mt-1">Các sự kiện sắp tới sẽ tự động chuyển sang "Đang diễn ra" khi đến khung giờ tương ứng.</p>
          </div>
        )}
      </div>

      {/* 2. STATS WIDGETS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-tactile border border-surface-variant flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-pastel-green text-green-800 flex items-center justify-center font-bold text-2xl">
            <span className="material-symbols-outlined">payments</span>
          </div>
          <div>
            <p className="text-xs font-bold text-on-surface-variant uppercase">Tổng chi phí</p>
            <h4 className="text-xl font-extrabold text-cow-spot mt-0.5">
              {totalTripCost.toLocaleString('vi-VN')} VNĐ
            </h4>
            <p className="text-[11px] font-semibold text-green-700 mt-0.5">Chia đều cho {members.length} người</p>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-tactile border border-surface-variant flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-pastel-blue text-blue-800 flex items-center justify-center font-bold text-2xl">
            <span className="material-symbols-outlined">groups</span>
          </div>
          <div>
            <p className="text-xs font-bold text-on-surface-variant uppercase">Thành viên</p>
            <h4 className="text-xl font-extrabold text-cow-spot mt-0.5">
              {members.length} người
            </h4>
            <p className="text-[11px] font-semibold text-blue-700 mt-0.5">1 Lead • {members.length - 1} Member</p>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-tactile border border-surface-variant flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-pastel-yellow text-yellow-900 flex items-center justify-center font-bold text-2xl">
            <span className="material-symbols-outlined">event_available</span>
          </div>
          <div>
            <p className="text-xs font-bold text-on-surface-variant uppercase">Tổng sự kiện</p>
            <h4 className="text-xl font-extrabold text-cow-spot mt-0.5">
              {events.length} sự kiện
            </h4>
            <p className="text-[11px] font-semibold text-amber-700 mt-0.5">{completedEvents.length} đã hoàn thành</p>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-tactile border border-surface-variant flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-tertiary-container text-tertiary flex items-center justify-center font-bold text-2xl">
            <span className="material-symbols-outlined">hourglass_top</span>
          </div>
          <div>
            <p className="text-xs font-bold text-on-surface-variant uppercase">Chờ xét duyệt</p>
            <h4 className="text-xl font-extrabold text-cow-spot mt-0.5">
              {pendingEvents.length} đề xuất
            </h4>
            <p className="text-[11px] font-semibold text-tertiary mt-0.5">
              {isLead ? 'Cần Lead xét duyệt' : 'Đề xuất từ thành viên'}
            </p>
          </div>
        </div>
      </div>

      {/* 3. QUICK UPCOMING EVENTS & APPROVAL BANNER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-3xl p-6 shadow-tactile border border-surface-variant">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-extrabold text-cow-spot flex items-center gap-2">
              <span className="material-symbols-outlined text-tertiary">upcoming</span>
              Sự kiện sắp tới ({upcomingEvents.length})
            </h3>
            <button
              onClick={() => setActiveTab('schedule')}
              className="text-xs font-bold text-tertiary hover:underline cursor-pointer"
            >
              Xem chi tiết
            </button>
          </div>

          <div className="space-y-3">
            {upcomingEvents.slice(0, 3).map(evt => (
              <div key={evt.id} className="flex items-center justify-between p-4 bg-surface-container-low rounded-2xl border border-surface-variant hover:border-cow-spot transition-all">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-cow-spot bg-soft-pink px-2.5 py-0.5 rounded-full">
                      🕒 {evt.startTime} – {evt.endTime}
                    </span>
                    <span className="text-xs font-semibold text-on-surface-variant">
                      {evt.activityType}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-cow-spot">{evt.title}</h4>
                  <p className="text-xs text-on-surface-variant flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">location_on</span>
                    {evt.location}
                  </p>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 bg-pastel-blue text-blue-800 text-xs font-bold rounded-full border border-blue-200">
                    Sắp tới
                  </span>
                </div>
              </div>
            ))}

            {upcomingEvents.length === 0 && (
              <p className="text-xs text-center text-on-surface-variant py-6">Không có sự kiện nào sắp tới trong danh sách chính thức.</p>
            )}
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-tactile border border-surface-variant flex flex-col justify-between">
          <div>
            <h3 className="text-base font-extrabold text-cow-spot flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-tertiary">admin_panel_settings</span>
              Phân Quyền & Xét Duyệt
            </h3>
            <p className="text-xs text-on-surface-variant mb-4 leading-relaxed">
              {isLead
                ? 'Bạn đang truy cập với quyền Lead (Trưởng đoàn). Bạn có toàn quyền thêm, sửa, xóa, duyệt đề xuất sự kiện của thành viên.'
                : 'Bạn đang truy cập với quyền Member (Thành viên). Bạn có thể tạo đề xuất sự kiện (trạng thái Chờ duyệt) và sửa/xóa đề xuất của chính mình.'}
            </p>

            <div className="p-4 bg-surface-container rounded-2xl border border-surface-variant space-y-2 text-xs">
              <div className="flex justify-between font-bold">
                <span>Chức vụ trong chuyến đi:</span>
                <span className="px-2 py-0.5 bg-cow-spot text-white rounded-full uppercase text-[10px]">
                  {currentUser?.role === 'Lead' ? 'Leader (Trưởng đoàn)' : 'Member (Thành viên)'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-surface-variant flex flex-col gap-2">
            <button
              onClick={() => setActiveTab('schedule')}
              className="w-full py-2.5 bg-soft-pink text-cow-spot font-bold text-xs rounded-full border border-cow-spot hover:bg-soft-pink/80 transition-all cursor-pointer"
            >
              + Tạo Sự Kiện Mới
            </button>
            <button
              onClick={() => setActiveTab('expenses')}
              className="w-full py-2.5 bg-surface-container text-cow-spot font-bold text-xs rounded-full border border-surface-variant hover:bg-surface-container-high transition-all cursor-pointer"
            >
              Xem Chi Tiêu "Ai Nợ Ai"
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
