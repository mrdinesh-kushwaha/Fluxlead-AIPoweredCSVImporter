"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface TopPaginationControlsProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
}

/**
 * "Rows per page: [10] · Page X of Y · < >" — a single compact line that
 * sits above the table, matching the reference SaaS-table pattern. Distinct
 * from PaginationBar (used on the Results screen), which is the larger
 * centered/circle-button style better suited to a taller results panel.
 */
export function TopPaginationControls({
  page,
  totalPages,
  onPageChange,
  pageSize,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
}: TopPaginationControlsProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 text-xs text-mist-400">
      <div className="flex items-center gap-2">
        <span>Rows per page:</span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          aria-label="Rows per page"
          className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-mist-100 outline-none focus-visible:border-flow-purple"
        >
          {pageSizeOptions.map((size) => (
            <option key={size} value={size} className="bg-ink-800 text-mist-100">
              {size}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <span className="whitespace-nowrap text-mist-100">
          Page {page} of {totalPages}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            aria-label="Previous page"
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 text-mist-300 transition-colors hover:bg-white/10 hover:text-mist-100 disabled:pointer-events-none disabled:opacity-30"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages}
            aria-label="Next page"
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 text-mist-300 transition-colors hover:bg-white/10 hover:text-mist-100 disabled:pointer-events-none disabled:opacity-30"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
