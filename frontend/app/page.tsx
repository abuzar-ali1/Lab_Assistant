'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import ProtectedRoute from '@/Components/ProtectedRoute';
import api from '@/lib/api';
import Link from 'next/link';
import { Upload, Clock, AlertTriangle, ChevronRight, Layers } from 'lucide-react';
import EmptyState from '@/Components/EmptyState';
import ReportCard from '@/Components/ReportCard';
import StatCard from '@/Components/StatCard';

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
    Promise.all([
      api.get('/api/reports/').then(({ data }) => setReports(data)),
    ])
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (reports.length > 0) {
      const totalAbnormal = reports.reduce((sum, r) => sum + r.abnormal_count, 0);
      const recent = reports[0];
      setStats({ total: reports.length, abnormal: totalAbnormal, recent });
    }
  }, [reports]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.06 }
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 120, damping: 18 },
    },
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] bg-neutral-50/60 pt-24 pb-16">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          {/* Dashboard Header */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10 pb-6 border-b border-neutral-200/60">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl">
                Analysis Workspace
              </h1>
              <p className="text-neutral-500 mt-1.5 text-sm sm:text-base">
                AI powered multi-lingual laboratory tracking • <span className="font-semibold text-indigo-600">Urdu & English</span>
              </p>
            </div>
            <Link href="/upload">
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center justify-center gap-2 bg-neutral-900 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm hover:bg-neutral-800 transition-all text-sm w-full sm:w-auto"
              >
                <Upload className="w-4 h-4" />
                Upload New Report
              </motion.button>
            </Link>
          </motion.div>

          {/* Core Analytics Cards */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
            <StatCard
              icon={<Layers className="w-5 h-5 text-indigo-600" />}
              label="Processed Invoices"
              value={stats.total}
              color="indigo"
            />
            <StatCard
              icon={<AlertTriangle className="w-5 h-5 text-rose-600" />}
              label="Abnormal Outliers"
              value={stats.abnormal}
              color="rose"
            />
            <StatCard
              icon={<Clock className="w-5 h-5 text-amber-600" />}
              label="Last Evaluation"
              value={stats.recent ? new Date(stats.recent.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'None'}
              color="amber"
            />
          </motion.div>

          {/* Documents Content Grid */}
          <motion.div variants={itemVariants} className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-lg font-bold text-neutral-900">Recent Health Stream</h2>
              {reports.length > 0 && (
                <Link href="/reports" className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
                  View full index <ChevronRight className="w-4 h-4" />
                </Link>
              )}
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white border border-neutral-200/60 h-20 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : reports.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="space-y-3">
                {reports.slice(0, 5).map((report, idx) => (
                  <motion.div
                    key={report.id}
                    variants={itemVariants}
                    custom={idx}
                  >
                    <ReportCard report={report} />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </ProtectedRoute>
  );
}