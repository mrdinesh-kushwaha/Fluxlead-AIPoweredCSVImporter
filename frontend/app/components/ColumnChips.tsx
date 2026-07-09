"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

interface ColumnChipsProps {
  headers: string[];
  initialVisible?: number;
}

export function ColumnChips({ headers, initialVisible = 8 }: ColumnChipsProps) {
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return headers;
    return headers.filter((h) => h.toLowerCase().includes(q));
  }, [headers, query]);

  const visible = showAll || query ? filtered : filtered.slice(0, initialVisible);
  const hiddenCount = filtered.length - visible.length;

  return (
    // <div className="glass-panel rounded-2xl p-3.5 shadow-glass">
    //   <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    //     {/* <h3 className="text-sm font-semibold text-mist-100">Columns detected ({headers.length})</h3>
    //     <div className="relative w-full sm:w-56">
    //       <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-mist-400" />
    //       <input
    //         value={query}
    //         onChange={(e) => setQuery(e.target.value)}
    //         placeholder="Search column names…"
    //         className="w-full rounded-lg border border-white/10 bg-white/5 py-1.5 pl-8 pr-3 text-xs text-mist-100 outline-none placeholder:text-mist-400 focus-visible:border-flow-purple"
    //       />
    //     </div> */}
    //   </div>

    //   {/* <div className="mt-3 flex flex-wrap gap-1.5">
    //     {visible.map((h) => (
    //       <span
    //         key={h}
    //         className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-mist-300"
    //       >
    //         {h}
    //       </span>
    //     ))}
    //     {!showAll && !query && hiddenCount > 0 && (
    //       <button
    //         onClick={() => setShowAll(true)}
    //         className="rounded-full border border-flow-purple/30 bg-flow-purple/10 px-2.5 py-1 text-xs font-medium text-flow-purple transition-colors hover:bg-flow-purple/20"
    //       >
    //         +{hiddenCount} more
    //       </button>
    //     )}
    //     {filtered.length === 0 && (
    //       <span className="text-xs text-mist-400">No columns match &quot;{query}&quot;</span>
    //     )}
    //   </div> */}
    // </div>
    <>
    </>
  );
}
