'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import GlobalLoading from '@/app/loading';
import { useAuthStore } from '@/stores/auth.store';
import { useUIStore } from '@/stores/ui.store';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/providers/theme-provider';
import { Can } from '@/components/auth/can';
import { PERMISSIONS } from '@/config/permissions';
import {
  LayoutDashboard, Users, GraduationCap, BookOpen, Calendar,
  ClipboardCheck, Clock, FileText, Video, PenTool, Library,
  CalendarDays, Bus, Building2, Package, DollarSign, MessageSquare,
  Bell, Settings, ChevronLeft, ChevronRight, Menu, X, Search,
  Moon, Sun, LogOut, User, Shield, BarChart3, Globe,
  CreditCard, Store, Award, Palmtree, ChevronDown,
  Users2,
} from 'lucide-react';

/* ─── route / nav config ─────────────────────────────────── */

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  permission?: string;
  badge?: string;
  schoolOnly?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
  adminOnly?: boolean;
  schoolOnly?: boolean;
  roles?: string[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Overview',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'People',
    schoolOnly: true,
    items: [
      { href: '/students', label: 'Students', icon: GraduationCap, permission: PERMISSIONS.STUDENTS_VIEW, schoolOnly: true },
      { href: '/teachers', label: 'Teachers', icon: Users, permission: PERMISSIONS.TEACHERS_VIEW, schoolOnly: true },
      { href: '/parents', label: 'Parents', icon: Users2, permission: PERMISSIONS.PARENTS_VIEW, schoolOnly: true },
    ],
  },
  {
    title: 'Academics',
    schoolOnly: true,
    items: [
      { href: '/classes', label: 'Classes', icon: BookOpen, permission: PERMISSIONS.ACADEMIC_VIEW, schoolOnly: true },
      { href: '/subjects', label: 'Subjects', icon: FileText, permission: PERMISSIONS.ACADEMIC_VIEW, schoolOnly: true },
      { href: '/timetable', label: 'Timetable', icon: Clock, schoolOnly: true },
      { href: '/attendance', label: 'Attendance', icon: ClipboardCheck, permission: PERMISSIONS.ATTENDANCE_VIEW, schoolOnly: true },
    ],
  },
  {
    title: 'Learning',
    items: [
      { href: '/content', label: 'My Content', icon: BookOpen, permission: PERMISSIONS.CONTENT_VIEW },
      { href: '/live-classes', label: 'Live Classes', icon: Video, permission: PERMISSIONS.LIVE_CLASSES_VIEW },
      { href: '/certificates', label: 'Certificates', icon: Award },
      { href: '/assignments', label: 'Assignments', icon: FileText, permission: PERMISSIONS.ASSIGNMENTS_VIEW, schoolOnly: true },
      { href: '/exams', label: 'Exams', icon: PenTool, permission: PERMISSIONS.EXAMS_VIEW, schoolOnly: true },
      { href: '/gradebook', label: 'Gradebook', icon: BarChart3, permission: PERMISSIONS.EXAMS_VIEW, schoolOnly: true },
    ],
  },
  {
    title: 'Finance',
    schoolOnly: true,
    items: [
      { href: '/fees', label: 'Fee Management', icon: CreditCard, permission: PERMISSIONS.FEES_VIEW, schoolOnly: true },
      { href: '/payroll', label: 'Payroll', icon: DollarSign, permission: PERMISSIONS.PAYROLL_VIEW, schoolOnly: true },
    ],
  },
  {
    title: 'Operations',
    schoolOnly: true,
    items: [
      { href: '/library', label: 'Library', icon: Library, permission: PERMISSIONS.LIBRARY_MANAGE, schoolOnly: true },
      { href: '/transport', label: 'Transport', icon: Bus, permission: PERMISSIONS.TRANSPORT_VIEW, schoolOnly: true },
      { href: '/hostel', label: 'Hostel', icon: Building2, permission: PERMISSIONS.HOSTEL_VIEW, schoolOnly: true },
      { href: '/inventory', label: 'Inventory', icon: Package, permission: PERMISSIONS.INVENTORY_VIEW, schoolOnly: true },
      { href: '/leaves', label: 'Leaves', icon: Palmtree, schoolOnly: true },
      { href: '/events', label: 'Events', icon: CalendarDays },
    ],
  },
  {
    title: 'Communication',
    items: [
      { href: '/messages', label: 'Messages', icon: MessageSquare },
      { href: '/notifications', label: 'Notifications', icon: Bell },
    ],
  },
  {
    title: 'Insights',
    items: [
      { href: '/analytics', label: 'Analytics', icon: BarChart3, permission: PERMISSIONS.ANALYTICS_VIEW },
      { href: '/reports', label: 'Reports', icon: FileText, permission: PERMISSIONS.REPORTS_VIEW, schoolOnly: true },
      { href: '/marketplace', label: 'Marketplace', icon: Store },
    ],
  },
  {
    title: 'Administration',
    adminOnly: true,
    items: [
      { href: '/organization', label: 'Organization', icon: Globe },
      { href: '/admin/roles', label: 'Roles & Permissions', icon: Shield },
      { href: '/admin/academic-years', label: 'Academic Years', icon: Calendar },
      { href: '/certificates', label: 'Certificates', icon: Award },
      { href: '/settings', label: 'Settings', icon: Settings },
    ],
  },
];

