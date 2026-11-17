/**
 * MERI SCHOOL DIARY — PDF Upload & Submission Card
 * Handles drag-and-drop, validation (max 5MB, application/pdf), pre-submission preview, and replace confirmation.
 */

import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  Eye,
  Trash2,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { PdfViewerModal } from './PdfViewerModal';

export interface UploadedPdfInfo {
  fileName: string;
  fileSize: string;
  dataUrl: string;
}

interface PdfUploadCardProps {
  label?: string;
  description?: string;
  value?: UploadedPdfInfo | null;
  onChange: (info: UploadedPdfInfo | null) => void;
  required?: boolean;
  disabled?: boolean;
}

export const PdfUploadCard: React.FC<PdfUploadCardProps> = ({
  label = 'Upload Homework PDF Document',
  description = 'Attach scanned assignment copy or worksheet (PDF only, up to 5 MB)',
  value,
  onChange,
  required = false,
  disabled = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [showReplaceConfirm, setShowReplaceConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const processFile = (file: File) => {
    setError(null);

    // Validate mime type
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setError('Invalid file format. Please upload an official PDF document.');
      return;
    }

    // Validate size (max 5MB)
    const MAX_BYTES = 5 * 1024 * 1024;
    if (file.size > MAX_BYTES) {
      setError(`File size exceeds 5 MB limit (${formatFileSize(file.size)}). Please compress the PDF.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      onChange({
        fileName: file.name,
        fileSize: formatFileSize(file.size),
        dataUrl,
      });
      setShowReplaceConfirm(false);
    };
    reader.onerror = () => {
      setError('Failed to read PDF file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    onChange(null);
    setShowReplaceConfirm(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
        {value && (
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Ready for submission
          </span>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf,.pdf"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />

      {!value ? (
        // Empty Upload Zone
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !disabled && fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? 'border-purple-600 bg-purple-50/70 dark:bg-purple-950/40'
              : 'border-slate-200 dark:border-slate-700/80 hover:border-purple-400 bg-white dark:bg-slate-900/60'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center justify-center shadow-2xs">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Click to browse or drag and drop PDF file here
              </p>
              <p className="text-[11px] text-slate-400">{description}</p>
            </div>
          </div>
        </div>
      ) : (
        // Uploaded File Card
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center justify-center shrink-0 shadow-2xs">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {value.fileName}
                </div>
                <div className="text-[11px] text-slate-400 flex items-center gap-2">
                  <span>{value.fileSize}</span>
                  <span>·</span>
                  <span className="text-purple-600 dark:text-purple-400 font-medium">Valid PDF Document</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setPreviewOpen(true)}
                className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/60 transition-colors flex items-center gap-1"
                title="Preview PDF"
              >
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Preview</span>
              </button>

              {!showReplaceConfirm ? (
                <button
                  type="button"
                  onClick={() => setShowReplaceConfirm(true)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  title="Remove or Replace file"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              ) : (
                <div className="flex items-center gap-1 bg-rose-50 dark:bg-rose-950/60 p-1 rounded-xl border border-rose-200 dark:border-rose-800 text-[11px]">
                  <span className="text-rose-700 dark:text-rose-300 font-bold px-1">Remove?</span>
                  <button
                    type="button"
                    onClick={handleRemove}
                    className="px-2 py-0.5 rounded-lg bg-rose-600 text-white font-bold hover:bg-rose-700"
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowReplaceConfirm(false)}
                    className="px-2 py-0.5 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
                  >
                    No
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-purple-700 dark:text-purple-400 font-bold hover:underline flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Replace with different PDF
            </button>
            <span className="text-slate-400">Target: Government Girls Higher Secondary School Gizri</span>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-2.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-400 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Embedded Preview Modal */}
      {value && (
        <PdfViewerModal
          isOpen={previewOpen}
          onClose={() => setPreviewOpen(false)}
          title={`Preview: ${value.fileName}`}
          pdfDataUrl={value.dataUrl}
          filename={value.fileName}
          subtitle="Attached submission scan for teacher review"
        />
      )}
    </div>
  );
};
