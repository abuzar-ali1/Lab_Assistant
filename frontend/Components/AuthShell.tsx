import { CheckCircle2, HeartHandshake, Languages, ShieldCheck } from "lucide-react";
import Link from "next/link";
import BrandMark from "@/Components/BrandMark";

export default function AuthShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[var(--paper)] lg:grid lg:grid-cols-[0.9fr_1.1fr]">
      <section className="relative hidden min-h-screen overflow-hidden bg-[var(--ink)] p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">
        <div className="auth-grid absolute inset-0 opacity-30" />
        <div className="ambient-orb ambient-orb-one !left-auto !right-[-10rem] !top-[-8rem] opacity-40" />
        <Link href="/" className="relative z-10 w-fit rounded-xl bg-white px-4 py-3">
          <BrandMark />
        </Link>
        <div className="relative z-10 max-w-xl py-14">
          <p className="mb-5 text-xs font-extrabold uppercase tracking-[0.22em] text-[#90dfcf]">Health clarity, together</p>
          <h2 className="text-4xl font-extrabold leading-[1.08] tracking-[-0.045em] xl:text-5xl">
            Lab numbers should start a helpful conversation—not a panic spiral.
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {[
              { icon: Languages, label: "English + Urdu" },
              { icon: ShieldCheck, label: "Private workspace" },
              { icon: HeartHandshake, label: "Doctor-ready prompts" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="rounded-2xl border border-white/12 bg-white/7 p-4 backdrop-blur-sm">
                <Icon className="mb-4 h-5 w-5 text-[#90dfcf]" />
                <p className="text-sm font-bold text-white/90">{label}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="relative z-10 flex items-center gap-2 text-xs font-semibold text-white/55">
          <CheckCircle2 className="h-4 w-4 text-[#90dfcf]" /> Built to explain, never to diagnose.
        </p>
      </section>

      <section className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-8 lg:px-12">
        <div className="w-full max-w-lg">
          <Link href="/" className="mb-10 inline-flex lg:hidden"><BrandMark /></Link>
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="mt-4 text-3xl font-extrabold tracking-[-0.04em] text-[var(--ink)] sm:text-4xl">{title}</h1>
          <p className="mt-3 max-w-md text-sm leading-6 text-[var(--muted)] sm:text-base">{description}</p>
          <div className="mt-8">{children}</div>
        </div>
      </section>
    </main>
  );
}
