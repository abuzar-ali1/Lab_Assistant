'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, LogOut, User, Settings, Bell, Search, ChevronDown, MoreVertical } from 'lucide-react';
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

  const profileMenuVariants = {
    hidden: { opacity: 0, y: -10, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.2, ease: 'easeOut' },
    },
    exit: { opacity: 0, y: -10, scale: 0.95, transition: { duration: 0.15 } },
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="fixed top-0 w-full bg-white/95 backdrop-blur-md border-b border-gray-200 z-50 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-gradient-to-r from-teal-600 to-emerald-500 rounded-lg shadow-md flex items-center justify-center">
                <span className="text-white font-bold text-lg">⚕️</span>
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-teal-600 to-emerald-500 bg-clip-text text-transparent hidden sm:inline">
                LabSaathi
              </span>
            </Link>
          </motion.div>

          {/* Center: Desktop Navigation */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center gap-1">
              <NavLink href="/upload" icon="📤" label="Upload" />
              <NavLink href="/reports" icon="📋" label="Reports" />
              <NavLink href="/trends" icon="📈" label="Trends" />
            </div>
          )}

          {/* Right: Auth & Profile */}
          <div className="flex items-center gap-3 sm:gap-4">
            {!loading && (
              <>
                {isAuthenticated ? (
                  <>
                    {/* Notifications - Desktop */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="hidden sm:inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 transition relative"
                    >
                      <Bell className="w-5 h-5 text-gray-600" />
                      <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    </motion.button>

                    {/* Profile Dropdown */}
                    <div className="relative">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setProfileOpen(!profileOpen)}
                        className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-teal-50 to-emerald-50 hover:from-teal-100 hover:to-emerald-100 border border-teal-200 hover:border-teal-300 transition"
                      >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-teal-600 to-emerald-500 flex items-center justify-center text-white text-sm font-bold">
                          {userInitials}
                        </div>
                        <div className="text-left hidden md:block">
                          <p className="text-xs text-gray-500">Welcome</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {user?.first_name || user?.username}
                          </p>
                        </div>
                        <ChevronDown
                          className={`w-4 h-4 text-gray-600 transition ${
                            profileOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </motion.button>

                      {/* Profile Dropdown Menu */}
                      <AnimatePresence>
                        {profileOpen && (
                          <motion.div
                            variants={profileMenuVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden"
                          >
                            {/* User Info */}
                            <div className="px-4 py-4 bg-gradient-to-r from-teal-50 to-emerald-50 border-b border-gray-200">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-teal-600 to-emerald-500 flex items-center justify-center text-white font-bold text-lg">
                                  {userInitials}
                                </div>
                                <div className="flex-1">
                                  <p className="font-semibold text-gray-900">
                                    {user?.first_name} {user?.last_name}
                                  </p>
                                  <p className="text-xs text-gray-500">{user?.email}</p>
                                </div>
                              </div>
                            </div>

                            {/* Menu Items */}
                            <div className="py-2">
                              <ProfileMenuItem
                                icon={<User className="w-4 h-4" />}
                                label="My Profile"
                                href="/profile"
                                onClick={() => setProfileOpen(false)}
                              />
                              <ProfileMenuItem
                                icon={<Settings className="w-4 h-4" />}
                                label="Settings"
                                href="/settings"
                                onClick={() => setProfileOpen(false)}
                              />
                              <div className="h-px bg-gray-200 my-2" />
                              <button
                                onClick={handleLogout}
                                className="w-full px-4 py-2.5 flex items-center gap-3 text-red-600 hover:bg-red-50 transition text-sm font-medium"
                              >
                                <LogOut className="w-4 h-4" />
                                Logout
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Mobile Menu Button */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setMobileOpen(!mobileOpen)}
                      className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
                    >
                      {mobileOpen ? (
                        <X className="w-5 h-5 text-gray-600" />
                      ) : (
                        <Menu className="w-5 h-5 text-gray-600" />
                      )}
                    </motion.button>
                  </>
                ) : (
                  <>
                    {/* Login/Register Buttons - Desktop */}
                    <div className="hidden sm:flex items-center gap-3">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => router.push('/login')}
                        className="px-4 py-2 rounded-lg text-teal-600 font-semibold hover:bg-teal-50 transition"
                      >
                        Sign In
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => router.push('/register')}
                        className="px-4 py-2 rounded-lg bg-gradient-to-r from-teal-600 to-emerald-500 text-white font-semibold hover:shadow-lg transition"
                      >
                        Sign Up
                      </motion.button>
                    </div>

                    {/* Mobile Menu Button */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setMobileOpen(!mobileOpen)}
                      className="sm:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
                    >
                      {mobileOpen ? (
                        <X className="w-5 h-5 text-gray-600" />
                      ) : (
                        <Menu className="w-5 h-5 text-gray-600" />
                      )}
                    </motion.button>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden border-t border-gray-200 bg-gray-50"
            >
              <div className="px-4 py-4 space-y-2">
                {isAuthenticated ? (
                  <>
                    {/* Mobile User Info */}
                    <div className="px-3 py-3 bg-white rounded-lg mb-2 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-teal-600 to-emerald-500 flex items-center justify-center text-white font-bold">
                        {userInitials}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">
                          {user?.first_name || user?.username}
                        </p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                    </div>

                    {/* Mobile Navigation */}
                    <MobileNavLink href="/upload" icon="📤" label="Upload Report" onClick={() => setMobileOpen(false)} />
                    <MobileNavLink href="/reports" icon="📋" label="My Reports" onClick={() => setMobileOpen(false)} />
                    <MobileNavLink href="/trends" icon="📈" label="Health Trends" onClick={() => setMobileOpen(false)} />
                    <MobileNavLink href="/profile" icon="👤" label="My Profile" onClick={() => setMobileOpen(false)} />
                    <MobileNavLink href="/settings" icon="⚙️" label="Settings" onClick={() => setMobileOpen(false)} />

                    <div className="h-px bg-gray-200 my-2" />

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        handleLogout();
                        setMobileOpen(false);
                      }}
                      className="w-full px-3 py-2.5 rounded-lg bg-red-100 text-red-700 font-semibold hover:bg-red-200 transition flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </motion.button>
                  </>
                ) : (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        router.push('/login');
                        setMobileOpen(false);
                      }}
                      className="w-full px-4 py-2.5 rounded-lg text-teal-600 font-semibold hover:bg-teal-50 transition border border-teal-200"
                    >
                      Sign In
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        router.push('/register');
                        setMobileOpen(false);
                      }}
                      className="w-full px-4 py-2.5 rounded-lg bg-gradient-to-r from-teal-600 to-emerald-500 text-white font-semibold hover:shadow-lg transition"
                    >
                      Sign Up
                    </motion.button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}

// Helper Components
function NavLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: string;
  label: string;
}) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition font-medium flex items-center gap-2 cursor-pointer"
      >
        <span>{icon}</span>
        <span>{label}</span>
      </motion.div>
    </Link>
  );
}

function ProfileMenuItem({
  icon,
  label,
  href,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  href: string;
  onClick: () => void;
}) {
  return (
    <Link href={href}>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className="w-full px-4 py-2.5 flex items-center gap-3 text-gray-700 hover:bg-gray-50 transition text-sm font-medium"
      >
        <span className="text-gray-600">{icon}</span>
        {label}
      </motion.button>
    </Link>
  );
}

function MobileNavLink({
  href,
  icon,
  label,
  onClick,
}: {
  href: string;
  icon: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className="px-3 py-2.5 rounded-lg text-gray-700 hover:bg-white transition font-medium flex items-center gap-3 cursor-pointer"
      >
        <span className="text-lg">{icon}</span>
        <span>{label}</span>
      </motion.div>
    </Link>
  );
}