import { ArrowLeft, FileQuestion } from "lucide-react";
import Link from "next/link";
import BrandMark from "@/Components/BrandMark";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="mb-8 flex justify-center"><BrandMark /></div>
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--sun-pale)] text-[#a36a13]"><FileQuestion className="h-8 w-8" /></span>
        <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--brand)]">404 · Not found</p>
        <h1 className="mt-3 text-2xl font-extrabold tracking-[-0.035em]">This page isn’t in your health timeline.</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">The link may be outdated or the page may have moved.</p>
        <Link href="/" className="button-primary mt-7"><ArrowLeft className="h-4 w-4" /> Return home</Link>
      </div>
    </main>
  );
}
