/**
 * Dashboard — Role-based overview with real API data
 */

'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Can } from '@/components/auth/can';
import { PERMISSIONS } from '@/config/permissions';
import { useHasRole } from '@/hooks/use-permissions';
import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '@/services/analytics.service';
import { PasswordExpiryBanner } from '@/components/auth/password-expiry-banner';
import {
  GraduationCap, Users, BookOpen, ClipboardCheck,
  CreditCard, TrendingUp, FileText,
  PenTool, Video, ArrowUpRight, BarChart3,
  Clock,
} from 'lucide-react';

/* ── stat card ─────────────────────────────────────────────── */

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  trend?: string;
  href?: string;
}

function StatCard({ title, value, icon: Icon, color, trend, href }: StatCardProps) {
  const router = useRouter();

  return (
    <div
      className={`card-premium card-interactive p-5 stat-card stat-card-${color}`}
      onClick={href ? () => router.push(href) : undefined}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">{title}</p>
          <p className="text-3xl font-bold tabular-nums">{value}</p>
          {trend && (
            <p className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="h-3 w-3" />
              {trend}
            </p>
          )}
        </div>
        <div
          className="flex items-center justify-center h-10 w-10 rounded-xl shrink-0"
          style={{ background: `var(--gradient-${color === 'blue' ? 'primary' : color === 'purple' ? 'accent' : color === 'green' ? 'success' : 'warm'})` }}
        >
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
      {href && (
        <div className="mt-3 pt-3 border-t border-[hsl(var(--border))] flex items-center text-xs font-medium text-[hsl(var(--primary))]">
          View details
          <ArrowUpRight className="h-3 w-3 ml-1" />
        </div>
      )}
    </div>
  );
}

/* ── quick action button ──────────────────────────────────── */

interface QuickActionProps {
  icon: React.ElementType;
  label: string;
  href: string;
  gradient: string;
}

function QuickAction({ icon: Icon, label, href, gradient }: QuickActionProps) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push(href)}
      className="group flex flex-col items-center gap-3 p-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
    >
      <div
        className="flex items-center justify-center h-12 w-12 rounded-xl transition-transform group-hover:scale-110"
        style={{ background: gradient }}
      >
        <Icon className="h-5 w-5 text-white" />
      </div>
      <span className="text-xs font-medium text-[hsl(var(--foreground))]">{label}</span>
    </button>
  );
}

/* ── main dashboard ──────────────────────────────────────── */

