import { ImportJobStatusResponse, RawCsvRow, UploadPreviewResponse } from "./types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "") || "http://localhost:4000";

export class ApiRequestError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/** Turns a bare HTTP status (no readable `.error` in the response body — e.g.
 * a proxy timeout or our own rate limiter's default text response) into a
 * message a non-technical user can actually act on, instead of leaking
 * "Request failed with status 429" straight into the UI. */
function friendlyStatusMessage(status: number): string {
  if (status === 429) {
    return "AI Mapping Failed — rate limit reached. Please wait a moment and try again.";
  }
  if (status === 401 || status === 403) {
    return "AI Mapping Failed — could not connect to the AI provider (authentication issue).";
  }
  if (status >= 500) {
    return "AI Mapping Failed — the import service is temporarily unavailable. Please try again.";
  }
  return `AI Mapping Failed — the request could not be completed (error ${status}).`;
}

async function parseErrorMessage(res: Response): Promise<string> {
  try {
    const data = await res.json();
    if (data?.error) return data.error;
  } catch {
    // body wasn't JSON — fall through to the friendly status-based message
  }
  return friendlyStatusMessage(res.status);
}

export async function uploadCsvForPreview(file: File): Promise<UploadPreviewResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE_URL}/api/csv/preview`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new ApiRequestError(res.status, await parseErrorMessage(res));
  return res.json();
}

export async function startImportJob(
  fileName: string,
  fileSizeBytes: number,
  rows: RawCsvRow[]
): Promise<{ jobId: string }> {
  const res = await fetch(`${API_BASE_URL}/api/csv/import-jobs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileName, fileSizeBytes, rows }),
  });

  if (!res.ok) throw new ApiRequestError(res.status, await parseErrorMessage(res));
  return res.json();
}

export async function getImportJobStatus(jobId: string): Promise<ImportJobStatusResponse> {
  const res = await fetch(`${API_BASE_URL}/api/csv/import-jobs/${jobId}`);
  if (!res.ok) throw new ApiRequestError(res.status, await parseErrorMessage(res));
  return res.json();
}
