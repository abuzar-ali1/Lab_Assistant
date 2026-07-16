"use client";

import { ArrowRight, CheckCircle2, Eye, EyeOff, Loader2, LockKeyhole } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";
import AuthShell from "@/Components/AuthShell";
import api from "@/lib/api";
import { getApiError } from "@/lib/errors";

export default function ResetPasswordForm({ uid, token }: { uid: string; token: string }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [complete, setComplete] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (password !== confirm) return toast.error("Passwords do not match.");
    setLoading(true);
    try {
      await api.post("/api/reset-password/", { uid, token, new_password: password, new_password_confirm: confirm });
      setComplete(true);
    } catch (error) {
      toast.error(getApiError(error, "This reset link is invalid or has expired."));
    } finally {
      setLoading(false);
    }
  };

  const validLink = Boolean(uid && token);
  return (
    <AuthShell eyebrow="Secure reset" title={complete ? "Your password is ready." : "Choose a new password."} description={complete ? "You can now return to your private health space." : "Use at least eight characters with an uppercase letter and a number."}>
      {complete ? (
        <div className="surface-card p-8 text-center"><CheckCircle2 className="mx-auto h-12 w-12 text-[var(--brand)]" /><Link href="/login" className="button-primary mt-6 w-full">Sign in now <ArrowRight className="h-4 w-4" /></Link></div>
      ) : !validLink ? (
        <div className="surface-card p-8 text-center"><LockKeyhole className="mx-auto h-10 w-10 text-[var(--coral)]" /><h2 className="mt-4 font-extrabold">This reset link is incomplete.</h2><p className="mt-2 text-sm text-[var(--muted)]">Request a fresh link to continue safely.</p><Link href="/forgot-password" className="button-secondary mt-6 w-full">Request another link</Link></div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div><label htmlFor="reset-password" className="form-label">New password</label><div className="relative"><input id="reset-password" type={show ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} className="form-field !pr-11" autoComplete="new-password" required minLength={8} /><button type="button" onClick={() => setShow((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-[var(--muted)]" aria-label={show ? "Hide password" : "Show password"}>{show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></div>
          <div><label htmlFor="reset-confirm" className="form-label">Confirm new password</label><input id="reset-confirm" type={show ? "text" : "password"} value={confirm} onChange={(event) => setConfirm(event.target.value)} className="form-field" autoComplete="new-password" required minLength={8} /></div>
          <button type="submit" disabled={loading} className="button-primary w-full">{loading ? <><Loader2 className="h-5 w-5 animate-spin" /> Updating password…</> : <>Update password <ArrowRight className="h-4 w-4" /></>}</button>
        </form>
      )}
    </AuthShell>
  );
}
