import BrandMark from "@/Components/BrandMark";

export default function BrandLoader({ label = "Preparing your health space" }: { label?: string }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6" role="status" aria-live="polite">
      <div className="text-center">
        <div className="relative mx-auto mb-6 h-24 w-24">
          <div className="loader-orbit" />
          <div className="absolute inset-0 flex items-center justify-center">
            <BrandMark compact />
          </div>
          <span className="loader-dot" />
        </div>
        <p className="text-sm font-bold text-[var(--ink)]">{label}</p>
        <p className="mt-1 text-xs text-[var(--muted)]">A little clarity is on its way.</p>
      </div>
    </div>
  );
}
