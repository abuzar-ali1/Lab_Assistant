'use client';

import { motion } from 'framer-motion';
import { Upload, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="text-center py-16 px-4 bg-white rounded-2xl border border-neutral-200/60 shadow-sm max-w-xl mx-auto"
    >
      <div className="relative w-16 h-16 mx-auto mb-5 flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.0, 0.3] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 bg-indigo-100 rounded-2xl"
        />
        <div className="relative w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
          <Upload className="w-5 h-5" />
        </div>
      </div>

      <h3 className="text-lg font-bold text-neutral-900 tracking-tight">No laboratory diagnostics tracked</h3>
      <p className="text-neutral-500 text-sm mt-1.5 max-w-sm mx-auto leading-relaxed">
        Upload your first clinical data sheet. Our localized LLMs unpack values into clean structural breakdowns with translation parameters.
      </p>

      <div className="mt-6">
        <Link href="/upload">
          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2 bg-indigo-600 text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-md shadow-indigo-100 hover:bg-indigo-700 transition-colors"
          >
            Drop First Report Here
            <ArrowRight className="w-3.5 h-3.5" />
          </motion.button>
        </Link>
      </div>
    </motion.div>
  );
}