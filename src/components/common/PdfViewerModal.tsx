/**
 * MERI SCHOOL DIARY — PDF Viewer & Print Modal
 * Provides interactive client-side preview, printing, and formatted file download.
 */

import React, { useRef, useEffect } from 'react';
import {
  X,
  Download,
  Printer,
  FileText,
  ExternalLink,
  CheckCircle,
} from 'lucide-react';

interface PdfViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  pdfBlob?: Blob | null;
  pdfDataUrl?: string | null;
  filename: string;
  subtitle?: string;
}

export const PdfViewerModal: React.FC<PdfViewerModalProps> = ({
  isOpen,
  onClose,
  title,
  pdfBlob,
  pdfDataUrl,
  filename,
  subtitle,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [objectUrl, setObjectUrl] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    if (!isOpen) {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
        setObjectUrl(null);
      }
      return;
    }

    if (pdfBlob) {
      const url = URL.createObjectURL(pdfBlob);
      setObjectUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    } else if (pdfDataUrl) {
      setObjectUrl(pdfDataUrl);
    }
  }, [isOpen, pdfBlob, pdfDataUrl]);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (!objectUrl) return;
    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handlePrint = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        iframeRef.current.contentWindow.focus();
        iframeRef.current.contentWindow.print();
      } catch (err) {
        // Fallback: window.print() or download
        window.print();
      }
    } else {
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-5xl h-[90vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800">
        {/* Header Bar */}
        <div className="px-5 py-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700/80 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center justify-center shrink-0 shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                  {title}
                </h3>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 border border-purple-200/50 dark:border-purple-700/50">
                  PDF Preview
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {subtitle || 'Government Girls Higher Secondary School Gizri · SEMIS 408060247'}
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handlePrint}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-2xs"
              title="Print Official Document"
            >
              <Printer className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="hidden sm:inline">Print</span>
            </button>

            <button
              onClick={handleDownload}
              type="button"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-purple-700 text-white hover:bg-purple-800 transition-colors shadow-xs"
              title="Download PDF File"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>

            <button
              onClick={onClose}
              type="button"
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-1"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PDF Body Container */}
        <div className="flex-1 bg-slate-100 dark:bg-slate-950 p-2 sm:p-4 flex flex-col items-center justify-center overflow-hidden">
          {objectUrl ? (
            <iframe
              ref={iframeRef}
              src={`${objectUrl}#toolbar=0`}
              title={title}
              className="w-full h-full rounded-2xl bg-white shadow-inner border border-slate-200 dark:border-slate-800"
            />
          ) : (
            <div className="text-center p-8 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto animate-pulse">
                <FileText className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Rendering PDF document...
              </p>
            </div>
          )}
        </div>

        {/* Footer Meta */}
        <div className="px-5 py-2.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2 truncate">
            <span className="font-mono text-purple-700 dark:text-purple-300 font-semibold truncate">
              {filename}
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="hidden sm:inline">Official Sindh School Record</span>
            <button
              onClick={handleDownload}
              className="text-purple-700 dark:text-purple-400 font-bold hover:underline"
            >
              Direct Link
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
