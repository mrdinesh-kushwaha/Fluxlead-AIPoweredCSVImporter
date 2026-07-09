export const CRM_STATUS_VALUES = [
  "GOOD_LEAD_FOLLOW_UP",
  "DID_NOT_CONNECT",
  "BAD_LEAD",
  "SALE_DONE",
] as const;

export type CrmStatus = (typeof CRM_STATUS_VALUES)[number];

export type RawCsvRow = Record<string, string>;

export interface CrmRecord {
  created_at: string | null;
  name: string | null;
  email: string | null;
  country_code: string | null;
  mobile_without_country_code: string | null;
  company: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  lead_owner: string | null;
  crm_status: CrmStatus | null;
  crm_note: string | null;
  data_source: string | null;
  possession_time: string | null;
  description: string | null;
}

export interface SkippedRecord {
  rawRow: RawCsvRow;
  reason: string;
}

export interface UploadPreviewResponse {
  uploadId: string;
  fileName: string;
  fileSizeBytes: number;
  headers: string[];
  rowCount: number;
  previewRows: RawCsvRow[];
  rows: RawCsvRow[];
}

export interface ParsedImportResult {
  success: CrmRecord[];
  skipped: SkippedRecord[];
  totalImported: number;
  totalSkipped: number;
  totalReceived: number;
  batches: number;
  durationMs: number;
  importId: string;
  completedAt: string;
  aiProvider: string;
}

export type FlowStep = "upload" | "preview" | "processing" | "results";

export interface ImportJobProgress {
  completedBatches: number;
  totalBatches: number;
  processedRows: number;
  totalRows: number;
}

export interface ImportJobStatusResponse {
  status: "processing" | "completed" | "failed";
  progress: ImportJobProgress;
  result: ParsedImportResult | null;
  error: string | null;
}
