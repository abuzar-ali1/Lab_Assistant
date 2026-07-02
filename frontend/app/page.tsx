'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Upload, MessageSquare, Activity, User, LogOut, ChevronRight, BrainCircuit } from 'lucide-react';
import { useAuth } from '@/Context/AuthContext';

export default function HomePage() {
  const { user, logout, loading } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  return (
    <div className="min-h-screen bg-neutral-50 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Navigation Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-neutral-900">
              Lab Assistant AI
            </span>
          </div>

          <div className="relative">
            {user ? (
              <div className="relative">
                <button 
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-3 hover:bg-neutral-100 p-2 rounded-xl transition-colors"
                >
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-semibold text-neutral-900">{user.first_name} {user.last_name}</p>
                    <p className="text-xs text-neutral-500">{user.email}</p>
                  </div>
                  <div className="bg-indigo-100 p-2 rounded-full text-indigo-700">
                    <User className="w-5 h-5" />
                  </div>
                </button>

                {/* Profile Dropdown */}
                <AnimatePresence>
                  {showProfileMenu && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-neutral-100 overflow-hidden"
                    >
                      <div className="p-4 border-b border-neutral-100 sm:hidden">
                        <p className="text-sm font-semibold text-neutral-900">{user.first_name} {user.last_name}</p>
                        <p className="text-xs text-neutral-500 truncate">{user.email}</p>
                      </div>
                      <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 transition-colors text-sm text-neutral-700 font-medium">
                        <Activity className="w-4 h-4" /> Go to Dashboard
                      </Link>
                      <button 
                        onClick={async () => {
                          await logout();
                          setShowProfileMenu(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-rose-50 transition-colors text-sm text-rose-600 font-medium"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link href="/login">
                <button 
                  className="bg-neutral-900 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-neutral-800 transition-all shadow-sm hover:shadow-md"
                >
                  Sign In
                </button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="text-center max-w-4xl mx-auto"
        >
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-medium mb-8">
            <span className="flex h-2 w-2 rounded-full bg-indigo-500"></span>
            Open Source Medical AI
          </motion.div>
          
          <motion.h1 variants={fadeInUp} className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-neutral-900 tracking-tight leading-[1.1]">
            Understand your medical reports <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-500">instantly.</span>
          </motion.h1>
          
          <motion.p variants={fadeInUp} className="mt-6 text-lg sm:text-xl text-neutral-500 max-w-2xl mx-auto leading-relaxed">
            Upload your lab results and let our AI translate complex medical jargon into simple language. Ask questions and get answers based strictly on your personal report.
          </motion.p>

          <motion.div variants={fadeInUp} className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href={user ? "/dashboard" : "/login"}>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-2xl text-lg font-bold shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all"
              >
                Analyze a Report <ChevronRight className="w-5 h-5" />
              </motion.button>
            </Link>
            <p className="text-sm text-neutral-400 font-medium px-4">Fully localized in English & Roman Urdu</p>
          </motion.div>
        </motion.div>

        {/* How it Works - Animated Cards */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {/* Step 1 */}
          <motion.div variants={fadeInUp} className="relative p-8 rounded-3xl bg-white border border-neutral-200 shadow-sm hover:shadow-xl transition-shadow duration-300">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mb-6">
              <Upload className="w-7 h-7 text-indigo-600" />
            </div>
            <h3 className="text-xl font-bold text-neutral-900 mb-3">1. Upload Report</h3>
            <p className="text-neutral-500 leading-relaxed">
              Take a photo of your medical lab report or upload a PDF. Our secure pipeline instantly reads the text using advanced OCR.
            </p>
          </motion.div>

          {/* Step 2 */}
          <motion.div variants={fadeInUp} className="relative p-8 rounded-3xl bg-white border border-neutral-200 shadow-sm hover:shadow-xl transition-shadow duration-300">
            <div className="w-14 h-14 rounded-2xl bg-violet-50 flex items-center justify-center mb-6">
              <BrainCircuit className="w-7 h-7 text-violet-600" />
            </div>
            <h3 className="text-xl font-bold text-neutral-900 mb-3">2. AI Processing</h3>
            <p className="text-neutral-500 leading-relaxed">
              The AI analyzes your specific values against standard medical ranges, highlighting if anything is out of bounds or dangerous.
            </p>
          </motion.div>

          {/* Step 3 */}
          <motion.div variants={fadeInUp} className="relative p-8 rounded-3xl bg-white border border-neutral-200 shadow-sm hover:shadow-xl transition-shadow duration-300">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mb-6">
              <MessageSquare className="w-7 h-7 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-neutral-900 mb-3">3. Contextual Chat</h3>
            <p className="text-neutral-500 leading-relaxed">
              Have a conversation with the AI. Ask questions like "What does low Hemoglobin mean?" and get answers tailored strictly to your uploaded document.
            </p>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}