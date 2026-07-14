"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { UploadZone } from "./components/UploadZone";
import { uploadCsvForPreview, ApiRequestError } from "./lib/api";
import { savePreview, clearAll } from "./lib/storage";

export default function UploadPage() {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handleFileSelected(file: File) {
    setIsUploading(true);
    setUploadError(null);
    try {
      const data = await uploadCsvForPreview(file);
      clearAll();
      savePreview(data);
      router.push("/preview");
    } catch (err) {
      const message =
        err instanceof ApiRequestError
          ? err.message
          : "Could not reach the import service. Check your connection and try again.";
      setUploadError(message);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="flex h-full flex-col items-center justify-center gap-8">
      <section className="shrink-0 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl font-display text-2xl font-semibold leading-tight text-mist-100 sm:text-[2rem]"
        >
          Any CSV. Any layout. <span className="text-gradient">One clean CRM import.</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08 }}
          className="mx-auto mt-1.5 max-w-xl text-xs text-mist-400 sm:text-sm"
        >
          Drop a Facebook Ads export, a Google Ads export, or a spreadsheet someone built by
          hand — Fluxlead's AI reads the columns and maps them into Easy CRM format.
        </motion.p>
      </section>

      <div className="w-full max-w-2xl">
        <UploadZone
          onFileSelected={handleFileSelected}
          isUploading={isUploading}
          error={uploadError}
        />
      </div>
    </div>
  );
}
