'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/Components/ProtectedRoute';
import api from '@/lib/api';
import Link from 'next/link';

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

  useEffect(() => {
    api.get('/reports/')
      .then(({ data }) => setReports(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">LabSaathi</h1>
          <Link href="/upload">
            <button className="w-full bg-blue-600 text-white py-3 rounded-lg text-lg hover:bg-blue-700 mb-8">
              + Upload New Report
            </button>
          </Link>

          <h2 className="text-xl font-semibold mb-3">Your Reports</h2>
          {loading ? (
            <p>Loading...</p>
          ) : reports.length === 0 ? (
            <p className="text-gray-500">No reports yet. Upload your first lab report!</p>
          ) : (
            <ul className="space-y-3">
              {reports.map((report) => (
                <li key={report.id}>
                  <Link href={`/reports/${report.id}`}>
                    <div className="bg-white p-4 rounded shadow hover:shadow-md transition">
                      <p className="font-medium">{report.original_filename}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(report.created_at).toLocaleDateString()} • {report.status}
                      </p>
                      {report.status === 'completed' && (
                        <p className="text-sm">
                          <span className="text-red-500">{report.abnormal_count} abnormal</span> / {report.total_tests} tests
                        </p>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}