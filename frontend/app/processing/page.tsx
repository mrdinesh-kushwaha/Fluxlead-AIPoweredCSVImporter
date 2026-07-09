"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Clock, Check } from "lucide-react";
import { startImportJob, getImportJobStatus, ApiRequestError } from "../lib/api";
import { loadPreview, saveResults } from "../lib/storage";
import { ImportJobProgress, ParsedImportResult, UploadPreviewResponse } from "../lib/types";

const POLL_INTERVAL_MS = 600;
const WORKFLOW_STEPS = ["Reading headers", "Mapping fields", "Finalizing data"] as const;

function statusMessageFor(pct: number): string {
  if (pct < 20) return "Reading column headers…";
  if (pct < 40) return "Analyzing uploaded data…";
  if (pct < 60) return "Mapping CRM fields…";
  if (pct < 80) return "Validating records…";
  if (pct < 95) return "Preparing import preview…";
  return "Finalizing…";
}

function activeStepFor(pct: number): number {
  if (pct < 20) return 0;
  if (pct < 95) return 1;
  return 2;
}

const EMPTY_PROGRESS: ImportJobProgress = {
  completedBatches: 0,
  totalBatches: 0,
  processedRows: 0,
  totalRows: 0,
};

/** When AI mapping can't even run (network error, job crash, rate limit hitting
 * our own API before a job starts) there's no per-row AI outcome to report —
 * so every row is marked skipped with the real reason and sent to Results,
 * the same shape a provider-level failure (e.g. bad API key) already produces. */
function buildFailureResult(preview: UploadPreviewResponse, reason: string): ParsedImportResult {
  const now = new Date();
  return {
    success: [],
    skipped: preview.rows.map((rawRow) => ({ rawRow, reason })),
    totalImported: 0,
    totalSkipped: preview.rows.length,
    totalReceived: preview.rows.length,
    batches: 0,
    durationMs: 0,
    importId: `IMP-${now.toISOString().slice(0, 10).replace(/-/g, "")}-${now
      .getTime()
      .toString()
      .slice(-6)}`,
    completedAt: now.toISOString(),
    aiProvider: "unknown",
  };
}

export default function ProcessingPage() {
  const router = useRouter();
  const [progress, setProgress] = useState<ImportJobProgress>(EMPTY_PROGRESS);
  const startedRef = useRef(false);
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pct =
    progress.totalRows > 0
      ? Math.min(100, Math.round((progress.processedRows / progress.totalRows) * 100))
      : 0;

  const runImport = useCallback(async () => {
    setProgress(EMPTY_PROGRESS);

    const preview = loadPreview();
    if (!preview) {
      router.replace("/");
      return;
    }

    const failWith = (reason: string) => {
      saveResults(buildFailureResult(preview, reason));
      router.push("/results");
    };

    try {
      const { jobId } = await startImportJob(preview.fileName, preview.fileSizeBytes, preview.rows);

      const poll = async () => {
        try {
          const status = await getImportJobStatus(jobId);
          setProgress(status.progress);

          if (status.status === "completed" && status.result) {
            saveResults(status.result);
            pollTimerRef.current = setTimeout(() => router.push("/results"), 500);
            return;
          }
          if (status.status === "failed") {
            failWith(status.error || "AI mapping failed unexpectedly.");
            return;
          }
          pollTimerRef.current = setTimeout(poll, POLL_INTERVAL_MS);
        } catch (err) {
          const msg =
            err instanceof ApiRequestError
              ? err.message
              : "Lost connection while checking import progress.";
          failWith(msg);
        }
      };

      poll();
    } catch (err) {
      const msg =
        err instanceof ApiRequestError ? err.message : "Could not start AI mapping.";
      failWith(msg);
    }
  }, [router]);

  useEffect(() => {
    // Guard against React 18 strict-mode double-invoking effects in dev,
    // which would otherwise fire the AI call twice.
    if (startedRef.current) return;
    startedRef.current = true;
    runImport();

    return () => {
      if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
    };
  }, [runImport]);

  const activeStep = activeStepFor(pct);
  const statusMessage = statusMessageFor(pct);

  return (
    <div className="mx-auto flex h-full w-full max-w-xl flex-col items-center justify-center gap-5 text-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
        className="flex h-16 w-16 items-center justify-center rounded-2xl bg-flow-gradient shadow-glow"
      >
        <Sparkles className="h-7 w-7 text-white" />
      </motion.div>

      <div>
        <h3 className="font-display text-xl font-semibold text-mist-100">AI is mapping your leads</h3>

        <p className="mt-2 font-display text-2xl font-semibold tabular-nums text-signal-success">
          {pct}%
        </p>

        <AnimatePresence mode="wait">
          <motion.p
            key={statusMessage}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="mt-2 text-sm text-mist-400"
          >
            {statusMessage}
          </motion.p>
        </AnimatePresence>
      </div>

      <div className="h-2 w-full max-w-xs overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full rounded-full bg-signal-success"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>

      <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs">
        {WORKFLOW_STEPS.map((step, idx) => (
          <div key={step} className="flex items-center gap-2">
            {idx > 0 && <span className="text-mist-400/50">•</span>}
            <span
              className={`flex items-center gap-1 ${
                idx <= activeStep ? "font-semibold text-signal-success" : "text-mist-400"
              }`}
            >
              {idx < activeStep ? (
                <Check className="h-3.5 w-3.5" />
              ) : idx === activeStep ? (
                <span className="h-1.5 w-1.5 rounded-full bg-signal-success" />
              ) : (
                <span className="h-1.5 w-1.5 rounded-full border border-mist-400" />
              )}
              {step}
            </span>
          </div>
        ))}
      </div>

      <p className="flex items-center gap-1.5 text-xs text-mist-400">
        <Clock className="h-3.5 w-3.5" />
        Large files are processed in batches — this usually takes a few seconds.
      </p>
    </div>
  );
}
