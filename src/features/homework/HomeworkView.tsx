/**
 * MERI SCHOOL DIARY — Homework & Classwork Management
 * Workflow: Pending → Submitted (optional student note) → Checked (teacher feedback)
 */

import React, { useState } from 'react';
import {
  BookMarked,
  PlusCircle,
  Clock,
  CheckCircle2,
  Calendar,
  Send,
  CheckCheck,
  X,
  FileCheck,
  AlertTriangle,
  FileText,
  Download,
  Eye,
  Paperclip,
} from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { HomeworkItem, HomeworkSubmission } from '../../types';
import {
  generateHomeworkBriefPdf,
  generateSubmissionSlipPdf,
} from '../../utils/pdfGenerator';
import { PdfViewerModal } from '../../components/common/PdfViewerModal';
import { PdfUploadCard, UploadedPdfInfo } from '../../components/common/PdfUploadCard';

export const HomeworkView: React.FC = () => {
  const {
    db,
    currentRole,
    activeChild,
    activeStudent,
    activeTeacher,
    createHomework,
    submitHomework,
    checkHomework,
  } = useSchool();

  // Selected section for viewing / creating
  const targetStudent = currentRole === 'parent' ? activeChild : activeStudent;
  const initialSectionId = targetStudent?.sectionId || 'sec-6a';
  const [selectedSectionId, setSelectedSectionId] = useState<string>(initialSectionId);

  // Filter state
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'submitted' | 'checked'>('all');

  // Modal for Teacher Creating Homework
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState('sub-math');
  const [instructions, setInstructions] = useState('');
  const [assignedDate, setAssignedDate] = useState('2026-11-11');
  const [dueDate, setDueDate] = useState('2026-11-12');
  const [isClasswork, setIsClasswork] = useState(false);
  const [uploadedTeacherPdf, setUploadedTeacherPdf] = useState<UploadedPdfInfo | null>(null);
  const [formError, setFormError] = useState('');

  // Modal for Student Submitting Homework
  const [submittingHw, setSubmittingHw] = useState<HomeworkItem | null>(null);
  const [studentNote, setStudentNote] = useState('');
  const [uploadedSubmissionPdf, setUploadedSubmissionPdf] = useState<UploadedPdfInfo | null>(null);

  // Modal for Teacher Checking Homework
  const [checkingSubmissionId, setCheckingSubmissionId] = useState<string | null>(null);
  const [teacherFeedback, setTeacherFeedback] = useState('');

  // Active PDF Viewer modal state
  const [activePdfModal, setActivePdfModal] = useState<{
    title: string;
    blob?: Blob | null;
    dataUrl?: string | null;
    filename: string;
    subtitle?: string;
  } | null>(null);

  // List of homework items for selected section
  const homeworkList = db.homeworkItems.filter(h => h.sectionId === selectedSectionId);

  const handleDownloadHomeworkBrief = (hw: HomeworkItem) => {
    const subject = db.subjects.find(s => s.id === hw.subjectId) || { id: hw.subjectId, name: 'Subject', code: 'SUB', isCore: true };
    const teacher = db.teachers.find(t => t.id === hw.teacherId) || { id: hw.teacherId, fullName: 'Subject Teacher', designation: 'Instructor', phone: '', cnic: '', qualification: '', joiningDate: '', isActive: true };
    const section = db.sections.find(s => s.id === hw.sectionId) || { id: hw.sectionId, name: '6-A', classId: 'cls-6', roomNumber: 'Room 101', classTeacherId: 'tch-abdul-qadir' };
    const schoolClass = db.classes.find(c => c.id === section.classId);

    const doc = generateHomeworkBriefPdf({
      school: db.school,
      homework: hw,
      subject,
      teacher,
      className: schoolClass?.name || 'Class 6',
      section,
    });

    setActivePdfModal({
      title: `Assignment Brief: ${hw.title}`,
      blob: doc.output('blob'),
      filename: `GGHSS_Gizri_HW_${section.name}_${subject.name.replace(/\s+/g, '_')}.pdf`,
      subtitle: `${db.school.name} · Official Homework Instructions`,
    });
  };

  const handleViewSubmissionPdf = (sub: HomeworkSubmission, hw: HomeworkItem) => {
    const student = db.students.find(s => s.id === sub.studentId);
    const subject = db.subjects.find(s => s.id === hw.subjectId) || { id: hw.subjectId, name: 'Subject', code: 'SUB', isCore: true };
    const teacher = db.teachers.find(t => t.id === hw.teacherId) || { id: hw.teacherId, fullName: 'Subject Teacher', designation: 'Instructor', phone: '', cnic: '', qualification: '', joiningDate: '', isActive: true };
    const section = db.sections.find(s => s.id === hw.sectionId) || { id: hw.sectionId, name: '6-A', classId: 'cls-6', roomNumber: 'Room 101', classTeacherId: 'tch-abdul-qadir' };
    const schoolClass = db.classes.find(c => c.id === section.classId);

    if (sub.pdfDataUrl) {
      setActivePdfModal({
        title: `Submission: ${sub.pdfFileName || 'Homework Document'}`,
        dataUrl: sub.pdfDataUrl,
        filename: sub.pdfFileName || `GGHSS_Gizri_Submission_${student?.fullName || 'Student'}.pdf`,
        subtitle: `Submitted by ${student?.fullName} (Roll #${student?.rollNumber}) · ${sub.pdfFileSize || 'PDF'}`,
      });
    } else {
      const doc = generateSubmissionSlipPdf({
        school: db.school,
        homework: hw,
        submission: sub,
        student: student || { id: sub.studentId, fullName: 'Student', fatherName: 'Father', admissionNumber: 'GR-101', rollNumber: 1, gender: 'Female', dateOfBirth: '', sectionId: hw.sectionId, guardianId: '', isActive: true, emergencyContact: '' },
        subject,
        teacher,
        className: schoolClass?.name || 'Class 6',
        section,
      });

      setActivePdfModal({
        title: `Submission Slip: ${student?.fullName}`,
        blob: doc.output('blob'),
        filename: sub.pdfFileName || `GGHSS_Gizri_Submission_Slip_${student?.rollNumber || 1}.pdf`,
        subtitle: `${db.school.name} · Verified Submission Slip`,
      });
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !instructions.trim()) {
      setFormError('Please enter both title and instructions.');
      return;
    }
    if (dueDate < assignedDate) {
      setFormError('Due date cannot be before assigned date.');
      return;
    }

    createHomework({
      sectionId: selectedSectionId,
      subjectId,
      teacherId: activeTeacher ? activeTeacher.id : 'tch-abdul-qadir',
      title: title.trim(),
      instructions: instructions.trim(),
      assignedDate,
      dueDate,
      isClasswork,
      pdfAttachmentName: uploadedTeacherPdf?.fileName,
      pdfAttachmentSize: uploadedTeacherPdf?.fileSize,
      pdfAttachmentData: uploadedTeacherPdf?.dataUrl,
    });

    setTitle('');
    setInstructions('');
    setUploadedTeacherPdf(null);
    setFormError('');
    setIsCreateOpen(false);
  };

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!submittingHw || !targetStudent) return;
    submitHomework(
      submittingHw.id,
      targetStudent.id,
      studentNote.trim() || undefined,
      uploadedSubmissionPdf
        ? {
            pdfFileName: uploadedSubmissionPdf.fileName,
            pdfFileSize: uploadedSubmissionPdf.fileSize,
            pdfDataUrl: uploadedSubmissionPdf.dataUrl,
          }
        : undefined
    );
    setSubmittingHw(null);
    setStudentNote('');
    setUploadedSubmissionPdf(null);
  };

  const handleTeacherCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkingSubmissionId || !teacherFeedback.trim()) return;
    checkHomework(checkingSubmissionId, teacherFeedback.trim());
    setCheckingSubmissionId(null);
    setTeacherFeedback('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Homework &amp; Classwork Diary
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track daily academic assignments, student submissions, and teacher feedback.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Section selector for teachers/admin */}
          {(currentRole === 'teacher' || currentRole === 'admin') && (
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
          )}

          {(currentRole === 'teacher' || currentRole === 'admin') && (
            <button
              onClick={() => setIsCreateOpen(true)}
              className="px-4 py-2 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              Assign Homework
            </button>
          )}
        </div>
      </div>

      {/* Homework Cards List */}
      <div className="space-y-4">
        {homeworkList.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 text-sm">
            No homework items assigned in this section yet.
          </div>
        ) : (
          homeworkList.map(hw => {
            const subject = db.subjects.find(s => s.id === hw.subjectId);
            const teacher = db.teachers.find(t => t.id === hw.teacherId);

            // Submissions for this homework
            const submissions = db.homeworkSubmissions.filter(s => s.homeworkId === hw.id);

            // If Parent or Student, get this specific student's submission
            const studentSub = targetStudent
              ? submissions.find(s => s.studentId === targetStudent.id)
              : null;

            const isSubmitted = studentSub && studentSub.status !== 'pending';
            const isChecked = studentSub?.status === 'checked';

            return (
              <div
                key={hw.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4 hover:border-purple-200 dark:hover:border-purple-800/60 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 px-2.5 py-0.5 rounded-lg">
                        {subject?.name}
                      </span>
                      {hw.isClasswork && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          Classwork
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white pt-1">
                      {hw.title}
                    </h3>
                    <div className="text-xs text-slate-400">
                      Assigned by {teacher?.fullName} on {hw.assignedDate}
                    </div>
                  </div>

                  {/* Due Date & Assignment PDF Brief */}
                  <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleDownloadHomeworkBrief(hw)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-xs font-bold text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/60 transition-colors shadow-2xs"
                      title="Download Official Assignment Brief PDF"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Assignment Brief PDF</span>
                    </button>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <Clock className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                      <span>Due: {hw.dueDate}</span>
                    </div>
                  </div>
                </div>

                {/* Instructions */}
                <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal bg-slate-50/70 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
                  {hw.instructions}
                </div>

                {/* Teacher Attached Worksheet if present */}
                {hw.pdfAttachmentName && (
                  <div className="p-3 bg-purple-50/50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-800/40 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Paperclip className="w-4 h-4 text-purple-700 dark:text-purple-400 shrink-0" />
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{hw.pdfAttachmentName}</span>
                        {hw.pdfAttachmentSize && <span className="text-slate-400 ml-2">({hw.pdfAttachmentSize})</span>}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDownloadHomeworkBrief(hw)}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700 hover:bg-purple-50 transition-colors flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Worksheet</span>
                    </button>
                  </div>
                )}

                {/* Student / Parent View: Submission and checking details */}
                {(currentRole === 'student' || currentRole === 'parent') && (
                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 flex-wrap">
                      {isChecked ? (
                        <span className="px-3 py-1 text-xs font-bold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 flex items-center gap-1.5">
                          <CheckCheck className="w-3.5 h-3.5" />
                          Checked &amp; Evaluated
                        </span>
                      ) : isSubmitted ? (
                        <span className="px-3 py-1 text-xs font-bold rounded-lg bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Submitted — Pending Teacher Check
                        </span>
                      ) : (
                        <span className="px-3 py-1 text-xs font-bold rounded-lg bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          Pending Submission
                        </span>
                      )}

                      {studentSub?.isLate && (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
                          Submitted Late
                        </span>
                      )}

                      {studentSub?.pdfFileName && (
                        <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5" />
                          {studentSub.pdfFileName} ({studentSub.pdfFileSize || 'PDF'})
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {isSubmitted && studentSub && (
                        <button
                          type="button"
                          onClick={() => handleViewSubmissionPdf(studentSub, hw)}
                          className="px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5"
                          title="View / Download Submitted Work"
                        >
                          <Eye className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                          <span>View My Submission</span>
                        </button>
                      )}

                      {/* Submit button for Student role */}
                      {currentRole === 'student' && !isSubmitted && (
                        <button
                          onClick={() => {
                            setSubmittingHw(hw);
                            setStudentNote('');
                            setUploadedSubmissionPdf(null);
                          }}
                          className="px-4 py-1.5 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
                        >
                          <Send className="w-3.5 h-3.5" />
                          Submit Assignment (PDF/Text)
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Feedback Display if checked */}
                {studentSub?.teacherFeedback && (
                  <div className="p-3 bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 rounded-xl text-xs space-y-1">
                    <span className="font-bold text-purple-900 dark:text-purple-300 block">
                      Teacher's Feedback:
                    </span>
                    <p className="text-slate-700 dark:text-slate-300 font-normal">
                      "{studentSub.teacherFeedback}"
                    </p>
                  </div>
                )}

                {/* Teacher View: Student Submissions Review List */}
                {(currentRole === 'teacher' || currentRole === 'admin') && (
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                      <span>Student Submissions ({submissions.length} received)</span>
                      <span className="text-[11px] text-slate-400">
                        {submissions.filter(s => s.status === 'checked').length} Checked
                      </span>
                    </div>

                    {submissions.length === 0 ? (
                      <div className="text-xs text-slate-400 py-1 italic">
                        No submissions received from students yet.
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {submissions.map(sub => {
                          const student = db.students.find(s => s.id === sub.studentId);
                          return (
                            <div
                              key={sub.id}
                              className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                            >
                              <div>
                                <div className="text-xs font-bold text-slate-900 dark:text-white">
                                  {student?.fullName} (Roll #{student?.rollNumber})
                                </div>
                                {sub.studentNote && (
                                  <div className="text-[11px] text-slate-500 italic mt-0.5">
                                    Student note: "{sub.studentNote}"
                                  </div>
                                )}
                                {sub.teacherFeedback && (
                                  <div className="text-[11px] text-purple-700 dark:text-purple-300 font-medium mt-0.5">
                                    Feedback: "{sub.teacherFeedback}"
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                                <button
                                  type="button"
                                  onClick={() => handleViewSubmissionPdf(sub, hw)}
                                  className="px-2.5 py-1 text-[11px] font-bold rounded-lg text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors flex items-center gap-1"
                                  title="View / Download Student Submission Document"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>{sub.pdfFileName ? 'View PDF' : 'Submission Slip'}</span>
                                </button>

                                {sub.status === 'checked' ? (
                                  <span className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                                    Checked
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => {
                                      setCheckingSubmissionId(sub.id);
                                      setTeacherFeedback('Checked. Well done!');
                                    }}
                                    className="px-3 py-1 text-[11px] font-bold rounded-lg text-white bg-purple-700 hover:bg-purple-800 transition-colors"
                                  >
                                    Check &amp; Grade
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Teacher Creating Homework */}
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
              Assign Homework / Classwork
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter assignment details for Section {db.sections.find(s => s.id === selectedSectionId)?.name}
            </p>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4">
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
                    Type
                  </label>
                  <select
                    value={isClasswork ? 'classwork' : 'homework'}
                    onChange={e => setIsClasswork(e.target.value === 'classwork')}
                    className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="homework">Homework</option>
                    <option value="classwork">Classwork Task</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Assignment Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Exercise 4.2: Questions 6 to 12"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Instructions &amp; Requirements *
                </label>
                <textarea
                  value={instructions}
                  onChange={e => setInstructions(e.target.value)}
                  placeholder="Detailed instructions for students, register guidelines, due dates..."
                  rows={3}
                  className="w-full p-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Assigned Date
                  </label>
                  <input
                    type="date"
                    value={assignedDate}
                    onChange={e => setAssignedDate(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Due Date *
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <PdfUploadCard
                  label="Attach Question Worksheet (Optional PDF)"
                  description="Upload printable assignment questions or exercise guide (up to 5 MB)"
                  value={uploadedTeacherPdf}
                  onChange={setUploadedTeacherPdf}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-xl shadow-xs transition-colors"
                >
                  Publish Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Student Submitting Homework */}
      {submittingHw && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setSubmittingHw(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              Submit Homework
            </h3>
            <p className="text-xs text-slate-500 mb-4">{submittingHw.title}</p>

            <form onSubmit={handleStudentSubmit} className="space-y-4">
              <div>
                <PdfUploadCard
                  label="Attach Scanned Homework PDF (Recommended)"
                  description="Upload your handwritten homework pages scan or worksheet (up to 5 MB)"
                  value={uploadedSubmissionPdf}
                  onChange={setUploadedSubmissionPdf}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Submission Notes / Text Response
                </label>
                <textarea
                  value={studentNote}
                  onChange={e => setStudentNote(e.target.value)}
                  placeholder="e.g. Sir, I have completed all questions and attached the PDF scan."
                  rows={2}
                  className="w-full p-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSubmittingHw(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-xl shadow-xs transition-colors"
                >
                  Confirm Submission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Teacher Checking Submission */}
      {checkingSubmissionId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setCheckingSubmissionId(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              Check Submission &amp; Provide Feedback
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Mark this student's submission as checked and write teacher remarks.
            </p>

            <form onSubmit={handleTeacherCheck} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Teacher's Feedback &amp; Grade Remarks *
                </label>
                <textarea
                  value={teacherFeedback}
                  onChange={e => setTeacherFeedback(e.target.value)}
                  placeholder="e.g. Excellent work, neat diagrams. Grade: A+"
                  rows={3}
                  className="w-full p-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCheckingSubmissionId(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-xl shadow-xs transition-colors"
                >
                  Save Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PDF Viewer & Print Modal */}
      {activePdfModal && (
        <PdfViewerModal
          isOpen={true}
          onClose={() => setActivePdfModal(null)}
          title={activePdfModal.title}
          pdfBlob={activePdfModal.blob}
          pdfDataUrl={activePdfModal.dataUrl}
          filename={activePdfModal.filename}
          subtitle={activePdfModal.subtitle}
        />
      )}
    </div>
  );
};
