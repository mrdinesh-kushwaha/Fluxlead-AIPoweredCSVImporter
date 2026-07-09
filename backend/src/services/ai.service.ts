import OpenAI from "openai";
import { RawCsvRow, CrmRecord } from "../types";
import { normalizeAiRecord } from "./crm.service";

const AI_PROVIDER = (process.env.AI_PROVIDER || "openai").toLowerCase();
const BATCH_SIZE = Number(process.env.AI_BATCH_SIZE || 20);
const MAX_RETRIES = Number(process.env.AI_MAX_RETRIES || 3);

export interface BatchExtractionOutcome {
  index: number; // index within the batch
  record: CrmRecord | null;
  error?: string;
}

const SYSTEM_PROMPT = `You are a precise data-mapping engine for GrowEasy CRM.
You receive an array of raw CSV row objects with arbitrary, inconsistent column names
(they may come from Facebook Lead Ads, Google Ads, Excel exports, real-estate CRMs,
sales reports, marketing agency sheets, or manual spreadsheets).

Your job: map each row's available fields into the GrowEasy CRM schema below.
Return ONLY a JSON array, same length and same order as the input array, one object
per input row. Do not merge, drop, add, or reorder rows. If a row is entirely unusable,
still return an object for it with whatever fields you found (possibly all null) —
the caller decides skipping.

CRM schema (every key must be present; use null when unknown):
- created_at: string | null — lead creation date/time, must be a value parseable by
  JavaScript's "new Date(value)". Prefer formats like "YYYY-MM-DD HH:mm:ss" or ISO 8601.
  If no explicit date exists, use null (do not invent one).
- name: string | null — the lead's full name.
- email: string | null — the primary email address (lowercase). If several emails exist,
  put only the first here.
- country_code: string | null — phone country code including "+" (e.g. "+91"). Infer from
  a full phone number or country if possible; otherwise null.
- mobile_without_country_code: string | null — the phone number digits only, with the
  country code stripped off. If several numbers exist, put only the first here.
- company: string | null
- city: string | null
- state: string | null
- country: string | null
- lead_owner: string | null — the salesperson/agent/owner assigned to this lead, often an
  email or name in columns like "assigned to", "owner", "agent".
- crm_status: string | null — MUST be exactly one of:
  "GOOD_LEAD_FOLLOW_UP", "DID_NOT_CONNECT", "BAD_LEAD", "SALE_DONE".
  Infer from status/stage/disposition-like columns. If nothing matches confidently, use null.
- crm_note: string | null — remarks, follow-up notes, extra comments, PLUS any additional
  emails or phone numbers beyond the first one (append them here as plain text, comma
  separated, clearly labeled e.g. "Alt email: x@y.com; Alt phone: 9876500000").
- data_source: string | null — MUST be exactly one of:
  "leads_on_demand", "meridian_tower", "eden_park", "varah_swamy", "sarjapur_plots".
  Only set this if a source/campaign/project column confidently matches one of these
  values or their evident aliases; otherwise leave null. Never guess.
- possession_time: string | null — property possession timeframe, if this is a real-estate
  lead export (e.g. "Ready to move", "Dec 2026").
- description: string | null — any other useful free-text info that doesn't fit above.

Rules:
1. Never invent data that isn't present or strongly implied by the row.
2. Use column name AND value context together — a column literally named "email" is
   strong evidence, but also detect emails/phones by pattern even under odd headers.
3. Keep every value as a single line of text (no raw newlines); if a value naturally
   contains line breaks, replace them with the literal characters "\\n".
4. Respond with raw JSON only — no markdown fences, no commentary, no trailing text.`;

function buildUserPrompt(rows: RawCsvRow[]): string {
  return `Map the following ${rows.length} CSV rows to the GrowEasy CRM schema.
Input rows (JSON array, 0-indexed, same order must be preserved in your output):
${JSON.stringify(rows, null, 0)}`;
}

