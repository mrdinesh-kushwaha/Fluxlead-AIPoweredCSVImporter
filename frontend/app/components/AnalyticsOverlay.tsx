"use client";

import { X, FileStack, Layers, Sparkles, Clock } from "lucide-react";
import { SegmentedDonut } from "./SegmentedDonut";
import { ParsedImportResult, SkippedRecord } from "../lib/types";

interface AnalyticsOverlayProps {
  result: ParsedImportResult;
  onClose: () => void;
}

const REASON_COLORS = ["#F87171", "#FBBF24", "#6D5EF5", "#EC4899", "#94A3B8"];

function categorizeReason(reason: string): string {
  if (reason.startsWith("AI Mapping Failed")) return "AI Mapping Failed";
  if (reason.startsWith("AI extraction failed")) return "AI extraction failed";
  if (reason.startsWith("Duplicate record")) return "Duplicate record";
  if (reason.includes("Email and Mobile is empty")) return "Missing email & mobile";
  if (reason.includes("Email is empty")) return "Missing email";
  if (reason.includes("Mobile is empty")) return "Missing mobile";
  return "Other";
}

function buildReasonBreakdown(skipped: SkippedRecord[]) {
  const counts = new Map<string, number>();
  skipped.forEach((s) => {
    const cat = categorizeReason(s.reason);
    counts.set(cat, (counts.get(cat) ?? 0) + 1);
  });
  return Array.from(counts.entries())
    .map(([label, value], idx) => ({ label, value, color: REASON_COLORS[idx % REASON_COLORS.length] }))
    .sort((a, b) => b.value - a.value);
}

export function AnalyticsOverlay({ result, onClose }: AnalyticsOverlayProps) {
  const { totalImported, totalSkipped, totalReceived, skipped, batches, durationMs, aiProvider } = result;
  const importedPct = totalReceived > 0 ? Math.round((totalImported / totalReceived) * 1000) / 10 : 0;
  const skippedPct = totalReceived > 0 ? Math.round((totalSkipped / totalReceived) * 1000) / 10 : 0;
  const segments = [
    { label: "Imported", value: totalImported, color: "#34D399" },
    { label: "Skipped", value: totalSkipped, color: "#F87171" },
  ];
  const reasonBreakdown = buildReasonBreakdown(skipped);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-ink-950/75 backdrop-blur-md">
      <button
        onClick={onClose}
        aria-label="Close analytics"
        className="fixed right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/10 text-mist-100 backdrop-blur transition-colors hover:bg-white/20 sm:right-6 sm:top-6"
      >
        <X className="h-4.5 w-4.5" />
      </button>

      <div className="flex min-h-full items-center justify-center px-4 py-16 sm:px-6">
        <div className="glass-panel w-full max-w-md rounded-3xl p-6 text-center shadow-glass sm:max-w-lg sm:p-8">
          <h2 className="font-display text-lg font-semibold text-mist-100 sm:text-xl">Import Analytics</h2>
          <p className="mt-1 text-xs text-mist-400 sm:text-sm">Imported vs skipped, across all rows</p>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-mist-300">
              <FileStack className="h-3 w-3" />
              {totalReceived.toLocaleString()} rows
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-mist-300">
              <Layers className="h-3 w-3" />
              {batches} batch{batches === 1 ? "" : "es"}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-mist-300">
              <Sparkles className="h-3 w-3" />
              {aiProvider}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-mist-300">
              <Clock className="h-3 w-3" />
              {(durationMs / 1000).toFixed(1)}s
            </span>
          </div>

          <div className="mt-7 flex justify-center">
            <SegmentedDonut segments={segments} size={216} strokeWidth={26} />
          </div>

          <div className="mt-7 flex justify-center gap-8 sm:gap-14">
            <div>
              <p className="flex items-center justify-center gap-1.5 text-xs text-mist-400">
                <span className="h-2 w-2 rounded-full bg-signal-success" />
                Imported
              </p>
              <p className="mt-1 font-display text-2xl font-bold text-signal-success sm:text-3xl">
                {importedPct}%
              </p>
              <p className="text-[11px] text-mist-400">{totalImported.toLocaleString()} rows</p>
            </div>
            <div>
              <p className="flex items-center justify-center gap-1.5 text-xs text-mist-400">
                <span className="h-2 w-2 rounded-full bg-signal-danger" />
                Skipped
              </p>
              <p className="mt-1 font-display text-2xl font-bold text-signal-danger sm:text-3xl">
                {skippedPct}%
              </p>
              <p className="text-[11px] text-mist-400">{totalSkipped.toLocaleString()} rows</p>
            </div>
          </div>

          {reasonBreakdown.length > 0 && (
            <div className="mt-7 space-y-3 border-t border-white/10 pt-5 text-left">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-mist-400">
                Why rows were skipped
              </p>
              {reasonBreakdown.map((r) => {
                const pct = totalSkipped > 0 ? Math.round((r.value / totalSkipped) * 100) : 0;
                return (
                  <div key={r.label} className="space-y-1">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="flex min-w-0 items-center gap-1.5 text-mist-300">
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: r.color }} />
                        <span className="truncate">{r.label}</span>
                      </span>
                      <span className="shrink-0 font-medium text-mist-100">
                        {r.value} ({pct}%)
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, backgroundColor: r.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <button
            onClick={onClose}
            className="mt-8 rounded-xl border border-white/10 bg-white/5 px-6 py-2.5 text-sm font-medium text-mist-100 transition-colors hover:bg-white/10"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
