"use client";

import { motion } from "framer-motion";
import { AlertCircle, ArrowLeft, ArrowUpRight, BadgeCheck, BrainCircuit, CheckCircle2, CircleHelp, Clock3, ExternalLink, FileText, Languages, Loader2, MessageCircleQuestion, RefreshCw, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import useSWR from "swr";
import AppShell from "@/Components/AppShell";
import api from "@/lib/api";
import type { ReportDetail, ReportStatus, TestResult } from "@/lib/types";

const fetcher = (url: string) => api.get(url).then((response) => response.data);
type LanguageView = "both" | "english" | "urdu";
type ResultFilter = "all" | "attention" | "range";

const statusLabels: Record<ReportStatus, { label: string; classes: string; icon: typeof CheckCircle2 }> = {
  completed: { label: "Clarity brief ready", classes: "bg-[var(--brand-pale)] text-[var(--brand-dark)]", icon: CheckCircle2 },
  processing: { label: "Analysis in progress", classes: "bg-[#eaf3ff] text-[#356b9a]", icon: Loader2 },
  pending: { label: "Waiting to start", classes: "bg-[var(--sun-pale)] text-[#956214]", icon: Clock3 },
  failed: { label: "Analysis needs a retry", classes: "bg-[var(--coral-pale)] text-[#b44747]", icon: AlertCircle },
};

export default function ReportDetailPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const [language, setLanguage] = useState<LanguageView>("both");
  const [filter, setFilter] = useState<ResultFilter>("all");
  const { data: report, error, isLoading, mutate } = useSWR<ReportDetail>(id ? `/api/reports/${id}/` : null, fetcher, {
    refreshInterval: (latest) => latest?.status === "pending" || latest?.status === "processing" ? 3000 : 0,
  });

  const counts = useMemo(() => {
    const tests = report?.test_results || [];
    const abnormal = tests.filter((test) => test.is_abnormal).length;
    return { total: tests.length, abnormal, normal: tests.length - abnormal };
  }, [report]);

  const visibleTests = useMemo(() => (report?.test_results || []).filter((test) => filter === "all" || (filter === "attention" ? test.is_abnormal : !test.is_abnormal)), [report, filter]);
  const doctorQuestions = useMemo(() => Array.from(new Set((report?.test_results || []).flatMap((test) => test.doctor_questions || []))), [report]);

  if (isLoading) return <ReportSkeleton />;
  if (error || !report) return <ReportError onRetry={() => mutate()} />;

  const status = statusLabels[report.status];
  const StatusIcon = status.icon;
  const processing = report.status === "pending" || report.status === "processing";

  return (
    <AppShell>
      <div className="px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <Link href="/reports" className="inline-flex items-center gap-2 rounded-xl px-1 py-2 text-xs font-extrabold text-[var(--muted)] transition hover:text-[var(--brand-dark)]"><ArrowLeft className="h-4 w-4" /> Back to report history</Link>

          <header className="surface-card mt-6 p-5 sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--surface-soft)] text-[var(--brand)] sm:h-14 sm:w-14"><FileText className="h-6 w-6" /></span>
                <div className="min-w-0"><p className="text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-[var(--brand)]">Lab report</p><h1 className="mt-2 break-words text-xl font-extrabold tracking-[-0.035em] sm:text-3xl">{report.original_filename}</h1><p className="mt-2 text-xs text-[var(--muted)]">Uploaded {new Date(report.created_at).toLocaleDateString("en-PK", { day: "numeric", month: "long", year: "numeric" })}{report.processing_time_seconds ? ` · analyzed in ${report.processing_time_seconds}s` : ""}</p></div>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <span className={`inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-[0.68rem] font-extrabold uppercase tracking-[0.08em] ${status.classes}`}><StatusIcon className={`h-4 w-4 ${report.status === "processing" ? "animate-spin" : ""}`} /> {status.label}</span>
                {report.file_url && <a href={report.file_url} target="_blank" rel="noreferrer" className="button-secondary !min-h-9 !rounded-full !px-3.5 !py-2 !text-xs">Original <ExternalLink className="h-3.5 w-3.5" /></a>}
              </div>
            </div>
          </header>

          {processing && <ProcessingState status={report.status} />}
          {report.status === "failed" && <FailedState message={report.error_message} />}

          {report.status === "completed" && (
            <>
              <section className="mt-6 grid gap-4 sm:grid-cols-3">
                {[
                  { label: "Markers read", value: counts.total, icon: BrainCircuit, color: "bg-[var(--surface-soft)] text-[var(--brand)]" },
                  { label: "Worth discussing", value: counts.abnormal, icon: AlertCircle, color: counts.abnormal ? "bg-[var(--coral-pale)] text-[var(--coral)]" : "bg-[var(--brand-pale)] text-[var(--brand)]" },
                  { label: "Within range", value: counts.normal, icon: BadgeCheck, color: "bg-[var(--brand-pale)] text-[var(--brand)]" },
                ].map(({ label, value, icon: Icon, color }) => <div key={label} className="surface-card flex items-center justify-between p-5"><div><p className="text-[0.68rem] font-extrabold uppercase tracking-[0.1em] text-[var(--muted)]">{label}</p><p className="mt-2 text-3xl font-extrabold tracking-[-0.04em]">{value}</p></div><span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${color}`}><Icon className="h-5 w-5" /></span></div>)}
              </section>

              <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_320px]">
                <div>
                  <div className="surface-card flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-1 overflow-x-auto" aria-label="Filter findings">{(["all", "attention", "range"] as ResultFilter[]).map((value) => <button key={value} onClick={() => setFilter(value)} className={`shrink-0 rounded-xl px-3.5 py-2.5 text-xs font-extrabold capitalize ${filter === value ? "bg-[var(--ink)] text-white" : "text-[var(--muted)] hover:bg-[var(--surface-soft)]"}`}>{value === "range" ? "In range" : value}</button>)}</div>
                    <div className="flex items-center gap-1 rounded-xl bg-[var(--surface-soft)] p-1" aria-label="Explanation language"><Languages className="mx-2 h-4 w-4 text-[var(--brand)]" />{(["both", "english", "urdu"] as LanguageView[]).map((value) => <button key={value} onClick={() => setLanguage(value)} className={`rounded-lg px-3 py-2 text-[0.68rem] font-extrabold capitalize ${language === value ? "bg-white text-[var(--ink)] shadow-sm" : "text-[var(--muted)]"}`}>{value}</button>)}</div>
                  </div>

                  <div className="mt-4 space-y-4">
                    {visibleTests.length ? visibleTests.map((test, index) => <ResultCard key={test.id} test={test} language={language} index={index} />) : <div className="surface-card py-12 text-center text-sm text-[var(--muted)]">No markers match this filter.</div>}
                  </div>
                </div>

                <aside className="space-y-5">
                  <div className="sticky top-24 space-y-5">
                    <div className="relative overflow-hidden rounded-3xl bg-[var(--ink)] p-6 text-white">
                      <Sparkles className="absolute right-5 top-5 h-5 w-5 text-[var(--sun)] soft-float" />
                      <MessageCircleQuestion className="h-6 w-6 text-[#90dfcf]" />
                      <h2 className="mt-6 text-xl font-extrabold tracking-[-0.03em]">Your doctor discussion list</h2>
                      <p className="mt-2 text-xs leading-5 text-white/55">Use these as conversation starters, not self-diagnosis.</p>
                      <div className="mt-5 space-y-3">{doctorQuestions.length ? doctorQuestions.slice(0, 6).map((question, index) => <div key={`${question}-${index}`} className="flex gap-3 rounded-xl bg-white/[0.07] p-3 text-xs font-semibold leading-5 text-white/82"><span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#90dfcf] text-[0.62rem] font-extrabold text-[var(--ink)]">{index + 1}</span>{question}</div>) : <div className="rounded-xl bg-white/[0.07] p-4 text-xs leading-5 text-white/60">No specific questions were generated for this report. Ask your clinician how these results fit your symptoms and history.</div>}</div>
                    </div>
                    <div className="rounded-2xl border border-[var(--line)] bg-white p-5"><div className="flex gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[var(--brand)]" /><div><p className="text-sm font-extrabold">A note on ranges</p><p className="mt-1 text-xs leading-5 text-[var(--muted)]">Reference ranges can vary by lab, age, sex, pregnancy, medicines, and medical history. Your clinician interprets the full picture.</p></div></div></div>
                  </div>
                </aside>
              </section>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function ResultCard({ test, language, index }: { test: TestResult; language: LanguageView; index: number }) {
  return (
    <motion.article initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index * 0.04, 0.24) }} className="surface-card overflow-hidden">
      <div className={`h-1.5 ${test.is_abnormal ? "bg-[var(--coral)]" : "bg-[var(--brand-soft)]"}`} />
      <div className="p-5 sm:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3"><span className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${test.is_abnormal ? "bg-[var(--coral-pale)] text-[var(--coral)]" : "bg-[var(--brand-pale)] text-[var(--brand)]"}`}>{test.is_abnormal ? <AlertCircle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}</span><div><p className="text-lg font-extrabold tracking-[-0.025em]">{test.test_name}</p><p className={`mt-1 text-xs font-extrabold ${test.is_abnormal ? "text-[#b44747]" : "text-[var(--brand-dark)]"}`}>{test.is_abnormal ? "Outside the report’s range" : "Within the report’s range"}</p></div></div>
          <div className="rounded-2xl bg-[var(--surface-soft)] px-4 py-3 sm:text-right"><p className="text-2xl font-extrabold tracking-[-0.035em]">{test.value} <span className="text-sm font-bold text-[var(--muted)]">{test.unit}</span></p><p className="mt-1 text-[0.68rem] text-[var(--muted)]">Reference: {test.reference_range || "Not shown"}</p></div>
        </div>
        <div className={`mt-6 grid gap-3 ${language === "both" ? "md:grid-cols-2" : ""}`}>
          {(language === "both" || language === "english") && <div className="rounded-2xl border border-[var(--line)] bg-[#fbfdfc] p-5"><p className="flex items-center gap-2 text-[0.66rem] font-extrabold uppercase tracking-[0.12em] text-[var(--muted)]"><CircleHelp className="h-4 w-4 text-[var(--brand)]" /> Plain English</p><p className="mt-4 text-sm leading-6 text-[var(--ink-soft)]">{test.explanation_english || "A plain-language explanation was not available for this marker."}</p></div>}
          {(language === "both" || language === "urdu") && <div className="rounded-2xl border border-[#cfeadf] bg-[var(--brand-pale)]/55 p-5" dir="rtl"><p className="flex items-center justify-end gap-2 text-[0.72rem] font-extrabold text-[var(--brand-dark)]"><span>آسان اردو</span><Languages className="h-4 w-4" /></p><p className="urdu-copy mt-3 text-base text-[var(--ink-soft)]">{test.explanation_urdu || "اس نتیجے کی اردو وضاحت دستیاب نہیں ہے۔"}</p></div>}
        </div>
      </div>
    </motion.article>
  );
}

function ProcessingState({ status }: { status: ReportStatus }) {
  const active = status === "processing" ? 1 : 0;
  return <section className="surface-card mt-6 overflow-hidden p-6 sm:p-8"><div className="flex flex-col gap-6 sm:flex-row sm:items-center"><div className="relative flex h-20 w-20 shrink-0 items-center justify-center"><span className="pulse-ring absolute inset-2 rounded-full border border-[var(--brand-soft)]" /><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--brand-pale)] text-[var(--brand)]"><BrainCircuit className="h-6 w-6 animate-pulse" /></span></div><div className="flex-1"><p className="text-lg font-extrabold">We’re preparing your clarity brief.</p><p className="mt-2 text-sm leading-6 text-[var(--muted)]">The page updates automatically. You can safely leave and return from your report timeline.</p><div className="mt-5 grid gap-2 sm:grid-cols-3">{["Report received", "Reading values", "Building explanations"].map((label, index) => <div key={label} className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold ${index <= active ? "bg-[var(--brand-pale)] text-[var(--brand-dark)]" : "bg-[var(--surface-soft)] text-[var(--muted)]"}`}>{index < active ? <CheckCircle2 className="h-4 w-4" /> : index === active ? <Loader2 className="h-4 w-4 animate-spin" /> : <span className="h-4 w-4 rounded-full border border-current opacity-40" />}{label}</div>)}</div></div></div></section>;
}

function FailedState({ message }: { message?: string | null }) {
  return <section className="mt-6 rounded-3xl border border-[#f4d3ce] bg-[var(--coral-pale)] p-6 sm:p-8"><div className="flex gap-4"><AlertCircle className="mt-0.5 h-6 w-6 shrink-0 text-[var(--coral)]" /><div><h2 className="font-extrabold text-[#8f3939]">We couldn’t read this report.</h2><p className="mt-2 text-sm leading-6 text-[#a05454]">{message || "The file may be incomplete, blurry, or in an unsupported format."}</p><Link href="/upload" className="button-secondary mt-5 !border-[#efc7c1]">Try a clearer report <ArrowUpRight className="h-4 w-4" /></Link></div></div></section>;
}

function ReportError({ onRetry }: { onRetry: () => void }) {
  return <AppShell><div className="flex min-h-[70vh] items-center justify-center px-4"><div className="max-w-md text-center"><span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--coral-pale)] text-[var(--coral)]"><AlertCircle className="h-8 w-8" /></span><h1 className="mt-5 text-2xl font-extrabold tracking-[-0.03em]">This report isn’t available.</h1><p className="mt-2 text-sm leading-6 text-[var(--muted)]">It may have been removed, or your session may need to reconnect.</p><div className="mt-6 flex justify-center gap-3"><Link href="/reports" className="button-secondary">Report history</Link><button onClick={onRetry} className="button-primary"><RefreshCw className="h-4 w-4" /> Retry</button></div></div></div></AppShell>;
}

function ReportSkeleton() {
  return <AppShell><div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8"><div className="shimmer h-4 w-36 rounded" /><div className="surface-card mt-6 p-7"><div className="flex gap-4"><div className="shimmer h-14 w-14 rounded-2xl" /><div className="flex-1"><div className="shimmer h-6 w-72 max-w-full rounded" /><div className="shimmer mt-3 h-3 w-44 rounded" /></div></div></div><div className="mt-6 grid gap-4 sm:grid-cols-3">{[1, 2, 3].map((item) => <div key={item} className="surface-card h-28 p-5"><div className="shimmer h-3 w-24 rounded" /><div className="shimmer mt-5 h-8 w-14 rounded" /></div>)}</div><div className="mt-6 space-y-4">{[1, 2].map((item) => <div key={item} className="surface-card h-72 p-7"><div className="shimmer h-6 w-52 rounded" /><div className="mt-8 grid gap-4 md:grid-cols-2"><div className="shimmer h-36 rounded-2xl" /><div className="shimmer h-36 rounded-2xl" /></div></div>)}</div></div></AppShell>;
}
