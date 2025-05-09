'use client';

import { useState } from 'react';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Card, CardBody, CardHeader, CardFooter } from '@heroui/card';
import { Divider } from '@heroui/divider';
import { supabase } from '@/lib/supabase';
import { addToast } from '@heroui/react';


export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) {
        addToast({title:error.message});
      } else {
        setIsSent(true);
        addToast({title:'Password reset instructions sent to your email'});
      }
    } catch (error) {
      console.error('Error sending reset password email:', error);
      addToast({title:'An unexpected error occurred'});
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-md w-full">
      <CardHeader className="flex gap-3">
        <div className="flex flex-col">
          <p className="text-lg font-bold">Reset your password</p>
          <p className="text-default-500 text-sm">
            {isSent 
              ? 'Check your email for a password reset link' 
              : 'Enter your email to receive a password reset link'}
          </p>
        </div>
      </CardHeader>
      <Divider />
      <CardBody>
        {!isSent ? (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              required
            />
            
            <Button 
              type="submit" 
              color="primary" 
              isLoading={isLoading} 
              className="w-full mt-4"
            >
              Send Reset Instructions
            </Button>
          </form>
        ) : (
          <div className="text-center py-4">
            <p className="mb-4">
              We've sent reset instructions to <strong>{email}</strong>
            </p>
            <p className="text-default-500 text-sm">
              If you don't see the email, check your spam folder or
              request another reset link.
            </p>
          </div>
        )}
      </CardBody>
      <Divider />
      <CardFooter>
        <div className="w-full text-center">
          {isSent ? (
            <Button 
              variant="flat" 
              fullWidth
              onPress={() => {
                setIsSent(false);
                setEmail('');
              }}
            >
              Try Again
            </Button>
          ) : (
            <Button 
              variant="flat" 
              fullWidth
              href="/login"
              as="a"
            >
              Back to Login
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}