'use client';

import { useState } from 'react';
import { Input } from '@heroui/input';
import { Button } from '@heroui/button';
import { addToast, Card, CardBody, CardFooter, CardHeader } from '@heroui/react';
import { Divider } from '@heroui/divider';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import ProtectedRoute from '@/components/Auth/ProtectedRoute';
import { title } from '@/components/primitives';

export default function SettingsPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.user_metadata?.full_name || '',
    website: user?.user_metadata?.website || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const updateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: formData.fullName,
          website: formData.website,
        },
      });

      if (error) {
        addToast({title:'Error updating profile'});
        console.error('Error updating profile:', error);
      } else {
        addToast({title:'Profile updated successfully'});
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      addToast({title:'An unexpected error occurred'});
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="flex flex-col items-center justify-center py-2 ">
        <div className="inline-block  text-center justify-center mb-8">
          <h3 className={title()}>Settings</h3>
          <p className="mt-4 text-default-500">Update your profile information</p>
        </div>

        <Card className=" max-w-lg w-full">
          <CardHeader className="flex gap-3">
            <div className="flex flex-col">
              <p className="text-lg font-bold">Profile Settings</p>
              <p className="text-default-500 text-sm">Update your account details</p>
            </div>
          </CardHeader>
          <Divider />
          <CardBody>
            <form onSubmit={updateProfile} className="space-y-4">
              <Input
                label="Email"
                type="email"
                value={user?.email || ''}
                disabled
                description="You cannot change your email address"
              />
              
              <Input
                label="Full Name"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Your full name"
              />
              
              <Input
                label="Website"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="Your website (optional)"
              />
              
              <Button 
                type="submit" 
                color="primary" 
                isLoading={isLoading} 
                className="w-full mt-4"
              >
                Save Changes
              </Button>
            </form>
          </CardBody>
          <Divider />
          <CardFooter>
            <div className="w-full">
              <Button 
                color="danger" 
                variant="flat" 
                fullWidth
                onPress={() => supabase.auth.signOut()}
              >
                Sign Out
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </ProtectedRoute>
  );
}