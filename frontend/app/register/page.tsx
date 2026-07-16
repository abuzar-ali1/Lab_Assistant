"use client";

import { ArrowRight, Check, Eye, EyeOff, Loader2, Lock } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import AuthShell from "@/Components/AuthShell";
import GoogleAuthButton from "@/Components/GoogleAuthButton";
import { useAuth } from "@/Context/AuthContext";
import { getApiError } from "@/lib/errors";
import type { RegisterPayload } from "@/lib/types";

const initialForm: RegisterPayload = { email: "", username: "", first_name: "", last_name: "", password: "", password_confirm: "" };

export default function RegisterPage() {
  const { register } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const passwordChecks = useMemo(() => [
    { label: "8+ characters", valid: form.password.length >= 8 },
    { label: "one uppercase letter", valid: /[A-Z]/.test(form.password) },
    { label: "one number", valid: /\d/.test(form.password) },
  ], [form.password]);

  const update = (event: React.ChangeEvent<HTMLInputElement>) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (form.password !== form.password_confirm) return toast.error("Passwords do not match.");
    if (!passwordChecks.every((item) => item.valid)) return toast.error("Please complete all password requirements.");
    setLoading(true);
    try {
      await register({ ...form, email: form.email.trim(), username: form.username.trim() });
      toast.success("Your health space is ready");
    } catch (error) {
      toast.error(getApiError(error, "We could not create your account."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell eyebrow="Create your space" title="Start a clearer health record." description="Keep report explanations, Urdu translations, and doctor questions together in one private timeline.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label htmlFor="first_name" className="form-label">First name</label><input id="first_name" name="first_name" value={form.first_name} onChange={update} placeholder="Ayesha" className="form-field" required /></div>
          <div><label htmlFor="last_name" className="form-label">Last name</label><input id="last_name" name="last_name" value={form.last_name} onChange={update} placeholder="Khan" className="form-field" required /></div>
        </div>
        <div><label htmlFor="register-email" className="form-label">Email address</label><input id="register-email" name="email" type="email" autoComplete="email" value={form.email} onChange={update} placeholder="you@example.com" className="form-field" required /></div>
        <div><label htmlFor="username" className="form-label">Username</label><input id="username" name="username" autoComplete="username" value={form.username} onChange={update} placeholder="ayesha_khan" className="form-field" required /></div>
        <div>
          <label htmlFor="new-password" className="form-label">Password</label>
          <div className="relative"><Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" /><input id="new-password" name="password" type={showPassword ? "text" : "password"} autoComplete="new-password" value={form.password} onChange={update} placeholder="Create a strong password" className="form-field !px-11" required /><button type="button" onClick={() => setShowPassword((show) => !show)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--surface-soft)]" aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div>
          {form.password && <div className="mt-2 flex flex-wrap gap-2">{passwordChecks.map((item) => <span key={item.label} className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[0.65rem] font-bold ${item.valid ? "bg-[var(--brand-pale)] text-[var(--brand-dark)]" : "bg-[#edf1ef] text-[var(--muted)]"}`}><Check className="h-3 w-3" /> {item.label}</span>)}</div>}
        </div>
        <div><label htmlFor="confirm-password" className="form-label">Confirm password</label><input id="confirm-password" name="password_confirm" type={showPassword ? "text" : "password"} autoComplete="new-password" value={form.password_confirm} onChange={update} placeholder="Repeat your password" className="form-field" required /></div>
        <button type="submit" disabled={loading} className="button-primary w-full !min-h-12">{loading ? <><Loader2 className="h-5 w-5 animate-spin" /> Creating your space…</> : <>Create my account <ArrowRight className="h-5 w-5" /></>}</button>
      </form>
      <div className="my-6 flex items-center gap-3"><span className="h-px flex-1 bg-[var(--line)]" /><span className="text-[0.68rem] font-extrabold uppercase tracking-wider text-[var(--muted)]">or</span><span className="h-px flex-1 bg-[var(--line)]" /></div>
      <GoogleAuthButton label="Sign up with Google" />
      <p className="mt-7 text-center text-sm text-[var(--muted)]">Already have an account? <Link href="/login" className="font-extrabold text-[var(--brand-dark)] hover:underline">Sign in</Link></p>
    </AuthShell>
  );
}
