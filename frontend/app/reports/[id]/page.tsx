'use client';

import { useParams, useRouter } from 'next/navigation';
import useSWR from 'swr';
import ProtectedRoute from '@/Components/ProtectedRoute';
import api from '@/lib/api';
import { ArrowLeft, Activity, CheckCircle2, AlertCircle, FileText, Loader2 } from 'lucide-react';

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

export default function ReportDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  // SWR automatically handles loading, error, caching, and conditional polling
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
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50/50 p-6">
          <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
          <p className="text-gray-600 mb-4 font-medium">Report not found or access denied.</p>
          <button onClick={() => router.push('/')} className="text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
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
      <div className="min-h-screen bg-gray-50/50 p-4 md:p-8 font-sans">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <button
                onClick={() => router.push('/')}
                className="text-gray-500 hover:text-gray-900 transition-colors text-sm mb-3 flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Dashboard
              </button>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{report.original_filename}</h1>
                  <p className="text-sm text-gray-500">
                    Uploaded on {new Date(report.created_at).toLocaleDateString('en-PK', {
                      year: 'numeric', month: 'long', day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>
            <StatusBadge status={report.status} />
          </div>

          {/* Processing / Error States */}
          {isProcessing && (
            <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-5 flex items-start gap-4">
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin shrink-0" />
              <div>
                <h3 className="font-semibold text-blue-900">AI is analyzing your report</h3>
                <p className="text-blue-700 text-sm mt-1">Please wait a few moments. This page will update automatically when finished.</p>
              </div>
            </div>
          )}

          {report.status === 'failed' && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-5 flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-red-600 shrink-0" />
              <div>
                <h3 className="font-semibold text-red-900">Analysis Failed</h3>
                <p className="text-red-700 text-sm mt-1">We couldn't process this document. Please ensure it's a valid lab report and try again.</p>
              </div>
            </div>
          )}

          {/* Completed State */}
          {report.status === 'completed' && report.test_results && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* Summary Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <StatCard title="Total Tests" value={report.test_results.length} icon={<Activity className="w-5 h-5" />} />
                <StatCard title="Abnormal" value={abnormalCount} icon={<AlertCircle className="w-5 h-5 text-red-500" />} valueColor="text-red-600" />
                <StatCard title="Normal" value={normalCount} icon={<CheckCircle2 className="w-5 h-5 text-emerald-500" />} valueColor="text-emerald-600" />
              </div>

              {/* Results List */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 px-1">Detailed Findings</h2>
                {report.test_results.map((test) => (
                  <ResultCard key={test.id} test={test} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

// --- Subcomponents ---

function StatCard({ title, value, icon, valueColor = "text-gray-900" }: { title: string, value: number | string, icon: React.ReactNode, valueColor?: string }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <p className={`text-3xl font-bold ${valueColor}`}>{value}</p>
      </div>
      <div className="bg-gray-50 p-3 rounded-full">{icon}</div>
    </div>
  );
}

function ResultCard({ test }: { test: TestResult }) {
  const isAbnormal = test.is_abnormal;
  return (
    <div className={`bg-white rounded-xl p-5 shadow-sm border-l-4 transition-all hover:shadow-md ${
      isAbnormal ? 'border-red-500' : 'border-emerald-500'
    }`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-4 border-b border-gray-50">
        <div className="flex items-center gap-3">
          {isAbnormal ? <AlertCircle className="w-5 h-5 text-red-500" /> : <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
          <h3 className="font-semibold text-gray-900 text-lg">{test.test_name}</h3>
        </div>
        <div className="md:text-right bg-gray-50 md:bg-transparent p-3 md:p-0 rounded-lg">
          <div className={`text-xl font-bold ${isAbnormal ? 'text-red-600' : 'text-gray-900'}`}>
            {test.value} <span className="text-sm font-medium text-gray-500">{test.unit}</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Ref: {test.reference_range || 'N/A'}</p>
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-4">
        {/* English Box */}
        <div className="bg-slate-50/50 rounded-lg p-3 border border-slate-100">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
            <span>🇬🇧</span> English
          </p>
          <p className="text-sm text-slate-700 leading-relaxed">{test.explanation_english}</p>
        </div>
        {/* Urdu Box - Note the RTL support here */}
        <div className="bg-emerald-50/50 rounded-lg p-3 border border-emerald-100" dir="rtl">
          <p className="text-xs font-semibold text-emerald-600 mb-2 flex items-center gap-2">
            <span dir="ltr">🇵🇰</span> اردو
          </p>
          <p className="text-sm text-emerald-900 leading-relaxed font-arabic">{test.explanation_urdu}</p>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    processing: 'bg-blue-100 text-blue-700 border-blue-200',
    pending: 'bg-amber-100 text-amber-700 border-amber-200',
    failed: 'bg-red-100 text-red-700 border-red-200',
  }[status] || 'bg-gray-100 text-gray-700 border-gray-200';

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${styles} capitalize`}>
      {status === 'processing' && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
      {status}
    </span>
  );
}

function ReportSkeleton() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50/50 p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
          <div className="h-4 w-32 bg-gray-200 rounded mb-6"></div>
          <div className="flex gap-4 items-center">
            <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
            <div className="space-y-2">
              <div className="h-6 w-64 bg-gray-200 rounded"></div>
              <div className="h-4 w-40 bg-gray-200 rounded"></div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8">
            {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>)}
          </div>
          <div className="space-y-4 mt-8">
            {[1, 2].map(i => <div key={i} className="h-40 bg-gray-200 rounded-xl"></div>)}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}