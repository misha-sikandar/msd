/**
 * MERI SCHOOL DIARY — Admin Overview Dashboard
 */

import React, { useState } from 'react';
import {
  Users,
  GraduationCap,
  Layers,
  BookOpen,
  CalendarCheck,
  Calendar,
  Bell,
  BarChart3,
  RotateCcw,
  PlusCircle,
  School,
  ChevronRight,
  FileText,
  Download,
} from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { NavTabId } from '../../components/layout/Sidebar';
import {
  generateSchoolProfilePdf,
  generateStudentDirectoryPdf,
  generateStaffDirectoryPdf,
} from '../../utils/pdfGenerator';
import { PdfViewerModal } from '../../components/common/PdfViewerModal';

interface AdminDashboardProps {
  onNavigate: (tab: NavTabId) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const { db } = useSchool();
  const [activePdf, setActivePdf] = useState<{
    title: string;
    blob: Blob;
    filename: string;
    subtitle?: string;
  } | null>(null);

  const totalStudents = db.students.filter(s => s.isActive).length;
  const totalTeachers = db.teachers.filter(t => t.isActive).length;
  const totalClasses = db.classes.length;
  const totalSections = db.sections.length;
  const totalSubjects = db.subjects.length;

  const handleExportProfilePdf = () => {
    const doc = generateSchoolProfilePdf({
      school: db.school,
      totalStudents,
      totalTeachers,
      totalSections,
    });
    setActivePdf({
      title: 'Official School Profile Document',
      blob: doc.output('blob'),
      filename: `GGHSS_Gizri_School_Profile_SEMIS_${db.school.sindhEmisCode}.pdf`,
      subtitle: `${db.school.name} · Official SEMIS Census Record`,
    });
  };

  const handleExportStudentsPdf = () => {
    const section = db.sections[0] || { id: 'sec-6a', name: '6-A', classId: 'cls-6', roomNumber: 'Room 101', classTeacherId: 'tch-abdul-qadir' };
    const doc = generateStudentDirectoryPdf({
      school: db.school,
      section,
      className: 'Class 6',
      students: db.students.filter(s => s.sectionId === section.id && s.isActive),
      guardians: db.guardians,
    });
    setActivePdf({
      title: `Student Enrollment Directory — Section ${section.name}`,
      blob: doc.output('blob'),
      filename: `GGHSS_Gizri_Student_Directory_${section.name}.pdf`,
      subtitle: `Official Enrollment Roster · Total Enrolled: ${db.students.filter(s => s.sectionId === section.id).length}`,
    });
  };

  const handleExportStaffPdf = () => {
    const doc = generateStaffDirectoryPdf({
      school: db.school,
      teachers: db.teachers.filter(t => t.isActive),
    });
    setActivePdf({
      title: 'Faculty Roster & Staff Directory',
      blob: doc.output('blob'),
      filename: 'GGHSS_Gizri_Faculty_Roster_2026.pdf',
      subtitle: `Appointed Teaching Cadre · ${db.teachers.length} Faculty Members`,
    });
  };

  // Today's attendance stats
  const todayRecords = db.attendanceRecords.filter(r => r.date === '2026-11-11');
  const presentCount = todayRecords.filter(r => r.status === 'present').length;
  const lateCount = todayRecords.filter(r => r.status === 'late').length;
  const leaveCount = todayRecords.filter(r => r.status === 'leave').length;
  const absentCount = todayRecords.filter(r => r.status === 'absent').length;

  const attendanceRate =
    todayRecords.length > 0
      ? Math.round(((presentCount + lateCount * 0.5 + leaveCount) / todayRecords.length) * 100)
      : 0;

  // Upcoming holidays
  const upcomingHolidays = db.calendarEvents.filter(
    e => e.type === 'holiday' && e.endDate >= '2026-11-09'
  );

