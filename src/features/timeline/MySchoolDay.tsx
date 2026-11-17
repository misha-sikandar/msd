/**
 * FLAGSHIP FEATURE: My School Day — Daily School Activity Timeline
 * Distinct from planned timetable: Records what actually happened period-by-period.
 */

import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  UserCheck,
  AlertCircle,
  Edit3,
  PlusCircle,
  FileCheck2,
  CalendarCheck2,
  BookOpen,
  Sparkles,
  X,
  History,
  Download,
} from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { TimelineUpdate } from '../../types';
import { generateMySchoolDayPdf } from '../../utils/pdfGenerator';
import { PdfViewerModal } from '../../components/common/PdfViewerModal';

export const MySchoolDay: React.FC = () => {
  const {
    db,
    currentRole,
    activeChild,
    activeStudent,
    activeTeacher,
    saveTimelineUpdate,
    saveEndOfDayReport,
  } = useSchool();

  // Determine active section based on role
  const defaultSectionId =
    currentRole === 'parent'
      ? activeChild?.sectionId || 'sec-6a'
      : currentRole === 'student'
      ? activeStudent?.sectionId || 'sec-6a'
      : 'sec-6a';

  const [selectedSectionId, setSelectedSectionId] = useState<string>(defaultSectionId);
  const [selectedDate, setSelectedDate] = useState<string>('2026-11-11'); // Defaults to current demo date

  // Modal state for editing/adding period update
  const [editingPeriod, setEditingPeriod] = useState<number | null>(null);
  const [existingUpdateToEdit, setExistingUpdateToEdit] = useState<TimelineUpdate | null>(null);
  const [modalSubjectId, setModalSubjectId] = useState<string>('sub-math');
  const [modalWhatWasTaught, setModalWhatWasTaught] = useState<string>('');
  const [modalNotes, setModalNotes] = useState<string>('');
  const [modalIsSubstitute, setModalIsSubstitute] = useState<boolean>(false);
  const [modalSubstituteTeacherId, setModalSubstituteTeacherId] = useState<string>('tch-zulfiqar-soomro');

  // End of Day report editing
  const [isEditingEod, setIsEditingEod] = useState(false);
  const [eodText, setEodText] = useState('');

  // PDF Preview state
  const [activePdf, setActivePdf] = useState<{
    title: string;
    blob: Blob;
    filename: string;
    subtitle?: string;
  } | null>(null);

  const currentSection = db.sections.find(s => s.id === selectedSectionId);

  const handleExportDailyDiaryPdf = () => {
    const sec = currentSection || db.sections[0];
    if (!sec) return;
    const cls = db.classes.find(c => c.id === sec.classId);
    const updates = db.timelineUpdates.filter(
      u => u.sectionId === sec.id && u.date === selectedDate
    );

    const doc = generateMySchoolDayPdf({
      school: db.school,
      date: selectedDate,
      section: sec,
      className: cls?.name || 'Class 6',
      timelineUpdates: updates,
      teachers: db.teachers,
      subjects: db.subjects,
    });

    setActivePdf({
      title: `My School Day Diary — Section ${sec.name} (${selectedDate})`,
      blob: doc.output('blob'),
      filename: `GGHSS_Gizri_MySchoolDay_${sec.name}_${selectedDate}.pdf`,
      subtitle: `${db.school.name} · Daily Syllabus & Period Activity Log`,
    });
  };

  // Check holiday or calendar event for this date
  const calendarEvent = db.calendarEvents.find(
    e => selectedDate >= e.startDate && selectedDate <= e.endDate
  );

  const isSunday = new Date(selectedDate).getDay() === 0;

  // Periods list (1 to 6)
  const periodSchedule = [
    { period: 1, start: '08:00', end: '08:40', label: 'Period 1' },
    { period: 2, start: '08:40', end: '09:20', label: 'Period 2' },
    { period: 3, start: '09:20', end: '10:00', label: 'Period 3' },
    { period: 'recess', start: '10:00', end: '10:20', label: 'Recess & Assembly Break' },
    { period: 4, start: '10:20', end: '11:00', label: 'Period 4' },
    { period: 5, start: '11:00', end: '11:40', label: 'Period 5' },
    { period: 6, start: '11:40', end: '12:20', label: 'Period 6' },
  ];

  // Helper date navigation
  const shiftDate = (days: number) => {
    const cur = new Date(selectedDate);
    cur.setDate(cur.getDate() + days);
    setSelectedDate(cur.toISOString().split('T')[0]);
  };

  const handleOpenEditModal = (periodNum: number, existing?: TimelineUpdate) => {
    setEditingPeriod(periodNum);
    if (existing) {
      setExistingUpdateToEdit(existing);
      setModalSubjectId(existing.subjectId);
      setModalWhatWasTaught(existing.whatWasTaught);
      setModalNotes(existing.teacherNotes || '');
      setModalIsSubstitute(existing.isSubstitute);
      setModalSubstituteTeacherId(existing.substituteTeacherId || 'tch-zulfiqar-soomro');
    } else {
      // Find planned subject for this period from timetable
      const plannedSlot = db.timetableSlots.find(
        t => t.sectionId === selectedSectionId && t.periodNumber === periodNum
      );
      setExistingUpdateToEdit(null);
      setModalSubjectId(plannedSlot?.subjectId || 'sub-math');
      setModalWhatWasTaught('');
      setModalNotes('');
      setModalIsSubstitute(false);
      setModalSubstituteTeacherId('tch-zulfiqar-soomro');
    }
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPeriod || !modalWhatWasTaught.trim()) return;

    const periodInfo = periodSchedule.find(p => p.period === editingPeriod);

    saveTimelineUpdate({
      id: existingUpdateToEdit?.id,
      date: selectedDate,
      sectionId: selectedSectionId,
      periodNumber: editingPeriod,
      startTime: periodInfo ? periodInfo.start : '08:00',
      endTime: periodInfo ? periodInfo.end : '08:40',
      subjectId: modalSubjectId,
      teacherId: activeTeacher ? activeTeacher.id : 'tch-abdul-qadir',
      isSubstitute: modalIsSubstitute,
      substituteTeacherId: modalIsSubstitute ? modalSubstituteTeacherId : undefined,
      whatWasTaught: modalWhatWasTaught.trim(),
      teacherNotes: modalNotes.trim() ? modalNotes.trim() : undefined,
    });

    setEditingPeriod(null);
  };

  const handleSaveEodReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eodText.trim()) return;

    saveEndOfDayReport({
      date: selectedDate,
      sectionId: selectedSectionId,
      summaryText: eodText.trim(),
      reportedById: activeTeacher ? activeTeacher.id : 'tch-abdul-qadir',
    });
    setIsEditingEod(false);
  };

  // End of day report for this section and date
  const eodReport = db.endOfDayReports.find(
    r => r.sectionId === selectedSectionId && r.date === selectedDate
  );

  return (
    <div className="space-y-6">
      {/* Header with Title and Distinction Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              My School Day
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300">
              Daily Activity
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Period-by-period verified record of what actually happened in class — distinct from planned timetable.
          </p>
        </div>

        {/* Section Selector & PDF Export */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportDailyDiaryPdf}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/60 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Daily Diary (PDF)</span>
          </button>

          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Class:</label>
          <select
            value={selectedSectionId}
            onChange={e => setSelectedSectionId(e.target.value)}
            className="px-3 py-1.5 text-xs font-bold rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-600"
          >
            {db.sections.map(sec => (
              <option key={sec.id} value={sec.id}>
                Section {sec.name} ({sec.roomNumber})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Date Navigation Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => shiftDate(-1)}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
            title="Previous Day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setSelectedDate('2026-11-11')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              selectedDate === '2026-11-11'
                ? 'bg-purple-700 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            Today (Nov 11)
          </button>
          <button
            onClick={() => setSelectedDate('2026-11-10')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              selectedDate === '2026-11-10'
                ? 'bg-purple-700 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            Yesterday
          </button>
          <button
            onClick={() => shiftDate(1)}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
            title="Next Day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="px-3 py-1 text-xs font-semibold rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white"
          />
        </div>
      </div>

      {/* Special Day Banners (Holidays, Sunday, Half-days) */}
      {calendarEvent && (
        <div
          className={`p-4 rounded-2xl border flex items-start gap-3 ${
            calendarEvent.type === 'holiday'
              ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200'
              : 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800/60 text-purple-900 dark:text-purple-200'
          }`}
        >
          <CalendarCheck2 className="w-5 h-5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
          <div>
            <div className="font-bold text-sm">{calendarEvent.title}</div>
            <div className="text-xs mt-0.5 opacity-90">{calendarEvent.description}</div>
            <div className="text-[11px] font-mono mt-1 font-semibold uppercase tracking-wider">
              {calendarEvent.type === 'holiday' ? 'Official Public Holiday' : 'Scheduled School Event'}
            </div>
          </div>
        </div>
      )}

      {isSunday && !calendarEvent && (
        <div className="p-4 rounded-2xl border bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-3">
          <CalendarIcon className="w-5 h-5 text-slate-400" />
          <div>
            <div className="font-bold text-sm">Sunday — Weekly Recess</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Regular school session was not in progress.</div>
          </div>
        </div>
      )}

      {/* Vertical Timeline Structure */}
      <div className="relative pl-6 sm:pl-8 space-y-6 before:content-[''] before:absolute before:left-2.5 sm:before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-purple-200 dark:before:bg-purple-950">
        {periodSchedule.map((p, idx) => {
          if (p.period === 'recess') {
            return (
              <div key="recess" className="relative group">
                <div className="absolute -left-6 sm:-left-8 top-1.5 w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-white dark:border-slate-900 flex items-center justify-center text-[10px] text-slate-500 font-bold" />
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 rounded-xl flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-2 font-semibold">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>10:00 – 10:20 | Recess &amp; Morning Refreshment</span>
                  </div>
                  <span className="text-[11px]">Playground &amp; Canteen</span>
                </div>
              </div>
            );
          }

          const periodNum = p.period as number;
          // Find actual timeline update
          const update = db.timelineUpdates.find(
            u => u.sectionId === selectedSectionId && u.date === selectedDate && u.periodNumber === periodNum
          );

          // Find planned timetable slot to compare
          const plannedSlot = db.timetableSlots.find(
            t => t.sectionId === selectedSectionId && t.periodNumber === periodNum
          );
          const plannedSubject = plannedSlot ? db.subjects.find(s => s.id === plannedSlot.subjectId) : null;
          const plannedTeacher = plannedSlot ? db.teachers.find(t => t.id === plannedSlot.teacherId) : null;

          const updateSubject = update ? db.subjects.find(s => s.id === update.subjectId) : null;
          const updateTeacher = update ? db.teachers.find(t => t.id === update.teacherId) : null;
          const substituteTeacher = update?.substituteTeacherId
            ? db.teachers.find(t => t.id === update.substituteTeacherId)
            : null;

          const isRecorded = Boolean(update);

          return (
            <div key={periodNum} className="relative group">
              {/* Timeline Node Icon */}
              <div
                className={`absolute -left-6 sm:-left-8 top-2 w-5 h-5 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center text-[10px] font-bold ${
                  isRecorded
                    ? update?.isSubstitute
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'bg-purple-700 text-white shadow-xs'
                    : 'bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                {periodNum}
              </div>

              {/* Period Card */}
              <div
                className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                  isRecorded
                    ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs'
                    : 'bg-slate-50/80 dark:bg-slate-900/40 border-dashed border-slate-300 dark:border-slate-800'
                }`}
              >
                {/* Period Time & Subject Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 px-2 py-0.5 rounded-md">
                      {p.start} – {p.end}
                    </span>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Period {periodNum}
                    </span>

                    {/* Planned Subject Reference */}
                    {plannedSubject && (
                      <span className="text-xs text-slate-400 dark:text-slate-500 font-medium hidden sm:inline">
                        (Planned: {plannedSubject.name})
                      </span>
                    )}
                  </div>

                  {/* Badges for Substitute / Backdated / Edit */}
                  <div className="flex items-center gap-2">
                    {update?.isSubstitute && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 flex items-center gap-1">
                        <UserCheck className="w-3 h-3" />
                        Substitute Teacher
                      </span>
                    )}

                    {update?.isBackdated && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center gap-1">
                        <History className="w-3 h-3" />
                        Backdated Entry
                      </span>
                    )}

                    {(currentRole === 'teacher' || currentRole === 'admin') && (
                      <button
                        onClick={() => handleOpenEditModal(periodNum, update)}
                        className="text-xs font-semibold text-purple-700 dark:text-purple-300 hover:underline flex items-center gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        {isRecorded ? 'Edit Update' : 'Record What Happened'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Content body */}
                {isRecorded && update ? (
                  <div className="space-y-3">
                    <div className="flex items-baseline justify-between gap-4">
                      <div className="text-base font-extrabold text-slate-900 dark:text-white">
                        {updateSubject?.name}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {update.isSubstitute ? (
                          <span className="text-amber-700 dark:text-amber-400 font-semibold">
                            Conducted by {substituteTeacher?.fullName} (Substituted for {updateTeacher?.fullName})
                          </span>
                        ) : (
                          <span>Conducted by {updateTeacher?.fullName || 'Assigned Teacher'}</span>
                        )}
                      </div>
                    </div>

                    <div className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-normal bg-slate-50/70 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                      <span className="font-bold text-purple-800 dark:text-purple-300 block text-xs mb-1 uppercase tracking-wide">
                        What was taught &amp; covered:
                      </span>
                      {update.whatWasTaught}
                    </div>

                    {update.teacherNotes && (
                      <div className="text-xs text-slate-600 dark:text-slate-300 italic pl-3 border-l-2 border-purple-400 dark:border-purple-600">
                        <span className="font-semibold not-italic text-slate-700 dark:text-slate-200">
                          Teacher's note:{' '}
                        </span>
                        {update.teacherNotes}
                      </div>
                    )}

                    {/* Edit timestamp verification */}
                    <div className="text-[10px] text-slate-400 pt-1 flex items-center justify-between">
                      <span>
                        Recorded: {new Date(update.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {update.updatedAt !== update.createdAt && ' · Edited'}
                      </span>
                      {update.relatedHomeworkId && (
                        <span className="text-purple-700 dark:text-purple-400 font-medium flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          Homework Assigned
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Missing Record Notice */
                  <div className="py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" />
                      <div>
                        <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          No update recorded yet
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Teacher has not yet published the daily log for this period.
                        </div>
                      </div>
                    </div>

                    {(currentRole === 'teacher' || currentRole === 'admin') && (
                      <button
                        onClick={() => handleOpenEditModal(periodNum)}
                        className="px-3 py-1.5 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-xl transition-colors flex items-center gap-1 self-start sm:self-auto"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        Log Period Activity
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* End of Day Report Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-50 dark:bg-purple-950/50 rounded-xl text-purple-700 dark:text-purple-300">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">End of Day Daily Report</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Official closing summary from the Class Teacher
              </p>
            </div>
          </div>

          {(currentRole === 'teacher' || currentRole === 'admin') && (
            <button
              onClick={() => {
                setEodText(eodReport?.summaryText || '');
                setIsEditingEod(true);
              }}
              className="px-3 py-1.5 text-xs font-bold text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/50 rounded-xl transition-colors flex items-center gap-1"
            >
              <Edit3 className="w-3.5 h-3.5" />
              {eodReport ? 'Edit Summary' : 'Write Daily Report'}
            </button>
          )}
        </div>

        {isEditingEod ? (
          <form onSubmit={handleSaveEodReport} className="space-y-3 pt-2">
            <textarea
              value={eodText}
              onChange={e => setEodText(e.target.value)}
              placeholder="Summarize the overall class discipline, student reception, special announcements, or remarks for parents..."
              rows={3}
              className="w-full p-3 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-600"
              required
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditingEod(false)}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-lg transition-colors"
              >
                Save Daily Report
              </button>
            </div>
          </form>
        ) : eodReport ? (
          <div className="space-y-2">
            <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-normal">
              "{eodReport.summaryText}"
            </p>
            <div className="text-[11px] text-slate-400 flex items-center gap-2">
              <span>Reported by {db.teachers.find(t => t.id === eodReport.reportedById)?.fullName}</span>
              <span>·</span>
              <span>Submitted at {new Date(eodReport.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        ) : (
          <div className="text-xs text-slate-400 py-2 italic">
            No end-of-day summary has been published for this date yet.
          </div>
        )}
      </div>

      {/* Modal for Recording / Editing Period Update */}
      {editingPeriod !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setEditingPeriod(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 rounded-xl">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Period {editingPeriod} Daily Log
                </h3>
                <p className="text-xs text-slate-500">
                  {currentSection?.name} · {selectedDate}
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Subject Conducted
                </label>
                <select
                  value={modalSubjectId}
                  onChange={e => setModalSubjectId(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  {db.subjects.map(sub => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name} ({sub.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  What Was Taught / Covered *
                </label>
                <textarea
                  value={modalWhatWasTaught}
                  onChange={e => setModalWhatWasTaught(e.target.value)}
                  placeholder="e.g. Chapter 4 Fractions, Exercise 4.2 questions 1-5 on blackboard..."
                  rows={3}
                  className="w-full p-3 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Teacher's Observation or Note (Optional)
                </label>
                <input
                  type="text"
                  value={modalNotes}
                  onChange={e => setModalNotes(e.target.value)}
                  placeholder="e.g. Dictation announced for Friday, classwork checked."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              {/* Substitute Teacher Option */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={modalIsSubstitute}
                    onChange={e => setModalIsSubstitute(e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded-sm border-slate-300"
                  />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Substitute Teacher conducted this period
                  </span>
                </label>

                {modalIsSubstitute && (
                  <div className="mt-2 pl-6">
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Select Substitute Teacher
                    </label>
                    <select
                      value={modalSubstituteTeacherId}
                      onChange={e => setModalSubstituteTeacherId(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      {db.teachers.filter(t => t.isActive).map(t => (
                        <option key={t.id} value={t.id}>
                          {t.fullName} ({t.designation})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingPeriod(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-xl shadow-xs transition-colors"
                >
                  Save Timeline Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
