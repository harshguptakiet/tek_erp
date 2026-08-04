'use client';

import { useAuthStore } from '../../stores/auth.store';
import { useAuth } from '../../hooks/use-auth';
import { Button } from '../../components/ui/button';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const { logout, isLoggingOut } = useAuth();

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

  const isActive = (path: string) => pathname === path || pathname?.startsWith(path + '/');

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center px-4 md:px-6">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <span className="text-xl font-bold">Tekurious ERP</span>
            </Link>
          </div>

          <div className="ml-auto flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              {user.firstName} {user.lastName}
            </span>
            <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
              {user.role}
            </span>
            <Button 
              variant="ghost" 
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
        {/* Sidebar */}
        <aside className="sticky top-16 h-[calc(100vh-4rem)] w-64 border-r bg-background p-4 overflow-y-auto">
          <nav className="space-y-2">
            <Link href="/dashboard">
              <div className={`flex items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive('/dashboard') && pathname === '/dashboard'
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent hover:text-accent-foreground'
              }`}>
                <span>Dashboard</span>
              </div>
            </Link>
            
            <Link href="/dashboard/students">
              <div className={`flex items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive('/dashboard/students')
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent hover:text-accent-foreground'
              }`}>
                <span>Students</span>
              </div>
            </Link>
            
            <Link href="/dashboard/teachers">
              <div className={`flex items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive('/dashboard/teachers')
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent hover:text-accent-foreground'
              }`}>
                <span>Teachers</span>
              </div>
            </Link>
            
            <Link href="/dashboard/classes">
              <div className={`flex items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive('/dashboard/classes')
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent hover:text-accent-foreground'
              }`}>
                <span>Classes</span>
              </div>
            </Link>
            
            <Link href="/dashboard/attendance">
              <div className={`flex items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive('/dashboard/attendance')
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent hover:text-accent-foreground'
              }`}>
                <span>Attendance</span>
              </div>
            </Link>
            
            <Link href="/dashboard/subjects">
              <div className={`flex items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive('/dashboard/subjects')
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent hover:text-accent-foreground'
              }`}>
                <span>Subjects</span>
              </div>
            </Link>
            
            <Link href="/dashboard/exams">
              <div className={`flex items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive('/dashboard/exams')
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent hover:text-accent-foreground'
              }`}>
                <span>Exams</span>
              </div>
            </Link>
            
            <Link href="/dashboard/fees">
              <div className={`flex items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive('/dashboard/fees')
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent hover:text-accent-foreground'
              }`}>
                <span>Fees</span>
              </div>
            </Link>

            <div className="pt-4 mt-4 border-t">
              <Link href="/dashboard/settings">
                <div className={`flex items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive('/dashboard/settings')
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-accent hover:text-accent-foreground'
                }`}>
                  <span>Settings</span>
                </div>
              </Link>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
