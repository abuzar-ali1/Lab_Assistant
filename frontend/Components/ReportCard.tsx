'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronRight, AlertCircle, CheckCircle, Clock, FileText } from 'lucide-react';

interface ReportCardProps {
  report: {
    id: number;
    original_filename: string;
    status: string;
    created_at: string;
    abnormal_count: number;
    total_tests: number;
  };
}

export default function ReportCard({ report }: ReportCardProps) {
  const date = new Date(report.created_at);
  const isAbnormal = report.abnormal_count > 0;
  const isCompleted = report.status === 'completed';

  return (
    <Link href={`/reports/${report.id}`}>
      <motion.div
        whileHover={{ scale: 1.02, y: -4 }}
        whileTap={{ scale: 0.98 }}
        className="bg-white rounded-xl p-5 shadow-md hover:shadow-xl border border-gray-100 cursor-pointer group"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="w-5 h-5 text-teal-600" />
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-teal-600 transition">
                {report.original_filename}
              </h3>
            </div>
            <p className="text-sm text-gray-500 mb-3">
              {date.toLocaleDateString()} • {date.toLocaleTimeString()}
            </p>

            {isCompleted && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 text-sm">
                  <span className="font-semibold text-gray-900">{report.total_tests}</span>
                  <span className="text-gray-600">tests</span>
                </div>
                <div className={`flex items-center gap-1 text-sm ${isAbnormal ? 'text-red-600' : 'text-green-600'}`}>
                  <AlertCircle className="w-4 h-4" />
                  <span className="font-semibold">{report.abnormal_count} abnormal</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
              isCompleted
                ? 'bg-green-100 text-green-700'
                : report.status === 'processing'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700'
            }`}>
              {report.status === 'completed' ? '✓ Analyzed' : '⏳ Processing'}
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-teal-600 group-hover:translate-x-1 transition" />
          </div>
        </div>
      </motion.div>
    </Link>
  );
}