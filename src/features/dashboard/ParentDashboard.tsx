/**
 * MERI SCHOOL DIARY — Parent Dashboard
 * Scoped to currently active child, includes child switcher, today's attendance, pending homework, recent timeline.
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
  UserCheck,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { NavTabId } from '../../components/layout/Sidebar';

interface ParentDashboardProps {
  onNavigate: (tab: NavTabId) => void;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({ onNavigate }) => {
  const { db, activeChild, parentChildren, setActiveChildId } = useSchool();

  if (!activeChild) {
    return <div className="p-8 text-center text-slate-500">No child records linked.</div>;
  }

  const section = db.sections.find(s => s.id === activeChild.sectionId);
  const classTeacher = section ? db.teachers.find(t => t.id === section.classTeacherId) : null;

  // Today's attendance record
  const todayRecord = db.attendanceRecords.find(
    r => r.studentId === activeChild.id && r.date === '2026-11-11'
  );

  // Pending homework
  const childHomework = db.homeworkItems.filter(h => h.sectionId === activeChild.sectionId);
  const pendingHomework = childHomework.filter(h => {
    const sub = db.homeworkSubmissions.find(
      s => s.homeworkId === h.id && s.studentId === activeChild.id
    );
    return !sub || sub.status === 'pending';
  });

  // Recent timeline updates for child's section
  const todayTimeline = db.timelineUpdates
    .filter(u => u.sectionId === activeChild.sectionId && u.date === '2026-11-11')
    .sort((a, b) => a.periodNumber - b.periodNumber);

  // Upcoming tests
  const upcomingTests = db.tests
    .filter(t => t.sectionId === activeChild.sectionId && t.date >= '2026-11-11')
    .sort((a, b) => a.date.localeCompare(b.date));

  // Upcoming holidays
  const upcomingHolidays = db.calendarEvents.filter(
    e => e.type === 'holiday' && e.endDate >= '2026-11-09'
  );

  return (
    <div className="space-y-6">
      {/* Welcome Banner & Multi-Child Switcher */}
      <div className="bg-gradient-to-r from-purple-800 to-indigo-900 rounded-3xl p-6 sm:p-7 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-200">
              Welcome Back, Respected Parent
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Tariq Mehmood
            </h1>
            <p className="text-xs sm:text-sm text-purple-100/90 max-w-xl font-normal leading-relaxed">
              Monitoring digital diary for {db.school.name}, {db.school.address}
            </p>
          </div>

          {/* Child Switcher Pill Island */}
          <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 shrink-0">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-200 block mb-2">
              Switch Child:
            </span>
            <div className="flex items-center gap-2">
              {parentChildren.map(child => {
                const sec = db.sections.find(s => s.id === child.sectionId);
                const isSelected = child.id === activeChild.id;
                return (
                  <button
                    key={child.id}
                    onClick={() => setActiveChildId(child.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all text-left ${
                      isSelected
                        ? 'bg-white text-purple-900 shadow-sm'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                  >
                    <div>{child.fullName}</div>
                    <div className={`text-[10px] ${isSelected ? 'text-purple-700' : 'text-purple-200'}`}>
                      Section {sec?.name} · Roll #{child.rollNumber}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Active Child Profile Overview Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 font-extrabold text-lg flex items-center justify-center shrink-0">
            {activeChild.fullName.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                {activeChild.fullName}
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-purple-50 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800">
                Section {section?.name}
              </span>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex flex-wrap items-center gap-2">
              <span>Roll #{activeChild.rollNumber}</span>
              <span>·</span>
              <span>Adm #{activeChild.admissionNumber}</span>
              <span>·</span>
              <span>Class Teacher: {classTeacher?.fullName || 'Assigned'}</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => onNavigate('attendance')}
          className="text-xs font-bold text-purple-700 dark:text-purple-300 hover:underline flex items-center gap-1 self-start sm:self-auto"
        >
          View Full Record <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Grid of Key Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Attendance Card */}
        <div
          onClick={() => onNavigate('attendance')}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-2 hover:border-purple-300 dark:hover:border-purple-700 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Today's Attendance</span>
            <CalendarCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="pt-1">
            {todayRecord ? (
              <div className="flex items-center gap-2">
                <span className="text-xl font-black capitalize text-emerald-600 dark:text-emerald-400">
                  {todayRecord.status === 'present' && 'Present in Class'}
                  {todayRecord.status === 'late' && 'Late Arrival'}
                  {todayRecord.status === 'leave' && 'On Approved Leave'}
                  {todayRecord.status === 'absent' && 'Absent Today'}
                </span>
              </div>
            ) : (
              <span className="text-sm font-bold text-slate-500">Not recorded yet</span>
            )}
            <span className="text-[11px] text-slate-400 block mt-1">Wednesday, 11 Nov 2026</span>
          </div>
        </div>

        {/* Pending Homework Card */}
        <div
          onClick={() => onNavigate('homework')}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-2 hover:border-purple-300 dark:hover:border-purple-700 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Homework</span>
            <BookMarked className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="pt-1">
            <span className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">
              {pendingHomework.length}
            </span>
            <span className="text-[11px] text-slate-500 block mt-1">
              {pendingHomework.length > 0 ? 'Due for completion' : 'All homework submitted'}
            </span>
          </div>
        </div>

        {/* Today's Timeline Updates */}
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
            <span className="text-[11px] text-slate-500 block mt-1">Scheduled assessments</span>
          </div>
        </div>
      </div>

      {/* Flagship Snapshot: Today's Classroom Activity (My School Day Preview) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Today's Classroom Activity (My School Day)
            </h3>
            <p className="text-xs text-slate-500">
              Verified record of what was taught today in Section {section?.name}
            </p>
          </div>
          <button
            onClick={() => onNavigate('timeline')}
            className="text-xs font-bold text-purple-700 dark:text-purple-300 hover:underline flex items-center gap-1"
          >
            Open Full Timeline <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-3">
          {todayTimeline.length === 0 ? (
            <div className="p-4 text-center text-slate-400 text-xs">
              No period updates logged yet for today.
            </div>
          ) : (
            todayTimeline.slice(0, 3).map(u => {
              const sub = db.subjects.find(s => s.id === u.subjectId);
              const teacher = db.teachers.find(t => t.id === u.teacherId);
              return (
                <div
                  key={u.id}
                  className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-purple-800 dark:text-purple-300">
                      Period {u.periodNumber}: {sub?.name}
                    </span>
                    <span className="font-mono text-[11px] text-slate-500">
                      {u.startTime} – {u.endTime}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-normal">
                    {u.whatWasTaught}
                  </p>
                  <div className="text-[11px] text-slate-400">
                    Conducted by {teacher?.fullName}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Announcements & Holidays Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Important Announcements */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Circulars</h3>
            </div>
            <button
              onClick={() => onNavigate('announcements')}
              className="text-xs font-bold text-purple-700 dark:text-purple-300 hover:underline"
            >
              View All
            </button>
          </div>

          <div className="space-y-2.5">
            {db.announcements.slice(0, 2).map(anc => (
              <div key={anc.id} className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{anc.title}</div>
                <p className="text-xs text-slate-500 line-clamp-2">{anc.content}</p>
                <div className="text-[10px] text-slate-400 font-mono">{anc.publishDate}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Holidays */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Upcoming School Holidays</h3>
            </div>
          </div>

          <div className="space-y-2.5">
            {upcomingHolidays.map(hol => (
              <div key={hol.id} className="p-3 rounded-xl border border-amber-100 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/20 space-y-1">
                <div className="text-xs font-bold text-amber-900 dark:text-amber-200">{hol.title}</div>
                <div className="text-xs text-slate-600 dark:text-slate-400">{hol.description}</div>
                <div className="text-[11px] font-mono font-bold text-amber-700 dark:text-amber-400">
                  {hol.startDate} {hol.startDate !== hol.endDate && `to ${hol.endDate}`}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
