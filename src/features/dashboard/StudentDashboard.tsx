/**
 * MERI SCHOOL DIARY — Student Digital Diary Dashboard
 */

import React from 'react';
import {
  CalendarCheck,
  BookMarked,
  Clock,
  Award,
  Bell,
  Calendar,
  ChevronRight,
  Send,
  CheckCircle2,
} from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { NavTabId } from '../../components/layout/Sidebar';

interface StudentDashboardProps {
  onNavigate: (tab: NavTabId) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onNavigate }) => {
  const { db, activeStudent } = useSchool();

  if (!activeStudent) {
    return <div className="p-8 text-center text-slate-500">No active student profile.</div>;
  }

  const section = db.sections.find(s => s.id === activeStudent.sectionId);

  // Today's attendance
  const todayRecord = db.attendanceRecords.find(
    r => r.studentId === activeStudent.id && r.date === '2026-11-11'
  );

  // Pending homework
  const sectionHw = db.homeworkItems.filter(h => h.sectionId === activeStudent.sectionId);
  const pendingHomework = sectionHw.filter(h => {
    const sub = db.homeworkSubmissions.find(
      s => s.homeworkId === h.id && s.studentId === activeStudent.id
    );
    return !sub || sub.status === 'pending';
  });

  // Today's timeline updates
  const todayTimeline = db.timelineUpdates
    .filter(u => u.sectionId === activeStudent.sectionId && u.date === '2026-11-11')
    .sort((a, b) => a.periodNumber - b.periodNumber);

  // Upcoming tests
  const upcomingTests = db.tests
    .filter(t => t.sectionId === activeStudent.sectionId && t.date >= '2026-11-11')
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="space-y-6">
      {/* Student Profile Banner */}
      <div className="bg-gradient-to-r from-purple-800 to-indigo-900 rounded-3xl p-6 sm:p-7 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-200">
              Student Digital Diary
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              {activeStudent.fullName}
            </h1>
            <p className="text-xs sm:text-sm text-purple-100/90 max-w-xl font-normal leading-relaxed">
              Roll #{activeStudent.rollNumber} · Section {section?.name} · Admission #{activeStudent.admissionNumber} · {db.school.name} (SEMIS {db.school.sindhEmisCode})
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => onNavigate('homework')}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-white text-purple-900 hover:bg-purple-50 transition-colors shadow-xs"
            >
              My Homework ({pendingHomework.length})
            </button>
            <button
              onClick={() => onNavigate('timeline')}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-white/20 hover:bg-white/30 text-white transition-colors"
            >
              View My School Day
            </button>
          </div>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Attendance */}
        <div
          onClick={() => onNavigate('attendance')}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-2 hover:border-purple-300 dark:hover:border-purple-700 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Today's Attendance</span>
            <CalendarCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="pt-1">
            <span className="text-lg font-black capitalize text-emerald-600 dark:text-emerald-400">
              {todayRecord?.status === 'present' && 'Present'}
              {todayRecord?.status === 'late' && 'Late'}
              {todayRecord?.status === 'leave' && 'On Leave'}
              {todayRecord?.status === 'absent' && 'Absent'}
              {!todayRecord && 'Not Marked'}
            </span>
            <span className="text-[11px] text-slate-500 block mt-1">Wednesday, 11 Nov 2026</span>
          </div>
        </div>

        {/* Pending Homework */}
        <div
          onClick={() => onNavigate('homework')}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-2 hover:border-purple-300 dark:hover:border-purple-700 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Homework Due</span>
            <BookMarked className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="pt-1">
            <span className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">
              {pendingHomework.length}
            </span>
            <span className="text-[11px] text-slate-500 block mt-1">Pending assignments</span>
          </div>
        </div>

        {/* My School Day */}
        <div
          onClick={() => onNavigate('timeline')}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-2 hover:border-purple-300 dark:hover:border-purple-700 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">My School Day</span>
            <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="pt-1">
            <span className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">
              {todayTimeline.length} / 6
            </span>
            <span className="text-[11px] text-slate-500 block mt-1">Periods recorded today</span>
          </div>
        </div>

        {/* Upcoming Tests */}
        <div
          onClick={() => onNavigate('tests')}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-2 hover:border-purple-300 dark:hover:border-purple-700 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Upcoming Tests</span>
            <Award className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="pt-1">
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400 tabular-nums">
              {upcomingTests.length}
            </span>
            <span className="text-[11px] text-slate-500 block mt-1">Tests this month</span>
          </div>
        </div>
      </div>

      {/* Pending Homework Quick List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Pending Homework Tasks
            </h3>
            <p className="text-xs text-slate-500">Submit your work before due dates</p>
          </div>
          <button
            onClick={() => onNavigate('homework')}
            className="text-xs font-bold text-purple-700 dark:text-purple-300 hover:underline flex items-center gap-1"
          >
            All Homework <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-3">
          {pendingHomework.length === 0 ? (
            <div className="p-4 text-center text-slate-400 text-xs">
              No pending homework! You are completely caught up.
            </div>
          ) : (
            pendingHomework.slice(0, 3).map(hw => {
              const sub = db.subjects.find(s => s.id === hw.subjectId);
              return (
                <div
                  key={hw.id}
                  className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-purple-700 dark:text-purple-300">
                        {sub?.name}
                      </span>
                      <span className="text-xs text-slate-400">· Due: {hw.dueDate}</span>
                    </div>
                    <div className="text-sm font-extrabold text-slate-900 dark:text-white">
                      {hw.title}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1">
                      {hw.instructions}
                    </p>
                  </div>

                  <button
                    onClick={() => onNavigate('homework')}
                    className="px-3.5 py-1.5 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-xl transition-colors shadow-xs flex items-center gap-1.5 self-start sm:self-auto shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Submit Now
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
