import React from 'react';
import { useTrip } from '../../store/TripContext';

export default function StatisticsView() {
  const { events, currentOngoingEvent, calculateExpenses } = useTrip();
  const { memberStats } = calculateExpenses();

  const activityCounts = events.reduce((acc, e) => {
    const type = e.activityType || 'Khác';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const statusCounts = events.reduce((acc, e) => {
    const st = e.status || 'Khác';
    acc[st] = (acc[st] || 0) + 1;
    return acc;
  }, {});

  const totalEvents = events.length;

  return (
    <div className="space-y-6">

      <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-tactile border-2 border-cow-spot relative overflow-hidden">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-pastel-purple flex items-center justify-center text-purple-900 font-bold border border-purple-300">
            <span className="material-symbols-outlined">analytics</span>
          </div>
          <div>
            <h3 className="text-base font-extrabold text-cow-spot">THỐNG KÊ REALTIME • SỰ KIỆN ĐANG DIỄN RA</h3>
            <p className="text-xs text-on-surface-variant font-medium">Trạng thái hoạt động tức thời của chuyến đi</p>
          </div>
        </div>

        {currentOngoingEvent ? (
          <div className="p-5 bg-pastel-purple/40 rounded-2xl border border-purple-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="px-3 py-1 bg-purple-600 text-white font-extrabold text-xs rounded-full shadow-xs">
                {currentOngoingEvent.activityType}
              </span>
              <h4 className="text-xl font-extrabold text-cow-spot mt-1">{currentOngoingEvent.title}</h4>
              <p className="text-xs text-on-surface-variant font-medium">
                🕒 {currentOngoingEvent.startTime} – {currentOngoingEvent.endTime} • 📍 {currentOngoingEvent.location}
              </p>
            </div>
            <div className="text-right">
              <span className="px-4 py-2 bg-purple-700 text-white text-xs font-bold rounded-full animate-pulse inline-block">
                ● LIVE NOW
              </span>
            </div>
          </div>
        ) : (
          <div className="p-6 bg-surface-container-low rounded-2xl border border-dashed border-outline-variant text-center">
            <p className="text-xs font-bold text-cow-spot">Hiện tại không có sự kiện nào đang diễn ra.</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-tactile border border-surface-variant">
          <h3 className="text-base font-extrabold text-cow-spot flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-tertiary">category</span>
            Thống Kê Theo Loại Hoạt Động
          </h3>

          <div className="space-y-3">
            {Object.entries(activityCounts).map(([type, count]) => {
              const percentage = totalEvents > 0 ? Math.round((count / totalEvents) * 100) : 0;
              return (
                <div key={type} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-cow-spot">
                    <span>{type}</span>
                    <span>{count} sự kiện ({percentage}%)</span>
                  </div>
                  <div className="w-full h-3 bg-surface-container-high rounded-full overflow-hidden">
                    <div
                      className="h-full bg-tertiary rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-tactile border border-surface-variant">
          <h3 className="text-base font-extrabold text-cow-spot flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-tertiary">pie_chart</span>
            Thống Kê Theo Trạng Thái
          </h3>

          <div className="space-y-3">
            {[
              { status: 'Sắp tới', color: 'bg-blue-500' },
              { status: 'Đang diễn ra', color: 'bg-purple-600' },
              { status: 'Đã xong', color: 'bg-moo-green' },
              { status: 'Tạm hoãn', color: 'bg-slate-500' },
              { status: 'Hủy', color: 'bg-rose-500' },
              { status: 'Chờ duyệt', color: 'bg-orange-500' }
            ].map(item => {
              const count = statusCounts[item.status] || 0;
              const percentage = totalEvents > 0 ? Math.round((count / totalEvents) * 100) : 0;
              return (
                <div key={item.status} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-cow-spot">
                    <span>{item.status}</span>
                    <span>{count} sự kiện ({percentage}%)</span>
                  </div>
                  <div className="w-full h-3 bg-surface-container-high rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-tactile border border-surface-variant">
        <h3 className="text-base font-extrabold text-cow-spot flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-tertiary">monetization_on</span>
          Thống Kê Dòng Tiền & Chi Phí Từng Thành Viên
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {memberStats.map(stat => (
            <div key={stat.member.id} className="p-4 bg-surface-container-low rounded-2xl border border-surface-variant flex items-center gap-3">
              <img src={stat.member.avatar} alt={stat.member.name} className="w-12 h-12 rounded-full bg-soft-pink border border-cow-spot" />
              <div className="space-y-0.5">
                <h4 className="font-bold text-xs text-cow-spot">{stat.member.name}</h4>
                <p className="text-[11px] font-semibold text-green-800">
                  Đã trả: {stat.totalPaid.toLocaleString('vi-VN')} VNĐ
                </p>
                <p className="text-[11px] font-semibold text-on-surface-variant">
                  Phải chịu: {stat.totalShare.toLocaleString('vi-VN')} VNĐ
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
