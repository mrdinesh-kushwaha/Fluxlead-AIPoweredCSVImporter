"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { RawCsvRow } from "../lib/types";
import { usePagination } from "../lib/usePagination";
import { TopPaginationControls } from "./TopPaginationControls";

interface PreviewTableProps {
  headers: string[];
  rows: RawCsvRow[];
}

/**
 * Shows exactly `pageSize` rows at a time (default 10) — no internal
 * vertical scroll needed since pagination already caps what's rendered.
 * Only horizontal scroll remains, for CSVs with many columns. Renders a
 * real table on sm+ screens and a stacked card list on mobile.
 */
export function PreviewTable({ headers, rows }: PreviewTableProps) {
  const [query, setQuery] = useState("");

  // Match against whichever detected columns look like name/email/city;
  // falls back to all columns if the CSV has none of those headers.
  const searchHeaders = useMemo(() => {
    const matches = headers.filter((h) => /name|email|city/i.test(h));
    return matches.length > 0 ? matches : headers;
  }, [headers]);

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) => searchHeaders.some((h) => (row[h] || "").toLowerCase().includes(q)));
  }, [rows, searchHeaders, query]);

  const { pageItems, page, setPage, totalPages, pageSize, setPageSize, rangeStart } = usePagination(
    filteredRows,
    10
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-sm font-semibold text-mist-100">
          Data preview
          {query && (
            <span className="ml-2 font-normal text-mist-400">
              ({filteredRows.length.toLocaleString()} match{filteredRows.length === 1 ? "" : "es"})
            </span>
          )}
        </h3>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-56">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-mist-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, email, city…"
              className="w-full rounded-lg border border-white/10 bg-white/5 py-1.5 pl-8 pr-3 text-xs text-mist-100 outline-none placeholder:text-mist-400 focus-visible:border-flow-purple"
            />
          </div>
          <TopPaginationControls
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            pageSize={pageSize}
            onPageSizeChange={setPageSize}
          />
        </div>
      </div>

      {filteredRows.length === 0 ? (
        <div className="glass-panel rounded-2xl px-4 py-10 text-center text-sm text-mist-400 shadow-glass">
          No rows match &quot;{query}&quot;
        </div>
      ) : (
      <div className="glass-panel overflow-hidden rounded-2xl shadow-glass">
        {/* Desktop / tablet: real table — horizontal scroll only, no vertical scroll */}
        <div className="hidden overflow-x-auto sm:block">
          <table className="w-full min-w-max border-collapse text-left text-sm">
            <thead className="sticky top-0 z-10 bg-ink-800/95 backdrop-blur">
              <tr>
                <th className="whitespace-nowrap px-4 py-3 font-mono text-[11px] font-medium text-mist-400">
                  #
                </th>
                {headers.map((h) => (
                  <th
                    key={h}
                    className="whitespace-nowrap px-4 py-3 font-display text-[11px] font-semibold uppercase tracking-wider text-mist-300"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageItems.map((row, idx) => (
                <tr
                  key={idx}
                  className="table-row-zebra border-t border-white/10 transition-colors hover:bg-white/[0.035]"
                >
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-mist-400">
                    {rangeStart + idx}
                  </td>
                  {headers.map((h) => (
                    <td
                      key={h}
                      className="max-w-[260px] truncate whitespace-nowrap px-4 py-3 text-[13.5px] leading-relaxed text-mist-100/90"
                      title={row[h]}
                    >
                      {row[h] || <span className="text-mist-400/50">—</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile: stacked cards, one per row — no forced scroll container either */}
        <div className="divide-y divide-white/10 sm:hidden">
          {pageItems.map((row, idx) => (
            <div key={idx} className="px-4 py-3.5">
              <div className="mb-2 font-mono text-[11px] text-mist-400">Row {rangeStart + idx}</div>
              <dl className="space-y-2">
                {headers.map((h) => (
                  <div key={h} className="flex items-baseline justify-between gap-3">
                    <dt className="shrink-0 text-[11px] font-medium uppercase tracking-wide text-mist-400">
                      {h}
                    </dt>
                    <dd className="truncate text-right text-[15px] leading-snug text-mist-100/90" title={row[h]}>
                      {row[h] || <span className="text-mist-400/50">—</span>}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
      </div>
      )}
    </div>
  );
}
