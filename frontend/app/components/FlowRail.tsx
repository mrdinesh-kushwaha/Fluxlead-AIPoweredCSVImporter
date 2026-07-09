"use client";

import { motion } from "framer-motion";
import { Upload, Table2, Sparkles, ListChecks } from "lucide-react";
import clsx from "clsx";
import { FlowStep } from "../lib/types";

const STEPS: { key: FlowStep; label: string; icon: typeof Upload }[] = [
  { key: "upload", label: "Upload", icon: Upload },
  { key: "preview", label: "Preview", icon: Table2 },
  { key: "processing", label: "AI Mapping", icon: Sparkles },
  { key: "results", label: "Results", icon: ListChecks },
];

export function FlowRail({ current }: { current: FlowStep }) {
  const currentIndex = STEPS.findIndex((s) => s.key === current);
  const progressPct = (currentIndex / (STEPS.length - 1)) * 100;

  return (
    <div className="relative mx-auto w-full max-w-2xl px-4">
      <div className="absolute left-0 right-0 top-4 mx-4 h-[2px] bg-white/10" />
      <motion.div
        className="absolute left-0 top-4 mx-4 h-[2px] bg-flow-gradient"
        initial={{ width: 0 }}
        animate={{ width: `${progressPct}%` }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        style={{ maxWidth: "calc(100% - 2rem)" }}
      />

      <div className="relative flex justify-between">
        {STEPS.map((step, idx) => {
          const isDone = idx < currentIndex;
          const isActive = idx === currentIndex;
          const Icon = step.icon;

          return (
            <div key={step.key} className="flex flex-col items-center gap-2">
              <motion.div
                animate={
                  isActive
                    ? { scale: [1, 1.12, 1] }
                    : { scale: 1 }
                }
                transition={{ duration: 1.6, repeat: isActive ? Infinity : 0, ease: "easeInOut" }}
                className={clsx(
                  "flex h-8 w-8 items-center justify-center rounded-full border transition-colors duration-300",
                  isDone && "border-transparent bg-flow-gradient text-white",
                  isActive && "border-flow-purple bg-ink-800 text-flow-purple shadow-glow",
                  !isDone && !isActive && "border-white/15 bg-ink-800 text-mist-400"
                )}
              >
                <Icon className="h-4 w-4" strokeWidth={2} />
              </motion.div>
              <span
                className={clsx(
                  "text-xs font-medium",
                  isActive ? "text-mist-100" : "text-mist-400"
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
