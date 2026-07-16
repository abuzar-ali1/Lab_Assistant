"use client";

import { ArrowRight, Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";
import AuthShell from "@/Components/AuthShell";
import GoogleAuthButton from "@/Components/GoogleAuthButton";
import { useAuth } from "@/Context/AuthContext";
import { getApiError } from "@/lib/errors";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      await login(email.trim(), password);
      toast.success("Welcome back");
    } catch (error) {
      toast.error(getApiError(error, "That email and password did not match."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell eyebrow="Welcome back" title="Continue your health timeline." description="Sign in to revisit previous reports or create a new bilingual clarity brief.">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="email" className="form-label">Email address</label>
          <div className="relative"><Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" /><input id="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="form-field !pl-11" required /></div>
        </div>
        <div>
          <div className="flex items-center justify-between"><label htmlFor="password" className="form-label">Password</label><Link href="/forgot-password" className="mb-2 text-xs font-extrabold text-[var(--brand-dark)] hover:underline">Forgot password?</Link></div>
          <div className="relative"><Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" /><input id="password" type={showPassword ? "text" : "password"} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" className="form-field !px-11" required /><button type="button" onClick={() => setShowPassword((show) => !show)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--surface-soft)]" aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div>
        </div>
        <button type="submit" disabled={loading} className="button-primary w-full !min-h-12">{loading ? <><Loader2 className="h-5 w-5 animate-spin" /> Opening your space…</> : <>Sign in <ArrowRight className="h-5 w-5" /></>}</button>
      </form>
      <div className="my-6 flex items-center gap-3"><span className="h-px flex-1 bg-[var(--line)]" /><span className="text-[0.68rem] font-extrabold uppercase tracking-wider text-[var(--muted)]">or</span><span className="h-px flex-1 bg-[var(--line)]" /></div>
      <GoogleAuthButton label="Continue with Google" />
      <p className="mt-7 text-center text-sm text-[var(--muted)]">New to LabSaathi? <Link href="/register" className="font-extrabold text-[var(--brand-dark)] hover:underline">Create a free account</Link></p>
    </AuthShell>
  );
}
