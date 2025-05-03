
import React from 'react';
import { Link } from 'react-router-dom';
import { UserButton } from './UserButton';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ThemeToggle } from '@/components/theme-toggle';

const AppHeader = () => {
  return (
    <header className="border-b fixed top-0 left-0 right-0 z-30 bg-background h-16 flex items-center px-4 w-full">
      <div className="flex-1 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="md:hidden" />
          <Link to="/" className="text-xl font-bold text-primary">
            Swift
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <UserButton />
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
