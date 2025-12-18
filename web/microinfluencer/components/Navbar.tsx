'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, LogOut, BarChart3, Wand2 } from 'lucide-react';

export default function Navbar() {
  const { user, userProfile, logout } = useAuth();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="border-b border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80">
      <div className="mx-auto max-w-7xl px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/">
            <h1 className="cursor-pointer text-2xl font-bold text-blue-600 dark:text-blue-400">
              MicroInfluence
            </h1>
          </Link>

          {/* Navigation */}
          <div className="flex items-center gap-6">
            {user && userProfile ? (
              <>
                {/* Nav Links */}
                <div className="flex items-center gap-1">
                  <Link href="/profile">
                    <Button
                      variant={isActive('/profile') ? 'default' : 'ghost'}
                      size="sm"
                    >
                      Profile
                    </Button>
                  </Link>

                  {userProfile.userType === 'influencer' && (
                    <Link href="/generate">
                      <Button
                        variant={isActive('/generate') ? 'default' : 'ghost'}
                        size="sm"
                        className="gap-2"
                      >
                        <Wand2 className="h-4 w-4" />
                        Generate
                      </Button>
                    </Link>
                  )}

                  <Link href="/analytics">
                    <Button
                      variant={isActive('/analytics') ? 'default' : 'ghost'}
                      size="sm"
                      className="gap-2"
                    >
                      <BarChart3 className="h-4 w-4" />
                      Analytics
                    </Button>
                  </Link>
                </div>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <User className="h-4 w-4" />
                      <span className="hidden sm:inline">
                        {userProfile.displayName || userProfile.email}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {userProfile.displayName || 'User'}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {userProfile.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/analytics" className="cursor-pointer">
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Analytics
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* User Type Badge */}
                <div className="hidden rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300 lg:block">
                  {userProfile.userType === 'agency' ? '🏢 Agency' : '✨ Influencer'}
                </div>
              </>
            ) : (
              <Link href="/">
                <Button size="sm">Get Started</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

