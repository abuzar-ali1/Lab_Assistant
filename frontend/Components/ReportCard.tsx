import { AlertCircle, ArrowUpRight, CheckCircle2, Clock3, FileText, Loader2 } from "lucide-react";
import Link from "next/link";
import type { ReportSummary, ReportStatus } from "@/lib/types";

const statusMap: Record<ReportStatus, { label: string; classes: string; icon: typeof CheckCircle2 }> = {
  completed: { label: "Ready", classes: "bg-[#e5f7ef] text-[#08705f]", icon: CheckCircle2 },
  processing: { label: "Analyzing", classes: "bg-[#eaf3ff] text-[#356b9a]", icon: Loader2 },
  pending: { label: "Queued", classes: "bg-[#fff4dd] text-[#956214]", icon: Clock3 },
  failed: { label: "Needs retry", classes: "bg-[#fff0ed] text-[#b44747]", icon: AlertCircle },
};

export default function ReportCard({ report, compact = false }: { report: ReportSummary; compact?: boolean }) {
  const status = statusMap[report.status] || statusMap.pending;
  const StatusIcon = status.icon;
  const date = new Date(report.created_at).toLocaleDateString("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <Link
      href={`/reports/${report.id}`}
      className="group flex flex-col gap-4 rounded-2xl border border-[var(--line)] bg-white p-4 transition duration-200 hover:-translate-y-0.5 hover:border-[var(--brand-soft)] hover:shadow-[0_16px_36px_rgba(27,62,53,0.09)] sm:flex-row sm:items-center sm:p-5"
      aria-label={`Open ${report.original_filename}`}
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--surface-soft)] text-[var(--brand-dark)]">
        <FileText className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-extrabold text-[var(--ink)] sm:text-[0.95rem]">{report.original_filename}</span>
        <span className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--muted)]">
          <span>{date}</span>
          {report.status === "completed" && <span>{report.total_tests} markers found</span>}
        </span>
      </span>
      <span className="flex items-center justify-between gap-4 sm:justify-end">
        {!compact && report.status === "completed" && (
          <span className={`text-xs font-extrabold ${report.abnormal_count > 0 ? "text-[#b44747]" : "text-[var(--brand-dark)]"}`}>
            {report.abnormal_count > 0 ? `${report.abnormal_count} to discuss` : "All in range"}
          </span>
        )}
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[0.68rem] font-extrabold uppercase tracking-[0.08em] ${status.classes}`}>
          <StatusIcon className={`h-3.5 w-3.5 ${report.status === "processing" ? "animate-spin" : ""}`} />
          {status.label}
        </span>
        <ArrowUpRight className="h-4 w-4 text-[#9aaca6] transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--brand)]" />
      </span>
    </Link>
  );
}
