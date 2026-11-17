/**
 * MERI SCHOOL DIARY — Announcements & Circulars
 */

import React, { useState } from 'react';
import { Bell, PlusCircle, AlertCircle, Calendar, User, X, Printer } from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { Announcement } from '../../types';
import { generateCircularPdf } from '../../utils/pdfGenerator';
import { PdfViewerModal } from '../../components/common/PdfViewerModal';

export const AnnouncementsView: React.FC = () => {
  const { db, currentRole, createAnnouncement } = useSchool();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<'normal' | 'important' | 'urgent'>('normal');
  const [activePdf, setActivePdf] = useState<{
    title: string;
    blob: Blob;
    filename: string;
    subtitle?: string;
  } | null>(null);

  const handlePrintCircular = (anc: Announcement) => {
    const doc = generateCircularPdf({
      school: db.school,
      announcement: anc,
    });
    setActivePdf({
      title: `Official Circular: ${anc.title}`,
      blob: doc.output('blob'),
      filename: `GGHSS_Gizri_Circular_${anc.id.slice(-4).toUpperCase()}.pdf`,
      subtitle: `${db.school.name} · Official School Notification`,
    });
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    createAnnouncement({
      title: title.trim(),
      content: content.trim(),
      publishDate: new Date().toISOString().split('T')[0],
      publishedBy: 'School Administration',
      priority,
      targetRole: 'all',
    });

    setTitle('');
    setContent('');
    setIsCreateOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            School Announcements
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Official government circulars, holiday notices, and academic reminders.
          </p>
        </div>

        {currentRole === 'admin' && (
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-xl transition-colors shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            Publish Circular
          </button>
        )}
      </div>

      <div className="space-y-4">
        {db.announcements.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 text-sm">
            No announcements published yet.
          </div>
        ) : (
          db.announcements.map(anc => {
            const priorityConfig = {
              urgent: {
                label: 'Urgent Circular',
                bg: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300',
              },
              important: {
                label: 'Important Notice',
                bg: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300',
              },
              normal: {
                label: 'General Notice',
                bg: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300',
              },
            }[anc.priority];

            return (
              <div
                key={anc.id}
                className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="space-y-1">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${priorityConfig.bg}`}>
                      {priorityConfig.label}
                    </span>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white pt-1">
                      {anc.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{anc.publishDate}</span>
                  </div>
                </div>

                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                  {anc.content}
                </p>

                <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3 h-3 text-slate-400" />
                    <span>Issued by: {anc.publishedBy}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handlePrintCircular(anc)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors"
                  >
                    <Printer className="w-3 h-3" />
                    <span>Print Circular (PDF)</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Create Announcement */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setIsCreateOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              Publish New Announcement
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Circulate a notification to parents, teachers, and students.
            </p>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Announcement Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Winter Vacation Notification 2026"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={e => setPriority(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="normal">Normal Announcement</option>
                  <option value="important">Important Notice</option>
                  <option value="urgent">Urgent Circular</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Circular Content *
                </label>
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Detailed announcement text, schedule adjustments, instructions..."
                  rows={4}
                  className="w-full p-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
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
                  Publish Now
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
