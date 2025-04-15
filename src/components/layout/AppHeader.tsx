
import React from 'react';
import { Link } from 'react-router-dom';
import { UserButton } from './UserButton';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMobileNav } from '@/hooks/use-mobile';
import { ThemeToggle } from '@/components/theme-toggle';

const AppHeader = () => {
  const { setMobileOpen } = useMobileNav();

  return (
    <header className="border-b bg-background h-16 flex items-center px-4 w-full">
      <div className="flex-1 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Link to="/" className="text-xl font-bold text-swift-blue-600">
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
