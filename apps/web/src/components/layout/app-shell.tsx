'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '../../stores/auth.store';
import { useAuth } from '../../hooks/use-auth';
import { Button } from '../ui/button';

const PUBLIC_PATHS = ['/auth', '/test/api'];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const { logout, isLoggingOut } = useAuth();

  const isPublic = PUBLIC_PATHS.some((path) => pathname?.startsWith(path));

  if (isPublic) {
    return <>{children}</>;
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const isActive = (path: string) => {
    if (path === '/dashboard') return pathname === '/dashboard';
    return pathname === path || pathname?.startsWith(path + '/');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center px-4 md:px-6">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <span className="text-xl font-bold text-primary">Tekurious ERP</span>
            </Link>
          </div>

          <div className="ml-auto flex items-center space-x-4">
            <span className="text-sm font-medium text-foreground">
              {user.firstName} {user.lastName}
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
              {user.role}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Left Sidebar */}
        <aside className="sticky top-16 h-[calc(100vh-4rem)] w-64 border-r bg-background p-4 overflow-y-auto shrink-0">
          <nav className="space-y-1.5">
            <Link href="/dashboard">
              <div
                className={`flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive('/dashboard')
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                <span className="text-lg">📊</span>
                <span>Dashboard</span>
              </div>
            </Link>

            <Link href="/students">
              <div
                className={`flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive('/students')
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                <span className="text-lg">👨‍🎓</span>
                <span>Students</span>
              </div>
            </Link>

            <Link href="/teachers">
              <div
                className={`flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive('/teachers')
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                <span className="text-lg">👨‍🏫</span>
                <span>Teachers</span>
              </div>
            </Link>

            <Link href="/classes">
              <div
                className={`flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive('/classes')
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                <span className="text-lg">🏫</span>
                <span>Classes</span>
              </div>
            </Link>

            <Link href="/attendance">
              <div
                className={`flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive('/attendance')
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                <span className="text-lg">📅</span>
                <span>Attendance</span>
              </div>
            </Link>

            <Link href="/subjects">
              <div
                className={`flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive('/subjects')
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                <span className="text-lg">📚</span>
                <span>Subjects</span>
              </div>
            </Link>

            <Link href="/exams">
              <div
                className={`flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive('/exams')
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                <span className="text-lg">📝</span>
                <span>Exams</span>
              </div>
            </Link>

            <Link href="/fees">
              <div
                className={`flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive('/fees')
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                <span className="text-lg">💰</span>
                <span>Fees</span>
              </div>
            </Link>

            <div className="pt-4 mt-4 border-t">
              <Link href="/settings">
                <div
                  className={`flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive('/settings')
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  <span className="text-lg">⚙️</span>
                  <span>Settings</span>
                </div>
              </Link>
            </div>
          </nav>
        </aside>

        {/* Main Page Viewport */}
        <main className="flex-1 overflow-y-auto p-6 min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>
    </div>
  );
}
