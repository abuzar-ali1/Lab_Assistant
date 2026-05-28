'use client';

import ProtectedRoute from '@/Components/ProtectedRoute';
import { useAuth } from '@/Context/AuthContext';

export default function Home() {
  const { user, logout } = useAuth();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50 flex flex-col">
        {/* Navigation Header */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-600">
              LabSaathi
            </span>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-slate-600 hidden sm:inline">
                {user?.email}
              </span>
              <button
                onClick={logout}
                className="px-4 py-2 border border-rose-200 text-rose-600 rounded-xl text-sm font-medium hover:bg-rose-50 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard Frame */}
        <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-12">
          <div className="bg-gradient-to-r from-teal-700 to-emerald-700 rounded-3xl p-8 text-white shadow-xl shadow-teal-900/10 mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold">
              Assalam-o-Alaikum, {user?.username || 'Patient'}!
            </h1>
            <p className="text-teal-100 mt-2 text-sm sm:text-base max-w-xl">
              Welcome to your health dashboard. Upload a lab test photo below to get clear explanations in English and Urdu.
            </p>
          </div>

          {/* Placeholder for File Upload Component */}
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center shadow-sm">
            <div className="mx-auto w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center text-teal-600 text-xl font-bold mb-4">
              +
            </div>
            <h3 className="text-lg font-semibold text-slate-800">Upload Lab Report</h3>
            <p className="text-sm text-slate-400 mt-1 max-w-xs mx-auto">
              Drop your blood test image or PDF file here to begin AI analysis.
            </p>
            <button className="mt-6 px-6 py-2.5 bg-slate-900 text-white font-medium rounded-xl text-sm hover:bg-slate-800 transition">
              Select File
            </button>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}