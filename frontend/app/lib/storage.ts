import { ParsedImportResult, UploadPreviewResponse } from "./types";

const KEYS = {
  preview: "fluxlead:preview",
  results: "fluxlead:results",
  importError: "fluxlead:importError",
} as const;

function isBrowser() {
  return typeof window !== "undefined";
}

/**
 * Preview and results data live in sessionStorage (not global React state)
 * because each step is a real route (`/`, `/preview`, `/processing`,
 * `/results`). A hard refresh or direct link on any of those pages needs
 * to still find its data — sessionStorage survives client-side navigation
 * and page refreshes within the same tab, and clears itself when the tab
 * closes (nothing lingers like it would with localStorage).
 */
export function savePreview(data: UploadPreviewResponse) {
  if (!isBrowser()) return;
  sessionStorage.setItem(KEYS.preview, JSON.stringify(data));
}

export function loadPreview(): UploadPreviewResponse | null {
  if (!isBrowser()) return null;
  const raw = sessionStorage.getItem(KEYS.preview);
  return raw ? (JSON.parse(raw) as UploadPreviewResponse) : null;
}

export function saveResults(data: ParsedImportResult) {
  if (!isBrowser()) return;
  sessionStorage.setItem(KEYS.results, JSON.stringify(data));
}

export function loadResults(): ParsedImportResult | null {
  if (!isBrowser()) return null;
  const raw = sessionStorage.getItem(KEYS.results);
  return raw ? (JSON.parse(raw) as ParsedImportResult) : null;
}

export function saveImportError(message: string) {
  if (!isBrowser()) return;
  sessionStorage.setItem(KEYS.importError, message);
}

/** Reads the pending error (if any) and clears it so it only shows once. */
export function loadAndClearImportError(): string | null {
  if (!isBrowser()) return null;
  const message = sessionStorage.getItem(KEYS.importError);
  if (message) sessionStorage.removeItem(KEYS.importError);
  return message;
}

export function clearAll() {
  if (!isBrowser()) return;
  sessionStorage.removeItem(KEYS.preview);
  sessionStorage.removeItem(KEYS.results);
  sessionStorage.removeItem(KEYS.importError);
}
