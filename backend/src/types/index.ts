export const CRM_STATUS_VALUES = [
  "GOOD_LEAD_FOLLOW_UP",
  "DID_NOT_CONNECT",
  "BAD_LEAD",
  "SALE_DONE",
] as const;

export const DATA_SOURCE_VALUES = [
  "leads_on_demand",
  "meridian_tower",
  "eden_park",
  "varah_swamy",
  "sarjapur_plots",
] as const;

export type CrmStatus = (typeof CRM_STATUS_VALUES)[number];
export type DataSource = (typeof DATA_SOURCE_VALUES)[number];

/** Raw CSV row before AI processing — arbitrary, unknown shape */
export type RawCsvRow = Record<string, string>;

/** Easy CRM canonical lead record */
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
  data_source: DataSource | null;
  possession_time: string | null;
  description: string | null;
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

export interface SkippedRecord {
  rawRow: RawCsvRow;
  reason: string;
}

export interface UploadPreviewResponse {
  fileName: string;
  fileSizeBytes: number;
  headers: string[];
  rowCount: number;
  previewRows: RawCsvRow[];
  uploadId: string;
}

export interface AiExtractionBatchResult {
  records: (CrmRecord & { _sourceIndex: number })[];
  failedIndexes: number[];
}
