import React from 'react';
import { useAuth } from '../../store/AuthContext';
import { useTrip } from '../../store/TripContext';

export default function Navigation({ activeTab, setActiveTab }) {
  const { currentUser, logout } = useAuth();
  const { events } = useTrip();

  const completedCount = events.filter(e => e.status === 'Đã xong' || e.completed).length;
  const uncompletedCount = events.filter(e => e.status !== 'Đã xong' && !e.completed && e.status !== 'Hủy' && e.status !== 'Chờ duyệt').length;
  const ongoingCount = events.filter(e => e.status === 'Đang diễn ra').length;
  const upcomingCount = events.filter(e => e.status === 'Sắp tới').length;
  const pausedCount = events.filter(e => e.status === 'Tạm hoãn').length;
  const cancelledCount = events.filter(e => e.status === 'Hủy').length;
  const pendingCount = events.filter(e => e.status === 'Chờ duyệt').length;

  return (
    <aside className="fixed left-0 top-0 h-full w-72 flex flex-col p-6 z-40 bg-surface-container-low shadow-sm rounded-r-[2rem] border-r border-surface-variant overflow-y-auto hidden md:flex">
      
      {/* Brand Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-soft-pink flex items-center justify-center text-cow-spot font-bold shadow-tactile border-2 border-cow-spot">
          <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>pets</span>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-cow-spot tracking-tight">Quản Lí Lịch Trình</h1>
          <p className="text-xs text-on-surface-variant font-medium">Lịch trình thông minh</p>
        </div>
      </div>

      {/* Main Nav Tabs */}
      <nav className="flex-1 space-y-2">
        <button
          onClick={() => setActiveTab('schedule')}
          className={`w-full flex justify-between items-center rounded-full px-4 py-3 font-semibold text-sm transition-all cursor-pointer ${
            activeTab === 'schedule' || activeTab === 'dashboard'
              ? 'bg-tertiary text-on-tertiary shadow-tactile'
              : 'text-on-surface hover:bg-surface-container hover:text-cow-spot'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined">dashboard</span>
            <span>Tasks</span>
          </div>
          <span className="bg-soft-pink text-cow-spot px-2.5 py-0.5 rounded-full text-xs font-bold">
            {events.length} hôm nay
          </span>
        </button>

        <div className="flex flex-col gap-1 pt-1 pb-2">
          <button
            onClick={() => setActiveTab('members')}
            className={`w-full flex items-center gap-3 rounded-full px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'members' ? 'bg-surface-container-highest text-cow-spot' : 'text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-base">groups</span>
            <span>Thành Viên ({currentUser?.role})</span>
          </button>

          <button
            onClick={() => setActiveTab('expenses')}
            className={`w-full flex items-center gap-3 rounded-full px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'expenses' ? 'bg-surface-container-highest text-cow-spot' : 'text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-base">payments</span>
            <span>Chi Tiêu "Ai Nợ Ai"</span>
          </button>

          <button
            onClick={() => setActiveTab('statistics')}
            className={`w-full flex items-center gap-3 rounded-full px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'statistics' ? 'bg-surface-container-highest text-cow-spot' : 'text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-base">insights</span>
            <span>Thống Kê Báo Cáo</span>
          </button>
        </div>

        {/* Status Breakdown Section */}
        <div className="pt-4 pb-2">
          <h2 className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider px-2">
            THỐNG KÊ TRẠNG THÁI ({events.length})
          </h2>
        </div>

        <div className="space-y-2 text-xs font-semibold">
          <div className="flex justify-between items-center bg-pastel-green rounded-full px-4 py-2 border border-green-200">
            <div className="flex items-center gap-3 text-green-800">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              <span>Đã hoàn thành</span>
            </div>
            <span className="bg-green-200 text-green-900 px-2 py-0.5 rounded-full font-bold">{completedCount}</span>
          </div>

          <div className="flex justify-between items-center bg-pastel-yellow rounded-full px-4 py-2 border border-yellow-200">
            <div className="flex items-center gap-3 text-yellow-900">
              <span className="material-symbols-outlined text-[18px]">pending_actions</span>
              <span>Chưa hoàn thành</span>
            </div>
            <span className="bg-yellow-200 text-yellow-900 px-2 py-0.5 rounded-full font-bold">{uncompletedCount}</span>
          </div>

          <div className="flex justify-between items-center bg-pastel-purple rounded-full px-4 py-2 border border-purple-200">
            <div className="flex items-center gap-3 text-purple-800">
              <span className="material-symbols-outlined text-[18px]">play_circle</span>
              <span>Đang diễn ra</span>
            </div>
            <span className="bg-purple-200 text-purple-900 px-2 py-0.5 rounded-full font-bold">{ongoingCount}</span>
          </div>

          <div className="flex justify-between items-center bg-pastel-blue rounded-full px-4 py-2 border border-blue-200">
            <div className="flex items-center gap-3 text-blue-800">
              <span className="material-symbols-outlined text-[18px]">schedule</span>
              <span>Sắp tới</span>
            </div>
            <span className="bg-blue-200 text-blue-900 px-2 py-0.5 rounded-full font-bold">{upcomingCount}</span>
          </div>

          <div className="flex justify-between items-center bg-surface-container rounded-full px-4 py-2 border border-surface-variant">
            <div className="flex items-center gap-3 text-on-surface-variant">
              <span className="material-symbols-outlined text-[18px]">pause_circle</span>
              <span>Tạm hoãn</span>
            </div>
            <span className="bg-surface-variant text-on-surface px-2 py-0.5 rounded-full font-bold">{pausedCount}</span>
          </div>

          <div className="flex justify-between items-center bg-pastel-red rounded-full px-4 py-2 border border-red-200">
            <div className="flex items-center gap-3 text-red-800">
              <span className="material-symbols-outlined text-[18px]">cancel</span>
              <span>Đã hủy</span>
            </div>
            <span className="bg-red-200 text-red-900 px-2 py-0.5 rounded-full font-bold">{cancelledCount}</span>
          </div>

          {pendingCount > 0 && (
            <div className="flex justify-between items-center bg-orange-100 rounded-full px-4 py-2 border border-orange-200">
              <div className="flex items-center gap-3 text-orange-900">
                <span className="material-symbols-outlined text-[18px]">hourglass_top</span>
                <span>Chờ duyệt</span>
              </div>
              <span className="bg-orange-200 text-orange-900 px-2 py-0.5 rounded-full font-bold">{pendingCount}</span>
            </div>
          )}
        </div>

        <div className="pt-6">
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('open-new-track-modal'))}
            className="w-full flex items-center justify-center gap-2 bg-soft-pink text-cow-spot rounded-full py-3 font-bold text-sm shadow-pressable hover:shadow-pressable-hover active:translate-y-0.5 transition-all border-2 border-cow-spot cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            <span>+ New Track</span>
          </button>
        </div>

        <div className="pt-3">
          <button
            onClick={() => {
              if (window.confirm('Khôi phục dữ liệu mặc định?')) {
                localStorage.clear();
                window.location.reload();
              }
            }}
            className="w-full flex items-center justify-center gap-2 bg-surface-container text-on-surface-variant rounded-full py-2 text-xs font-semibold border border-surface-variant hover:bg-surface-variant transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">restart_alt</span>
            <span>Reset Local Store</span>
          </button>
        </div>
      </nav>

      <div className="pt-4 border-t border-surface-variant space-y-1">
        <a
          href="#help"
          onClick={(e) => { e.preventDefault(); alert('Quản Lí Lịch Trình: Kéo thả ô lịch trình & thanh trượt 24H để sắp xếp lịch trình linh hoạt!'); }}
          className="flex items-center gap-3 text-on-surface-variant hover:bg-surface-container-highest rounded-full px-4 py-2 text-xs font-bold"
        >
          <span className="material-symbols-outlined text-base">help</span>
          <span>Help</span>
        </a>

        <button
          onClick={logout}
          className="w-full flex items-center gap-3 text-on-surface-variant hover:bg-surface-container-highest rounded-full px-4 py-2 text-xs font-bold cursor-pointer"
        >
          <span className="material-symbols-outlined text-base">logout</span>
          <span>Logout ({currentUser?.name})</span>
        </button>
      </div>

    </aside>
  );
}
