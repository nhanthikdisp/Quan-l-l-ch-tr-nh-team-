import React, { useState } from 'react';
import { useAuth } from '../store/AuthContext';
import Navigation from '../components/Layout/Navigation';
import Header from '../components/Layout/Header';
import AuthPage from '../features/Auth/AuthPage';
import DashboardView from '../features/Dashboard/DashboardView';
import ScheduleView from '../features/Schedule/ScheduleView';
import MembersView from '../features/Members/MembersView';
import ExpensesView from '../features/Expenses/ExpensesView';
import StatisticsView from '../features/Statistics/StatisticsView';

export default function AppRouter() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('schedule');

  if (!currentUser) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-background text-on-surface font-sans flex">
      {/* Sidebar Layout */}
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Workspace Layout */}
      <div className="flex-1 md:ml-72 flex flex-col min-h-screen">
        <Header activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="flex-1 px-4 lg:px-8 pb-12 max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && <DashboardView setActiveTab={setActiveTab} />}
          {activeTab === 'schedule' && <ScheduleView />}
          {activeTab === 'members' && <MembersView />}
          {activeTab === 'expenses' && <ExpensesView />}
          {activeTab === 'statistics' && <StatisticsView />}
        </main>
      </div>
    </div>
  );
}
