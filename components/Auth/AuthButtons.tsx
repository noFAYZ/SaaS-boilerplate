'use client';

import { FC } from 'react';
import { Button } from '@heroui/button';
import { Link } from '@heroui/link';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar } from '@heroui/avatar';
import { 
  Dropdown, 
  DropdownTrigger, 
  DropdownMenu, 
  DropdownItem 
} from '@heroui/dropdown';
import { useRouter } from 'next/navigation';
import { IconParkOutlineLockOne } from '../icons/icons';

interface AuthButtonsProps {
  isMobile?: boolean;
}

export const AuthButtons: FC<AuthButtonsProps> = ({ isMobile = false }) => {
  const { user, signOut, isLoading } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return null;
  }

  if (user) {
    return (
      <Dropdown placement="bottom-end">
        <DropdownTrigger>
          <Button 
            isIconOnly 
            variant="light" 
            className="rounded-full p-0"
            aria-label="User menu"
          >
            {user.user_metadata?.avatar_url ? (
              <Avatar
                src={user.user_metadata.avatar_url}
                size="md"
                alt="User avatar"
               
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
                {user.email?.[0].toUpperCase() || 'U'}
              </div>
            )}
          </Button>
        </DropdownTrigger>
        <DropdownMenu aria-label="User actions">
          <DropdownItem key="profile" onPress={() => router.push('/profile')}>
            Profile
          </DropdownItem>
          <DropdownItem key="settings" onPress={() => router.push('/settings')}>
            Settings
          </DropdownItem>
          <DropdownItem key="logout" color="danger" onPress={() => signOut()}>
            Logout
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    );
  }

  if (isMobile) {
    return (
      <>
        <Button 
          as={Link} 
          color="primary" 
          href="/login" 
          radius='full'
          variant="flat" 
          className="w-full mb-2"
        >
          Login
        </Button>
        <Button 
          as={Link} 
          color="primary" 
          href="/login" 
          radius='full'
          variant="solid" 
          className="w-full rounded-full"
        >
          Sign Up
        </Button>
      </>
    );
  }

  return (
    <>
      <Button 
        as={Link} 
        color="primary" 
        href="/login" 
        variant="solid" 
           radius='full'
        size="sm"
        className="items-center font-bold "
        startContent={<IconParkOutlineLockOne className="w-4 h-4" />}
      >
        
        Login
      </Button>
    
    </>
  );
};