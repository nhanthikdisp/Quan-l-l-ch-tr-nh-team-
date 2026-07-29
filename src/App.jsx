import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TripProvider } from './context/TripContext';
import Navigation from './components/Navigation';
import Header from './components/Header';
import AuthPage from './components/AuthPage';
import DashboardView from './components/DashboardView';
import ScheduleView from './components/ScheduleView';
import MembersView from './components/MembersView';
import ExpensesView from './components/ExpensesView';
import StatisticsView from './components/StatisticsView';

function MainApp() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!currentUser) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-background text-on-surface font-sans flex">
      {/* Sidebar Navigation */}
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Workspace */}
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

export default function App() {
  return (
    <AuthProvider>
      <TripProvider>
        <MainApp />
      </TripProvider>
    </AuthProvider>
  );
}
