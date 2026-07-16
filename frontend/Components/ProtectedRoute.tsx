'use client';

import { useAuth } from '@/Context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import BrandLoader from '@/Components/BrandLoader';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return <BrandLoader label="Opening your private health space" />;
  }

  if (!user) return null;

  return <>{children}</>;
}
