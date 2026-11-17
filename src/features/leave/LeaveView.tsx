/**
 * MERI SCHOOL DIARY — Leave Management
 * Parent submits leave for selected child; Teacher reviews, approves, or rejects.
 * Approved leave automatically updates student attendance records.
 */

import React, { useState } from 'react';
import {
  FileText,
  PlusCircle,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  X,
  MessageSquare,
} from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';

export const LeaveView: React.FC = () => {
  const {
    db,
    currentRole,
    activeChild,
    submitLeaveApplication,
    reviewLeaveApplication,
  } = useSchool();

  // Modal: Parent Submitting Leave
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [startDate, setStartDate] = useState('2026-11-12');
  const [endDate, setEndDate] = useState('2026-11-12');
  const [reason, setReason] = useState('');
  const [formError, setFormError] = useState('');

  // Modal: Teacher Reviewing Leave
  const [reviewingAppId, setReviewingAppId] = useState<string | null>(null);
  const [reviewFeedback, setReviewFeedback] = useState('');

  const handleParentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChild) return;
    if (!reason.trim()) {
      setFormError('Please state the reason for leave.');
      return;
    }
    if (endDate < startDate) {
      setFormError('End date cannot be earlier than start date.');
      return;
    }

    submitLeaveApplication(activeChild.id, startDate, endDate, reason.trim());
    setReason('');
    setFormError('');
    setIsSubmitOpen(false);
  };

  const handleReviewAction = (status: 'approved' | 'rejected') => {
    if (!reviewingAppId) return;
    reviewLeaveApplication(reviewingAppId, status, reviewFeedback.trim() || undefined);
    setReviewingAppId(null);
    setReviewFeedback('');
  };

  // Filter leaves based on role
  const leaveList =
    currentRole === 'parent'
      ? db.leaveApplications.filter(l => l.studentId === activeChild?.id)
      : db.leaveApplications;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Leave Applications
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {currentRole === 'parent'
              ? `Manage leave requests for ${activeChild?.fullName || 'Child'}`
              : 'Review and approve student leave requests from assigned classes.'}
          </p>
        </div>

        {currentRole === 'parent' && (
          <button
            onClick={() => setIsSubmitOpen(true)}
            className="px-4 py-2 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-xl transition-colors shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            Apply for Leave
          </button>
        )}
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {leaveList.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 text-sm">
            No leave applications found.
          </div>
        ) : (
          leaveList.map(app => {
            const student = db.students.find(s => s.id === app.studentId);
            const section = student ? db.sections.find(sec => sec.id === student.sectionId) : null;
            const reviewer = app.reviewedById ? db.teachers.find(t => t.id === app.reviewedById) : null;

            const statusConfig = {
              approved: {
                label: 'Approved',
                bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300',
                icon: <CheckCircle2 className="w-3.5 h-3.5" />,
              },
              rejected: {
                label: 'Rejected',
                bg: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300',
                icon: <XCircle className="w-3.5 h-3.5" />,
              },
              pending: {
                label: 'Pending Review',
                bg: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300',
                icon: <Clock className="w-3.5 h-3.5" />,
              },
            }[app.status];

            return (
              <div
                key={app.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-extrabold text-slate-900 dark:text-white">
                        {student?.fullName}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {section?.name} · Roll #{student?.rollNumber}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Applied on {new Date(app.appliedAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border flex items-center gap-1.5 ${statusConfig.bg}`}>
                      {statusConfig.icon}
                      {statusConfig.label}
                    </span>
                  </div>
                </div>

                {/* Duration & Reason */}
                <div className="flex items-center gap-2 text-xs font-bold text-purple-700 dark:text-purple-300">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Duration: {app.startDate} {app.startDate !== app.endDate && `to ${app.endDate}`}
                  </span>
                </div>

                <div className="text-sm text-slate-800 dark:text-slate-200 bg-slate-50/70 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Reason Stated:
                  </span>
                  {app.reason}
                </div>

                {/* Teacher Feedback if available */}
                {app.teacherFeedback && (
                  <div className="p-3 bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 rounded-xl text-xs space-y-1">
                    <span className="font-bold text-purple-900 dark:text-purple-300 block">
                      Teacher Remark ({reviewer?.fullName}):
                    </span>
                    <p className="text-slate-700 dark:text-slate-300">"{app.teacherFeedback}"</p>
                  </div>
                )}

                {/* Teacher Decision Actions */}
                {(currentRole === 'teacher' || currentRole === 'admin') && app.status === 'pending' && (
                  <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => {
                        setReviewingAppId(app.id);
                        setReviewFeedback('Approved. Please catch up on missed classwork.');
                      }}
                      className="px-4 py-1.5 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-xl transition-colors shadow-xs"
                    >
                      Review &amp; Decide
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Parent Apply for Leave */}
      {isSubmitOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setIsSubmitOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              Apply for Leave
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Submitting for child: <span className="font-bold">{activeChild?.fullName}</span>
            </p>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold">
                {formError}
              </div>
            )}

            <form onSubmit={handleParentSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    End Date *
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Reason for Absence *
                </label>
                <textarea
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="e.g. Sickness (seasonal fever), attending sister wedding in Sukkur..."
                  rows={3}
                  className="w-full p-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSubmitOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Teacher Review Leave */}
      {reviewingAppId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setReviewingAppId(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              Review Leave Application
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Approved leave will automatically reflect as 'Leave' in student attendance records.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Teacher Remarks / Instructions
                </label>
                <textarea
                  value={reviewFeedback}
                  onChange={e => setReviewFeedback(e.target.value)}
                  placeholder="e.g. Leave granted. Please complete missed homework upon return."
                  rows={3}
                  className="w-full p-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleReviewAction('rejected')}
                  className="px-4 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900/60 rounded-xl transition-colors"
                >
                  Reject
                </button>
                <button
                  type="button"
                  onClick={() => handleReviewAction('approved')}
                  className="px-5 py-2 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-xl shadow-xs transition-colors"
                >
                  Approve Leave
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
