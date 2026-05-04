'use client';

import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 rounded-2xl gradient-blue flex items-center justify-center shadow-lg shadow-apple-blue/20 animate-pulse">
        <span className="text-white font-bold text-lg">F</span>
      </div>
    </div>
  );
}
