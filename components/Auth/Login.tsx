'use client';

import { useState } from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';

export default function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
    const { theme, setTheme } = useTheme();

  return (
    <div className="w-full max-w-md p-4 mx-auto bg-primary-500/5 border border-divider rounded-2xl z-10 ">
      <h2 className="mb-6 text-xl font-bold text-center">Sign In</h2>
      <Auth
        supabaseClient={supabase}
        appearance={{ 
          theme: ThemeSupa,
          variables: {
            default: {
              colors: {
                brand: 'primary',
                brandAccent: 'var(--color-primary-focus)',
              },
            },
          },
          className: {
            container: 'w-full',
            button: 'w-full bg-primary text-white px-2 py-1 rounded hover:bg-primary-focus transition-colors',
            input: 'w-full p-2 border rounded mb-3',
            message: 'text-sm text-danger mb-3',
          }
        }}
        theme={theme} // or light based on your theme
        providers={['google', 'github']}
        redirectTo={`${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`}
        onlyThirdPartyProviders={false}
      />
    </div>
  );
}