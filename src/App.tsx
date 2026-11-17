/**
 * MERI SCHOOL DIARY — Complete School Management & Digital Diary Application
 * Target: Government Schools in Sindh, Pakistan
 */

import React, { useState, useEffect } from 'react';
import { SchoolProvider, useSchool } from './context/SchoolContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar, NavTabId } from './components/layout/Sidebar';
import { PublicHomePage } from './features/public/PublicHomePage';
import { RoleSelectionPage } from './features/auth/RoleSelectionPage';
import { RoleLoginPage } from './features/auth/RoleLoginPage';
import { RoleSignUpPage } from './features/auth/RoleSignUpPage';
import { ParentDashboard } from './features/dashboard/ParentDashboard';
import { TeacherDashboard } from './features/dashboard/TeacherDashboard';
import { StudentDashboard } from './features/dashboard/StudentDashboard';
import { AdminDashboard } from './features/dashboard/AdminDashboard';
import { MySchoolDay } from './features/timeline/MySchoolDay';
import { AttendanceView } from './features/attendance/AttendanceView';
import { HomeworkView } from './features/homework/HomeworkView';
import { ExamsView } from './features/exams/ExamsView';
import { TimetableView } from './features/timetable/TimetableView';
import { LeaveView } from './features/leave/LeaveView';
import { AnnouncementsView } from './features/announcements/AnnouncementsView';
import { AdminManagement } from './features/admin/AdminManagement';
import { Home, Clock, BookMarked, CalendarCheck, MoreHorizontal } from 'lucide-react';

const AppContent: React.FC = () => {
  const { currentRole, authScreen } = useSchool();
  const [activeTab, setActiveTab] = useState<NavTabId>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // When role changes, switch back to overview dashboard
  useEffect(() => {
    setActiveTab('overview');
  }, [currentRole]);

  // 1. Public Home Screen
  if (authScreen === 'home') {
    return <PublicHomePage />;
  }

  // 2. Role Selection Portal
  if (authScreen === 'role_select') {
    return <RoleSelectionPage />;
  }

  // 3. Role-Specific Login Screen
  if (authScreen === 'login') {
    return <RoleLoginPage />;
  }

  // 4. Role-Specific Sign-Up Screen
  if (authScreen === 'signup') {
    return <RoleSignUpPage />;
  }

  // 5. Authenticated App Workspace (Isolated per Role)
  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        if (currentRole === 'parent') return <ParentDashboard onNavigate={setActiveTab} />;
        if (currentRole === 'teacher') return <TeacherDashboard onNavigate={setActiveTab} />;
        if (currentRole === 'student') return <StudentDashboard onNavigate={setActiveTab} />;
        if (currentRole === 'admin') return <AdminDashboard onNavigate={setActiveTab} />;
        return <ParentDashboard onNavigate={setActiveTab} />;

      case 'timeline':
        return <MySchoolDay />;

      case 'attendance':
        return <AttendanceView />;

      case 'homework':
        return <HomeworkView />;

      case 'tests':
        return <ExamsView />;

      case 'timetable':
        return <TimetableView />;

      case 'leave':
        return <LeaveView />;

      case 'announcements':
        return <AnnouncementsView />;

      case 'classes':
        // If teacher, show students directory filtered to their class
        return <AdminManagement tab="students" />;

      case 'students':
      case 'teachers':
      case 'subjects':
      case 'calendar':
      case 'reports':
      case 'profile':
        return <AdminManagement tab={activeTab} />;

      default:
        return <ParentDashboard onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Bar with Role Info and Logout */}
      <Navbar onToggleSidebar={() => setIsSidebarOpen(true)} />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Content Viewport */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8">
          {renderContent()}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 lg:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-3 py-2 flex items-center justify-around">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold ${
            activeTab === 'overview'
              ? 'text-purple-700 dark:text-purple-400'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Home className="w-4 h-4" />
          <span>Home</span>
        </button>

        <button
          onClick={() => setActiveTab('timeline')}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold ${
            activeTab === 'timeline'
              ? 'text-purple-700 dark:text-purple-400'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Timeline</span>
        </button>

        <button
          onClick={() => setActiveTab('homework')}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold ${
            activeTab === 'homework'
              ? 'text-purple-700 dark:text-purple-400'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <BookMarked className="w-4 h-4" />
          <span>Homework</span>
        </button>

        <button
          onClick={() => setActiveTab('attendance')}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold ${
            activeTab === 'attendance'
              ? 'text-purple-700 dark:text-purple-400'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          <span>Attendance</span>
        </button>

        <button
          onClick={() => setIsSidebarOpen(true)}
          className="flex flex-col items-center gap-1 text-[10px] font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
        >
          <MoreHorizontal className="w-4 h-4" />
          <span>More</span>
        </button>
      </nav>
    </div>
  );
};

export default function App() {
  return (
    <SchoolProvider>
      <AppContent />
    </SchoolProvider>
  );
}
