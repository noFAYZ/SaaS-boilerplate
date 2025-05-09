'use client';

import { useState } from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  return (
    <div className="w-full max-w-md p-6 mx-auto bg-background border border-default-200 rounded-lg shadow-md">
      <h2 className="mb-6 text-2xl font-bold text-center">Sign In</h2>
      <Auth
        supabaseClient={supabase}
        appearance={{ 
          theme: ThemeSupa,
          variables: {
            default: {
              colors: {
                brand: 'var(--color-primary)',
                brandAccent: 'var(--color-primary-focus)',
              },
            },
          },
          className: {
            container: 'w-full',
            button: 'w-full bg-primary text-white px-4 py-2 rounded hover:bg-primary-focus transition-colors',
            input: 'w-full p-2 border rounded mb-3',
            message: 'text-sm text-danger mb-3',
          }
        }}
        theme="dark" // or light based on your theme
        providers={['google', 'github']}
        redirectTo={`${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`}
        onlyThirdPartyProviders={false}
      />
    </div>
  );
}