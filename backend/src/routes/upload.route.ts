import { Router } from "express";
import { randomUUID } from "crypto";
import { csvUpload } from "../middleware/upload.middleware";
import { parseCsvBuffer } from "../services/csv.service";
import { ApiError } from "../middleware/error.middleware";
import { UploadPreviewResponse } from "../types";
import { logger } from "../utils/logger";

export const uploadRouter = Router();

const PREVIEW_ROW_LIMIT = 50;

/**
 * POST /api/csv/preview
 * Accepts any valid CSV (any column layout), parses it, and returns every
 * row plus a capped previewRows slice for the UI table. No AI call happens
 * here — this step is purely structural parsing per the assignment spec.
 */
uploadRouter.post("/preview", csvUpload.single("file"), (req, res, next) => {
  try {
    if (!req.file) {
      throw new ApiError(400, "No file uploaded. Attach a CSV file under the 'file' field.");
    }

    const { headers, rows } = parseCsvBuffer(req.file.buffer);

    const response: UploadPreviewResponse & { rows: typeof rows } = {
      uploadId: randomUUID(),
      fileName: req.file.originalname,
      fileSizeBytes: req.file.size,
      headers,
      rowCount: rows.length,
      previewRows: rows.slice(0, PREVIEW_ROW_LIMIT),
      rows,
    };

    logger.info("csv.preview", {
      fileName: req.file.originalname,
      rowCount: rows.length,
      headers,
    });

    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
});
