import { randomUUID } from "crypto";
import { CrmRecord, ParsedImportResult, RawCsvRow, SkippedRecord } from "../types";
import { extractCrmRecords, ExtractionProgress } from "./ai.service";
import { isImportable } from "./crm.service";
import { getPrisma, isDbEnabled } from "../db/prisma";
import { logger } from "../utils/logger";

export type ImportJobStatus = "processing" | "completed" | "failed";

export interface ImportJob {
  id: string;
  status: ImportJobStatus;
  progress: ExtractionProgress;
  result: ParsedImportResult | null;
  error: string | null;
}

const JOB_TTL_MS = 15 * 60 * 1000;
const jobs = new Map<string, ImportJob>();

export function getImportJob(id: string): ImportJob | undefined {
  return jobs.get(id);
}

/**
 * Kicks off AI extraction in the background and returns immediately with a
 * job handle — the caller polls getImportJob(id) for live progress instead
 * of blocking on one long request. This is what makes the frontend's
 * progress bar real instead of a simulated animation.
 */
export function startImportJob(fileName: string, fileSizeBytes: number, rows: RawCsvRow[]): ImportJob {
  const id = randomUUID();
  const job: ImportJob = {
    id,
    status: "processing",
    progress: { completedBatches: 0, totalBatches: 0, processedRows: 0, totalRows: rows.length },
    result: null,
    error: null,
  };
  jobs.set(id, job);

  runImportJob(job, fileName, fileSizeBytes, rows).catch((err) => {
    job.status = "failed";
    job.error = (err as Error).message || "Unexpected server error while mapping this file.";
    logger.error("csv.import.job_failed", { jobId: id, error: job.error });
  });

  setTimeout(() => jobs.delete(id), JOB_TTL_MS).unref();

  return job;
}

async function runImportJob(job: ImportJob, fileName: string, fileSizeBytes: number, rows: RawCsvRow[]) {
  const startedAt = Date.now();

  const { outcomes, batchCount } = await extractCrmRecords(rows, (progress) => {
    job.progress = progress;
  });

  const success: CrmRecord[] = [];
  const skipped: SkippedRecord[] = [];
  const seenEmails = new Set<string>();

  let globalIndex = 0;
  for (const batchOutcomes of outcomes) {
    for (const outcome of batchOutcomes) {
      const rawRow = rows[globalIndex];
      globalIndex++;

      if (!outcome.record) {
        skipped.push({ rawRow, reason: outcome.error || "AI extraction failed for this row." });
        continue;
      }
      if (!isImportable(outcome.record)) {
        const missing =
          !outcome.record.email && !outcome.record.mobile_without_country_code
            ? "Email and Mobile"
            : !outcome.record.email
            ? "Email"
            : "Mobile";
        skipped.push({
          rawRow,
          reason: `Missing required field: ${missing} is empty.`,
        });
        continue;
      }
      if (outcome.record.email && seenEmails.has(outcome.record.email)) {
        skipped.push({ rawRow, reason: `Duplicate record: email "${outcome.record.email}" already imported.` });
        continue;
      }
      if (outcome.record.email) seenEmails.add(outcome.record.email);

      success.push(outcome.record);
    }
  }

  const durationMs = Date.now() - startedAt;
  const now = new Date();
  const importId = `IMP-${now.toISOString().slice(0, 10).replace(/-/g, "")}-${now
    .getTime()
    .toString().slice(-6)}`;

  const result: ParsedImportResult = {
    success,
    skipped,
    totalImported: success.length,
    totalSkipped: skipped.length,
    totalReceived: rows.length,
    batches: batchCount,
    durationMs,
    importId,
    completedAt: now.toISOString(),
    aiProvider: process.env.AI_PROVIDER || "openai",
  };

  // Best-effort persistence — never fails the job if DB is down/unset.
  if (isDbEnabled()) {
    persistImportBatch(fileName, fileSizeBytes, result).catch((err) =>
      logger.error("db.persist_failed", { error: (err as Error).message })
    );
  }

  logger.info("csv.import.completed", {
    fileName,
    totalReceived: result.totalReceived,
    totalImported: result.totalImported,
    totalSkipped: result.totalSkipped,
    durationMs,
  });

  job.result = result;
  job.status = "completed";
}

async function persistImportBatch(fileName: string, fileSizeBytes: number, result: ParsedImportResult) {
  const prisma = getPrisma();
  if (!prisma) return;

  const batch = await prisma.importBatch.create({
    data: {
      fileName,
      fileSizeBytes,
      totalReceived: result.totalReceived,
      totalImported: result.totalImported,
      totalSkipped: result.totalSkipped,
      batchCount: result.batches,
      durationMs: result.durationMs,
      aiProvider: process.env.AI_PROVIDER || "openai",
    },
  });

  if (result.success.length) {
    await prisma.lead.createMany({
      data: result.success.map((r) => ({
        importBatchId: batch.id,
        createdAtRaw: r.created_at,
        name: r.name,
        email: r.email,
        countryCode: r.country_code,
        mobileWithoutCountryCode: r.mobile_without_country_code,
        company: r.company,
        city: r.city,
        state: r.state,
        country: r.country,
        leadOwner: r.lead_owner,
        crmStatus: r.crm_status,
        crmNote: r.crm_note,
        dataSource: r.data_source,
        possessionTime: r.possession_time,
        description: r.description,
      })),
    });
  }

  if (result.skipped.length) {
    await prisma.skippedRow.createMany({
      data: result.skipped.map((s) => ({
        importBatchId: batch.id,
        rawRowJson: s.rawRow,
        reason: s.reason,
      })),
    });
  }
}
