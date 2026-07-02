'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Upload, Clock, AlertTriangle, ChevronRight, Activity, FileText, Plus } from 'lucide-react';
import ProtectedRoute from '@/Components/ProtectedRoute';
import api from '@/lib/api';
import EmptyState from '@/Components/EmptyState';
import ReportCard from '@/Components/ReportCard';

// If you haven't updated your StatCard component yet, you can use this modern inline version
// to guarantee it matches the new UI perfectly.
const ModernStatCard = ({ icon, label, value, bgColor, iconColor }: any) => (
  <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm hover:shadow-md transition-shadow flex items-center gap-5">
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${bgColor}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-neutral-500 mb-1">{label}</p>
      <h3 className="text-2xl font-bold text-neutral-900">{value}</h3>
    </div>
  </div>
);

interface ReportSummary {
  id: number;
  original_filename: string;
  status: string;
  created_at: string;
  abnormal_count: number;
  total_tests: number;
}

export default function DashboardPage() {
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    abnormal: 0,
    recent: null as any,
  });

  useEffect(() => {
    // Mocking the API call for visual testing. Replace with your actual api.get
    setTimeout(() => {
      setReports([
        { id: 1, original_filename: 'CBC_Blood_Test_June.pdf', status: 'completed', created_at: '2026-06-28T10:00:00Z', abnormal_count: 2, total_tests: 15 },
        { id: 2, original_filename: 'Lipid_Profile.jpg', status: 'completed', created_at: '2026-06-15T14:30:00Z', abnormal_count: 0, total_tests: 8 },
      ]);
      setLoading(false);
    }, 1500);
  }, []);

  useEffect(() => {
    if (reports.length > 0) {
      const totalAbnormal = reports.reduce((sum, r) => sum + r.abnormal_count, 0);
      const recent = reports[0];
      setStats({ total: reports.length, abnormal: totalAbnormal, recent });
    }
  }, [reports]);

  // Framer Motion Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 100, damping: 15 },
    },
  };

  const slicedReports = reports?.slice(0, 10) || [];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-neutral-50 pt-28 pb-16">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          {/* Dashboard Header */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-4">
                <Activity className="w-4 h-4" /> Workspace
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight text-neutral-900 sm:text-5xl">
                My Reports
              </h1>
              <p className="text-neutral-500 mt-2 text-base sm:text-lg">
                Track your medical history in <span className="font-semibold text-indigo-600">English & Urdu</span>
              </p>
            </div>
            
            <Link href="/upload" className="w-full sm:w-auto">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3.5 rounded-2xl font-bold shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all"
              >
                <Plus className="w-5 h-5" />
                New Analysis
              </motion.button>
            </Link>
          </motion.div>

          {/* Core Analytics Cards */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <ModernStatCard
              icon={<FileText className="w-6 h-6 text-indigo-600" />}
              bgColor="bg-indigo-50"
              label="Analyzed Reports"
              value={stats.total}
            />
            <ModernStatCard
              icon={<AlertTriangle className="w-6 h-6 text-rose-600" />}
              bgColor="bg-rose-50"
              label="Abnormal Outliers"
              value={stats.abnormal}
            />
            <ModernStatCard
              icon={<Clock className="w-6 h-6 text-amber-600" />}
              bgColor="bg-amber-50"
              label="Last Evaluation"
              value={stats.recent ? new Date(stats.recent.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '--'}
            />
          </motion.div>

          {/* Documents Content Grid */}
          <motion.div variants={itemVariants} className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-neutral-900">Recent Health Stream</h2>
              {reports.length > 0 && (
                <Link href="/reports" className="inline-flex items-center gap-1 text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
                  View Full History <ChevronRight className="w-4 h-4" />
                </Link>
              )}
            </div>

            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-neutral-50 border border-neutral-100 h-24 rounded-2xl animate-pulse" />
                  ))}
                </motion.div>
              ) : reports.length === 0 ? (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <EmptyState />
                </motion.div>
              ) : (
                <motion.div key="list" className="space-y-4">
                  {slicedReports.map((report, idx) => (
                    <motion.div
                      key={report.id}
                      variants={itemVariants}
                      custom={idx}
                      className="group"
                    >
                      {/* Assuming your ReportCard looks good. If not, this is a wrapper that forces nice styling */}
                      <div className="transition-all duration-200 hover:-translate-y-1">
                        <ReportCard report={report} />
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </div>
    </ProtectedRoute>
  );
}