const PUBLIC_PATHS = ['/auth', '/test/api'];

/* ─── helpers ─────────────────────────────────────────────── */

function getInitials(user: { firstName?: string; lastName?: string; email?: string }) {
  if (user.firstName && user.lastName) {
    return (user.firstName[0] + user.lastName[0]).toUpperCase();
  }
  return (user.email?.[0] || 'U').toUpperCase();
}

function getRoleBadgeColor(role?: string) {
  if (!role) return 'bg-gray-500/10 text-gray-600 dark:text-gray-400';
  const colors: Record<string, string> = {
    PLATFORM_ADMIN: 'bg-red-500/10 text-red-600 dark:text-red-400',
    ORG_ADMIN: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    SCHOOL_ADMIN: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    TEACHER: 'bg-green-500/10 text-green-600 dark:text-green-400',
    STUDENT: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
    PARENT: 'bg-pink-500/10 text-pink-600 dark:text-pink-400',
  };
  return colors[role] || 'bg-gray-500/10 text-gray-600 dark:text-gray-400';
}

/* ─── component ────────────────────────────────────────────── */

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [pendingPathname, setPendingPathname] = useState<string | null>(null);
  const user = useAuthStore((s) => s.user);
  const { logout, isLoggingOut } = useAuth();
  const { setTheme, resolvedTheme } = useTheme();
  const {
    sidebarCollapsed,
    mobileSidebarOpen,
    toggleSidebarCollapse,
    setMobileSidebarOpen,
    setSidebarCollapsed,
  } = useUIStore();

  // Reset optimistic pendingPathname when real route navigation finishes
  useEffect(() => {
    setPendingPathname(null);
  }, [pathname]);

  // Active path calculation (optimistic selection)
  const activePath = pendingPathname ?? pathname;

  const isNavigating = pendingPathname !== null && pendingPathname !== pathname;

  const handleNavClick = (href: string) => {
    if (pathname !== href) {
      setPendingPathname(href);
    }
  };

  // Read sidebar collapsed state from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebar-collapsed');
      if (saved === 'true') setSidebarCollapsed(true);
    }
  }, [setSidebarCollapsed]);

  // Close mobile sidebar on navigation
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [pathname, setMobileSidebarOpen]);

  // Public pages — no shell
  const isPublic = PUBLIC_PATHS.some((p) => pathname?.startsWith(p));
  if (isPublic) return <>{children}</>;

  // Loading — user not yet resolved
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[hsl(var(--background))]">
        <div className="text-center animate-fade-in">
          <div className="relative mx-auto mb-6 h-14 w-14">
            <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            Loading Tekurious ERP…
          </p>
        </div>
      </div>
    );
  }

  const isActive = (path: string) => {
    if (path === '/dashboard') return activePath === '/dashboard';
    return activePath === path || activePath?.startsWith(path + '/');
  };

  const isAdmin =
    user.role === 'PLATFORM_ADMIN' ||
    user.role === 'ORG_ADMIN' ||
    user.role === 'SCHOOL_ADMIN';

  const isIndependentStudent =
    user.role === 'STUDENT' && !user.schoolId && !user.organizationId && !user.tenantId;

  const displayName =
    user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.email || 'User';

  const displayRole = isIndependentStudent ? 'Independent Student' : (user.role?.replace(/_/g, ' ') || 'User');

  /* ── sidebar content ──────────────────────────────────── */
  const sidebarContent = (
    <nav className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center h-[var(--header-height)] px-4 border-b border-[hsl(var(--sidebar-border))] shrink-0">
        <Link href="/dashboard" className="flex items-center gap-3 min-w-0">
          <div
            className="flex items-center justify-center h-9 w-9 rounded-xl shrink-0"
            style={{ background: 'var(--gradient-primary)' }}
          >
            <span className="text-white font-bold text-base">T</span>
          </div>
          {!sidebarCollapsed && (
            <span className="text-lg font-bold tracking-tight text-[hsl(var(--sidebar-fg))] truncate font-[var(--font-display)]">
              Tekurious
            </span>
          )}
        </Link>
      </div>

      {/* Search (expanded only) */}
      {!sidebarCollapsed && (
        <div className="px-3 pt-4 pb-2">
          <Link href="/search">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[hsl(var(--sidebar-hover))] text-[hsl(var(--sidebar-section))] text-sm cursor-pointer hover:bg-[hsl(var(--sidebar-hover))] transition-colors">
              <Search className="h-4 w-4 shrink-0" />
              <span>Search…</span>
              <kbd className="ml-auto text-[10px] bg-[hsl(var(--background))] px-1.5 py-0.5 rounded border border-[hsl(var(--border))] font-mono">
                ⌘K
              </kbd>
            </div>
          </Link>
        </div>
      )}

      {/* Nav sections */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        {NAV_SECTIONS.map((section) => {
          if (section.adminOnly && !isAdmin) return null;
          if (isIndependentStudent && section.schoolOnly) return null;

          const visibleItems = isIndependentStudent
            ? section.items.filter((item) => !item.schoolOnly)
            : section.items;

          if (visibleItems.length === 0) return null;

          return (
            <div key={section.title} className="pt-3 first:pt-0">
              {!sidebarCollapsed && (
                <div className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--sidebar-section))]">
                  {section.title}
                </div>
              )}
              {sidebarCollapsed && <div className="my-2 mx-2 h-px bg-[hsl(var(--sidebar-border))]" />}

              {visibleItems.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;

                const linkContent = (
                  <Link href={item.href} onClick={() => handleNavClick(item.href)}>
                    <div
                      className={`
                        group flex items-center gap-3 rounded-lg text-sm font-medium transition-all duration-150
                        ${sidebarCollapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2'}
                        ${
                          active
                            ? 'bg-[hsl(var(--sidebar-active))] text-[hsl(var(--sidebar-active-fg))] shadow-sm'
                            : 'text-[hsl(var(--sidebar-fg)/0.7)] hover:bg-[hsl(var(--sidebar-hover))] hover:text-[hsl(var(--sidebar-fg))]'
                        }
                      `}
                      title={sidebarCollapsed ? item.label : undefined}
                    >
                      <Icon
                        className={`h-[18px] w-[18px] shrink-0 ${
                          active ? '' : 'text-[hsl(var(--sidebar-section))] group-hover:text-[hsl(var(--sidebar-fg))]'
                        }`}
                      />
                      {!sidebarCollapsed && (
                        <span className="truncate">{item.label}</span>
                      )}
                      {!sidebarCollapsed && item.badge && (
                        <span className="ml-auto text-[10px] font-semibold bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] px-1.5 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </Link>
                );

                if (item.permission) {
                  return (
                    <Can key={item.href} permission={item.permission as any}>
                      {linkContent}
                    </Can>
                  );
                }

                return <div key={item.href}>{linkContent}</div>;
              })}
            </div>
          );
        })}
      </div>

      {/* Bottom collapse toggle (desktop only) */}
      <div className="hidden md:block border-t border-[hsl(var(--sidebar-border))] px-3 py-3 shrink-0">
        <button
          onClick={toggleSidebarCollapse}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-[hsl(var(--sidebar-section))] hover:bg-[hsl(var(--sidebar-hover))] hover:text-[hsl(var(--sidebar-fg))] transition-colors"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-4 w-4 mx-auto" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      {/* ── Mobile overlay ── */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen
          bg-[hsl(var(--sidebar-bg))] border-r border-[hsl(var(--sidebar-border))]
          sidebar-transition
          ${sidebarCollapsed ? 'w-[var(--sidebar-collapsed-width)]' : 'w-[var(--sidebar-width)]'}
          ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
        `}
      >
        {sidebarContent}
      </aside>

      {/* ── Main area ── */}
      <div
        className={`
          sidebar-transition
          ${sidebarCollapsed ? 'md:ml-[var(--sidebar-collapsed-width)]' : 'md:ml-[var(--sidebar-width)]'}
        `}
      >
        {/* ── Top Header ── */}
        <header className="sticky top-0 z-30 h-[var(--header-height)] border-b border-[hsl(var(--border))] glass-strong">
          <div className="flex items-center h-full px-4 md:px-6 gap-4">
            {/* Mobile menu button */}
            <button
              className="md:hidden flex items-center justify-center h-9 w-9 rounded-lg hover:bg-[hsl(var(--secondary))] transition-colors"
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            >
              {mobileSidebarOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Header actions */}
            <div className="flex items-center gap-2">
              {/* Theme toggle */}
              <button
                onClick={() =>
                  setTheme(
                    resolvedTheme === 'dark' ? 'light' : 'dark'
                  )
                }
                className="flex items-center justify-center h-9 w-9 rounded-lg hover:bg-[hsl(var(--secondary))] transition-colors text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                title="Toggle theme"
              >
                {resolvedTheme === 'dark' ? (
                  <Sun className="h-[18px] w-[18px]" />
                ) : (
                  <Moon className="h-[18px] w-[18px]" />
                )}
              </button>

              {/* Notifications */}
              <Link href="/notifications">
                <div className="relative flex items-center justify-center h-9 w-9 rounded-lg hover:bg-[hsl(var(--secondary))] transition-colors text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
                  <Bell className="h-[18px] w-[18px]" />
                  <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center font-semibold animate-pulse-dot">
                    3
                  </span>
                </div>
              </Link>

              {/* Divider */}
              <div className="h-6 w-px bg-[hsl(var(--border))] mx-1" />

              {/* User menu */}
              <div className="flex items-center gap-3 pl-1 group relative">
                {/* Avatar */}
                <div className="flex items-center justify-center h-8 w-8 rounded-full text-sm font-semibold text-white shrink-0"
                  style={{ background: 'var(--gradient-primary)' }}
                >
                  {getInitials(user)}
                </div>

                {/* Name + Role */}
                <div className="hidden sm:block min-w-0">
                  <p className="text-sm font-semibold leading-tight truncate max-w-[140px]">
                    {displayName}
                  </p>
                  <p className="text-[11px] text-[hsl(var(--muted-foreground))] leading-tight">
                    {displayRole}
                  </p>
                </div>

                {/* Dropdown trigger */}
                <ChevronDown className="h-3.5 w-3.5 text-[hsl(var(--muted-foreground))] hidden sm:block" />

                {/* Dropdown */}
                <div className="absolute top-full right-0 mt-2 w-56 py-2 rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-y-1 group-hover:translate-y-0 z-50">
                  <div className="px-3 py-2 border-b border-[hsl(var(--border))]">
                    <p className="text-sm font-semibold">{displayName}</p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">{user.email}</p>
                    <span
                      className={`inline-block mt-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full ${getRoleBadgeColor(
                        user.role
                      )}`}
                    >
                      {displayRole}
                    </span>
                  </div>
                  <div className="py-1">
                    <Link href="/profile">
                      <div className="flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-[hsl(var(--secondary))] transition-colors">
                        <User className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                        My Profile
                      </div>
                    </Link>
                    <Link href="/settings/account">
                      <div className="flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-[hsl(var(--secondary))] transition-colors">
                        <Settings className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                        Settings
                      </div>
                    </Link>
                  </div>
                  <div className="border-t border-[hsl(var(--border))] pt-1">
                    <button
                      onClick={logout}
                      disabled={isLoggingOut}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm w-full hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      {isLoggingOut ? 'Logging out…' : 'Log out'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* ── Page content ── */}
        <main className="min-h-[calc(100vh-var(--header-height))] p-4 md:p-6 animate-fade-in">
          {isNavigating ? <GlobalLoading /> : children}
        </main>
      </div>
    </div>
  );
}
