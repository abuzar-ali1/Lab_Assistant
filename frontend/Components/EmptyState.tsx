'use client';

import { motion } from 'framer-motion';
import { Upload, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-16 px-6"
    >
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="w-20 h-20 bg-gradient-to-r from-teal-200 to-emerald-200 rounded-full flex items-center justify-center mx-auto mb-6"
      >
        <Upload className="w-10 h-10 text-teal-600" />
      </motion.div>
      <h3 className="text-2xl font-bold text-gray-900 mb-2">No Reports Yet</h3>
      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        Upload your first lab report to get started. Our AI will analyze it and explain every value in plain Urdu & English.
      </p>
      <Link href="/upload">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-600 to-emerald-500 text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl"
        >
          Upload Your First Report
          <ArrowRight className="w-5 h-5" />
        </motion.button>
      </Link>
    </motion.div>
  );
}