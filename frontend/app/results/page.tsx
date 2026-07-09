"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  XCircle,
  FileStack,
  TrendingUp,
  Clock,
  Sparkles,
  Download,
  BarChart3,
  AlertTriangle,
  LucideIcon,
} from "lucide-react";
import { WorkspaceHeader } from "../components/WorkspaceHeader";
import { StatCard } from "../components/StatCard";
import { ImportedPanel } from "../components/ImportedPanel";
import { SkippedPanel } from "../components/SkippedPanel";
import { AnalyticsOverlay } from "../components/AnalyticsOverlay";
import { ParsedImportResult } from "../lib/types";
import { clearAll, loadResults } from "../lib/storage";
import { downloadCrmRecordsAsCsv } from "../lib/csvExport";

export default function ResultsPage() {
  const router = useRouter();
  const [result, setResult] = useState<ParsedImportResult | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);

  useEffect(() => {
    const data = loadResults();
    if (!data) {
      router.replace("/");
      return;
    }
    setResult(data);
  }, [router]);

  function handleReset() {
    clearAll();
    router.push("/");
  }

  function handleDownload() {
    if (!result) return;
    downloadCrmRecordsAsCsv(result.success, `${result.importId}-imported-leads.csv`);
  }

  if (!result) return null;

  const successRate = result.totalReceived
    ? Math.round((result.totalImported / result.totalReceived) * 1000) / 10
    : 0;
  const completedAtLabel = new Date(result.completedAt).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
    hour12: true,
  });

  // The heading reflects what actually happened — never claims success when
  // nothing was imported, or when every row failed.
  let headingTitle: string;
  let headingSubtitle: string;
  let headingTone: "success" | "warning" | "danger";
  let headingIcon: LucideIcon;

  if (result.totalImported === 0 && result.totalReceived > 0) {
    // Case 3 — everything skipped
    headingTitle = "Import failed — no records were imported";
    headingSubtitle =
      "Every row was skipped. This is usually an AI provider issue (invalid key, quota) — check reasons below and try again.";
    headingTone = "danger";
    headingIcon = XCircle;
  } else if (result.totalSkipped > 0) {
    // Case 2 — partial import
    headingTitle = "Import completed with some records skipped";
    headingSubtitle = `${result.totalImported} of ${result.totalReceived} rows were imported. ${result.totalSkipped} rows need attention — see reasons below.`;
    headingTone = "warning";
    headingIcon = AlertTriangle;
  } else {
    // Case 1 — everything imported
    headingTitle = "Import completed successfully!";
    headingSubtitle = `All ${result.totalReceived} rows were imported into GrowEasy CRM.`;
    headingTone = "success";
    headingIcon = CheckCircle2;
  }

  return (
    <div className="mx-auto w-full max-w-6xl">
      <WorkspaceHeader
        title={headingTitle}
        subtitle={headingSubtitle}
        titleIcon={headingIcon}
        actionLabel="View Analytics"
        actionIcon={BarChart3}
        onAction={() => setShowAnalytics(true)}
        titleTone={headingTone}
      />

      {showAnalytics && <AnalyticsOverlay result={result} onClose={() => setShowAnalytics(false)} />}

      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <StatCard label="Imported" value={result.totalImported} icon={CheckCircle2} tone="success" delay={0} />
          <StatCard label="Skipped" value={result.totalSkipped} icon={XCircle} tone="warning" delay={0.04} />
          <StatCard label="Total Records" value={result.totalReceived} icon={FileStack} delay={0.08} />
          <StatCard label="Success Rate" value={`${successRate}%`} icon={TrendingUp} tone="gradient" delay={0.12} />
          <StatCard label="Batches" value={result.batches} icon={Sparkles} delay={0.16} />
        </div>

        <div className="glass-panel flex flex-col gap-2 rounded-2xl px-4 py-3 text-xs text-mist-400 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span>
              Import ID: <span className="font-mono text-mist-100">{result.importId}</span>
            </span>
            <span>
              AI Provider: <span className="text-mist-100">{result.aiProvider}</span>
            </span>
          </div>
          <span className="flex shrink-0 items-center gap-1.5 text-mist-400">
            <Clock className="h-3.5 w-3.5" />
            Completed {completedAtLabel} · {(result.durationMs / 1000).toFixed(1)}s
          </span>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <ImportedPanel leads={result.success} />
          <SkippedPanel skipped={result.skipped} />
        </div>

        <div className="flex justify-center gap-3 pb-2 pt-1">
          {result.totalImported > 0 && (
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 rounded-xl bg-flow-gradient px-6 py-2.5 text-sm font-semibold text-white shadow-glow transition-transform hover:scale-[1.02] active:scale-[0.99]"
            >
              <Download className="h-4 w-4" />
              Download Imported CSV
            </button>
          )}
          <button
            onClick={handleReset}
            className="rounded-xl border border-white/10 bg-white/5 px-6 py-2.5 text-sm font-medium text-mist-100 transition-colors hover:bg-white/10"
          >
            Start New Import
          </button>
        </div>
      </div>
    </div>
  );
}