export default function DashboardPage() {
  const { user } = useAuthStore();

  const isTeacher = useHasRole('TEACHER');
  const isStudent = useHasRole('STUDENT');
  const isParent = useHasRole('PARENT');
  const isAdmin =
    useHasRole('SCHOOL_ADMIN') ||
    useHasRole('PLATFORM_ADMIN') ||
    useHasRole('ORG_ADMIN');

  // Fetch dashboard stats
  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => analyticsService.getDashboardOverview(),
    staleTime: 5 * 60 * 1000,
  });

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <>
      <PasswordExpiryBanner />
      <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
        {/* ── Welcome header ── */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="page-title text-3xl">
              {greeting()}, {user?.firstName || 'there'} 👋
            </h1>
            <p className="page-description mt-1">
              Here&apos;s what&apos;s happening today
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
            <Clock className="h-4 w-4" />
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </div>
        </div>

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Can permission={PERMISSIONS.STUDENTS_VIEW}>
          <StatCard
            title="Total Students"
            value={stats?.totalStudents ?? '—'}
            icon={GraduationCap}
            color="blue"
            trend={stats?.studentGrowth ? `+${stats.studentGrowth}% this month` : undefined}
            href="/students"
          />
        </Can>

        <Can permission={PERMISSIONS.TEACHERS_VIEW}>
          <StatCard
            title="Teachers"
            value={stats?.totalTeachers ?? '—'}
            icon={Users}
            color="green"
            href="/teachers"
          />
        </Can>

        <Can permission={PERMISSIONS.ACADEMIC_VIEW}>
          <StatCard
            title="Active Classes"
            value={stats?.totalClasses ?? '—'}
            icon={BookOpen}
            color="purple"
            href="/classes"
          />
        </Can>

        <Can permission={PERMISSIONS.ATTENDANCE_VIEW}>
          <StatCard
            title="Today&apos;s Attendance"
            value={stats?.todayAttendance ? `${stats.todayAttendance}%` : '—'}
            icon={ClipboardCheck}
            color="orange"
            trend={stats?.attendanceTrend ? `${stats.attendanceTrend}% vs last week` : undefined}
            href="/attendance"
          />
        </Can>

        {/* Student-specific stats */}
        {isStudent && (
          <>
            <StatCard
              title="My Assignments"
              value={stats?.pendingAssignments ?? '—'}
              icon={PenTool}
              color="blue"
              href="/assignments"
            />
            <StatCard
              title="Upcoming Exams"
              value={stats?.upcomingExams ?? '—'}
              icon={FileText}
              color="orange"
              href="/exams"
            />
          </>
        )}

        {/* Parent-specific */}
        {isParent && (
          <StatCard
            title="My Children"
            value={stats?.childrenCount ?? '—'}
            icon={Users}
            color="pink"
            href="/parent-portal"
          />
        )}
        </div>

        {/* ── Quick Actions ── */}
        <Card className="card-premium">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {/* Admin & Teacher actions */}
            <Can permission={PERMISSIONS.STUDENTS_VIEW}>
              <QuickAction icon={GraduationCap} label="Students" href="/students" gradient="var(--gradient-primary)" />
            </Can>
            <Can permission={PERMISSIONS.TEACHERS_VIEW}>
              <QuickAction icon={Users} label="Teachers" href="/teachers" gradient="var(--gradient-success)" />
            </Can>
            <Can permission={PERMISSIONS.ATTENDANCE_MARK}>
              <QuickAction icon={ClipboardCheck} label="Attendance" href="/attendance" gradient="var(--gradient-warm)" />
            </Can>
            <Can permission={PERMISSIONS.EXAMS_VIEW}>
              <QuickAction icon={PenTool} label="Exams" href="/exams" gradient="var(--gradient-accent)" />
            </Can>
            <Can permission={PERMISSIONS.FEES_VIEW}>
              <QuickAction icon={CreditCard} label="Fees" href="/fees" gradient="var(--gradient-primary)" />
            </Can>
            <Can permission={PERMISSIONS.CONTENT_VIEW}>
              <QuickAction icon={BookOpen} label="Content" href="/content" gradient="var(--gradient-success)" />
            </Can>
            <Can permission={PERMISSIONS.LIVE_CLASSES_VIEW}>
              <QuickAction icon={Video} label="Live Classes" href="/live-classes" gradient="var(--gradient-warm)" />
            </Can>
            <Can permission={PERMISSIONS.ANALYTICS_VIEW}>
              <QuickAction icon={BarChart3} label="Analytics" href="/analytics" gradient="var(--gradient-accent)" />
            </Can>

            {/* Student actions */}
            {isStudent && (
              <>
                <QuickAction icon={PenTool} label="Assignments" href="/assignments" gradient="var(--gradient-primary)" />
                <QuickAction icon={BookOpen} label="Study" href="/content" gradient="var(--gradient-success)" />
                <QuickAction icon={Video} label="Live Class" href="/live-classes" gradient="var(--gradient-warm)" />
                <QuickAction icon={Clock} label="Timetable" href="/timetable" gradient="var(--gradient-accent)" />
              </>
            )}

            {/* Parent actions */}
            {isParent && (
              <>
                <QuickAction icon={Users} label="Children" href="/parent-portal" gradient="var(--gradient-primary)" />
                <QuickAction icon={CreditCard} label="Pay Fees" href="/fees/payment" gradient="var(--gradient-warm)" />
                <QuickAction icon={FileText} label="Reports" href="/report-cards" gradient="var(--gradient-accent)" />
              </>
            )}
          </div>
        </CardContent>
        </Card>

        {/* ── Getting Started Guide ── */}
        <div
          className="rounded-2xl p-6 md:p-8 text-white relative overflow-hidden"
          style={{ background: 'var(--gradient-primary)' }}
        >
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-white/5" />
        <div className="absolute bottom-4 -left-8 w-32 h-32 rounded-full bg-white/5" />

        <div className="relative z-10">
          <h3 className="text-xl font-bold mb-4 font-[var(--font-display)]">
            {isAdmin && '🏫 Admin Quick Guide'}
            {isTeacher && '👨‍🏫 Teacher Quick Guide'}
            {isStudent && '🎓 Student Quick Guide'}
            {isParent && '👪 Parent Quick Guide'}
            {!isAdmin && !isTeacher && !isStudent && !isParent && '📚 Getting Started'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {isAdmin && [
              { step: '1', text: 'Manage students, teachers & staff' },
              { step: '2', text: 'Configure academic years & classes' },
              { step: '3', text: 'Set up fee structures & payments' },
              { step: '4', text: 'View analytics & generate reports' },
              { step: '5', text: 'Manage permissions & settings' },
            ].map((item) => (
              <div key={item.step} className="flex items-center gap-3 rounded-xl bg-white/10 backdrop-blur-sm px-4 py-3">
                <span className="flex items-center justify-center h-7 w-7 rounded-full bg-white/20 text-xs font-bold shrink-0">
                  {item.step}
                </span>
                <span className="text-sm text-white/90">{item.text}</span>
              </div>
            ))}

            {isTeacher && [
              { step: '1', text: 'View assigned classes & students' },
              { step: '2', text: 'Mark daily attendance' },
              { step: '3', text: 'Create & grade assessments' },
              { step: '4', text: 'Upload study materials' },
              { step: '5', text: 'Conduct live classes' },
            ].map((item) => (
              <div key={item.step} className="flex items-center gap-3 rounded-xl bg-white/10 backdrop-blur-sm px-4 py-3">
                <span className="flex items-center justify-center h-7 w-7 rounded-full bg-white/20 text-xs font-bold shrink-0">
                  {item.step}
                </span>
                <span className="text-sm text-white/90">{item.text}</span>
              </div>
            ))}

            {isStudent && [
              { step: '1', text: 'Check your timetable' },
              { step: '2', text: 'Submit assignments on time' },
              { step: '3', text: 'Access study materials' },
              { step: '4', text: 'Join live classes' },
              { step: '5', text: 'Track your progress' },
            ].map((item) => (
              <div key={item.step} className="flex items-center gap-3 rounded-xl bg-white/10 backdrop-blur-sm px-4 py-3">
                <span className="flex items-center justify-center h-7 w-7 rounded-full bg-white/20 text-xs font-bold shrink-0">
                  {item.step}
                </span>
                <span className="text-sm text-white/90">{item.text}</span>
              </div>
            ))}

            {isParent && [
              { step: '1', text: "Track your child's attendance" },
              { step: '2', text: 'View exam results & reports' },
              { step: '3', text: 'Pay fees online' },
              { step: '4', text: 'Message teachers' },
              { step: '5', text: 'Stay updated with notifications' },
            ].map((item) => (
              <div key={item.step} className="flex items-center gap-3 rounded-xl bg-white/10 backdrop-blur-sm px-4 py-3">
                <span className="flex items-center justify-center h-7 w-7 rounded-full bg-white/20 text-xs font-bold shrink-0">
                  {item.step}
                </span>
                <span className="text-sm text-white/90">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
        </div>
      </div>
    </>
  );
}
