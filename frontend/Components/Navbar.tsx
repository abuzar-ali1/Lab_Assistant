'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, LogOut, User, Settings, Bell, ChevronDown, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface UserData {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  username: string;
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      setIsAuthenticated(true);
      fetchUserProfile();
    } else {
      setIsAuthenticated(false);
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      const { data } = await api.get('/auth/profile/');
      setUser(data);
    } catch (error) {
      console.error('Failed to fetch profile');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      await api.post('/auth/logout/', { refresh: refreshToken });
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setIsAuthenticated(false);
      setUser(null);
      toast.success('Logged out successfully');
      setProfileOpen(false);
      router.push('/');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  const userInitials = user
    ? `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`
        .toUpperCase()
        .substring(0, 2) || user.username[0].toUpperCase()
    : '';

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-neutral-200/50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-xl flex items-center justify-center shadow-md shadow-indigo-200">
                <Activity className="w-5 h-5 text-white transition-transform group-hover:rotate-12" />
              </div>
              <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-neutral-900 to-neutral-700 bg-clip-text text-transparent">
                LabSaathi
              </span>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center gap-1 bg-neutral-100/80 p-1 rounded-xl border border-neutral-200/30">
              <NavLink href="/upload" label="Upload" />
              <NavLink href="/reports" label="Reports" />
              <NavLink href="/trends" label="Trends" />
            </div>
          )}

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {!loading && (
              <>
                {isAuthenticated ? (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="hidden sm:inline-flex items-center justify-center w-10 h-10 rounded-xl bg-neutral-100 text-neutral-600 hover:bg-neutral-200/70 transition-colors relative"
                    >
                      <Bell className="w-4 h-4" />
                      <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-indigo-600 rounded-full" />
                    </motion.button>

                    {/* Profile Trigger */}
                    <div className="relative">
                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => setProfileOpen(!profileOpen)}
                        className="hidden sm:flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl bg-neutral-50 hover:bg-neutral-100 border border-neutral-200/60 transition-colors"
                      >
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                          {userInitials}
                        </div>
                        <div className="text-left hidden md:block">
                          <p className="text-xs font-medium text-neutral-800 leading-none">
                            {user?.first_name || user?.username}
                          </p>
                        </div>
                        <ChevronDown className={`w-3.5 h-3.5 text-neutral-500 transition-transform duration-300 ${profileOpen ? 'rotate-180' : ''}`} />
                      </motion.button>

                      {/* Dropdown Menu */}
                      <AnimatePresence>
                        {profileOpen && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                            className="absolute right-0 mt-2 w-64 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-neutral-200/60 overflow-hidden py-1.5"
                          >
                            <div className="px-4 py-3 border-b border-neutral-100 bg-neutral-50/50">
                              <p className="font-semibold text-neutral-900 text-sm">{user?.first_name} {user?.last_name}</p>
                              <p className="text-xs text-neutral-500 truncate mt-0.5">{user?.email}</p>
                            </div>
                            <ProfileMenuItem icon={<User className="w-4 h-4" />} label="My Profile" href="/profile" onClick={() => setProfileOpen(false)} />
                            <ProfileMenuItem icon={<Settings className="w-4 h-4" />} label="Settings" href="/settings" onClick={() => setProfileOpen(false)} />
                            <div className="h-px bg-neutral-200/60 my-1" />
                            <button
                              onClick={handleLogout}
                              className="w-full px-4 py-2 flex items-center gap-3 text-rose-600 hover:bg-rose-50 transition-colors text-sm font-medium"
                            >
                              <LogOut className="w-4 h-4" />
                              Logout
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setMobileOpen(!mobileOpen)}
                      className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl bg-neutral-100 text-neutral-600"
                    >
                      {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </motion.button>
                  </>
                ) : (
                  <div className="hidden sm:flex items-center gap-2">
                    <button onClick={() => router.push('/login')} className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors">
                      Sign In
                    </button>
                    <button onClick={() => router.push('/register')} className="px-4 py-2 text-sm font-medium bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors shadow-sm">
                      Sign Up
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-neutral-200 bg-white overflow-hidden shadow-inner"
          >
            <div className="px-4 py-4 space-y-1.5">
              {isAuthenticated ? (
                <>
                  <MobileNavLink href="/upload" label="Upload Report" onClick={() => setMobileOpen(false)} />
                  <MobileNavLink href="/reports" label="My Reports" onClick={() => setMobileOpen(false)} />
                  <MobileNavLink href="/trends" label="Health Trends" onClick={() => setMobileOpen(false)} />
                  <div className="h-px bg-neutral-100 my-2" />
                  <button
                    onClick={() => { handleLogout(); setMobileOpen(false); }}
                    className="w-full px-4 py-2.5 rounded-xl bg-rose-50 text-rose-600 text-sm font-semibold flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button onClick={() => { router.push('/login'); setMobileOpen(false); }} className="px-4 py-2.5 rounded-xl text-neutral-700 font-medium bg-neutral-50 border border-neutral-200 text-center text-sm">Sign In</button>
                  <button onClick={() => { router.push('/register'); setMobileOpen(false); }} className="px-4 py-2.5 rounded-xl text-white font-medium bg-indigo-600 text-center text-sm">Sign Up</button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href}>
      <span className="px-4 py-1.5 rounded-lg text-sm font-medium text-neutral-600 hover:text-neutral-900 hover:bg-white transition-all cursor-pointer block inline-flex items-center">
        {label}
      </span>
    </Link>
  );
}

function ProfileMenuItem({ icon, label, href, onClick }: { icon: React.ReactNode; label: string; href: string; onClick: () => void }) {
  return (
    <Link href={href} onClick={onClick} className="flex items-center gap-3 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors font-medium">
      <span className="text-neutral-400">{icon}</span>
      {label}
    </Link>
  );
}

function MobileNavLink({ href, label, onClick }: { href: string; label: string; onClick: () => void }) {
  return (
    <Link href={href} onClick={onClick} className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors">
      {label}
    </Link>
  );
}