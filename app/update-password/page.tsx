'use client';

import { useState, useEffect } from 'react';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Card, CardBody, CardHeader, CardFooter } from '@heroui/card';
import { Divider } from '@heroui/divider';
import { supabase } from '@/lib/supabase';
import { title } from '@/components/primitives';
import { useRouter } from 'next/navigation';
import { addToast } from '@heroui/react';


export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if we have a valid session for the password reset
    const validateSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      
      if (error || !data.session) {
        // If no valid session, redirect to login
        addToast({title:'Your password reset link has expired or is invalid'});
        router.push('/login');
      }
    };
    
    validateSession();
  }, [router]);

  const handleUpdatePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        setError(error.message);
        addToast({title:error.message});
      } else {
        addToast({title:'Password updated successfully'});
        // Redirect to profile page after successful password update
        setTimeout(() => {
          router.push('/profile');
        }, 1500);
      }
    } catch (error) {
      console.error('Error updating password:', error);
      setError('An unexpected error occurred');
      addToast({title:'An unexpected error occurred'});
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-8 md:py-10">
      <div className="inline-block max-w-lg text-center justify-center mb-8">
        <h1 className={title()}>Update Password</h1>
        <p className="mt-4 text-default-500">
          Create a new secure password for your account
        </p>
      </div>
      
      <Card className="max-w-md w-full">
        <CardHeader className="flex gap-3">
          <div className="flex flex-col">
            <p className="text-lg font-bold">Create new password</p>
            <p className="text-default-500 text-sm">
              Please choose a strong, unique password
            </p>
          </div>
        </CardHeader>
        <Divider />
        <CardBody>
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            {error && (
              <div className="bg-danger-50 text-danger border border-danger rounded-md p-3 mb-4">
                {error}
              </div>
            )}
            
            <Input
              label="New Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            
            <Input
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            
            <Button 
              type="submit" 
              color="primary" 
              isLoading={isLoading} 
              className="w-full mt-4"
            >
              Update Password
            </Button>
          </form>
        </CardBody>
        <Divider />
        <CardFooter>
          <div className="w-full text-center">
            <Button
              variant="flat"
              fullWidth
              href="/login"
              as="a"
            >
              Back to Login
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}