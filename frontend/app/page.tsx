'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import ProtectedRoute from '@/Components/ProtectedRoute';
import api from '@/lib/api';
import Link from 'next/link';
import { Upload, Clock, AlertCircle, ChevronRight } from 'lucide-react';
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
      api.get('/reports/').then(({ data }) => setReports(data)),
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
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-slate-100 pt-20 pb-12">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          {/* Hero Section */}
          <motion.div variants={itemVariants} className="mb-12">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-teal-600 via-teal-500 to-emerald-500 bg-clip-text text-transparent mb-2">
                  LabSaathi Dashboard
                </h1>
                <p className="text-gray-600 text-lg">
                  Understand your health reports in plain {' '}
                  <span className="font-semibold text-teal-600">Urdu & English</span>
                </p>
              </div>
              <Link href="/upload">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 bg-gradient-to-r from-teal-600 to-emerald-500 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl group"
                >
                  <Upload className="w-5 h-5 group-hover:animate-bounce" />
                  Upload Report
                </motion.button>
              </Link>
            </div>
          </motion.div>

          {/* Stats Section */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          >
            <StatCard
              icon={<Upload className="w-6 h-6" />}
              label="Total Reports"
              value={stats.total}
              color="teal"
            />
            <StatCard
              icon={<AlertCircle className="w-6 h-6" />}
              label="Abnormal Findings"
              value={stats.abnormal}
              color="red"
            />
            <StatCard
              icon={<Clock className="w-6 h-6" />}
              label="Last Upload"
              value={stats.recent ? new Date(stats.recent.created_at).toLocaleDateString() : 'N/A'}
              color="blue"
            />
          </motion.div>

          {/* Reports Section */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Your Reports</h2>
              {reports.length > 0 && (
                <Link href="/reports" className="flex items-center gap-1 text-teal-600 hover:text-teal-700 font-semibold">
                  View All <ChevronRight className="w-4 h-4" />
                </Link>
              )}
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white h-24 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : reports.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="space-y-4">
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