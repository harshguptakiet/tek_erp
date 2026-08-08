'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../stores/auth.store';

export default function Index() {
  const router = useRouter();
  const { user, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.push('/dashboard');
      } else {
        router.push('/auth/login');
      }
    }
  }, [user, isLoading, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[hsl(var(--background))]">
      <div className="text-center animate-fade-in">
        <div className="relative mx-auto mb-6 h-14 w-14">
          <div className="absolute inset-0 rounded-full border-4 border-[hsl(var(--primary)/0.2)]" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[hsl(var(--primary))] animate-spin" />
        </div>
        <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
          Loading Tekurious ERP…
        </p>
      </div>
    </div>
  );
}
