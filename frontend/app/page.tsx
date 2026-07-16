"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  BrainCircuit,
  Check,
  ChevronRight,
  CircleAlert,
  FileSearch,
  HeartHandshake,
  Languages,
  LockKeyhole,
  MessageCircleQuestion,
  ScanLine,
  ShieldCheck,
  Sparkles,
  UploadCloud,
} from "lucide-react";
import Link from "next/link";
import AppHeader from "@/Components/AppHeader";
import { useAuth } from "@/Context/AuthContext";

const reveal = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export default function HomePage() {
  const { user } = useAuth();
  const primaryHref = user ? "/dashboard" : "/register";

  return (
    <div className="overflow-hidden">
      <AppHeader publicNavigation />

      <main>
        <section className="relative px-4 pb-20 pt-32 sm:px-6 sm:pb-28 sm:pt-40 lg:px-8">
          <div className="ambient-orb ambient-orb-one" />
          <div className="ambient-orb ambient-orb-two" />
          <div className="dot-grid-dark absolute inset-x-0 top-0 -z-10 h-[44rem] opacity-50 [mask-image:linear-gradient(to_bottom,black,transparent)]" />

          <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            <motion.div initial="hidden" animate="visible" transition={{ staggerChildren: 0.1 }}>
              <motion.div variants={reveal} transition={{ duration: 0.5 }} className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white/80 px-3 py-2 text-xs font-extrabold text-[var(--brand-dark)] shadow-sm backdrop-blur">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--brand-soft)] opacity-70" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--brand)]" />
                </span>
                Made for patients who deserve plain answers
              </motion.div>

              <motion.h1 variants={reveal} transition={{ duration: 0.55 }} className="max-w-3xl text-[clamp(3rem,7vw,5.75rem)] font-extrabold leading-[0.98] tracking-[-0.065em] text-[var(--ink)]">
                Lab reports,
                <span className="mt-1 block text-[var(--brand)]">made human.</span>
              </motion.h1>
              <motion.p variants={reveal} transition={{ duration: 0.55 }} className="mt-7 max-w-xl text-base leading-7 text-[var(--muted)] sm:text-lg sm:leading-8">
                LabSaathi turns confusing numbers into a clear health brief: what needs attention, what it means in simple English and Urdu, and what to ask your doctor next.
              </motion.p>

              <motion.div variants={reveal} transition={{ duration: 0.55 }} className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link href={primaryHref} className="button-primary !min-h-14 !rounded-2xl !px-6 !text-base">
                  {user ? "Open my health space" : "Understand my report"} <ArrowRight className="h-5 w-5" />
                </Link>
                <a href="#how-it-works" className="button-secondary !min-h-14 !rounded-2xl !px-6 !text-base">
                  See the clarity path <ChevronRight className="h-5 w-5" />
                </a>
              </motion.div>

              <motion.div variants={reveal} transition={{ duration: 0.55 }} className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-xs font-bold text-[var(--muted)]">
                <span className="flex items-center gap-1.5"><LockKeyhole className="h-4 w-4 text-[var(--brand)]" /> Private by default</span>
                <span className="flex items-center gap-1.5"><Languages className="h-4 w-4 text-[var(--brand)]" /> English + Urdu</span>
                <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-[var(--brand)]" /> Not a diagnosis</span>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.75, delay: 0.15 }}
              className="relative mx-auto w-full max-w-[560px]"
            >
              <div className="absolute -left-6 top-20 hidden rounded-2xl border border-white/80 bg-white/90 p-3 shadow-[var(--shadow-lg)] backdrop-blur sm:block soft-float">
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--brand-pale)] text-[var(--brand)]"><Languages className="h-4 w-4" /></span>
                  <span><b className="block text-xs text-[var(--ink)]">دو زبانیں</b><small className="text-[0.66rem] text-[var(--muted)]">English + Urdu</small></span>
                </div>
              </div>
              <div className="absolute -right-4 bottom-16 z-10 hidden rounded-2xl border border-white/80 bg-white/90 p-3 shadow-[var(--shadow-lg)] backdrop-blur sm:block soft-float-delayed">
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--sun-pale)] text-[#a36a13]"><MessageCircleQuestion className="h-4 w-4" /></span>
                  <span><b className="block text-xs text-[var(--ink)]">Doctor-ready</b><small className="text-[0.66rem] text-[var(--muted)]">Questions included</small></span>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-[2rem] border border-white/90 bg-white/85 p-3 shadow-[0_34px_100px_rgba(27,62,53,0.16)] backdrop-blur-xl sm:p-5">
                <div className="rounded-[1.5rem] border border-[var(--line)] bg-[#fbfdfc] p-5 sm:p-7">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-[var(--brand)]">Your clarity brief</p>
                      <h2 className="mt-2 text-xl font-extrabold tracking-[-0.035em] text-[var(--ink)] sm:text-2xl">CBC blood test</h2>
                      <p className="mt-1 text-xs text-[var(--muted)]">15 markers · explained simply</p>
                    </div>
                    <span className="rounded-full bg-[var(--brand-pale)] px-3 py-1.5 text-[0.66rem] font-extrabold uppercase tracking-wider text-[var(--brand-dark)]">Ready</span>
                  </div>

                  <div className="mt-7 grid grid-cols-3 gap-2.5">
                    {[
                      { value: "15", label: "Markers", color: "text-[var(--ink)]" },
                      { value: "2", label: "Discuss", color: "text-[#b44747]" },
                      { value: "13", label: "In range", color: "text-[var(--brand)]" },
                    ].map((item) => (
                      <div key={item.label} className="rounded-2xl border border-[var(--line)] bg-white p-3 text-center sm:p-4">
                        <p className={`text-xl font-extrabold sm:text-2xl ${item.color}`}>{item.value}</p>
                        <p className="mt-1 text-[0.62rem] font-bold text-[var(--muted)] sm:text-[0.68rem]">{item.label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 space-y-3">
                    <div className="rounded-2xl border border-[#f4d3ce] bg-[var(--coral-pale)] p-4">
                      <div className="flex items-center justify-between gap-3">
                        <span className="flex items-center gap-2 text-sm font-extrabold text-[var(--ink)]"><CircleAlert className="h-4 w-4 text-[var(--coral)]" /> Hemoglobin</span>
                        <span className="text-sm font-extrabold text-[#b44747]">10.8 g/dL</span>
                      </div>
                      <p className="mt-2 text-xs leading-5 text-[var(--muted)]">Lower than the range shown. Ask your doctor if iron testing may help explain it.</p>
                    </div>
                    <div className="rounded-2xl border border-[var(--line)] bg-white p-4">
                      <div className="flex items-center justify-between gap-3">
                        <span className="flex items-center gap-2 text-sm font-extrabold text-[var(--ink)]"><BadgeCheck className="h-4 w-4 text-[var(--brand)]" /> Platelets</span>
                        <span className="text-sm font-extrabold text-[var(--ink)]">265 ×10³/µL</span>
                      </div>
                      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#e8efec]"><div className="h-full w-[72%] rounded-full bg-[var(--brand-soft)]" /></div>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center gap-2 rounded-xl bg-[var(--ink)] px-4 py-3 text-xs font-bold text-white">
                    <Sparkles className="h-4 w-4 text-[var(--sun)]" /> 3 questions prepared for your doctor
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="border-y border-[var(--line)] bg-white/60 px-4 py-7 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 text-center sm:grid-cols-3">
            {[
              ["3-step", "clarity path"],
              ["2 languages", "English + Urdu"],
              ["1 better", "doctor conversation"],
            ].map(([value, label], index) => (
              <div key={value} className={index ? "sm:border-l sm:border-[var(--line)]" : ""}>
                <p className="text-xl font-extrabold tracking-[-0.03em] text-[var(--ink)]">{value}</p>
                <p className="mt-1 text-xs font-bold text-[var(--muted)]">{label}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-2xl">
              <p className="eyebrow">The clarity path</p>
              <h2 className="mt-5 text-3xl font-extrabold tracking-[-0.045em] text-[var(--ink)] sm:text-5xl">From “what is this?” to “here’s what I’ll ask.”</h2>
              <p className="mt-5 text-base leading-7 text-[var(--muted)]">Each report is organized around the decisions a patient actually needs to make.</p>
            </div>

            <div className="mt-14 grid gap-5 lg:grid-cols-3">
              {[
                { n: "01", icon: UploadCloud, title: "Share your report", text: "Upload a clear PDF or photo. A simple readiness check helps avoid blurry, incomplete scans.", color: "bg-[var(--brand-pale)] text-[var(--brand)]" },
                { n: "02", icon: FileSearch, title: "See what matters", text: "Markers are separated into in-range results and items worth discussing—without alarmist language.", color: "bg-[var(--sun-pale)] text-[#a36a13]" },
                { n: "03", icon: HeartHandshake, title: "Walk in prepared", text: "Plain explanations and tailored questions help you have a more useful conversation with your clinician.", color: "bg-[var(--coral-pale)] text-[var(--coral)]" },
              ].map(({ n, icon: Icon, title, text, color }) => (
                <motion.article key={n} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.45 }} className="surface-card relative overflow-hidden p-7 sm:p-8">
                  <span className="absolute right-6 top-5 text-5xl font-black tracking-[-0.08em] text-[#e9f0ed]">{n}</span>
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${color}`}><Icon className="h-5 w-5" /></div>
                  <h3 className="mt-8 text-xl font-extrabold tracking-[-0.03em] text-[var(--ink)]">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{text}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="bg-[var(--ink)] px-4 py-24 text-white sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid items-end gap-8 lg:grid-cols-2">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#90dfcf]">Designed around real patient anxiety</p>
                <h2 className="mt-5 max-w-2xl text-3xl font-extrabold tracking-[-0.045em] sm:text-5xl">Clarity without false certainty.</h2>
              </div>
              <p className="max-w-xl text-base leading-7 text-white/60 lg:justify-self-end">LabSaathi keeps the original result visible, explains uncertainty, and makes the doctor—not the AI—the final decision-maker.</p>
            </div>

            <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-12">
              <article className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.07] p-7 md:p-9 lg:col-span-7">
                <Languages className="h-7 w-7 text-[#90dfcf]" />
                <h3 className="mt-8 text-2xl font-extrabold">Meaning that travels across language.</h3>
                <p className="mt-3 max-w-xl text-sm leading-6 text-white/60">Switch between a concise English explanation and natural Urdu without losing the test name, value, or context.</p>
                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-white/[0.08] p-5"><p className="text-[0.66rem] font-extrabold uppercase tracking-wider text-[#90dfcf]">Plain English</p><p className="mt-3 text-sm leading-6 text-white/82">This result measures how much oxygen your blood can carry.</p></div>
                  <div className="rounded-2xl bg-[#90dfcf] p-5 text-[var(--ink)]" dir="rtl"><p className="text-[0.68rem] font-extrabold text-[var(--brand-dark)]">آسان اردو</p><p className="urdu-copy mt-3 text-base">یہ نتیجہ بتاتا ہے کہ آپ کا خون کتنی آکسیجن لے جا سکتا ہے۔</p></div>
                </div>
              </article>
              <article className="rounded-[1.75rem] bg-[var(--sun)] p-7 text-[var(--ink)] md:p-9 lg:col-span-5">
                <MessageCircleQuestion className="h-7 w-7" />
                <h3 className="mt-8 text-2xl font-extrabold">Questions, not conclusions.</h3>
                <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">Every result can include practical prompts for your next appointment.</p>
                <div className="mt-7 space-y-3">
                  {["Could my diet or medicines affect this?", "Should this test be repeated?", "Which symptoms should I watch for?"].map((question) => (
                    <div key={question} className="flex gap-3 rounded-xl bg-white/45 p-3 text-xs font-bold"><Check className="mt-0.5 h-4 w-4 shrink-0" /> {question}</div>
                  ))}
                </div>
              </article>
              <article className="rounded-[1.75rem] border border-white/10 bg-white/[0.07] p-7 md:p-9 lg:col-span-5">
                <ScanLine className="h-7 w-7 text-[#90dfcf]" />
                <h3 className="mt-8 text-2xl font-extrabold">A living report timeline.</h3>
                <p className="mt-3 text-sm leading-6 text-white/60">Keep every analysis in one private space so previous reports are easy to revisit before an appointment.</p>
              </article>
              <article className="rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-[#0e8b78] to-[#086050] p-7 md:p-9 lg:col-span-7">
                <BrainCircuit className="h-7 w-7 text-white" />
                <h3 className="mt-8 text-2xl font-extrabold">Built-in guardrails for a calmer read.</h3>
                <p className="mt-3 max-w-xl text-sm leading-6 text-white/70">Ranges come from the report, abnormal markers are framed as discussion points, and every screen reinforces that context and diagnosis belong with a clinician.</p>
              </article>
            </div>
          </div>
        </section>

        <section id="safety" className="px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto grid max-w-6xl items-center gap-12 overflow-hidden rounded-[2rem] border border-[var(--line)] bg-white p-7 shadow-[var(--shadow-sm)] sm:p-12 lg:grid-cols-[0.75fr_1.25fr] lg:p-16">
            <div className="relative mx-auto flex h-48 w-48 items-center justify-center rounded-full bg-[var(--brand-pale)]">
              <span className="pulse-ring absolute inset-3 rounded-full border border-[var(--brand-soft)]" />
              <span className="flex h-24 w-24 items-center justify-center rounded-[2rem] bg-white text-[var(--brand)] shadow-lg"><ShieldCheck className="h-11 w-11" /></span>
            </div>
            <div>
              <p className="eyebrow">Safety is a product feature</p>
              <h2 className="mt-5 text-3xl font-extrabold tracking-[-0.045em] text-[var(--ink)] sm:text-4xl">Your report stays yours. Your doctor stays in charge.</h2>
              <p className="mt-5 text-sm leading-7 text-[var(--muted)] sm:text-base">Reports live in your authenticated workspace and are shown with their original values. LabSaathi explains information; it does not diagnose conditions, prescribe treatment, or replace professional medical advice.</p>
              <div className="mt-7 flex flex-wrap gap-3">
                {["Authenticated access", "Private file links", "Clear medical disclaimer"].map((item) => <span key={item} className="rounded-full bg-[var(--surface-soft)] px-4 py-2 text-xs font-extrabold text-[var(--ink-soft)]">{item}</span>)}
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 pb-24 sm:px-6 sm:pb-32 lg:px-8">
          <div className="mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-[var(--brand)] px-6 py-14 text-center text-white shadow-[0_28px_70px_rgba(11,141,120,0.25)] sm:px-12 sm:py-20">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-white/70">Less guessing. Better questions.</p>
            <h2 className="mx-auto mt-5 max-w-3xl text-3xl font-extrabold tracking-[-0.045em] sm:text-5xl">Ready to make sense of your next report?</h2>
            <Link href={primaryHref} className="button-secondary mt-8 !min-h-14 !border-white/30 !bg-white !px-7 !text-base !text-[var(--brand-dark)]">
              Start your clarity brief <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--line)] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 text-xs text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between">
          <p className="font-bold text-[var(--ink-soft)]">LabSaathi · Health clarity, together.</p>
          <p>For education only. Always discuss health decisions with a qualified clinician.</p>
        </div>
      </footer>
    </div>
  );
}
