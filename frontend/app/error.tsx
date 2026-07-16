"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { useEffect } from "react";
import BrandMark from "@/Components/BrandMark";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="mb-8 flex justify-center"><BrandMark /></div>
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--coral-pale)] text-[var(--coral)]"><AlertTriangle className="h-8 w-8" /></span>
        <h1 className="mt-5 text-2xl font-extrabold tracking-[-0.035em]">Something interrupted this view.</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">Your reports have not been changed. Try loading this part of LabSaathi again.</p>
        <button onClick={reset} className="button-primary mt-7"><RefreshCw className="h-4 w-4" /> Try again</button>
      </div>
    </main>
  );
}
