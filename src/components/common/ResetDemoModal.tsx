import React from 'react';
import { RotateCcw, AlertTriangle, X } from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';

interface ResetDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ResetDemoModal: React.FC<ResetDemoModalProps> = ({ isOpen, onClose }) => {
  const { resetToDemoData, db } = useSchool();

  if (!isOpen) return null;

  const handleReset = () => {
    resetToDemoData();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400 mb-4">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Reset Demo Data</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Restore original Sindh school records</p>
          </div>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
          This will reset all attendance, homework submissions, timeline updates, calendar events, and test records
          back to the pristine official dataset for {db.school.name}. Any changes made
          during this session will be replaced.
        </p>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-700 hover:bg-purple-800 dark:bg-purple-600 dark:hover:bg-purple-700 rounded-xl shadow-sm transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Confirm &amp; Reset
          </button>
        </div>
      </div>
    </div>
  );
};
