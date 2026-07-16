import { FilePlus2, Sparkles } from "lucide-react";
import Link from "next/link";

export default function EmptyState({
  title = "Your health timeline starts here",
  description = "Upload your first lab report and LabSaathi will turn the numbers into a clear bilingual brief.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-dashed border-[var(--brand-soft)] bg-[var(--brand-pale)]/45 px-5 py-10 text-center sm:px-10">
      <Sparkles className="absolute right-8 top-7 h-5 w-5 text-[var(--sun)] soft-float" aria-hidden="true" />
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[var(--brand)] shadow-sm">
        <FilePlus2 className="h-6 w-6" />
      </div>
      <h3 className="mt-5 text-lg font-extrabold tracking-[-0.02em] text-[var(--ink)]">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--muted)]">{description}</p>
      <Link href="/upload" className="button-primary mt-6">Analyze my first report</Link>
    </div>
  );
}
