"use client";

import { useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";
import { UploadCloud, FileSpreadsheet, AlertCircle } from "lucide-react";
import clsx from "clsx";

interface UploadZoneProps {
  onFileSelected: (file: File) => void;
  isUploading: boolean;
  error: string | null;
}

const MAX_SIZE_MB = 5;

const FAKE_UPLOAD_MS = 2000;

export function UploadZone({ onFileSelected, isUploading, error }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateAndEmit = useCallback(
    (file: File | undefined) => {
      if (!file) return;
      setLocalError(null);

      if (!file.name.toLowerCase().endsWith(".csv")) {
        setLocalError("Only .csv files are supported.");
        return;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        setLocalError(`File exceeds the ${MAX_SIZE_MB}MB limit.`);
        return;
      }

      setIsSimulating(true);
      setProgress(0);
      const start = Date.now();
      const timer = setInterval(() => {
        const elapsed = Date.now() - start;
        const pct = Math.min(100, Math.round((elapsed / FAKE_UPLOAD_MS) * 100));
        setProgress(pct);
        if (elapsed >= FAKE_UPLOAD_MS) {
          clearInterval(timer);
          setIsSimulating(false);
          onFileSelected(file);
        }
      }, 40);
    },
    [onFileSelected]
  );

  const displayError = error || localError;

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          validateAndEmit(e.dataTransfer.files?.[0]);
        }}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        aria-label="Upload CSV file"
        className={clsx(
          "relative cursor-pointer overflow-hidden rounded-3xl glass-panel px-8 py-10 text-center transition-all duration-300 shadow-glass",
          isDragging ? "border-flow-purple/70 shadow-glow scale-[1.01]" : "hover:border-white/20"
        )}
      >
        <div
          className={clsx(
            "absolute inset-0 opacity-0 transition-opacity duration-500 bg-flow-radial",
            isDragging && "opacity-100"
          )}
        />

        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => validateAndEmit(e.target.files?.[0] ?? undefined)}
        />

        <div className="relative z-10 flex flex-col items-center gap-5">
          <motion.div
            animate={isDragging ? { scale: 1.1, rotate: -4 } : { scale: 1, rotate: 0 }}
            className="flex h-16 w-16 items-center justify-center rounded-2xl bg-flow-gradient shadow-glow"
          >
            {isSimulating || isUploading ? (
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            ) : (
              <UploadCloud className="h-7 w-7 text-white" strokeWidth={1.75} />
            )}
          </motion.div>

          {isSimulating ? (
            <div className="w-full max-w-xs space-y-2.5">
              <p className="text-sm text-mist-400">uploading {progress}%</p>
              <div className="h-2 w-full overflow-hidden rounded-full border border-white/10 bg-white/5">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-sky-400 via-flow-purple to-flow-pink"
                  style={{ width: `${progress}%` }}
                  transition={{ ease: "linear" }}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <h3 className="font-display text-xl font-semibold text-mist-100">
                {isUploading ? "Reading your file…" : "Drop your CSV file here"}
              </h3>
              <p className="text-sm text-mist-400">
                {isUploading ? "Parsing rows and columns" : "or click to browse from your device"}
              </p>
            </div>
          )}

          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-mist-400">
            <FileSpreadsheet className="h-3.5 w-3.5" />
            Any column layout · .csv · up to {MAX_SIZE_MB}MB
          </div>
        </div>
      </motion.div>

      {displayError && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 flex items-center gap-2 rounded-xl border border-signal-danger/30 bg-signal-danger/10 px-4 py-3 text-sm text-signal-danger"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          {displayError}
        </motion.div>
      )}
    </div>
  );
}
