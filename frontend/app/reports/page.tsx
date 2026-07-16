"use client";

import { FileClock, Filter, RefreshCw, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import useSWR from "swr";
import AppShell from "@/Components/AppShell";
import EmptyState from "@/Components/EmptyState";
import ReportCard from "@/Components/ReportCard";
import { useAuth } from "@/Context/AuthContext";
import api from "@/lib/api";
import type { PaginatedReports, ReportStatus, ReportSummary } from "@/lib/types";

type FilterValue = "all" | ReportStatus;

export default function ReportsPage() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterValue>("all");
  const { data, error, isLoading: loading, mutate } = useSWR<PaginatedReports>(
    user ? "/api/reports/?page=1&page_size=100" : null,
    (url: string) => api.get(url).then((response) => response.data),
  );
  const reports: ReportSummary[] = useMemo(() => data?.results || [], [data?.results]);

  const visibleReports = useMemo(() => reports.filter((report) => {
    const matchesQuery = report.original_filename.toLowerCase().includes(query.toLowerCase());
    const matchesFilter = filter === "all" || report.status === filter;
    return matchesQuery && matchesFilter;
  }), [reports, query, filter]);

  return (
    <AppShell>
      <div className="px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div><p className="eyebrow">Health timeline</p><h1 className="mt-4 text-3xl font-extrabold tracking-[-0.045em] sm:text-5xl">All reports, one clear history.</h1><p className="mt-3 text-sm leading-6 text-[var(--muted)] sm:text-base">Revisit every bilingual brief before an appointment.</p></div>
            {!loading && <div className="flex items-center gap-2 rounded-full border border-[var(--line)] bg-white px-4 py-2 text-xs font-extrabold text-[var(--ink-soft)]"><FileClock className="h-4 w-4 text-[var(--brand)]" /> {reports.length} {reports.length === 1 ? "report" : "reports"}</div>}
          </header>

          {!loading && reports.length > 0 && (
            <div className="surface-card mt-9 flex flex-col gap-3 p-3 sm:flex-row sm:items-center">
              <label className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
                <span className="sr-only">Search reports</span>
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by file name" className="form-field !border-transparent !bg-[var(--surface-soft)] !pl-11 !pr-10" />
                {query && <button onClick={() => setQuery("")} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-[var(--muted)] hover:bg-white"><X className="h-4 w-4" /></button>}
              </label>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0" aria-label="Filter reports">
                <Filter className="ml-1 h-4 w-4 shrink-0 text-[var(--muted)]" />
                {(["all", "completed", "processing", "failed"] as FilterValue[]).map((value) => <button key={value} onClick={() => setFilter(value)} className={`shrink-0 rounded-xl px-3 py-2.5 text-xs font-extrabold capitalize transition ${filter === value ? "bg-[var(--ink)] text-white" : "text-[var(--muted)] hover:bg-[var(--surface-soft)]"}`}>{value === "all" ? "All" : value}</button>)}
              </div>
            </div>
          )}

          <section className="mt-6">
            {loading ? <ReportListSkeleton /> : error ? (
              <div className="surface-card py-14 text-center"><p className="font-extrabold">Your timeline couldn’t load.</p><p className="mt-2 text-sm text-[var(--muted)]">Check the connection and try once more.</p><button onClick={() => mutate()} className="button-secondary mt-5"><RefreshCw className="h-4 w-4" /> Try again</button></div>
            ) : reports.length === 0 ? <EmptyState /> : visibleReports.length === 0 ? (
              <div className="surface-card py-14 text-center"><p className="font-extrabold">No reports match that view.</p><p className="mt-2 text-sm text-[var(--muted)]">Try another file name or status.</p><button onClick={() => { setQuery(""); setFilter("all"); }} className="button-secondary mt-5">Clear filters</button></div>
            ) : <div className="space-y-3">{visibleReports.map((report) => <ReportCard key={report.id} report={report} />)}</div>}
          </section>
        </div>
      </div>
    </AppShell>
  );
}

function ReportListSkeleton() {
  return <div className="space-y-3">{[1, 2, 3, 4].map((item) => <div key={item} className="surface-card flex h-24 items-center gap-4 p-5"><div className="shimmer h-12 w-12 rounded-2xl" /><div className="flex-1"><div className="shimmer h-4 w-52 max-w-full rounded" /><div className="shimmer mt-3 h-3 w-36 rounded" /></div></div>)}</div>;
}
