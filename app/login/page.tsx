'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Login from '@/components/Auth/Login';
import { useAuth } from '@/contexts/AuthContext';
import { title } from '@/components/primitives';

export default function LoginPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !isLoading) {
      router.push('/profile');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-8 md:py-10">
      <div className="inline-block max-w-lg text-center justify-center mb-8">
        <h1 className={title()}>Login</h1>
        <p className="mt-4 text-default-500">Sign in to your account</p>
      </div>
      <Login />
    </div>
  );
}