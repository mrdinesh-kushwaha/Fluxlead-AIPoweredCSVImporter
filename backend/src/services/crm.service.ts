import {
  CRM_STATUS_VALUES,
  CrmRecord,
  CrmStatus,
  DATA_SOURCE_VALUES,
  DataSource,
} from "../types";

const STATUS_SET = new Set<string>(CRM_STATUS_VALUES);
const SOURCE_SET = new Set<string>(DATA_SOURCE_VALUES);

/** Coerces an AI-returned field into a valid CrmStatus, or null. */
export function coerceCrmStatus(value: unknown): CrmStatus | null {
  if (typeof value !== "string") return null;
  const v = value.trim().toUpperCase();
  return STATUS_SET.has(v) ? (v as CrmStatus) : null;
}

/** Coerces an AI-returned field into a valid DataSource, or null (blank if unsure). */
export function coerceDataSource(value: unknown): DataSource | null {
  if (typeof value !== "string") return null;
  const v = value.trim().toLowerCase();
  return SOURCE_SET.has(v) ? (v as DataSource) : null;
}

/** Confirms created_at is parseable via `new Date(...)`. Falls back to null. */
export function coerceDate(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  const d = new Date(value.trim());
  if (isNaN(d.getTime())) return null;
  return value.trim();
}

function cleanString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

/**
 * Escapes newlines so every record can remain a single logical CSV row
 * downstream (per assignment rule: avoid unintended line breaks).
 */
function sanitizeMultiline(value: string | null): string | null {
  if (value === null) return null;
  return value.replace(/\r\n|\r|\n/g, "\\n");
}

/**
 * Normalizes a raw AI-extracted object into a strict CrmRecord shape,
 * coercing enums and stripping anything that doesn't match the schema.
 */
export function normalizeAiRecord(raw: Record<string, unknown>): CrmRecord {
  return {
    created_at: coerceDate(raw.created_at),
    name: cleanString(raw.name),
    email: cleanString(raw.email)?.toLowerCase() ?? null,
    country_code: cleanString(raw.country_code),
    mobile_without_country_code: cleanString(raw.mobile_without_country_code),
    company: cleanString(raw.company),
    city: cleanString(raw.city),
    state: cleanString(raw.state),
    country: cleanString(raw.country),
    lead_owner: cleanString(raw.lead_owner),
    crm_status: coerceCrmStatus(raw.crm_status),
    crm_note: sanitizeMultiline(cleanString(raw.crm_note)),
    data_source: coerceDataSource(raw.data_source),
    possession_time: cleanString(raw.possession_time),
    description: sanitizeMultiline(cleanString(raw.description)),
  };
}

/**
 * Per assignment rule 7: a record must have an email OR a mobile number,
 * otherwise it is skipped.
 */
export function isImportable(record: CrmRecord): boolean {
  return Boolean(record.email) || Boolean(record.mobile_without_country_code);
}
