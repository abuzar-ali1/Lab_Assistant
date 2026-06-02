'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, LogOut, User, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      await api.post('/auth/logout/', { refresh: refreshToken });
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      toast.success('Logged out successfully');
      router.push('/login');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-200 z-50 shadow-sm"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-teal-600 to-emerald-500 rounded-lg" />
            <span className="font-bold text-xl bg-gradient-to-r from-teal-600 to-emerald-500 bg-clip-text text-transparent">
              LabSaathi
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/upload" className="text-gray-700 hover:text-teal-600 font-medium transition">
              Upload
            </Link>
            <Link href="/reports" className="text-gray-700 hover:text-teal-600 font-medium transition">
              Reports
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition font-medium"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setOpen(!open)}
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="md:hidden pb-4 border-t border-gray-200"
            >
              <Link href="/upload" className="block py-2 text-gray-700 hover:text-teal-600">
                Upload Report
              </Link>
              <Link href="/reports" className="block py-2 text-gray-700 hover:text-teal-600">
                My Reports
              </Link>
              <button
                onClick={handleLogout}
                className="w-full mt-4 py-2 rounded-lg bg-red-100 text-red-700 font-medium hover:bg-red-200 transition"
              >
                Logout
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}