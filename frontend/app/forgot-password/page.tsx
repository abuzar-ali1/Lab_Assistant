"use client";

import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";
import AuthShell from "@/Components/AuthShell";
import api from "@/lib/api";
import { getApiError } from "@/lib/errors";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      await api.post("/api/forgot-password/", { email: email.trim() });
      setSent(true);
    } catch (error) {
      toast.error(getApiError(error, "We could not send the reset link."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell eyebrow="Account recovery" title="Let’s get you back in." description="Enter your account email and we’ll send a secure, time-sensitive reset link.">
      {sent ? (
        <div className="surface-card p-7 text-center sm:p-9">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--brand-pale)] text-[var(--brand)]"><CheckCircle2 className="h-7 w-7" /></span>
          <h2 className="mt-5 text-xl font-extrabold">Check your inbox</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">If an account exists for <b className="text-[var(--ink)]">{email}</b>, a secure reset link is on its way.</p>
          <Link href="/login" className="button-primary mt-6 w-full">Back to sign in <ArrowRight className="h-4 w-4" /></Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div><label htmlFor="recovery-email" className="form-label">Email address</label><div className="relative"><Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" /><input id="recovery-email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="form-field !pl-11" required /></div></div>
          <button type="submit" disabled={loading} className="button-primary w-full !min-h-12">{loading ? <><Loader2 className="h-5 w-5 animate-spin" /> Sending secure link…</> : <>Send reset link <ArrowRight className="h-5 w-5" /></>}</button>
          <Link href="/login" className="button-quiet w-full"><ArrowLeft className="h-4 w-4" /> Back to sign in</Link>
        </form>
      )}
    </AuthShell>
  );
}
