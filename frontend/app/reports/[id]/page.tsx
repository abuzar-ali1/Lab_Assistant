'use client';

import { useParams, useRouter } from 'next/navigation';
import useSWR from 'swr';
import ProtectedRoute from '@/Components/ProtectedRoute';
import api from '@/lib/api';
import { ArrowLeft, Activity, CheckCircle2, AlertCircle, FileText, Loader2, BrainCircuit } from 'lucide-react';
import { motion } from 'framer-motion';

// --- Interfaces ---
interface TestResult {
  id: number;
  test_name: string;
  value: string;
  unit: string;
  reference_range: string;
  is_abnormal: boolean;
  explanation_urdu: string;
  explanation_english: string;
}

interface ReportDetail {
  id: number;
  original_filename: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  test_results: TestResult[];
}

// --- Fetcher for SWR ---
const fetcher = (url: string) => api.get(url).then((res) => res.data);

// --- Animation Variants (Matched to Home Page) ---
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

export default function ReportDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const { data: report, error, isLoading } = useSWR<ReportDetail>(
    id ? `/api/reports/${id}/` : null,
    fetcher,
    {
      refreshInterval: (data) =>
        data?.status === 'pending' || data?.status === 'processing' ? 3000 : 0,
    }
  );

  if (isLoading) return <ReportSkeleton />;

  if (error || !report) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 p-6">
          <motion.div 
            initial="hidden" animate="visible" variants={fadeInUp}
            className="flex flex-col items-center"
          >
            <AlertCircle className="w-16 h-16 text-rose-500 mb-4" />
            <p className="text-neutral-600 mb-6 font-medium text-lg">Report not found or access denied.</p>
            <button 
              onClick={() => router.push('/')} 
              className="bg-white border border-neutral-200 px-6 py-3 rounded-full text-neutral-700 hover:text-indigo-600 hover:border-indigo-200 hover:shadow-md transition-all flex items-center gap-2 font-medium"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </button>
          </motion.div>
        </div>
      </ProtectedRoute>
    );
  }

  const isProcessing = report.status === 'pending' || report.status === 'processing';
  const abnormalCount = report.test_results?.filter((t) => t.is_abnormal).length || 0;
  const normalCount = (report.test_results?.length || 0) - abnormalCount;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-neutral-50 p-4 md:p-8 font-sans selection:bg-indigo-100 selection:text-indigo-900">
        <div className="max-w-4xl mx-auto space-y-8 pb-16">
          
          {/* Header Section */}
          <motion.div 
            initial="hidden" animate="visible" variants={fadeInUp}
            className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 bg-white p-8 rounded-3xl shadow-sm border border-neutral-200 hover:shadow-xl transition-shadow duration-300"
          >
            <div>
              <button
                onClick={() => router.push('/')}
                className="group text-neutral-500 hover:text-indigo-600 transition-colors text-sm mb-5 flex items-center gap-1.5 font-medium"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
              </button>
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center shrink-0">
                  <FileText className="w-7 h-7 text-indigo-600" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">{report.original_filename}</h1>
                  <p className="text-neutral-500 mt-1 font-medium">
                    Uploaded on {new Date(report.created_at).toLocaleDateString('en-PK', {
                      year: 'numeric', month: 'long', day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>
            <StatusBadge status={report.status} />
          </motion.div>

          {/* Processing State */}
          {isProcessing && (
            <motion.div 
              initial="hidden" animate="visible" variants={fadeInUp}
              className="bg-indigo-50 border border-indigo-100 rounded-3xl p-8 flex items-start gap-5 shadow-sm"
            >
              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm shrink-0">
                <BrainCircuit className="w-6 h-6 text-indigo-600 animate-pulse" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-indigo-900">AI is analyzing your report</h3>
                <p className="text-indigo-700/80 mt-2 leading-relaxed">Our clinical AI is translating the medical markers into simple language. This page will update automatically when the analysis is complete.</p>
              </div>
            </motion.div>
          )}

          {/* Error State */}
          {report.status === 'failed' && (
            <motion.div 
              initial="hidden" animate="visible" variants={fadeInUp}
              className="bg-rose-50 border border-rose-100 rounded-3xl p-8 flex items-start gap-5 shadow-sm"
            >
              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm shrink-0">
                <AlertCircle className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-rose-900">Analysis Failed</h3>
                <p className="text-rose-700 mt-2 leading-relaxed">We couldn't process this document. Please ensure it is a valid, readable laboratory report and try uploading again.</p>
              </div>
            </motion.div>
          )}

          {report.status === 'completed' && report.test_results && (
            <motion.div 
              variants={staggerContainer} 
              initial="hidden" 
              animate="visible" 
              className="space-y-10"
            >
              {/* Summary Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <motion.div variants={fadeInUp}>
                  <StatCard title="Total Tests" value={report.test_results.length} icon={<Activity className="w-6 h-6 text-indigo-600" />} iconBg="bg-indigo-50" />
                </motion.div>
                <motion.div variants={fadeInUp}>
                  <StatCard title="Action Required" value={abnormalCount} icon={<AlertCircle className="w-6 h-6 text-rose-600" />} iconBg="bg-rose-50" valueColor="text-rose-600" />
                </motion.div>
                <motion.div variants={fadeInUp}>
                  <StatCard title="In Range" value={normalCount} icon={<CheckCircle2 className="w-6 h-6 text-emerald-600" />} iconBg="bg-emerald-50" valueColor="text-emerald-600" />
                </motion.div>
              </div>

              {/* Results List */}
              <div className="space-y-6">
                <motion.div variants={fadeInUp} className="flex items-center gap-3 px-2">
                  <h2 className="text-2xl font-extrabold text-neutral-900 tracking-tight">Detailed Findings</h2>
                  <div className="h-px flex-1 bg-neutral-200"></div>
                </motion.div>
                
                {report.test_results.map((test) => (
                  <motion.div key={test.id} variants={fadeInUp}>
                    <ResultCard test={test} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

// --- Subcomponents ---

function StatCard({ title, value, icon, iconBg, valueColor = "text-neutral-900" }: { title: string, value: number | string, icon: React.ReactNode, iconBg: string, valueColor?: string }) {
  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-neutral-200 flex flex-col justify-between hover:shadow-xl transition-shadow duration-300">
      <div className="flex justify-between items-start mb-6">
        <p className="text-sm md:text-base font-semibold text-neutral-500">{title}</p>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${iconBg}`}>
          {icon}
        </div>
      </div>
      <p className={`text-4xl md:text-5xl font-extrabold tracking-tight ${valueColor}`}>{value}</p>
    </div>
  );
}

function ResultCard({ test }: { test: TestResult }) {
  const isAbnormal = test.is_abnormal;
  
  return (
    <div className={`relative bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-neutral-200 hover:shadow-xl transition-all duration-300 overflow-hidden`}>
      {/* Decorative left border indicator */}
      <div className={`absolute left-0 top-0 bottom-0 w-2 ${isAbnormal ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-neutral-100 pl-4">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${isAbnormal ? 'bg-rose-50' : 'bg-emerald-50'}`}>
            {isAbnormal ? <AlertCircle className="w-6 h-6 text-rose-600" /> : <CheckCircle2 className="w-6 h-6 text-emerald-600" />}
          </div>
          <h3 className="font-extrabold text-neutral-900 text-xl md:text-2xl tracking-tight">{test.test_name}</h3>
        </div>
        <div className={`md:text-right p-4 md:p-0 rounded-2xl ${isAbnormal ? 'bg-rose-50 md:bg-transparent' : 'bg-neutral-50 md:bg-transparent'}`}>
          <div className={`text-3xl font-extrabold tracking-tight ${isAbnormal ? 'text-rose-600' : 'text-neutral-900'}`}>
            {test.value} <span className="text-lg font-medium text-neutral-500 ml-1">{test.unit}</span>
          </div>
          <p className="text-sm text-neutral-500 mt-2 font-medium bg-white md:bg-transparent px-3 md:px-0 py-1 md:py-0 rounded-lg inline-block border border-neutral-100 md:border-none">
            Range: {test.reference_range || 'N/A'}
          </p>
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6 pl-4">
        {/* English Box */}
        <div className="bg-neutral-50 rounded-2xl p-6 border border-neutral-100 hover:border-indigo-100 transition-colors">
          <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <span>🇺🇸</span> Medical Context
          </p>
          <p className="text-neutral-700 leading-relaxed font-medium">{test.explanation_english}</p>
        </div>
        {/* Urdu Box */}
        <div className="bg-emerald-50/50 rounded-2xl p-6 border border-emerald-100/50 hover:bg-emerald-50 transition-colors" dir="rtl">
          <p className="text-xs font-bold text-emerald-600 mb-4 flex items-center gap-2 tracking-wide">
            <span dir="ltr">🇵🇰</span> آسان اردو
          </p>
          <p className="text-emerald-900 leading-[1.8] font-arabic text-lg">{test.explanation_urdu}</p>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config = {
    completed: { classes: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Analyzed Successfully' },
    processing: { classes: 'bg-indigo-50 text-indigo-700 border-indigo-200', label: 'AI Processing...' },
    pending: { classes: 'bg-neutral-100 text-neutral-700 border-neutral-200', label: 'In Queue' },
    failed: { classes: 'bg-rose-50 text-rose-700 border-rose-200', label: 'Analysis Failed' },
  }[status] || { classes: 'bg-neutral-100 text-neutral-700 border-neutral-200', label: status };

  return (
    <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold border ${config.classes}`}>
      {status === 'processing' && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {config.label}
    </span>
  );
}

function ReportSkeleton() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-neutral-50 p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-8 animate-pulse pb-16">
          
          {/* Header Skeleton */}
          <div className="bg-white p-8 rounded-3xl border border-neutral-200 flex justify-between items-start">
            <div className="flex gap-5 items-center">
              <div className="w-14 h-14 bg-neutral-100 rounded-2xl"></div>
              <div className="space-y-3">
                <div className="h-8 w-64 bg-neutral-200 rounded-lg"></div>
                <div className="h-4 w-40 bg-neutral-100 rounded-lg"></div>
              </div>
            </div>
            <div className="h-10 w-32 bg-neutral-100 rounded-full"></div>
          </div>

          {/* Stats Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-40 bg-white border border-neutral-200 rounded-3xl p-6 flex flex-col justify-between">
                <div className="flex justify-between">
                  <div className="h-4 w-24 bg-neutral-200 rounded"></div>
                  <div className="w-12 h-12 bg-neutral-100 rounded-2xl"></div>
                </div>
                <div className="h-10 w-20 bg-neutral-200 rounded-lg"></div>
              </div>
            ))}
          </div>

          {/* Cards Skeleton */}
          <div className="space-y-6">
            <div className="h-8 w-48 bg-neutral-200 rounded-lg mb-6"></div>
            {[1, 2].map(i => (
              <div key={i} className="bg-white rounded-3xl p-8 border border-neutral-200 space-y-8">
                <div className="flex justify-between items-center pb-6 border-b border-neutral-100">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-neutral-100 rounded-2xl"></div>
                    <div className="h-8 w-56 bg-neutral-200 rounded-lg"></div>
                  </div>
                  <div className="h-10 w-24 bg-neutral-200 rounded-lg"></div>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="h-32 bg-neutral-50 rounded-2xl"></div>
                  <div className="h-32 bg-neutral-50 rounded-2xl"></div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </ProtectedRoute>
  );
}