import { Router } from "express";
import { z } from "zod";
import { ApiError } from "../middleware/error.middleware";
import { RawCsvRow } from "../types";
import { getImportJob, startImportJob } from "../services/importJob.service";

export const importRouter = Router();

const MAX_ROWS_PER_IMPORT = 5000;

const importRequestSchema = z.object({
  fileName: z.string().min(1),
  fileSizeBytes: z.number().nonnegative(),
  rows: z
    .array(z.record(z.string()))
    .min(1, "At least one row is required.")
    .max(MAX_ROWS_PER_IMPORT, `A single import is capped at ${MAX_ROWS_PER_IMPORT} rows.`),
});

/** Starts AI extraction in the background and returns a job id immediately —
 * the frontend polls GET /import-jobs/:jobId for live, real progress instead
 * of waiting on one long blocking request. */
importRouter.post("/import-jobs", (req, res, next) => {
  try {
    const parsed = importRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ApiError(400, parsed.error.issues.map((i) => i.message).join("; "));
    }
    const { fileName, fileSizeBytes, rows } = parsed.data as {
      fileName: string;
      fileSizeBytes: number;
      rows: RawCsvRow[];
    };

    const job = startImportJob(fileName, fileSizeBytes, rows);
    res.status(202).json({ jobId: job.id });
  } catch (err) {
    next(err);
  }
});

importRouter.get("/import-jobs/:jobId", (req, res) => {
  const job = getImportJob(req.params.jobId);
  if (!job) {
    res.status(404).json({ error: "Import job not found or expired." });
    return;
  }

  res.status(200).json({
    status: job.status,
    progress: job.progress,
    result: job.result,
    error: job.error,
  });
});
