import { NextFunction, Request, Response } from "express";
import { CsvParseError } from "../services/csv.service";

export class ApiError extends Error {
  statusCode: number;
  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ error: err.message });
  }
  if (err instanceof CsvParseError) {
    return res.status(400).json({ error: err.message });
  }

  const message = err instanceof Error ? err.message : "Unexpected server error.";
  const isMulterLimit =
    message.includes("File too large") || message.includes("LIMIT_FILE_SIZE");
  const isCsvType = message.includes("Only .csv files are supported");
  const statusCode = isMulterLimit ? 413 : isCsvType ? 400 : 500;

  console.error("[error]", message);
  res.status(statusCode).json({
    error: isMulterLimit ? "File exceeds the maximum allowed size." : message,
  });
}
