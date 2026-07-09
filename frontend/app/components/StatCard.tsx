"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import clsx from "clsx";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: "default" | "success" | "warning" | "gradient";
  delay?: number;
}

const toneStyles: Record<NonNullable<StatCardProps["tone"]>, string> = {
  default: "text-mist-100",
  success: "text-signal-success",
  warning: "text-signal-warning",
  gradient: "text-gradient",
};

const iconToneStyles: Record<NonNullable<StatCardProps["tone"]>, string> = {
  default: "bg-white/5 text-mist-300",
  success: "bg-signal-success/10 text-signal-success",
  warning: "bg-signal-warning/10 text-signal-warning",
  gradient: "bg-flow-gradient text-white",
};

export function StatCard({ label, value, icon: Icon, tone = "default", delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      className="min-w-0 glass-panel rounded-xl px-3.5 py-2.5 shadow-glass sm:px-4 sm:py-3"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-[10px] font-medium uppercase tracking-wide text-mist-400 sm:text-[11px]">
          {label}
        </span>
        <div
          className={clsx(
            "flex h-6 w-6 shrink-0 items-center justify-center rounded-md",
            iconToneStyles[tone]
          )}
        >
          <Icon className="h-3.5 w-3.5" strokeWidth={2} />
        </div>
      </div>
      <div
        className={clsx(
          "mt-1 truncate font-display text-lg font-semibold sm:text-xl",
          toneStyles[tone]
        )}
        title={String(value)}
      >
        {value}
      </div>
    </motion.div>
  );
}
