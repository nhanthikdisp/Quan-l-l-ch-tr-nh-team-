import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTrip } from '../context/TripContext';

export default function Header({ activeTab, setActiveTab }) {
  const { currentUser, isLead, switchAccount, userList } = useAuth();
  const { currentOngoingEvent } = useTrip();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const pageTitles = {
    dashboard: { title: 'Trang Chủ & Tổng Quan', desc: 'Theo dõi sự kiện thời gian thực và tổng quan chuyến đi' },
    schedule: { title: 'Lịch Trình Chi Tiết', desc: 'Quản lý, sắp xếp thời gian và xét duyệt các hoạt động' },
    members: { title: 'Quản Lý Thành Viên', desc: 'Danh sách thành viên, phân quyền Lead/Member và nhiệm vụ' },
    expenses: { title: 'Quản Lý Chi Tiêu & Ai Nợ Ai', desc: 'Tính toán chia đều chi phí và quyết toán số dư' },
    statistics: { title: 'Thống Kê Báo Cáo', desc: 'Biểu đồ trực quan về hoạt động, trạng thái và dòng tiền' },
  };

  const formattedTime = currentTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const formattedDate = currentTime.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-surface-variant px-4 lg:px-8 py-4 mb-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Left: Page Title & Mobile Nav */}
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-tertiary text-2xl">
              {activeTab === 'dashboard' ? 'dashboard' : activeTab === 'schedule' ? 'calendar_month' : activeTab === 'members' ? 'groups' : activeTab === 'expenses' ? 'payments' : 'insights'}
            </span>
            <h2 className="text-xl lg:text-2xl font-extrabold text-cow-spot tracking-tight">
              {pageTitles[activeTab]?.title}
            </h2>
          </div>
          <p className="text-xs lg:text-sm text-on-surface-variant font-medium mt-0.5">
            {pageTitles[activeTab]?.desc}
          </p>
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="flex md:hidden overflow-x-auto gap-2 py-1 scrollbar-none border-t border-surface-variant pt-2">
          {[
            { id: 'dashboard', label: 'Trang chủ', icon: 'dashboard' },
            { id: 'schedule', label: 'Lịch trình', icon: 'calendar_month' },
            { id: 'members', label: 'Thành viên', icon: 'groups' },
            { id: 'expenses', label: 'Chi tiêu', icon: 'payments' },
            { id: 'statistics', label: 'Thống kê', icon: 'insights' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap cursor-pointer ${
                activeTab === t.id ? 'bg-tertiary text-white' : 'bg-surface-container text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-sm">{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Right Controls: Realtime Clock, Switch Account, Role Indicator */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Realtime Ongoing Event Alert Badge */}
          {currentOngoingEvent && (
            <div className="hidden xl:flex items-center gap-2 bg-pastel-purple text-purple-900 border border-purple-300 px-3 py-1.5 rounded-full text-xs font-bold animate-pulse">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-ping"></span>
              <span className="material-symbols-outlined text-sm">play_circle</span>
              <span className="truncate max-w-[160px]">Đang diễn ra: {currentOngoingEvent.title}</span>
            </div>
          )}

          {/* Realtime Clock Badge */}
          <div className="flex items-center gap-2 bg-surface-container-low px-3.5 py-1.5 rounded-full border border-surface-variant text-xs font-semibold text-cow-spot">
            <span className="material-symbols-outlined text-tertiary text-base">schedule</span>
            <span>{formattedDate}</span>
            <span className="bg-cow-spot text-white px-2 py-0.5 rounded-full font-mono text-[11px] font-bold">
              {formattedTime}
            </span>
          </div>

          {/* Quick Account Switcher (Helper for testing permissions Lead/Member) */}
          <div className="flex items-center gap-2 bg-surface-container-high px-3 py-1 rounded-full border border-surface-variant">
            <span className="text-[11px] font-bold text-on-surface-variant uppercase">Tài khoản:</span>
            <select
              value={currentUser?.uid || ''}
              onChange={(e) => switchAccount(e.target.value)}
              className="bg-white text-cow-spot font-bold text-xs rounded-full px-2 py-1 border border-outline-variant focus:outline-none focus:ring-2 focus:ring-tertiary cursor-pointer"
            >
              {userList.map(u => (
                <option key={u.uid} value={u.uid}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>
        </div>

      </div>
    </header>
  );
}