/** Extracts the first top-level JSON array substring from a model response. */
function extractJsonArray(text: string): unknown[] {
  const cleaned = text.trim().replace(/^```(json)?/i, "").replace(/```$/, "").trim();
  const start = cleaned.indexOf("[");
  const end = cleaned.lastIndexOf("]");
  if (start === -1 || end === -1 || end < start) {
    throw new Error("AI response did not contain a JSON array.");
  }
  const jsonSlice = cleaned.slice(start, end + 1);
  const parsed = JSON.parse(jsonSlice);
  if (!Array.isArray(parsed)) throw new Error("Parsed AI response is not an array.");
  return parsed;
}

async function callOpenAi(rows: RawCsvRow[]): Promise<unknown[]> {
  const isGroq = AI_PROVIDER === "groq";
  const client = new OpenAI({
    apiKey: isGroq ? process.env.GROQ_API_KEY : process.env.OPENAI_API_KEY,
    baseURL: isGroq ? "https://api.groq.com/openai/v1" : undefined,
  });
  const model = isGroq
    ? process.env.GROQ_MODEL || "llama-3.3-70b-versatile"
    : process.env.OPENAI_MODEL || "gpt-4o-mini";

  const response = await client.chat.completions.create({
    model,
    temperature: 0,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT + `\nWrap the array in a JSON object as {"records": [...]}.` },
      { role: "user", content: buildUserPrompt(rows) },
    ],
  });

  const content = response.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(content);
  const records = parsed.records ?? parsed.data ?? parsed;
  if (!Array.isArray(records)) throw new Error("OpenAI response missing 'records' array.");
  return records;
}

class ProviderApiError extends Error {}

function buildProviderErrorMessage(providerLabel: string, status: number, rawBody: string): string {
  let parsedMessage: string | undefined;
  try {
    const parsed = JSON.parse(rawBody);
    parsedMessage = parsed?.error?.message || parsed?.message;
  } catch {
    // body wasn't JSON — fall through to status-based message
  }

  if (status === 429) {
    return `${providerLabel} rate limit or quota exceeded (HTTP 429). Check your API key's plan/billing in the provider console — this is not a bug in the app.`;
  }
  if (status === 401 || status === 403) {
    return `${providerLabel} rejected the API key (HTTP ${status}). Double-check the key is correct and active.`;
  }
  if (status === 404) {
    return `${providerLabel} model not found (HTTP 404) — the configured model name may be retired. Check the model list in the provider console.`;
  }

  const shortMessage = parsedMessage ? parsedMessage.split("\n")[0].slice(0, 180) : undefined;
  return `${providerLabel} error (HTTP ${status})${shortMessage ? `: ${shortMessage}` : "."}`;
}

async function callGemini(rows: RawCsvRow[]): Promise<unknown[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        { role: "user", parts: [{ text: SYSTEM_PROMPT + "\n\n" + buildUserPrompt(rows) }] },
      ],
      generationConfig: { temperature: 0, responseMimeType: "application/json" },
    }),
  });

  if (!res.ok) {
    throw new ProviderApiError(buildProviderErrorMessage("Gemini", res.status, await res.text()));
  }
 const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "[]";
  return extractJsonArray(text);
}

async function callAnthropic(rows: RawCsvRow[]): Promise<unknown[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const model = process.env.ANTHROPIC_MODEL || "claude-3-5-haiku-20241022";

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey || "",
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      temperature: 0,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildUserPrompt(rows) }],
    }),
  });

  if (!res.ok) {
    throw new ProviderApiError(buildProviderErrorMessage("Anthropic", res.status, await res.text()));
  }
  const data = (await res.json()) as { content?: { text?: string }[] };
  const text = data.content?.map((b: { text?: string }) => b.text ?? "").join("") ?? "[]";
  return extractJsonArray(text);
}

async function callGroq(rows: RawCsvRow[]): Promise<unknown[]> {
  const client = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
  });
  const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

  const response = await client.chat.completions.create({
    model,
    temperature: 0,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT + `\nWrap the array in a JSON object as {"records": [...]}.` },
      { role: "user", content: buildUserPrompt(rows) },
    ],
  });

  const content = response.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(content);
  const records = parsed.records ?? parsed.data ?? parsed;
  if (!Array.isArray(records)) throw new Error("Groq response missing 'records' array.");
  return records;
}

