'use client';

import ProtectedRoute from '@/components/Auth/ProtectedRoute';
import UserProfile from '@/components/Auth/UserProfile';
import { title } from '@/components/primitives';

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <div className="flex flex-col items-center justify-center py-8 md:py-10">
        <div className="inline-block max-w-lg text-center justify-center mb-8">
          <h1 className={title()}>Profile</h1>
          <p className="mt-4 text-default-500">Your account information</p>
        </div>
        <UserProfile children={undefined} />
      </div>
    </ProtectedRoute>
  );
}