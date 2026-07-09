import { useMemo, useState } from "react";

export interface UsePaginationResult<T> {
  pageItems: T[];
  page: number;
  setPage: (page: number) => void;
  totalPages: number;
  pageSize: number;
  setPageSize: (size: number) => void;
  totalItems: number;
  rangeStart: number;
  rangeEnd: number;
}

/**
 * Slices a (potentially large — hundreds or thousands of rows) array into
 * pages, so the DOM only ever renders `pageSize` rows at once. This is what
 * keeps the UI fast and scroll-light no matter how big the CSV import is —
 * 5 rows or 10,000 rows render identically fast.
 */
export function usePagination<T>(items: T[], initialPageSize = 25): UsePaginationResult<T> {
  const [page, setPageRaw] = useState(1);
  const [pageSize, setPageSizeRaw] = useState(initialPageSize);

  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(page, totalPages);

  const pageItems = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, safePage, pageSize]);

  function setPage(next: number) {
    setPageRaw(Math.min(Math.max(1, next), totalPages));
  }

  function setPageSize(size: number) {
    setPageSizeRaw(size);
    setPageRaw(1);
  }

  const rangeStart = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const rangeEnd = Math.min(safePage * pageSize, totalItems);

  return {
    pageItems,
    page: safePage,
    setPage,
    totalPages,
    pageSize,
    setPageSize,
    totalItems,
    rangeStart,
    rangeEnd,
  };
}
