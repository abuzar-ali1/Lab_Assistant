"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, ArrowLeft, ArrowRight, Check, FileCheck2, FileText, Image as ImageIcon, Loader2, LockKeyhole, ScanLine, ShieldCheck, UploadCloud, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import AppShell from "@/Components/AppShell";
import api from "@/lib/api";
import { getApiError } from "@/lib/errors";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ["application/pdf", "image/jpeg", "image/png"];
const phases = ["Securing your document", "Reading lab values", "Preparing the bilingual brief"];

export default function UploadPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [phase, setPhase] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!uploading) return;
    const interval = window.setInterval(() => setPhase((current) => Math.min(current + 1, phases.length - 1)), 2800);
    return () => window.clearInterval(interval);
  }, [uploading]);

  const validateFile = useCallback((selected: File) => {
    setError("");
    if (!ACCEPTED_TYPES.includes(selected.type)) {
      setFile(null);
      setError("Choose a PDF, JPG, or PNG lab report.");
      return;
    }
    if (selected.size > MAX_FILE_SIZE) {
      setFile(null);
      setError("This file is larger than 5 MB. Compress it or choose a smaller scan.");
      return;
    }
    setFile(selected);
  }, []);

  const clearFile = () => {
    setFile(null);
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setPhase(0);
    setError("");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const { data } = await api.post<{ id: number }>("/api/reports/upload/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (!data.id) throw new Error("Missing report id");
      window.location.assign(`/reports/${data.id}`);
    } catch (uploadError) {
      setError(getApiError(uploadError, "The analysis could not start. Check your connection and try again."));
      setUploading(false);
    }
  };

  return (
    <AppShell>
      <div className="px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-xl px-1 py-2 text-xs font-extrabold text-[var(--muted)] transition hover:text-[var(--brand-dark)]"><ArrowLeft className="h-4 w-4" /> Back to overview</Link>

          <div className="mt-6 grid gap-8 lg:grid-cols-[0.68fr_1.32fr] lg:gap-12">
            <aside className="lg:pt-6">
              <p className="eyebrow">New clarity brief</p>
              <h1 className="mt-5 text-3xl font-extrabold tracking-[-0.045em] text-[var(--ink)] sm:text-5xl">A clearer read starts with a clear scan.</h1>
              <p className="mt-5 text-sm leading-7 text-[var(--muted)] sm:text-base">Upload the complete lab report. We’ll keep the original values visible and organize the findings around what matters next.</p>

              <div className="mt-9 space-y-4">
                {[
                  { icon: FileCheck2, title: "Complete report", text: "Include every page and the laboratory’s reference ranges." },
                  { icon: ScanLine, title: "Sharp and readable", text: "Avoid shadows, glare, folds, and cropped test names." },
                  { icon: LockKeyhole, title: "Private workspace", text: "Only your signed-in account can open this analysis." },
                ].map(({ icon: Icon, title, text }, index) => (
                  <div key={title} className="flex gap-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[var(--brand)] shadow-sm"><Icon className="h-4 w-4" /></span>
                    <div><p className="text-sm font-extrabold text-[var(--ink)]">{index + 1}. {title}</p><p className="mt-1 text-xs leading-5 text-[var(--muted)]">{text}</p></div>
                  </div>
                ))}
              </div>

              <div className="mt-9 rounded-2xl border border-[#f0dfbb] bg-[var(--sun-pale)] p-4 text-xs leading-5 text-[#765422]">
                <b>Before you continue:</b> LabSaathi explains report content for education. It cannot diagnose a condition or recommend treatment.
              </div>
            </aside>

            <motion.section initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} className="surface-card relative overflow-hidden p-5 sm:p-8">
              <div className="flex items-center justify-between gap-4 border-b border-[var(--line)] pb-5">
                <div><h2 className="text-lg font-extrabold tracking-[-0.025em]">Upload report</h2><p className="mt-1 text-xs text-[var(--muted)]">PDF, JPG, or PNG · maximum 5 MB</p></div>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand-pale)] text-[var(--brand)]"><ShieldCheck className="h-5 w-5" /></span>
              </div>

              <div
                onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
                onDragLeave={(event) => { event.preventDefault(); setDragging(false); }}
                onDrop={(event) => { event.preventDefault(); setDragging(false); const dropped = event.dataTransfer.files[0]; if (dropped) validateFile(dropped); }}
                className={`relative mt-6 overflow-hidden rounded-3xl border-2 border-dashed transition duration-200 ${dragging ? "scale-[1.01] border-[var(--brand)] bg-[var(--brand-pale)]/65" : file ? "border-[var(--brand-soft)] bg-[#f3fbf7]" : "border-[#c8d8d2] bg-[var(--surface-soft)]/55 hover:border-[var(--brand-soft)]"}`}
              >
                <input ref={inputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" onChange={(event) => { const selected = event.target.files?.[0]; if (selected) validateFile(selected); }} className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0" disabled={uploading} aria-label="Choose a lab report" />
                <AnimatePresence mode="wait">
                  {file ? (
                    <motion.div key="selected" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="relative flex min-h-64 flex-col items-center justify-center px-5 py-10 text-center">
                      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-[var(--brand)] shadow-[var(--shadow-sm)]">{file.type === "application/pdf" ? <FileText className="h-8 w-8" /> : <ImageIcon className="h-8 w-8" />}</span>
                      <p className="mt-5 max-w-full truncate text-base font-extrabold text-[var(--ink)]">{file.name}</p>
                      <p className="mt-1.5 text-xs font-bold text-[var(--brand-dark)]">{(file.size / 1024 / 1024).toFixed(2)} MB · ready to analyze</p>
                      {!uploading && <button type="button" onClick={(event) => { event.stopPropagation(); clearFile(); }} className="relative z-20 mt-5 inline-flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-extrabold text-[var(--muted)] hover:bg-white hover:text-[#b44747]"><X className="h-4 w-4" /> Choose another</button>}
                    </motion.div>
                  ) : (
                    <motion.div key="prompt" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex min-h-64 flex-col items-center justify-center px-5 py-10 text-center">
                      <span className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-[var(--shadow-sm)] transition ${dragging ? "text-[var(--brand)]" : "text-[#86a098]"}`}><UploadCloud className="h-8 w-8" /></span>
                      <p className="mt-5 text-base font-extrabold text-[var(--ink)]">{dragging ? "Drop it right here" : "Drop a report here"}</p>
                      <p className="mt-1.5 text-xs text-[var(--muted)]">or click anywhere in this box to browse</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <AnimatePresence>
                {error && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-4 flex gap-3 overflow-hidden rounded-2xl border border-[#f4d3ce] bg-[var(--coral-pale)] p-4 text-xs font-bold leading-5 text-[#a94747]" role="alert"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}</motion.div>}
              </AnimatePresence>

              {uploading ? (
                <div className="mt-6 rounded-2xl bg-[var(--ink)] p-5 text-white">
                  <div className="flex items-center gap-3"><span className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white/10"><Loader2 className="h-5 w-5 animate-spin text-[#90dfcf]" /></span><div><p className="text-sm font-extrabold">{phases[phase]}</p><p className="mt-0.5 text-[0.68rem] text-white/55">Keep this window open while we prepare the brief.</p></div></div>
                  <div className="mt-5 grid grid-cols-3 gap-2">{phases.map((item, index) => <div key={item} className={`h-1.5 overflow-hidden rounded-full ${index <= phase ? "bg-white/15" : "bg-white/8"}`}><motion.div initial={{ width: 0 }} animate={{ width: index < phase ? "100%" : index === phase ? "78%" : 0 }} transition={{ duration: index === phase ? 2.4 : 0.4 }} className="h-full rounded-full bg-[#90dfcf]" /></div>)}</div>
                </div>
              ) : (
                <button type="button" onClick={handleUpload} disabled={!file} className="button-primary mt-6 w-full !min-h-13 !rounded-2xl">Analyze this report <ArrowRight className="h-5 w-5" /></button>
              )}
              <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-[0.68rem] text-[var(--muted)]"><Check className="h-3.5 w-3.5 text-[var(--brand)]" /> Your original report remains available beside the explanation.</p>
            </motion.section>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
