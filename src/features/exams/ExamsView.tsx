/**
 * MERI SCHOOL DIARY — Exams, Tests & Results
 * Tracks test schedules, student marks entry, and academic performance.
 */

import React, { useState } from 'react';
import {
  Award,
  PlusCircle,
  Calendar,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  Save,
  X,
  TrendingUp,
  Download,
  Printer,
} from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { Test } from '../../types';
import {
  generateReportCardPdf,
  generateClassMarksheetPdf,
} from '../../utils/pdfGenerator';
import { PdfViewerModal } from '../../components/common/PdfViewerModal';

export const ExamsView: React.FC = () => {
  const {
    db,
    currentRole,
    activeChild,
    activeStudent,
    activeTeacher,
    createTest,
    saveTestResults,
  } = useSchool();

  const targetStudent = currentRole === 'parent' ? activeChild : activeStudent;
  const initialSectionId = targetStudent?.sectionId || 'sec-6a';
  const [selectedSectionId, setSelectedSectionId] = useState<string>(initialSectionId);

  // Modal: Create Test
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState('sub-math');
  const [testDate, setTestDate] = useState('2026-11-18');
  const [totalMarks, setTotalMarks] = useState('50');
  const [passingMarks, setPassingMarks] = useState('20');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState('');

  // Modal: Enter Marks for Test
  const [enteringMarksTest, setEnteringMarksTest] = useState<Test | null>(null);
  const [marksDraft, setMarksDraft] = useState<Record<string, { marks: number; remarks: string }>>({});
  const [marksError, setMarksError] = useState('');

  // Active PDF modal
  const [activePdf, setActivePdf] = useState<{
    title: string;
    blob: Blob;
    filename: string;
    subtitle?: string;
  } | null>(null);

  const sectionTests = db.tests.filter(t => t.sectionId === selectedSectionId);

  const handleDownloadReportCard = () => {
    if (!targetStudent) return;
    const sec = db.sections.find(s => s.id === targetStudent.sectionId) || {
      id: targetStudent.sectionId,
      name: '6-A',
      classId: 'cls-6',
      roomNumber: 'Room 101',
      classTeacherId: 'tch-abdul-qadir',
    };
    const cls = db.classes.find(c => c.id === sec.classId);
    const guardian = db.guardians.find(g => g.id === targetStudent.guardianId);
    const stuTests = db.tests.filter(t => t.sectionId === sec.id);

    const doc = generateReportCardPdf({
      school: db.school,
      student: targetStudent,
      guardian,
      section: sec,
      className: cls?.name || 'Class 6',
      examName: 'Mid-Term & Monthly Assessments 2026',
      termDate: 'November 2026',
      tests: stuTests,
      results: db.testResults.filter(r => r.studentId === targetStudent.id),
      subjects: db.subjects,
    });

    setActivePdf({
      title: `Official Report Card — ${targetStudent.fullName}`,
      blob: doc.output('blob'),
      filename: `GGHSS_Gizri_ReportCard_${targetStudent.fullName.replace(/\s+/g, '_')}_${sec.name}.pdf`,
      subtitle: `${db.school.name} · SEMIS ${db.school.sindhEmisCode}`,
    });
  };

  const handleExportClassMarksheet = () => {
    const sec = db.sections.find(s => s.id === selectedSectionId) || db.sections[0];
    if (!sec) return;
    const cls = db.classes.find(c => c.id === sec.classId);
    const stuList = db.students.filter(s => s.sectionId === sec.id && s.isActive);
    const testsForSec = db.tests.filter(t => t.sectionId === sec.id);

    const doc = generateClassMarksheetPdf({
      school: db.school,
      section: sec,
      className: cls?.name || 'Class 6',
      examTitle: 'Term Assessment Gazette',
      students: stuList,
      tests: testsForSec,
      results: db.testResults,
      subjects: db.subjects,
    });

    setActivePdf({
      title: `Class Broad Marksheet — Section ${sec.name}`,
      blob: doc.output('blob'),
      filename: `GGHSS_Gizri_Marksheet_${sec.name}_2026.pdf`,
      subtitle: `${db.school.name} · Official Examination Result Gazetteer`,
    });
  };

  const handleOpenMarksEntry = (test: Test) => {
    setEnteringMarksTest(test);
    const existingResults = db.testResults.filter(r => r.testId === test.id);
    const draft: Record<string, { marks: number; remarks: string }> = {};

    const sectionStudents = db.students.filter(s => s.sectionId === test.sectionId && s.isActive);
    sectionStudents.forEach(std => {
      const res = existingResults.find(r => r.studentId === std.id);
      draft[std.id] = {
        marks: res ? res.obtainedMarks : 0,
        remarks: res?.remarks || '',
      };
    });

    setMarksDraft(draft);
    setMarksError('');
  };

  const handleSaveMarks = (e: React.FormEvent) => {
    e.preventDefault();
    if (!enteringMarksTest) return;

    // Validate marks do not exceed totalMarks
    const maxMarks = enteringMarksTest.totalMarks;
    for (const [studentId, data] of Object.entries(marksDraft)) {
      if (data.marks < 0 || data.marks > maxMarks) {
        const student = db.students.find(s => s.id === studentId);
        setMarksError(
          `Marks for ${student?.fullName} cannot be negative or exceed total marks (${maxMarks}).`
        );
        return;
      }
    }

    const payload = Object.entries(marksDraft).map(([studentId, data]) => ({
      studentId,
      obtainedMarks: data.marks,
      remarks: data.remarks.trim() || undefined,
    }));

    saveTestResults(enteringMarksTest.id, payload);
    setEnteringMarksTest(null);
  };

  const handleCreateTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError('Please enter a test title.');
      return;
    }
    const total = Number(totalMarks);
    const pass = Number(passingMarks);
    if (isNaN(total) || total <= 0) {
      setFormError('Total marks must be a positive number.');
      return;
    }
    if (pass > total) {
      setFormError('Passing marks cannot exceed total marks.');
      return;
    }

    createTest({
      sectionId: selectedSectionId,
      subjectId,
      teacherId: activeTeacher ? activeTeacher.id : 'tch-abdul-qadir',
      title: title.trim(),
      date: testDate,
      totalMarks: total,
      passingMarks: pass,
      description: description.trim() || undefined,
    });

    setTitle('');
    setDescription('');
    setFormError('');
    setIsCreateOpen(false);
  };

  // Student / Parent specific view
  if (currentRole === 'student' || currentRole === 'parent') {
    if (!targetStudent) {
      return <div className="p-6 text-sm text-slate-500">No student profile selected.</div>;
    }

    const studentResults = db.testResults
      .filter(r => r.studentId === targetStudent.id)
      .map(r => {
        const test = db.tests.find(t => t.id === r.testId);
        const subject = test ? db.subjects.find(s => s.id === test.subjectId) : null;
        return { ...r, test, subject };
      })
      .filter(r => r.test !== undefined);

    const upcomingTests = db.tests
      .filter(t => t.sectionId === targetStudent.sectionId && t.date >= '2026-11-11')
      .sort((a, b) => a.date.localeCompare(b.date));

    // Calculate overall percentage
    let totalObtained = 0;
    let totalMax = 0;
    studentResults.forEach(r => {
      if (r.test) {
        totalObtained += r.obtainedMarks;
        totalMax += r.test.totalMarks;
      }
    });

    const overallPercentage = totalMax > 0 ? Math.round((totalObtained / totalMax) * 100) : 0;

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Tests &amp; Examination Results
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Academic assessments for {targetStudent.fullName} · Roll #{targetStudent.rollNumber} (
              {db.sections.find(s => s.id === targetStudent.sectionId)?.name})
            </p>
          </div>

          <button
            type="button"
            onClick={handleDownloadReportCard}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-xl transition-colors shadow-xs self-start sm:self-auto"
          >
            <Download className="w-4 h-4" />
            <span>Download Report Card (PDF)</span>
          </button>
        </div>

        {/* Academic Performance KPI */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Average Score</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-black text-purple-700 dark:text-purple-400 tabular-nums">
                {overallPercentage}%
              </span>
              <span className="text-xs text-slate-500 font-medium">({totalObtained} / {totalMax} Marks)</span>
            </div>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold block mt-1">
              Grade: {overallPercentage >= 80 ? 'A+ (Outstanding)' : overallPercentage >= 70 ? 'A (Excellent)' : 'B (Good)'}
            </span>
          </div>

          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Completed Assessments</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">
              {studentResults.length}
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5">All results published</span>
          </div>

          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Upcoming Tests</span>
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400 tabular-nums">
              {upcomingTests.length}
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5">Scheduled this month</span>
          </div>
        </div>

        {/* Upcoming Tests Schedule */}
        {upcomingTests.length > 0 && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Upcoming Test Schedule</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {upcomingTests.map(test => {
                const sub = db.subjects.find(s => s.id === test.subjectId);
                return (
                  <div
                    key={test.id}
                    className="p-3.5 rounded-xl border border-purple-100 dark:border-purple-900/50 bg-purple-50/40 dark:bg-purple-950/20 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-700 dark:text-purple-300">
                        {sub?.name}
                      </span>
                      <span className="text-[11px] font-mono font-bold text-slate-600 dark:text-slate-400">
                        {test.date}
                      </span>
                    </div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">{test.title}</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">
                      Total Marks: {test.totalMarks} · Passing: {test.passingMarks}
                    </div>
                    {test.description && (
                      <div className="text-[11px] text-slate-500 italic">{test.description}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Results History */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Published Results</h2>
          <div className="space-y-3">
            {studentResults.length === 0 ? (
              <div className="py-6 text-center text-slate-400 text-sm">
                No exam results published yet.
              </div>
            ) : (
              studentResults.map(res => {
                if (!res.test) return null;
                const isPassed = res.obtainedMarks >= res.test.passingMarks;
                const pct = Math.round((res.obtainedMarks / res.test.totalMarks) * 100);

                return (
                  <div
                    key={res.id}
                    className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2.5 py-0.5 rounded-lg">
                          {res.subject?.name}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">{res.test.date}</span>
                      </div>
                      <div className="text-sm font-extrabold text-slate-900 dark:text-white">
                        {res.test.title}
                      </div>
                      {res.remarks && (
                        <div className="text-xs text-slate-500 italic">Remarks: "{res.remarks}"</div>
                      )}
                    </div>

                    <div className="flex items-center gap-4 self-start sm:self-auto">
                      <div className="text-right">
                        <div className="text-lg font-black text-slate-900 dark:text-white tabular-nums">
                          {res.obtainedMarks} <span className="text-xs text-slate-400 font-normal">/ {res.test.totalMarks}</span>
                        </div>
                        <div className="text-[11px] font-bold text-slate-500">{pct}%</div>
                      </div>

                      <span
                        className={`px-3 py-1 text-xs font-bold rounded-lg border ${
                          isPassed
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
                            : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300'
                        }`}
                      >
                        {isPassed ? 'Passed' : 'Needs Improvement'}
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

  // Teacher / Admin View
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Tests &amp; Marks Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Schedule chapter assessments, enter obtained marks for enrolled students, and publish results.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedSectionId}
            onChange={e => setSelectedSectionId(e.target.value)}
            className="px-3 py-1.5 text-xs font-bold rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white"
          >
            {db.sections.map(sec => (
              <option key={sec.id} value={sec.id}>
                Section {sec.name}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleExportClassMarksheet}
            className="px-3.5 py-2 text-xs font-bold rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/60 transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>Class Marksheet (PDF)</span>
          </button>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            Schedule New Test
          </button>
        </div>
      </div>

      {/* Tests List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sectionTests.length === 0 ? (
          <div className="p-8 text-center col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 text-sm">
            No tests scheduled for this section yet.
          </div>
        ) : (
          sectionTests.map(test => {
            const subject = db.subjects.find(s => s.id === test.subjectId);
            const resultsCount = db.testResults.filter(r => r.testId === test.id).length;

            return (
              <div
                key={test.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 px-2.5 py-0.5 rounded-lg">
                    {subject?.name}
                  </span>
                  <span className="text-xs font-mono text-slate-500">{test.date}</span>
                </div>

                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">{test.title}</h3>

                <div className="text-xs text-slate-600 dark:text-slate-400">
                  Total Marks: <span className="font-bold">{test.totalMarks}</span> · Passing Marks: <span className="font-bold">{test.passingMarks}</span>
                </div>

                {test.description && (
                  <p className="text-xs text-slate-500 italic leading-relaxed">{test.description}</p>
                )}

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    {resultsCount > 0 ? `${resultsCount} students evaluated` : 'Marks not yet entered'}
                  </span>

                  <button
                    onClick={() => handleOpenMarksEntry(test)}
                    className="px-3 py-1.5 text-xs font-bold rounded-xl text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/50 border border-purple-200 dark:border-purple-800 transition-colors flex items-center gap-1.5"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    {resultsCount > 0 ? 'Edit Marks' : 'Enter Student Marks'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Schedule Test */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setIsCreateOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              Schedule Assessment / Test
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Create test schedule for Section {db.sections.find(s => s.id === selectedSectionId)?.name}
            </p>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateTest} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Subject *
                  </label>
                  <select
                    value={subjectId}
                    onChange={e => setSubjectId(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    {db.subjects.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Test Date *
                  </label>
                  <input
                    type="date"
                    value={testDate}
                    onChange={e => setTestDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Test Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Monthly Assessment — Chapter 4 Fractions"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Total Maximum Marks *
                  </label>
                  <input
                    type="number"
                    value={totalMarks}
                    onChange={e => setTotalMarks(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Passing Marks *
                  </label>
                  <input
                    type="number"
                    value={passingMarks}
                    onChange={e => setPassingMarks(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Topics / Description (Optional)
                </label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Chapters covered, question pattern, calculator policy..."
                  rows={2}
                  className="w-full p-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-xl shadow-xs transition-colors"
                >
                  Schedule Test
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Enter Marks for Test */}
      {enteringMarksTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
            <button
              onClick={() => setEnteringMarksTest(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              Enter Marks: {enteringMarksTest.title}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Maximum Marks: {enteringMarksTest.totalMarks} · Passing: {enteringMarksTest.passingMarks}
            </p>

            {marksError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold">
                {marksError}
              </div>
            )}

            <form onSubmit={handleSaveMarks} className="space-y-4 flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto pr-1">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800 sticky top-0 text-slate-500 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3">Roll #</th>
                      <th className="py-2.5 px-3">Student Name</th>
                      <th className="py-2.5 px-3">Marks (Max: {enteringMarksTest.totalMarks})</th>
                      <th className="py-2.5 px-3">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {db.students
                      .filter(s => s.sectionId === enteringMarksTest.sectionId && s.isActive)
                      .sort((a, b) => a.rollNumber - b.rollNumber)
                      .map(std => {
                        const cur = marksDraft[std.id] || { marks: 0, remarks: '' };
                        return (
                          <tr key={std.id}>
                            <td className="py-2.5 px-3 font-mono font-bold text-slate-700 dark:text-slate-300">
                              {String(std.rollNumber).padStart(2, '0')}
                            </td>
                            <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">
                              {std.fullName}
                            </td>
                            <td className="py-2.5 px-3">
                              <input
                                type="number"
                                min={0}
                                max={enteringMarksTest.totalMarks}
                                value={cur.marks}
                                onChange={e =>
                                  setMarksDraft(prev => ({
                                    ...prev,
                                    [std.id]: { ...cur, marks: Number(e.target.value) },
                                  }))
                                }
                                className="w-24 px-2 py-1 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                required
                              />
                            </td>
                            <td className="py-2.5 px-3">
                              <input
                                type="text"
                                value={cur.remarks}
                                onChange={e =>
                                  setMarksDraft(prev => ({
                                    ...prev,
                                    [std.id]: { ...cur, remarks: e.target.value },
                                  }))
                                }
                                placeholder="e.g. Good performance"
                                className="w-full px-2 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                              />
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 shrink-0">
                <button
                  type="button"
                  onClick={() => setEnteringMarksTest(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  Publish &amp; Save Results
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
