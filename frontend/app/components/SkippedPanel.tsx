"use client";

import { useMemo, useState } from "react";
import { XCircle, Search } from "lucide-react";
import { SkippedRecord } from "../lib/types";
import { usePagination } from "../lib/usePagination";
import { PaginationBar } from "./PaginationBar";

export function SkippedPanel({ skipped }: { skipped: SkippedRecord[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return skipped;
    return skipped.filter(
      (s) =>
        Object.values(s.rawRow).some((v) => v?.toLowerCase().includes(q)) ||
        s.reason.toLowerCase().includes(q)
    );
  }, [skipped, query]);

  const { pageItems, page, setPage, totalPages, pageSize, setPageSize, totalItems, rangeStart, rangeEnd } =
    usePagination(filtered, 10);

  return (
    <div className="glass-panel flex h-full flex-col overflow-hidden rounded-2xl shadow-glass">
      <div className="flex items-center justify-between gap-2 border-b border-white/10 px-4 py-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-signal-danger">
          <XCircle className="h-4 w-4" />
          Skipped Leads ({skipped.length})
        </h3>
      </div>

      <div className="border-b border-white/10 p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-mist-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search skipped leads…"
            className="w-full rounded-lg border border-white/10 bg-white/5 py-1.5 pl-8 pr-3 text-xs text-mist-100 outline-none placeholder:text-mist-400 focus-visible:border-flow-purple"
          />
        </div>
      </div>

      <div className="max-h-[32vh] flex-1 divide-y divide-white/10 overflow-y-auto">
        {pageItems.map((s, idx) => (
          <div key={idx} className="table-row-zebra px-4 py-3">
            <span className="truncate text-sm font-medium text-mist-100">
              {s.rawRow[Object.keys(s.rawRow)[0]] || "Row"}
            </span>
            <p className="mt-0.5 line-clamp-2 text-xs text-signal-danger/90">{s.reason}</p>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="px-4 py-10 text-center text-sm text-mist-400">
            {query ? "No matches for your search." : "Nothing was skipped — great CSV!"}
          </div>
        )}
      </div>

      <PaginationBar
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        rangeStart={rangeStart}
        rangeEnd={rangeEnd}
        totalItems={totalItems}
        itemLabel="skipped"
        pageSizeOptions={[10, 25, 50]}
      />
    </div>
  );
}
