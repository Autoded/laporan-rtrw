'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#F8FAFC'
    }}>
      <div style={{
        width: '48px',
        height: '48px',
        border: '4px solid #E2E8F0',
        borderTopColor: '#3B82F6',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }} />
    </div>
  );
}
