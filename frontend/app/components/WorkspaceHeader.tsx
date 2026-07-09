"use client";

import { motion } from "framer-motion";
import { BarChart3, LucideIcon } from "lucide-react";
import clsx from "clsx";

interface WorkspaceHeaderProps {
  title: string;
  subtitle?: string;
  titleIcon?: LucideIcon;
  actionLabel?: string;
  actionIcon?: LucideIcon;
  onAction?: () => void;
  titleTone?: "default" | "warning" | "success" | "danger";
}

const TONE_STYLES: Record<NonNullable<WorkspaceHeaderProps["titleTone"]>, string> = {
  default: "text-mist-100",
  warning: "text-signal-warning",
  success: "text-signal-success",
  danger: "text-signal-danger",
};

export function WorkspaceHeader({
  title,
  subtitle,
  titleIcon: TitleIcon,
  actionLabel,
  actionIcon: ActionIcon = BarChart3,
  onAction,
  titleTone = "default",
}: WorkspaceHeaderProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-4 flex items-center justify-between border-b border-white/10 pb-3"
    >
      <div>
        <h2
          className={clsx(
            "flex items-center gap-2 font-display text-lg font-semibold sm:text-xl",
            TONE_STYLES[titleTone]
          )}
        >
          {TitleIcon && <TitleIcon className="h-5 w-5 shrink-0 sm:h-6 sm:w-6" />}
          {title}
        </h2>
        {subtitle && <p className="mt-0.5 text-xs text-mist-400">{subtitle}</p>}
      </div>
      {onAction && actionLabel && (
        <button
          onClick={onAction}
          className="flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-mist-400 transition-colors hover:bg-white/5 hover:text-mist-100"
        >
          <ActionIcon className="h-3.5 w-3.5" />
          {actionLabel}
        </button>
      )}
    </motion.section>
  );
}