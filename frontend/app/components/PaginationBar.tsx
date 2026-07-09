"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import clsx from "clsx";

interface PaginationBarProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  rangeStart: number;
  rangeEnd: number;
  totalItems: number;
  itemLabel?: string;
  pageSizeOptions?: number[];
}

/** Builds a compact page list like [1, "…", 4, 5, 6, "…", 42] */
function buildPageList(page: number, totalPages: number): (number | "…")[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);

  const pages: (number | "…")[] = [1];
  if (page > 3) pages.push("…");

  const start = Math.max(2, page - 1);
  const end = Math.min(totalPages - 1, page + 1);
  for (let p = start; p <= end; p++) pages.push(p);

  if (page < totalPages - 2) pages.push("…");
  pages.push(totalPages);
  return pages;
}

const circleButton =
  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium transition-colors";

export function PaginationBar({
  page,
  totalPages,
  onPageChange,
  pageSize,
  onPageSizeChange,
  rangeStart,
  rangeEnd,
  totalItems,
  itemLabel = "rows",
  pageSizeOptions = [25, 50, 100],
}: PaginationBarProps) {
  if (totalItems === 0) return null;

  return (
    <div className="flex flex-col items-center gap-2.5 border-t border-white/10 px-4 py-5">
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          aria-label="Previous page"
          className={clsx(
            circleButton,
            "bg-white/5 text-mist-300 hover:bg-white/10 hover:text-mist-100 disabled:pointer-events-none disabled:opacity-30"
          )}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {buildPageList(page, totalPages).map((p, idx) =>
          p === "…" ? (
            <span key={`ellipsis-${idx}`} className="px-1 text-xs text-mist-400">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              aria-current={p === page ? "page" : undefined}
              className={clsx(
                circleButton,
                p === page
                  ? "bg-flow-gradient text-white shadow-glow"
                  : "bg-white/5 text-mist-300 hover:bg-white/10 hover:text-mist-100"
              )}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          aria-label="Next page"
          className={clsx(
            circleButton,
            "bg-white/5 text-mist-300 hover:bg-white/10 hover:text-mist-100 disabled:pointer-events-none disabled:opacity-30"
          )}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="flex items-center gap-3 text-[11px] text-mist-400">
        <span>
          Showing <span className="font-medium text-mist-100">{rangeStart}–{rangeEnd}</span> of{" "}
          <span className="font-medium text-mist-100">{totalItems}</span> {itemLabel}
        </span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          aria-label="Rows per page"
          className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-mist-300 outline-none focus-visible:border-flow-purple"
        >
          {pageSizeOptions.map((size) => (
            <option key={size} value={size} className="bg-ink-800 text-mist-100">
              {size} / page
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
