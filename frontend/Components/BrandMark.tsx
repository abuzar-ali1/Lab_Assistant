import { Activity } from "lucide-react";

export default function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span className="brand-mark" aria-hidden="true">
        <Activity className="h-5 w-5" strokeWidth={2.4} />
      </span>
      {!compact && (
        <span className="text-[1.05rem] font-extrabold tracking-[-0.035em] text-[var(--ink)]">
          Lab<span className="text-[var(--brand)]">Saathi</span>
        </span>
      )}
    </span>
  );
}
