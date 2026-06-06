'use client';

import { useAuthStore } from '../lib/authStore';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import IslamicLoading from '../components/IslamicLoader';

export default function AuthProvider({ children }) {
  const { user, loading, listenAuth } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    listenAuth();
  }, []);

  useEffect(() => {
    if (!loading && !user && pathname !== '/login') {
      router.push('/login');
    }
  }, [user, loading, pathname]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <IslamicLoading/>
      </div>
    );
  }

  return children;
}