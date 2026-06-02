'use client';

import { useParams, useRouter } from 'next/navigation';
import useSWR from 'swr';
import ProtectedRoute from '@/Components/ProtectedRoute';
import api from '@/lib/api';
import { motion } from 'framer-motion';
import { ArrowLeft, Activity, CheckCircle2, AlertCircle, FileText, Loader2 } from 'lucide-react';

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

const fetcher = (url: string) => api.get(url).then((res) => res.data);

export default function ReportDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const { data: report, error, isLoading } = useSWR<ReportDetail>(
    id ? `/reports/${id}/` : null,
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
        <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50/50 p-6">
          <AlertCircle className="w-10 h-10 text-rose-500 mb-3" />
          <p className="text-neutral-800 font-medium mb-4 text-sm">Report structural context missing or access forbidden.</p>
          <button onClick={() => router.push('/')} className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:underline">
            <ArrowLeft className="w-3.5 h-3.5" /> Return Workspace Console
          </button>
        </div>
      </ProtectedRoute>
    );
  }

  const isProcessing = report.status === 'pending' || report.status === 'processing';
  const abnormalCount = report.test_results?.filter((t) => t.is_abnormal).length || 0;
  const normalCount = (report.test_results?.length || 0) - abnormalCount;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-neutral-50/60 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Detail Meta Section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200/60">
            <div>
              <button
                onClick={() => router.push('/')}
                className="text-neutral-500 hover:text-neutral-900 text-xs font-medium mb-3 inline-flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Core Workspace
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-neutral-900 tracking-tight">{report.original_filename}</h1>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Logged: {new Date(report.created_at).toLocaleDateString('en-PK', {
                      year: 'numeric', month: 'short', day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>
            <StatusBadge status={report.status} />
          </div>

          {/* Live Pipeline Polling Triggers */}
          {isProcessing && (
            <div className="bg-white border border-neutral-200 rounded-2xl p-5 flex items-start gap-4 shadow-sm">
              <Loader2 className="w-5 h-5 text-indigo-600 animate-spin shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-neutral-900">Neural analysis engine executing</h3>
                <p className="text-neutral-500 text-xs mt-1 leading-relaxed">Parsing structured data matrix arrays. Content renders instantly upon pipeline calculation resolution.</p>
              </div>
            </div>
          )}

          {report.status === 'failed' && (
            <div className="bg-rose-50/60 border border-rose-200 rounded-2xl p-5 flex items-start gap-4">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-rose-900">Pipeline parsing fault</h3>
                <p className="text-rose-700 text-xs mt-1">File stream structure parsing exception. Please verify target PDF composition matrix validation parameters.</p>
              </div>
            </div>
          )}

          {/* Main Context Grid Container */}
          {report.status === 'completed' && report.test_results && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-3 gap-4">
                <MetricBlock title="Total Evaluated" value={report.test_results.length} icon={<Activity className="w-4 h-4 text-neutral-500" />} color="neutral" />
                <MetricBlock title="Outliers (Abnormal)" value={abnormalCount} icon={<AlertCircle className="w-4 h-4 text-rose-500" />} color="rose" />
                <MetricBlock title="Nominal Metrics" value={normalCount} icon={<CheckCircle2 className="w-4 h-4 text-emerald-500" />} color="emerald" />
              </div>

              <div className="space-y-3">
                <h2 className="text-sm font-bold text-neutral-400 tracking-wider uppercase px-1">Structural Breakdowns</h2>
                {report.test_results.map((test) => (
                  <ResultCard key={test.id} test={test} />
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

/* Sub-UI Presentation Architecture Blocks */

function StatusBadge({ status }: { status: string }) {
  const blueprints: Record<string, string> = {
    pending: "bg-neutral-100 text-neutral-600 border-neutral-200",
    processing: "bg-indigo-50 text-indigo-600 border-indigo-200/60",
    completed: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
    failed: "bg-rose-50 text-rose-700 border-rose-200/60"
  };

  return (
    <span className={`text-xs font-semibold tracking-wide border px-2.5 py-1 rounded-lg uppercase ${blueprints[status] || blueprints.pending}`}>
      {status}
    </span>
  );
}

function MetricBlock({ title, value, icon, color }: { title: string, value: number, icon: React.ReactNode, color: 'neutral' | 'rose' | 'emerald' }) {
  const frames = {
    neutral: "border-neutral-200/70 text-neutral-900",
    rose: "border-rose-200/60 text-rose-600 bg-rose-50/20",
    emerald: "border-emerald-200/60 text-emerald-600 bg-emerald-50/20"
  };

  return (
    <div className={`bg-white border rounded-xl p-4 shadow-sm flex items-center justify-between ${frames[color]}`}>
      <div>
        <p className="text-neutral-400 text-xs font-medium tracking-tight truncate">{title}</p>
        <p className="text-xl sm:text-2xl font-bold mt-1 tracking-tight">{value}</p>
      </div>
      <div className="p-2 bg-neutral-50 border border-neutral-100 rounded-lg shrink-0">{icon}</div>
    </div>
  );
}

function ResultCard({ test }: { test: TestResult }) {
  return (
    <div className={`bg-white border rounded-2xl p-5 shadow-sm transition-all hover:shadow-md border-l-4 ${
      test.is_abnormal ? 'border-l-rose-500 border-neutral-200/80' : 'border-l-emerald-500 border-neutral-200/80'
    }`}>
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-4 mb-4 border-b border-neutral-100">
        <div className="flex items-start gap-2.5">
          {test.is_abnormal ? (
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-1" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-1" />
          )}
          <div>
            <h3 className="font-bold text-neutral-900 tracking-tight text-base sm:text-lg">{test.test_name}</h3>
            <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md mt-1 border ${
              test.is_abnormal ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              {test.is_abnormal ? 'Outlier Profile' : 'Within Bounds'}
            </span>
          </div>
        </div>
        <div className="bg-neutral-50 border border-neutral-100 p-3 rounded-xl min-w-[140px] md:text-right">
          <p className={`text-lg font-black tracking-tight ${test.is_abnormal ? 'text-rose-600' : 'text-neutral-900'}`}>
            {test.value} <span className="text-xs font-medium text-neutral-400">{test.unit}</span>
          </p>
          <p className="text-[11px] text-neutral-400 mt-0.5 font-medium">Interval: {test.reference_range || 'Global Default'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* English Translation Node */}
        <div className="bg-neutral-50/50 border border-neutral-100 rounded-xl p-3.5">
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <span>🇬🇧</span> English Breakdown
          </p>
          <p className="text-xs text-neutral-600 leading-relaxed font-medium">{test.explanation_english}</p>
        </div>
        
        {/* Urdu Native Node (With RTL support and baseline tracking adjustments) */}
        <div className="bg-indigo-50/20 border border-indigo-100/40 rounded-xl p-3.5" dir="rtl">
          <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5 justify-end">
            <span>🇵🇰</span> وضاحت (Urdu Context)
          </p>
          <p className="text-sm text-neutral-700 leading-relaxed font-normal text-right tracking-wide">
            {test.explanation_urdu}
          </p>
        </div>
      </div>
    </div>
  );
}

function ReportSkeleton() {
  return (
    <div className="min-h-screen bg-neutral-50/60 pt-24 pb-16 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
        <div className="h-4 bg-neutral-200 rounded w-1/4" />
        <div className="flex justify-between items-center">
          <div className="space-y-2 w-1/2">
            <div className="h-6 bg-neutral-200 rounded w-3/4" />
            <div className="h-3 bg-neutral-200 rounded w-1/2" />
          </div>
          <div className="h-8 bg-neutral-200 rounded w-20" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="h-20 bg-neutral-200 rounded-xl" />
          <div className="h-20 bg-neutral-200 rounded-xl" />
          <div className="h-20 bg-neutral-200 rounded-xl" />
        </div>
        <div className="h-4 bg-neutral-200 rounded w-1/6" />
        <div className="h-40 bg-neutral-200 rounded-2xl" />
      </div>
    </div>
  );
}