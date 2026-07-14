"use client";

import { createContext, useContext, useRef } from "react";
import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";
import { FlowRail } from "./FlowRail";
import { ThemeToggle } from "./ThemeToggle";
import { FlowStep } from "../lib/types";

function stepFromPath(pathname: string): FlowStep {
  const p = pathname.replace(/\/+$/, "") || "/";
  if (p.startsWith("/preview")) return "preview";
  if (p.startsWith("/processing")) return "processing";
  if (p.startsWith("/results")) return "results";
  return "upload";
}

const ScrollContainerContext = createContext<React.RefObject<HTMLDivElement> | null>(null);

/** Lets any descendant page read scroll position/direction of the shared
 * scrollable content area — used to auto-hide the stats bar on scroll. */
export function useScrollContainer() {
  return useContext(ScrollContainerContext);
}

/**
 * Wraps every route (`/`, `/preview`, `/processing`, `/results`). The logo,
 * theme toggle, and step rail persist across real navigations — only the
 * `{children}` slot (the actual routed page) changes underneath them.
 */
export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const step = stepFromPath(pathname || "/");
  const scrollRef = useRef<HTMLDivElement>(null);
  const isUpload = step === "upload";

  return (
    <main className="relative h-screen overflow-hidden bg-flow-radial">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-ink-900" />
      <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[420px] w-[900px] -translate-x-1/2 rounded-full bg-flow-violet/20 blur-[140px]" />

      <div className="relative z-10 mx-auto flex h-full max-w-6xl flex-col gap-3 px-6 py-4 sm:px-8 sm:py-5">
        <header className="flex shrink-0 items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-flow-gradient shadow-glow">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="font-display text-sm font-semibold leading-none text-mist-100">
                IntelliImport
              </p>
              <p className="text-[10px] leading-none text-mist-400">AI CRM Importer</p>
            </div>
          </div>
          <ThemeToggle />
        </header>

        <div className="shrink-0">
          <FlowRail current={step} />
        </div>

        <ScrollContainerContext.Provider value={scrollRef}>
          <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto pb-1">
            {children}
          </div>
        </ScrollContainerContext.Provider>

      </div>
    </main>
  );
}
