import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  Save,
  CheckCheck,
  Calendar,
  AlertCircle,
  Download,
  Printer,
} from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { AttendanceStatus } from '../../types';
import {
  generateAttendanceRegisterPdf,
  generateStudentAttendancePdf,
} from '../../utils/pdfGenerator';
import { PdfViewerModal } from '../../components/common/PdfViewerModal';

export const AttendanceView: React.FC = () => {
  const {
    db,
    currentRole,
    activeChild,
    activeStudent,
    saveSectionAttendance,
  } = useSchool();

  // For teacher marking
  const [selectedSectionId, setSelectedSectionId] = useState<string>('sec-6a');
  const [selectedDate, setSelectedDate] = useState<string>('2026-11-11');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // PDF Viewer modal state
  const [activePdf, setActivePdf] = useState<{
    title: string;
    blob: Blob;
    filename: string;
    subtitle?: string;
  } | null>(null);

  const targetStudent = currentRole === 'parent' ? activeChild : activeStudent;

  const handleExportRegisterPdf = () => {
    const sec = db.sections.find(s => s.id === selectedSectionId) || { id: 'sec-6a', name: '6-A', classId: 'cls-6', roomNumber: 'Room 101', classTeacherId: 'tch-abdul-qadir' };
    const schoolClass = db.classes.find(c => c.id === sec.classId);
    const teacher = db.teachers.find(t => t.id === sec.classTeacherId);

    const students = db.students
      .filter(s => s.sectionId === sec.id && s.isActive)
      .sort((a, b) => a.rollNumber - b.rollNumber);

    const workingDays = [
      '2026-11-02', '2026-11-03', '2026-11-04', '2026-11-05', '2026-11-06',
      '2026-11-10', '2026-11-11'
    ];

    const doc = generateAttendanceRegisterPdf({
      school: db.school,
      section: sec,
      className: schoolClass?.name || 'Class 6',
      monthName: 'November 2026',
      workingDays,
      students,
      records: db.attendanceRecords.filter(r => r.sectionId === sec.id),
      teacherName: teacher?.fullName,
    });

    setActivePdf({
      title: `Class Attendance Register — Section ${sec.name}`,
      blob: doc.output('blob'),
      filename: `GGHSS_Gizri_Attendance_${sec.name}_Nov2026.pdf`,
      subtitle: `${db.school.name} · Official Attendance Register (November 2026)`,
    });
  };

  const handleDownloadStudentAttendancePdf = () => {
    if (!targetStudent) return;
    const sec = db.sections.find(s => s.id === targetStudent.sectionId) || { id: 'sec-6a', name: '6-A', classId: 'cls-6', roomNumber: 'Room 101', classTeacherId: 'tch-abdul-qadir' };
    const schoolClass = db.classes.find(c => c.id === sec.classId);

    const doc = generateStudentAttendancePdf({
      school: db.school,
      student: targetStudent,
      section: sec,
      className: schoolClass?.name || 'Class 6',
      month: 'November 2026',
      records: db.attendanceRecords.filter(r => r.studentId === targetStudent.id).sort((a, b) => b.date.localeCompare(a.date)),
    });

    setActivePdf({
      title: `Student Attendance Certificate: ${targetStudent.fullName}`,
      blob: doc.output('blob'),
      filename: `GGHSS_Gizri_Attendance_${targetStudent.fullName.replace(/\s+/g, '_')}_Nov2026.pdf`,
      subtitle: `${db.school.name} · Verified Student Attendance Certificate`,
    });
  };

  // Filter students in selected section
  const sectionStudents = db.students
    .filter(s => s.sectionId === selectedSectionId && s.isActive)
    .sort((a, b) => a.rollNumber - b.rollNumber);

  // Attendance state map: { studentId: { status, notes } }
  const [attendanceDraft, setAttendanceDraft] = useState<
    Record<string, { status: AttendanceStatus; notes?: string }>
  >({});

  // When section or date changes, load existing records if present
  useEffect(() => {
    const existingRecords = db.attendanceRecords.filter(
      r => r.sectionId === selectedSectionId && r.date === selectedDate
    );

    const draft: Record<string, { status: AttendanceStatus; notes?: string }> = {};

    sectionStudents.forEach(std => {
      const rec = existingRecords.find(r => r.studentId === std.id);
      if (rec) {
        draft[std.id] = { status: rec.status, notes: rec.notes || '' };
      } else {
        // Check if there is an approved leave application for this student covering this date
        const approvedLeave = db.leaveApplications.find(
          l => l.studentId === std.id && l.status === 'approved' && selectedDate >= l.startDate && selectedDate <= l.endDate
        );
        if (approvedLeave) {
          draft[std.id] = { status: 'leave', notes: `Approved leave: ${approvedLeave.reason}` };
        } else {
          draft[std.id] = { status: 'present' }; // default
        }
      }
    });

    setAttendanceDraft(draft);
    setSaveSuccess(false);
  }, [selectedSectionId, selectedDate, db.attendanceRecords]);

  const handleMarkAllPresent = () => {
    const updated = { ...attendanceDraft };
    sectionStudents.forEach(std => {
      if (updated[std.id]?.status !== 'leave') {
        updated[std.id] = { ...updated[std.id], status: 'present' };
      }
    });
    setAttendanceDraft(updated);
  };

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendanceDraft(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], status },
    }));
  };

  const handleNoteChange = (studentId: string, notes: string) => {
    setAttendanceDraft(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], notes },
    }));
  };

  const handleSaveAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = Object.entries(attendanceDraft).map(([studentId, data]) => ({
      studentId,
      status: data.status,
      notes: data.notes,
    }));

    saveSectionAttendance(selectedSectionId, selectedDate, payload);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Check if calendar holiday or sunday
  const calendarEvent = db.calendarEvents.find(
    e => selectedDate >= e.startDate && selectedDate <= e.endDate
  );
  const isSunday = new Date(selectedDate).getDay() === 0;

  // View for Parent or Student
  if (currentRole === 'parent' || currentRole === 'student') {
    if (!targetStudent) {
      return <div className="p-6 text-sm text-slate-500">No student profile selected.</div>;
    }

    const studentRecords = db.attendanceRecords
      .filter(r => r.studentId === targetStudent.id)
      .sort((a, b) => b.date.localeCompare(a.date));

    const totalMarked = studentRecords.length;
    const presentCount = studentRecords.filter(r => r.status === 'present').length;
    const lateCount = studentRecords.filter(r => r.status === 'late').length;
    const leaveCount = studentRecords.filter(r => r.status === 'leave').length;
    const absentCount = studentRecords.filter(r => r.status === 'absent').length;

    const effectivePresent = presentCount + lateCount * 0.5 + leaveCount;
    const attendancePercentage =
      totalMarked > 0 ? Math.round((effectivePresent / totalMarked) * 100) : 100;

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Attendance Record
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Tracking attendance for {targetStudent.fullName} · Roll #{targetStudent.rollNumber} (
              {db.sections.find(s => s.id === targetStudent.sectionId)?.name})
            </p>
          </div>
          <button
            type="button"
            onClick={handleDownloadStudentAttendancePdf}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-xl transition-colors shadow-xs self-start sm:self-auto"
          >
            <Download className="w-4 h-4" />
            <span>Download Attendance Sheet (PDF)</span>
          </button>
        </div>

        {/* Attendance Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Overall Rate</span>
            <span className="text-2xl font-black text-purple-700 dark:text-purple-400 tabular-nums">
              {attendancePercentage}%
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5">{totalMarked} Recorded Days</span>
          </div>

          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">Present</span>
            <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400 tabular-nums">
              {presentCount}
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5">On time</span>
          </div>

          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
            <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">Late</span>
            <span className="text-2xl font-black text-amber-700 dark:text-amber-400 tabular-nums">
              {lateCount}
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5">Late arrivals</span>
          </div>

          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
            <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">Approved Leave</span>
            <span className="text-2xl font-black text-blue-700 dark:text-blue-400 tabular-nums">
              {leaveCount}
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5">With permission</span>
          </div>

          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs col-span-2 sm:col-span-1">
            <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block">Absent</span>
            <span className="text-2xl font-black text-rose-700 dark:text-rose-400 tabular-nums">
              {absentCount}
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5">Unexcused</span>
          </div>
        </div>

        {/* Detailed History Table */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">
            Recent Attendance Log
          </h2>

          <div className="space-y-3">
            {studentRecords.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-sm">
                No attendance recorded yet for this student.
              </div>
            ) : (
              studentRecords.map(rec => {
                const badgeConfig = {
                  present: { label: 'Present', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' },
                  absent: { label: 'Absent', bg: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800' },
                  late: { label: 'Late', bg: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800' },
                  leave: { label: 'Approved Leave', bg: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800' },
                }[rec.status];

                const teacher = db.teachers.find(t => t.id === rec.markedById);

                return (
                  <div
                    key={rec.id}
                    className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 rounded-lg">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">
                          {new Date(rec.date).toLocaleDateString('en-PK', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </div>
                        {rec.notes ? (
                          <div className="text-[11px] text-slate-500 italic">Note: {rec.notes}</div>
                        ) : (
                          <div className="text-[11px] text-slate-400">Marked by {teacher?.fullName || 'Class Teacher'}</div>
                        )}
                      </div>
                    </div>

                    <div className="self-start sm:self-auto">
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${badgeConfig.bg}`}>
                        {badgeConfig.label}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

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
  }

  // Teacher / Admin Marking Interface
  const currentSection = db.sections.find(s => s.id === selectedSectionId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Daily Class Attendance
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Mark daily attendance for enrolled students. Approved leaves are automatically integrated.
          </p>
        </div>

        {/* Section & Date Selector */}
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Class Section
            </label>
            <select
              value={selectedSectionId}
              onChange={e => setSelectedSectionId(e.target.value)}
              className="px-3 py-1.5 text-xs font-bold rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white"
            >
              {db.sections.map(sec => (
                <option key={sec.id} value={sec.id}>
                  Section {sec.name} ({sec.roomNumber})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              School Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 text-xs font-bold rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white"
            />
          </div>

          <div className="pt-4">
            <button
              type="button"
              onClick={handleExportRegisterPdf}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/60 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Export Attendance Register (PDF)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Holiday / Special event banner */}
      {calendarEvent && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl flex items-center gap-3 text-amber-900 dark:text-amber-200 text-xs">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <span className="font-bold">{calendarEvent.title}</span> — School is officially marked as{' '}
            {calendarEvent.type}. Verify if session is operational before submitting attendance.
          </div>
        </div>
      )}

      {/* Table Form for Marking */}
      <form onSubmit={handleSaveAttendance} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        {/* Actions bar */}
        <div className="p-4 bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs font-bold text-slate-700 dark:text-slate-200">
            {currentSection?.name} Enrollment: {sectionStudents.length} Students
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleMarkAllPresent}
              className="px-3 py-1.5 text-xs font-bold rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-purple-700 dark:text-purple-300 hover:bg-purple-50 transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark All Present
            </button>

            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              Save Attendance
            </button>
          </div>
        </div>

        {saveSuccess && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border-b border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Attendance for Section {currentSection?.name} on {selectedDate} saved successfully!
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Roll #</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Father Name</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Notes / Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {sectionStudents.map(std => {
                const currentStatus = attendanceDraft[std.id]?.status || 'present';
                const currentNote = attendanceDraft[std.id]?.notes || '';

                return (
                  <tr key={std.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                      {String(std.rollNumber).padStart(2, '0')}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      {std.fullName}
                      <span className="block text-[10px] text-slate-400 font-normal">{std.admissionNumber}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{std.fatherName}</td>
                    <td className="py-3 px-4">
                      {/* Segmented status buttons */}
                      <div className="flex items-center justify-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit mx-auto border border-slate-200/60 dark:border-slate-700">
                        <button
                          type="button"
                          onClick={() => handleStatusChange(std.id, 'present')}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                            currentStatus === 'present'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                          }`}
                        >
                          P
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(std.id, 'absent')}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                            currentStatus === 'absent'
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                          }`}
                        >
                          A
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(std.id, 'late')}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                            currentStatus === 'late'
                              ? 'bg-amber-600 text-white shadow-xs'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                          }`}
                        >
                          L
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(std.id, 'leave')}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                            currentStatus === 'leave'
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                          }`}
                        >
                          Leave
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="text"
                        value={currentNote}
                        onChange={e => handleNoteChange(std.id, e.target.value)}
                        placeholder="Optional note..."
                        className="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </form>

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
