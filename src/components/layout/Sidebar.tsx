import React from 'react';
import {
  Home,
  Clock,
  CalendarCheck,
  BookMarked,
  Award,
  Calendar,
  FileText,
  Bell,
  Users,
  GraduationCap,
  Layers,
  BookOpen,
  CalendarDays,
  BarChart3,
  School,
  X,
} from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';

export type NavTabId =
  | 'overview'
  | 'timeline'
  | 'attendance'
  | 'homework'
  | 'tests'
  | 'timetable'
  | 'leave'
  | 'announcements'
  | 'classes'
  | 'students'
  | 'teachers'
  | 'subjects'
  | 'calendar'
  | 'reports'
  | 'profile';

interface SidebarProps {
  activeTab: NavTabId;
  setActiveTab: (tab: NavTabId) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
  onClose,
}) => {
  const { currentRole, activeChild, db } = useSchool();

  const getNavItems = (): { id: NavTabId; label: string; icon: React.ReactNode; badge?: string | number }[] => {
    switch (currentRole) {
      case 'parent': {
        const pendingHw = db.homeworkItems.filter(h => {
          if (!activeChild || h.sectionId !== activeChild.sectionId) return false;
          const sub = db.homeworkSubmissions.find(s => s.homeworkId === h.id && s.studentId === activeChild.id);
          return !sub || sub.status === 'pending';
        }).length;

        return [
          { id: 'overview', label: 'Parent Dashboard', icon: <Home className="w-4 h-4" /> },
          { id: 'timeline', label: 'My School Day', icon: <Clock className="w-4 h-4" /> },
          { id: 'attendance', label: 'Attendance', icon: <CalendarCheck className="w-4 h-4" /> },
          { id: 'homework', label: 'Homework', icon: <BookMarked className="w-4 h-4" />, badge: pendingHw > 0 ? pendingHw : undefined },
          { id: 'tests', label: 'Tests & Results', icon: <Award className="w-4 h-4" /> },
          { id: 'timetable', label: 'Timetable', icon: <Calendar className="w-4 h-4" /> },
          { id: 'leave', label: 'Leave Applications', icon: <FileText className="w-4 h-4" /> },
          { id: 'announcements', label: 'Announcements', icon: <Bell className="w-4 h-4" /> },
        ];
      }

      case 'teacher': {
        const pendingLeaves = db.leaveApplications.filter(l => l.status === 'pending').length;
        const pendingSubmissions = db.homeworkSubmissions.filter(s => s.status === 'submitted').length;

        return [
          { id: 'overview', label: 'Teacher Dashboard', icon: <Home className="w-4 h-4" /> },
          { id: 'timeline', label: 'My School Day (Timeline)', icon: <Clock className="w-4 h-4" /> },
          { id: 'attendance', label: 'Mark Attendance', icon: <CalendarCheck className="w-4 h-4" /> },
          { id: 'homework', label: 'Homework & Checking', icon: <BookMarked className="w-4 h-4" />, badge: pendingSubmissions > 0 ? pendingSubmissions : undefined },
          { id: 'tests', label: 'Tests & Marks', icon: <Award className="w-4 h-4" /> },
          { id: 'leave', label: 'Leave Requests', icon: <FileText className="w-4 h-4" />, badge: pendingLeaves > 0 ? pendingLeaves : undefined },
          { id: 'classes', label: 'Assigned Classes', icon: <Users className="w-4 h-4" /> },
          { id: 'timetable', label: 'Timetable', icon: <Calendar className="w-4 h-4" /> },
        ];
      }

      case 'student': {
        const pendingHw = db.homeworkItems.filter(h => {
          const sub = db.homeworkSubmissions.find(s => s.homeworkId === h.id && s.studentId === 'std-bilal-tariq');
          return !sub || sub.status === 'pending';
        }).length;

        return [
          { id: 'overview', label: 'Student Home', icon: <Home className="w-4 h-4" /> },
          { id: 'timeline', label: 'My School Day', icon: <Clock className="w-4 h-4" /> },
          { id: 'homework', label: 'My Homework', icon: <BookMarked className="w-4 h-4" />, badge: pendingHw > 0 ? pendingHw : undefined },
          { id: 'attendance', label: 'My Attendance', icon: <CalendarCheck className="w-4 h-4" /> },
          { id: 'tests', label: 'Exams & Results', icon: <Award className="w-4 h-4" /> },
          { id: 'timetable', label: 'Weekly Timetable', icon: <Calendar className="w-4 h-4" /> },
          { id: 'announcements', label: 'Announcements', icon: <Bell className="w-4 h-4" /> },
        ];
      }

      case 'admin': {
        return [
          { id: 'overview', label: 'Admin Overview', icon: <Home className="w-4 h-4" /> },
          { id: 'students', label: 'Students Directory', icon: <GraduationCap className="w-4 h-4" /> },
          { id: 'teachers', label: 'Teacher Faculty', icon: <Users className="w-4 h-4" /> },
          { id: 'classes', label: 'Classes & Sections', icon: <Layers className="w-4 h-4" /> },
          { id: 'subjects', label: 'Subjects & Assignments', icon: <BookOpen className="w-4 h-4" /> },
          { id: 'calendar', label: 'School Calendar', icon: <CalendarDays className="w-4 h-4" /> },
          { id: 'announcements', label: 'Announcements', icon: <Bell className="w-4 h-4" /> },
          { id: 'reports', label: 'Reports & Analytics', icon: <BarChart3 className="w-4 h-4" /> },
          { id: 'profile', label: 'School Profile', icon: <School className="w-4 h-4" /> },
        ];
      }
    }
  };

  const navItems = getNavItems();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed lg:sticky top-16 z-40 h-[calc(100vh-4rem)] w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-200 shrink-0 flex flex-col justify-between ${
          isOpen ? 'left-0 shadow-2xl lg:shadow-none' : '-left-64 lg:left-0'
        }`}
      >
        <div className="p-4 flex-1 overflow-y-auto no-scrollbar">
          {/* Mobile close button & header */}
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100 dark:border-slate-800 lg:hidden">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Navigation</span>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Role badge */}
          <div className="mb-4 px-3 py-2 bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/40 rounded-xl">
            <div className="text-[10px] uppercase font-bold tracking-wider text-purple-700 dark:text-purple-300">
              Active Portal
            </div>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-100 capitalize">
              {currentRole === 'parent' && 'Parent / Guardian Portal'}
              {currentRole === 'teacher' && 'Teacher Academic Portal'}
              {currentRole === 'student' && 'Student Digital Diary'}
              {currentRole === 'admin' && 'School Administration'}
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map(item => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-purple-700 text-white shadow-xs font-bold'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}>
                      {item.icon}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full ${
                        isActive
                          ? 'bg-white text-purple-700'
                          : 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-200'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* School Footer Info */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 truncate">
            {db.school.name}
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
            SEMIS: {db.school.sindhEmisCode} · {db.school.city || 'Karachi'}
          </div>
        </div>
      </aside>
    </>
  );
};
