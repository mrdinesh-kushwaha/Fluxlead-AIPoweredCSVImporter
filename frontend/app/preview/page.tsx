"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, ArrowRight, FileText, XCircle, ChevronDown, CheckCircle2 } from "lucide-react";
import { ColumnChips } from "../components/ColumnChips";
import { PreviewTable } from "../components/PreviewTable";
import { UploadPreviewResponse } from "../lib/types";
import { clearAll, loadAndClearImportError, loadPreview } from "../lib/storage";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function PreviewPage() {
  const router = useRouter();
  const [preview, setPreview] = useState<UploadPreviewResponse | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [showFileDetails, setShowFileDetails] = useState(false);

  useEffect(() => {
    const data = loadPreview();
    if (!data) {
      router.replace("/");
      return;
    }
    setPreview(data);
    setImportError(loadAndClearImportError());
  }, [router]);

  function handleContinue() {
    router.push("/processing");
  }

  function handleReset() {
    clearAll();
    router.push("/");
  }

  if (!preview) return null;

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="mb-4 text-center">
        <h1 className="font-display text-2xl font-semibold text-mist-100 sm:text-[2rem]">
          Preview your data
        </h1>
      </div>

      <div className="space-y-3">
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-flow-purple/25 bg-flow-purple/10 px-4 py-2 text-xs text-mist-100 sm:text-sm">
            <ShieldCheck className="h-4 w-4 shrink-0 text-flow-purple" />
            Your data is secure and never stored until you confirm the import.
          </div>
        </div>

        <div className="glass-panel overflow-hidden rounded-2xl shadow-glass">
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-flow-gradient shadow-glow">
                <FileText className="h-4 w-4 text-white" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-mist-100">{preview.fileName}</p>
                <p className="text-xs text-mist-400">
                  Uploaded just now · {preview.rowCount.toLocaleString()} rows ·{" "}
                  {preview.headers.length} columns · {formatBytes(preview.fileSizeBytes)}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowFileDetails((v) => !v)}
              className="flex shrink-0 items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-mist-300 transition-colors hover:bg-white/10 hover:text-mist-100"
            >
              File details
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showFileDetails ? "rotate-180" : ""}`} />
            </button>
          </div>

          {showFileDetails && (
            <div className="grid grid-cols-2 gap-3 border-t border-white/10 px-4 py-3.5 text-xs sm:grid-cols-4">
              <div>
                <p className="text-mist-400">File type</p>
                <p className="mt-0.5 font-medium text-mist-100">CSV</p>
              </div>
              <div>
                <p className="text-mist-400">Total rows</p>
                <p className="mt-0.5 font-medium text-mist-100">{preview.rowCount.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-mist-400">Total columns</p>
                <p className="mt-0.5 font-medium text-mist-100">{preview.headers.length}</p>
              </div>
              <div>
                <p className="text-mist-400">File size</p>
                <p className="mt-0.5 font-medium text-mist-100">{formatBytes(preview.fileSizeBytes)}</p>
              </div>
            </div>
          )}
        </div>

        <ColumnChips headers={preview.headers} />

        <PreviewTable headers={preview.headers} rows={preview.rows} />

        {importError && (
          <div className="flex items-center gap-2 rounded-xl border border-signal-danger/30 bg-signal-danger/10 px-4 py-3 text-sm text-signal-danger">
            <XCircle className="h-4 w-4 shrink-0" />
            {importError}
          </div>
        )}

        <div className="flex flex-col items-center justify-between gap-3 pb-2 sm:flex-row">
          <button
            onClick={handleReset}
            className="order-3 text-sm text-mist-400 transition-colors hover:text-mist-100 sm:order-1"
          >
            ← Back to Upload
          </button>

          <div className="order-1 flex items-center gap-1.5 text-xs text-mist-400 sm:order-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-signal-success" />
            Looks good? Confirm to run AI extraction
          </div>

          <button
            onClick={handleContinue}
            className="group order-2 flex items-center gap-2 rounded-xl bg-flow-gradient px-6 py-3 text-sm font-semibold text-white shadow-glow transition-transform hover:scale-[1.02] active:scale-[0.99] sm:order-3"
          >
            Confirm &amp; Run AI Import
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
