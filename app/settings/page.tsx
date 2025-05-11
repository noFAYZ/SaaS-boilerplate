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
import { NavigationToggle } from '@/components/UI/NavigationToggle';
import { RadioGroup, Radio } from '@heroui/react';
import { useNavigation } from '@/contexts/NavigationContext';

export default function SettingsPage() {
  const { user } = useAuth();
  const { navigationMode, setNavigationMode } = useNavigation();
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
      <div className="flex flex-col items-center justify-center py-2">
        <div className="inline-block text-center justify-center mb-8">
          <h3 className={title()}>Settings</h3>
          <p className="mt-4 text-default-500">Update your profile information and preferences</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
          {/* Profile Settings Card */}
          <Card className="w-full">
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
          </Card>

          {/* UI Settings Card */}
          <Card className="w-full">
            <CardHeader className="flex gap-3">
              <div className="flex flex-col">
                <p className="text-lg font-bold">UI Preferences</p>
                <p className="text-default-500 text-sm">Customize your experience</p>
              </div>
            </CardHeader>
            <Divider />
            <CardBody>
              <div className="space-y-6">
                {/* Navigation Mode Preference */}
                <div>
                  <p className="text-sm font-medium mb-2">Navigation Style</p>
                  <RadioGroup
                    orientation="horizontal"
                    value={navigationMode}
                    onValueChange={(value) => setNavigationMode(value as 'sidebar' | 'navbar')}
                    className="gap-4"
                  >
                    <Radio value="sidebar" description="Traditional sidebar navigation">
                      Sidebar
                    </Radio>
                    <Radio value="navbar" description="Minimalist navbar navigation">
                      Navbar
                    </Radio>
                  </RadioGroup>
                  
                  <div className="mt-4 p-3 bg-default-100 rounded-lg flex justify-center">
                    <NavigationToggle variant="switch" />
                  </div>
                </div>
                
                {/* Other UI settings can be added here */}
              </div>
            </CardBody>
            <Divider />
            <CardFooter>
              <div className="w-full">
                <Button 
                  color="primary" 
                  variant="flat" 
                  fullWidth
                  onPress={() => {
                    localStorage.removeItem('navigationMode');
                    setNavigationMode('sidebar');
                    addToast({title:'UI preferences reset to default'});
                  }}
                >
                  Reset UI Preferences
                </Button>
              </div>
            </CardFooter>
          </Card>

          {/* Sign Out Button */}
          <Card className="w-full md:col-span-2">
            <CardBody>
              <Button 
                color="danger" 
                variant="flat" 
                fullWidth
                onPress={() => supabase.auth.signOut()}
              >
                Sign Out
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}