'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  color: 'teal' | 'red' | 'blue';
}

export default function StatCard({ icon, label, value, color }: StatCardProps) {
  const colorClasses = {
    teal: 'bg-teal-100 text-teal-600',
    red: 'bg-red-100 text-red-600',
    blue: 'bg-blue-100 text-blue-600',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      className={`${colorClasses[color]} rounded-xl p-6 shadow-md hover:shadow-lg`}
    >
      <motion.div
        className="w-12 h-12 rounded-lg bg-white/50 flex items-center justify-center mb-4"
        whileHover={{ rotate: 10 }}
      >
        {icon}
      </motion.div>
      <p className="text-sm font-medium opacity-75 mb-1">{label}</p>
      <p className="text-3xl font-bold">{value}</p>
    </motion.div>
  );
}