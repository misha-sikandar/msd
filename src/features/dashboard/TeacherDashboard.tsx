/**
 * MERI SCHOOL DIARY — Teacher Academic Dashboard
 */

import React from 'react';
import {
  CalendarCheck,
  BookMarked,
  Clock,
  Award,
  FileText,
  Users,
  ChevronRight,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { NavTabId } from '../../components/layout/Sidebar';

interface TeacherDashboardProps {
  onNavigate: (tab: NavTabId) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ onNavigate }) => {
  const { db, activeTeacher } = useSchool();

  if (!activeTeacher) {
    return <div className="p-8 text-center text-slate-500">No active teacher profile.</div>;
  }

  // Teacher assignments
  const assignments = db.teacherAssignments.filter(a => a.teacherId === activeTeacher.id);
  const assignedSections = Array.from(new Set(assignments.map(a => a.sectionId)))
    .map(secId => db.sections.find(s => s.id === secId))
    .filter(Boolean);

  // Check if class teacher of any section
  const classTeacherSection = db.sections.find(s => s.classTeacherId === activeTeacher.id);

  // Today's attendance status for class teacher section
  const todayAttendance = classTeacherSection
    ? db.attendanceRecords.filter(r => r.sectionId === classTeacherSection.id && r.date === '2026-11-11')
    : [];

  const isAttendanceMarked = todayAttendance.length > 0;

  // Pending homework checking
  const teacherHomeworkIds = db.homeworkItems.filter(h => h.teacherId === activeTeacher.id).map(h => h.id);
  const pendingChecking = db.homeworkSubmissions.filter(
    s => teacherHomeworkIds.includes(s.homeworkId) && s.status === 'submitted'
  );

  // Pending leaves for class teacher's section
  const sectionStudentIds = classTeacherSection
    ? db.students.filter(s => s.sectionId === classTeacherSection.id).map(s => s.id)
    : [];
  const pendingLeaves = db.leaveApplications.filter(
    l => sectionStudentIds.includes(l.studentId) && l.status === 'pending'
  );

  // Today's timeline updates
  const todayTimelineUpdates = db.timelineUpdates.filter(
    u => u.date === '2026-11-11' && (u.teacherId === activeTeacher.id || u.substituteTeacherId === activeTeacher.id)
  );

  return (
    <div className="space-y-6">
      {/* Teacher Profile Banner */}
      <div className="bg-gradient-to-r from-purple-800 to-indigo-900 rounded-3xl p-6 sm:p-7 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-200">
                Teacher Academic Portal
              </span>
              {classTeacherSection && (
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-900">
                  Class Teacher: Section {classTeacherSection.name}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              {activeTeacher.fullName}
            </h1>
            <p className="text-xs sm:text-sm text-purple-100/90 max-w-xl font-normal leading-relaxed">
              {activeTeacher.designation} · {db.school.name} · SEMIS {db.school.sindhEmisCode}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => onNavigate('attendance')}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-white text-purple-900 hover:bg-purple-50 transition-colors shadow-xs"
            >
              Mark Attendance
            </button>
            <button
              onClick={() => onNavigate('timeline')}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-white/20 hover:bg-white/30 text-white transition-colors"
            >
              Record My School Day
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Attendance Status */}
        <div
          onClick={() => onNavigate('attendance')}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-2 hover:border-purple-300 dark:hover:border-purple-700 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Class Attendance</span>
            <CalendarCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="pt-1">
            <span className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-1.5">
              {isAttendanceMarked ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700 dark:text-emerald-400">Marked for Today</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span className="text-amber-700 dark:text-amber-400">Pending Marking</span>
                </>
              )}
            </span>
            <span className="text-[11px] text-slate-500 block mt-1">
              {classTeacherSection ? `Section ${classTeacherSection.name}` : 'Subject Teacher'}
            </span>
          </div>
        </div>

        {/* Pending Checking */}
        <div
          onClick={() => onNavigate('homework')}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-2 hover:border-purple-300 dark:hover:border-purple-700 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Submissions to Check</span>
            <BookMarked className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="pt-1">
            <span className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">
              {pendingChecking.length}
            </span>
            <span className="text-[11px] text-slate-500 block mt-1">
              Student submissions awaiting review
            </span>
          </div>
        </div>

        {/* Timeline Logged Today */}
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
              {todayTimelineUpdates.length}
            </span>
            <span className="text-[11px] text-slate-500 block mt-1">Periods recorded by you today</span>
          </div>
        </div>

        {/* Leave Requests */}
        <div
          onClick={() => onNavigate('leave')}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-2 hover:border-purple-300 dark:hover:border-purple-700 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Leaves</span>
            <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="pt-1">
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400 tabular-nums">
              {pendingLeaves.length}
            </span>
            <span className="text-[11px] text-slate-500 block mt-1">Applications awaiting approval</span>
          </div>
        </div>
      </div>

      {/* Assigned Classes & Sections List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Assigned Classes &amp; Teaching Roster
            </h3>
            <p className="text-xs text-slate-500">
              Sections and subjects officially assigned to you
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {assignments.map(a => {
            const sec = db.sections.find(s => s.id === a.sectionId);
            const sub = db.subjects.find(s => s.id === a.subjectId);
            const enrolled = db.students.filter(s => s.sectionId === a.sectionId && s.isActive).length;

            return (
              <div
                key={a.id}
                className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-2.5 py-0.5 rounded-lg">
                    Section {sec?.name}
                  </span>
                  <span className="text-xs font-mono text-slate-400">{sec?.roomNumber}</span>
                </div>
                <div className="text-sm font-extrabold text-slate-900 dark:text-white">
                  {sub?.name}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {enrolled} Enrolled Students
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