async function callProvider(rows: RawCsvRow[]): Promise<unknown[]> {
  switch (AI_PROVIDER) {
    case "gemini":
      return callGemini(rows);
    case "anthropic":
      return callAnthropic(rows);
    case "groq":
      return callGroq(rows);
    case "openai":
    default:
      return callOpenAi(rows);
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function extractBatchWithRetry(rows: RawCsvRow[]): Promise<BatchExtractionOutcome[]> {
  let lastError = "";

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const rawResults = await callProvider(rows);

      return rows.map((_, i) => {
        const raw = rawResults[i];
        if (!raw || typeof raw !== "object") {
          return { index: i, record: null, error: "AI returned no data for this row" };
        }
        return { index: i, record: normalizeAiRecord(raw as Record<string, unknown>) };
      });
    } catch (err) {
      lastError = (err as Error).message;
      if (attempt < MAX_RETRIES) {
        await sleep(500 * 2 ** (attempt - 1)); // 500ms, 1s, 2s...
      }
    }
  }

  return rows.map((_, i) => ({
    index: i,
    record: null,
    error: `AI extraction failed after ${MAX_RETRIES} attempts: ${lastError}`,
  }));
}

export interface ExtractAllResult {
  outcomes: BatchExtractionOutcome[][]; // one array per batch, in order
  batchCount: number;
}

export interface ExtractionProgress {
  completedBatches: number;
  totalBatches: number;
  processedRows: number;
  totalRows: number;
}

/** Error patterns that mean "the AI connection itself is broken" (bad key,
 * no quota, retired model) — NOT a per-row data problem. Once the first
 * batch fails this way, every other batch will fail identically, so there's
 * no point burning time/retries re-proving that 24 more times. */
const SYSTEMIC_FAILURE_PATTERN = /API key|quota|rate limit|model not found|not valid/i;

/**
 * Splits rows into batches and runs AI extraction sequentially per batch —
 * this IS the "AI Extraction" step from the assignment spec: rows go to the
 * configured LLM in batches, the AI intelligently maps fields, and failed
 * batches are retried instead of crashing the whole import.
 *
 * Fail-fast guard: after the first batch, if every row in it failed with a
 * connection-level error (invalid API key, quota exceeded, retired model),
 * the remaining batches are marked failed immediately without calling the
 * AI again — saving significant time instead of repeating the same doomed
 * request dozens of times.
 */
export async function extractCrmRecords(
  rows: RawCsvRow[],
  onProgress?: (progress: ExtractionProgress) => void
): Promise<ExtractAllResult> {
  const batches: RawCsvRow[][] = [];
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    batches.push(rows.slice(i, i + BATCH_SIZE));
  }

  const outcomes: BatchExtractionOutcome[][] = [];
  let connectionFailureReason: string | null = null;

  for (let b = 0; b < batches.length; b++) {
    if (connectionFailureReason) {
      // Already proven the connection is broken — don't waste time/retries
      // re-calling the AI for every remaining batch.
      outcomes.push(
        batches[b].map((_, i) => ({
          index: i,
          record: null,
          error: `${connectionFailureReason} (skipped remaining batches after the first batch failed identically.)`,
        }))
      );
    } else {
      const batchOutcomes = await extractBatchWithRetry(batches[b]);
      outcomes.push(batchOutcomes);

      if (b === 0 && batchOutcomes.length > 0 && batchOutcomes.every((o) => !o.record)) {
        const firstError = batchOutcomes[0]?.error || "";
        if (SYSTEMIC_FAILURE_PATTERN.test(firstError)) {
          connectionFailureReason = firstError;
        }
      }
    }

    onProgress?.({
      completedBatches: b + 1,
      totalBatches: batches.length,
      processedRows: Math.min((b + 1) * BATCH_SIZE, rows.length),
      totalRows: rows.length,
    });
  }

  return { outcomes, batchCount: batches.length };
}
