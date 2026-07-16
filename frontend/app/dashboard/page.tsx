"use client";

import { motion } from "framer-motion";
import { AlertCircle, ArrowRight, CalendarClock, FileCheck2, HeartPulse, Plus, RefreshCw, Sparkles } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import useSWR from "swr";
import AppShell from "@/Components/AppShell";
import EmptyState from "@/Components/EmptyState";
import ReportCard from "@/Components/ReportCard";
import { useAuth } from "@/Context/AuthContext";
import api from "@/lib/api";
import type { PaginatedReports, ReportSummary } from "@/lib/types";

export default function DashboardPage() {
  const { user } = useAuth();
  const { data, error, isLoading: loading, mutate } = useSWR<PaginatedReports>(
    user ? "/api/reports/?page=1&page_size=6" : null,
    (url: string) => api.get(url).then((response) => response.data),
  );
  const reports: ReportSummary[] = useMemo(() => data?.results || [], [data?.results]);

  const stats = useMemo(() => {
    const completed = reports.filter((report) => report.status === "completed");
    const discuss = completed.reduce((total, report) => total + report.abnormal_count, 0);
    return { completed: completed.length, discuss, latest: reports[0] };
  }, [reports]);

  const firstName = user?.first_name || "there";
  const hasDiscussionItems = stats.discuss > 0;

  return (
    <AppShell>
      <div className="relative px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="ambient-orb ambient-orb-one opacity-60" />
        <div className="mx-auto max-w-7xl">
          <motion.header initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow">My health space</p>
              <h1 className="mt-4 text-3xl font-extrabold tracking-[-0.045em] text-[var(--ink)] sm:text-5xl">Good to see you, {firstName}.</h1>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)] sm:text-base">Here’s the clearest view of your recent lab reports.</p>
            </div>
            <Link href="/upload" className="button-primary !min-h-12 !rounded-2xl sm:self-auto"><Plus className="h-5 w-5" /> Analyze a report</Link>
          </motion.header>

          {loading ? (
            <DashboardSkeleton />
          ) : error ? (
            <div className="surface-card mt-10 flex flex-col items-center px-6 py-14 text-center">
              <AlertCircle className="h-10 w-10 text-[var(--coral)]" />
              <h2 className="mt-4 text-xl font-extrabold">We couldn’t load your health space.</h2>
              <p className="mt-2 text-sm text-[var(--muted)]">Your reports are safe. Check the connection and try again.</p>
              <button onClick={() => mutate()} className="button-secondary mt-6"><RefreshCw className="h-4 w-4" /> Try again</button>
            </div>
          ) : reports.length === 0 ? (
            <div className="mt-10"><EmptyState /></div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ staggerChildren: 0.08 }}>
              <section className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {[
                  { icon: FileCheck2, label: "Reports analyzed", value: stats.completed, detail: "in your private timeline", color: "bg-[var(--brand-pale)] text-[var(--brand)]" },
                  { icon: HeartPulse, label: "Markers to discuss", value: stats.discuss, detail: stats.discuss ? "across recent reports" : "nothing flagged right now", color: hasDiscussionItems ? "bg-[var(--coral-pale)] text-[var(--coral)]" : "bg-[var(--brand-pale)] text-[var(--brand)]" },
                  { icon: CalendarClock, label: "Latest report", value: stats.latest ? new Date(stats.latest.created_at).toLocaleDateString("en-PK", { day: "numeric", month: "short" }) : "—", detail: "most recent upload", color: "bg-[var(--sun-pale)] text-[#a36a13]" },
                ].map(({ icon: Icon, label, value, detail, color }) => (
                  <motion.article key={label} variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} initial="hidden" animate="visible" className="surface-card p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div><p className="text-xs font-extrabold uppercase tracking-[0.1em] text-[var(--muted)]">{label}</p><p className="mt-4 text-3xl font-extrabold tracking-[-0.04em] text-[var(--ink)]">{value}</p><p className="mt-1 text-xs text-[var(--muted)]">{detail}</p></div>
                      <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${color}`}><Icon className="h-5 w-5" /></span>
                    </div>
                  </motion.article>
                ))}
              </section>

              <section className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
                <div className="surface-card p-5 sm:p-7">
                  <div className="mb-6 flex items-center justify-between gap-4">
                    <div><h2 className="text-xl font-extrabold tracking-[-0.03em]">Recent reports</h2><p className="mt-1 text-xs text-[var(--muted)]">Your latest clarity briefs</p></div>
                    <Link href="/reports" className="flex items-center gap-1 text-xs font-extrabold text-[var(--brand-dark)] hover:gap-2">View all <ArrowRight className="h-4 w-4" /></Link>
                  </div>
                  <div className="space-y-3">{reports.slice(0, 4).map((report) => <ReportCard key={report.id} report={report} compact />)}</div>
                </div>

                <aside className={`relative overflow-hidden rounded-3xl p-6 sm:p-7 ${hasDiscussionItems ? "bg-[var(--ink)] text-white" : "bg-[var(--brand)] text-white"}`}>
                  <Sparkles className="absolute right-6 top-6 h-5 w-5 text-[var(--sun)] soft-float" />
                  <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-white/60">Your next best step</p>
                  <h2 className="mt-5 text-2xl font-extrabold leading-tight tracking-[-0.035em]">
                    {hasDiscussionItems ? "Turn flagged markers into better questions." : "Keep your next report in the same timeline."}
                  </h2>
                  <p className="mt-4 text-sm leading-6 text-white/65">
                    {hasDiscussionItems ? "Open a report to see plain explanations and a ready-made discussion list for your doctor." : "A consistent history makes reports easier to revisit before your next appointment."}
                  </p>
                  <Link href={stats.latest ? `/reports/${stats.latest.id}` : "/upload"} className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-extrabold text-[var(--ink)] transition hover:-translate-y-0.5">
                    {stats.latest ? "Open latest brief" : "Add a report"} <ArrowRight className="h-4 w-4" />
                  </Link>
                  <div className="mt-10 border-t border-white/12 pt-5 text-xs leading-5 text-white/50">LabSaathi explains results. Your clinician provides diagnosis and treatment.</div>
                </aside>
              </section>
            </motion.div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function DashboardSkeleton() {
  return (
    <div className="mt-10">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{[1, 2, 3].map((item) => <div key={item} className="surface-card h-36 p-6"><div className="shimmer h-3 w-28 rounded" /><div className="shimmer mt-7 h-9 w-16 rounded-lg" /><div className="shimmer mt-3 h-3 w-36 rounded" /></div>)}</div>
      <div className="surface-card mt-6 p-6"><div className="shimmer h-6 w-36 rounded" /><div className="mt-6 space-y-3">{[1, 2, 3].map((item) => <div key={item} className="shimmer h-20 rounded-2xl" />)}</div></div>
    </div>
  );
}
