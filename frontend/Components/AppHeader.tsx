"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, FileClock, LayoutDashboard, LogOut, Menu, Upload, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import BrandMark from "@/Components/BrandMark";
import { useAuth } from "@/Context/AuthContext";

const appLinks = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/reports", label: "Reports", icon: FileClock },
  { href: "/upload", label: "Analyze", icon: Upload },
];

export default function AppHeader({ publicNavigation = false }: { publicNavigation?: boolean }) {
  const { user, logout, loading } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const initials = `${user?.first_name?.[0] || ""}${user?.last_name?.[0] || ""}` || user?.email?.[0] || "L";

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/60 bg-[rgba(247,250,248,0.82)] backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label="LabSaathi home" className="rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]">
          <BrandMark />
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary navigation">
          {publicNavigation && !user ? (
            <>
              <a href="#how-it-works" className="nav-link">How it works</a>
              <a href="#features" className="nav-link">Why LabSaathi</a>
              <a href="#safety" className="nav-link">Safety</a>
            </>
          ) : (
            appLinks.map(({ href, label }) => (
              <Link key={href} href={href} className={`nav-link ${pathname === href ? "nav-link-active" : ""}`}>
                {label}
              </Link>
            ))
          )}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {!loading && user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileOpen((open) => !open)}
                className="flex items-center gap-2 rounded-full border border-[var(--line)] bg-white py-1.5 pl-1.5 pr-3 shadow-[0_8px_24px_rgba(28,65,55,0.06)] transition hover:border-[var(--brand-soft)]"
                aria-expanded={profileOpen}
                aria-label="Open profile menu"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--brand-pale)] text-xs font-extrabold uppercase text-[var(--brand-dark)]">
                  {initials}
                </span>
                <span className="max-w-28 truncate text-sm font-bold text-[var(--ink)]">{user.first_name || "My space"}</span>
                <ChevronDown className={`h-4 w-4 text-[var(--muted)] transition-transform ${profileOpen ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.97 }}
                    className="absolute right-0 top-12 w-64 overflow-hidden rounded-2xl border border-[var(--line)] bg-white p-2 shadow-[0_24px_60px_rgba(28,65,55,0.16)]"
                  >
                    <div className="border-b border-[var(--line)] px-3 py-3">
                      <p className="truncate text-sm font-extrabold text-[var(--ink)]">{user.first_name} {user.last_name}</p>
                      <p className="mt-0.5 truncate text-xs text-[var(--muted)]">{user.email}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => logout()}
                      className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-bold text-[#b44747] transition hover:bg-[#fff1ee]"
                    >
                      <LogOut className="h-4 w-4" /> Sign out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : !loading ? (
            <>
              <Link href="/login" className="px-3 py-2 text-sm font-bold text-[var(--ink)] hover:text-[var(--brand)]">Sign in</Link>
              <Link href="/register" className="button-primary !min-h-10 !px-5 !py-2 text-sm">Create account</Link>
            </>
          ) : (
            <span className="h-10 w-28 animate-pulse rounded-full bg-white" />
          )}
        </div>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--line)] bg-white text-[var(--ink)] md:hidden"
          onClick={() => setMobileOpen((open) => !open)}
          aria-label="Toggle navigation"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-[var(--line)] bg-[var(--paper)] md:hidden"
          >
            <nav className="space-y-1 px-4 py-4" aria-label="Mobile navigation">
              {(publicNavigation && !user
                ? [
                    { href: "#how-it-works", label: "How it works", icon: LayoutDashboard },
                    { href: "#features", label: "Why LabSaathi", icon: FileClock },
                    { href: "#safety", label: "Safety", icon: Upload },
                  ]
                : appLinks
              ).map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-[var(--ink)] hover:bg-[var(--brand-pale)]"
                >
                  <Icon className="h-4 w-4 text-[var(--brand)]" /> {label}
                </Link>
              ))}
              <div className="mt-3 border-t border-[var(--line)] pt-3">
                {user ? (
                  <button onClick={() => logout()} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-[#b44747]">
                    <LogOut className="h-4 w-4" /> Sign out
                  </button>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Link href="/login" className="button-secondary justify-center">Sign in</Link>
                    <Link href="/register" className="button-primary justify-center">Join free</Link>
                  </div>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
