"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Search } from "lucide-react";
import clsx from "clsx";
import { CrmRecord } from "../lib/types";
import { usePagination } from "../lib/usePagination";
import { PaginationBar } from "./PaginationBar";

const STATUS_STYLES: Record<string, string> = {
  GOOD_LEAD_FOLLOW_UP: "bg-signal-success/10 text-signal-success border-signal-success/30",
  DID_NOT_CONNECT: "bg-signal-warning/10 text-signal-warning border-signal-warning/30",
  BAD_LEAD: "bg-signal-danger/10 text-signal-danger border-signal-danger/30",
  SALE_DONE: "bg-flow-purple/10 text-flow-purple border-flow-purple/30",
};

export function ImportedPanel({ leads }: { leads: CrmRecord[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return leads;
    return leads.filter((r) =>
      [r.name, r.email, r.mobile_without_country_code, r.company, r.city]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(q))
    );
  }, [leads, query]);

  const { pageItems, page, setPage, totalPages, pageSize, setPageSize, totalItems, rangeStart, rangeEnd } =
    usePagination(filtered, 10);

  return (
    <div className="glass-panel flex h-full flex-col overflow-hidden rounded-2xl shadow-glass">
      <div className="flex items-center justify-between gap-2 border-b border-white/10 px-4 py-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-signal-success">
          <CheckCircle2 className="h-4 w-4" />
          Imported Leads ({leads.length})
        </h3>
      </div>

      <div className="border-b border-white/10 p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-mist-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search imported leads…"
            className="w-full rounded-lg border border-white/10 bg-white/5 py-1.5 pl-8 pr-3 text-xs text-mist-100 outline-none placeholder:text-mist-400 focus-visible:border-flow-purple"
          />
        </div>
      </div>

      <div className="max-h-[42vh] flex-1 divide-y divide-white/10 overflow-y-auto">
        {pageItems.map((r, idx) => (
          <div key={idx} className="table-row-zebra px-4 py-3">
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-sm font-medium text-mist-100">
                {r.name || <span className="text-mist-400/50">No name</span>}
              </span>
              {r.crm_status && (
                <span
                  className={clsx(
                    "shrink-0 whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] font-medium",
                    STATUS_STYLES[r.crm_status] ?? "border-white/10 bg-white/5 text-mist-300"
                  )}
                >
                  {r.crm_status.replaceAll("_", " ")}
                </span>
              )}
            </div>
            <div className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-mist-400">
              {r.email && <span className="truncate">{r.email}</span>}
              {r.mobile_without_country_code && <span>{r.mobile_without_country_code}</span>}
              {r.city && <span>{r.city}</span>}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="px-4 py-10 text-center text-sm text-mist-400">
            {query ? "No matches for your search." : "No records were imported from this file."}
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
        itemLabel="imported"
        pageSizeOptions={[10, 25, 50]}
      />
    </div>
  );
}