  return (
    <div className="space-y-6">
      {/* School Header Banner */}
      <div className="bg-gradient-to-r from-purple-800 to-indigo-900 rounded-3xl p-6 sm:p-7 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-200">
              School Administration Portal
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              {db.school.name}
            </h1>
            <p className="text-xs sm:text-sm text-purple-100/90 max-w-2xl font-normal leading-relaxed">
              SEMIS Code: {db.school.sindhEmisCode} · District: {db.school.district || 'District South, Karachi'} · {db.school.address}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={handleExportProfilePdf}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white/20 hover:bg-white/30 text-white transition-colors flex items-center gap-1.5 backdrop-blur-xs"
              title="Official School Profile PDF"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>School Profile PDF</span>
            </button>
            <button
              onClick={handleExportStudentsPdf}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white/20 hover:bg-white/30 text-white transition-colors flex items-center gap-1.5 backdrop-blur-xs"
              title="Student Enrollment Roster PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Students Roster</span>
            </button>
            <button
              onClick={handleExportStaffPdf}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white/20 hover:bg-white/30 text-white transition-colors flex items-center gap-1.5 backdrop-blur-xs"
              title="Faculty Directory PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Faculty List</span>
            </button>
            <button
              onClick={() => onNavigate('students')}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-white text-purple-900 hover:bg-purple-50 transition-colors shadow-xs"
            >
              Manage Students
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div
          onClick={() => onNavigate('students')}
          className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs cursor-pointer hover:border-purple-300 transition-all"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Students</span>
            <GraduationCap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <span className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">
            {totalStudents}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Enrolled active</span>
        </div>

        <div
          onClick={() => onNavigate('teachers')}
          className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs cursor-pointer hover:border-purple-300 transition-all"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Teachers</span>
            <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <span className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">
            {totalTeachers}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Active faculty</span>
        </div>

        <div
          onClick={() => onNavigate('classes')}
          className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs cursor-pointer hover:border-purple-300 transition-all"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Classes</span>
            <Layers className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <span className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">
            {totalClasses}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Classes 6 &amp; 7</span>
        </div>

        <div
          onClick={() => onNavigate('classes')}
          className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs cursor-pointer hover:border-purple-300 transition-all"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Sections</span>
            <Layers className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <span className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">
            {totalSections}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">6-A, 6-B, 7-A</span>
        </div>

        <div
          onClick={() => onNavigate('subjects')}
          className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs cursor-pointer hover:border-purple-300 transition-all"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Subjects</span>
            <BookOpen className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <span className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">
            {totalSubjects}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Sindh curriculum</span>
        </div>

        <div
          onClick={() => onNavigate('attendance')}
          className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs cursor-pointer hover:border-purple-300 transition-all"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Today's Rate</span>
            <CalendarCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
            {attendanceRate}%
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">{todayRecords.length} Marked</span>
        </div>
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Quick Administration Hub
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => onNavigate('students')}
            className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-left transition-colors"
          >
            <GraduationCap className="w-5 h-5 text-purple-700 dark:text-purple-400 mb-2" />
            <div className="text-xs font-bold text-slate-900 dark:text-white">Student Records</div>
            <div className="text-[11px] text-slate-400">Admissions &amp; Roll numbers</div>
          </button>

          <button
            onClick={() => onNavigate('teachers')}
            className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-left transition-colors"
          >
            <Users className="w-5 h-5 text-purple-700 dark:text-purple-400 mb-2" />
            <div className="text-xs font-bold text-slate-900 dark:text-white">Teacher Faculty</div>
            <div className="text-[11px] text-slate-400">Designations &amp; contacts</div>
          </button>

          <button
            onClick={() => onNavigate('calendar')}
            className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-left transition-colors"
          >
            <Calendar className="w-5 h-5 text-purple-700 dark:text-purple-400 mb-2" />
            <div className="text-xs font-bold text-slate-900 dark:text-white">Calendar &amp; Holidays</div>
            <div className="text-[11px] text-slate-400">Manage term events</div>
          </button>

          <button
            onClick={() => onNavigate('reports')}
            className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-left transition-colors"
          >
            <BarChart3 className="w-5 h-5 text-purple-700 dark:text-purple-400 mb-2" />
            <div className="text-xs font-bold text-slate-900 dark:text-white">Analytics &amp; Reports</div>
            <div className="text-[11px] text-slate-400">Attendance &amp; Exam graphs</div>
          </button>
        </div>
      </div>

      {/* Current Academic Year & School Profile Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">School Profile &amp; EMIS</h3>
            <button
              onClick={() => onNavigate('profile')}
              className="text-xs font-bold text-purple-700 dark:text-purple-300 hover:underline"
            >
              Edit Details
            </button>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800">
              <span className="text-slate-400">School Name</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{db.school.name}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800">
              <span className="text-slate-400">SEMIS Code</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{db.school.sindhEmisCode}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800">
              <span className="text-slate-400">Principal / Incharge</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {db.school.principalName && db.school.principalName !== 'Not provided' ? db.school.principalName : 'Not provided'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800">
              <span className="text-slate-400">Campus Address</span>
              <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[200px]" title={db.school.address}>
                {db.school.address}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Telephone</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {db.school.telephone && db.school.telephone !== 'Not provided' ? db.school.telephone : 'Not provided'}
              </span>
            </div>
          </div>
        </div>

        {/* Academic Years & Terms */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Academic Years</h3>
          </div>

          <div className="space-y-2.5">
            {db.academicYears.map(ay => (
              <div
                key={ay.id}
                className={`p-3.5 rounded-xl border flex items-center justify-between text-xs ${
                  ay.isCurrent
                    ? 'border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/30'
                    : 'border-slate-100 dark:border-slate-800'
                }`}
              >
                <div>
                  <div className="font-extrabold text-slate-900 dark:text-white">Academic Year {ay.name}</div>
                  <div className="text-slate-400 text-[11px] font-mono mt-0.5">
                    {ay.startDate} to {ay.endDate}
                  </div>
                </div>

                {ay.isCurrent && (
                  <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-purple-700 text-white">
                    Current Session
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PDF Viewer & Print Modal */}
      {activePdf && (
        <PdfViewerModal
          isOpen={true}
          onClose={() => setActivePdf(null)}
          title={activePdf.title}
          pdfBlob={activePdf.blob}
          filename={activePdf.filename}
          subtitle={activePdf.subtitle}
        />
      )}
    </div>
  );
};
