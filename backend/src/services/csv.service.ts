import { parse } from "csv-parse/sync";
import { RawCsvRow } from "../types";

export class CsvParseError extends Error {}

/**
 * Parses a raw CSV buffer into an array of row objects keyed by header.
 * Does NOT assume any fixed column names — headers are taken as-is from
 * the first row, trimmed and de-duplicated.
 */
export function parseCsvBuffer(buffer: Buffer): {
  headers: string[];
  rows: RawCsvRow[];
} {
  let records: Record<string, string>[];

  try {
    records = parse(buffer, {
      columns: (headerRow: string[]) => normalizeHeaders(headerRow),
      skip_empty_lines: true,
      trim: true,
      relax_column_count: true,
      bom: true,
    });
  } catch (err) {
    throw new CsvParseError(
      `Unable to parse CSV file: ${(err as Error).message}`
    );
  }

  if (records.length === 0) {
    throw new CsvParseError("The CSV file has no data rows.");
  }

  const headers = Object.keys(records[0]);
  return { headers, rows: records };
}

/** Trims whitespace and de-duplicates blank/duplicate header names. */
function normalizeHeaders(headerRow: string[]): string[] {
  const seen = new Map<string, number>();
  return headerRow.map((raw, idx) => {
    let h = (raw ?? "").trim();
    if (!h) h = `column_${idx + 1}`;
    const count = seen.get(h) ?? 0;
    seen.set(h, count + 1);
    return count === 0 ? h : `${h}_${count + 1}`;
  });
}
