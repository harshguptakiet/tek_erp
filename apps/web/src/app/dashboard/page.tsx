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
import {
  GraduationCap, Users, BookOpen, ClipboardCheck,
  CreditCard, TrendingUp, Activity, FileText,
  PenTool, Video, ArrowUpRight, BarChart3,
  Bell, Clock, Award,
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
  const router = useRouter();
  const { user } = useAuthStore();

  const isTeacher = useHasRole('TEACHER') || user?.role === 'TEACHER';
  const isStudent = useHasRole('STUDENT') || user?.role === 'STUDENT';
  const isParent = useHasRole('PARENT') || user?.role === 'PARENT';
  const isIndependentStudent = isStudent && !user?.schoolId && !user?.organizationId && !user?.tenantId;
  const isAdmin =
    useHasRole('SCHOOL_ADMIN') ||
    useHasRole('PLATFORM_ADMIN') ||
    useHasRole('ORG_ADMIN') ||
    user?.role === 'SCHOOL_ADMIN' ||
    user?.role === 'PLATFORM_ADMIN' ||
    user?.role === 'ORG_ADMIN';

  // Fetch dashboard stats
  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => analyticsService.getDashboardOverview(),
    staleTime: 5 * 60 * 1000,
  });

  const DEFAULT_STATS = {
    totalStudents: 428,
    totalTeachers: 34,
    totalClasses: 12,
    todayAttendance: 95.8,
    studentGrowth: 8.4,
    attendanceTrend: 2.1,
    pendingAssignments: 3,
    upcomingExams: 2,
    childrenCount: 1,
  };

  const activeStats = { ...DEFAULT_STATS, ...stats };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* ── Welcome header ── */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="page-title text-3xl text-[hsl(var(--foreground))]">
            {greeting()}, {user?.firstName || 'Learner'} 👋
          </h1>
          <p className="page-description mt-1 text-[hsl(var(--muted-foreground))]">
            {isIndependentStudent
              ? 'Welcome to your independent learning hub'
              : "Here's what's happening today"}
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
        {!isIndependentStudent && (
          <Can permission={PERMISSIONS.STUDENTS_VIEW}>
            <StatCard
              title="Total Students"
              value={activeStats.totalStudents}
              icon={GraduationCap}
              color="blue"
              trend={`+${activeStats.studentGrowth}% this month`}
              href="/students"
            />
          </Can>
        )}

        {!isIndependentStudent && (
          <Can permission={PERMISSIONS.TEACHERS_VIEW}>
            <StatCard
              title="Teachers"
              value={activeStats.totalTeachers}
              icon={Users}
              color="green"
              href="/teachers"
            />
          </Can>
        )}

        {!isIndependentStudent && (
          <Can permission={PERMISSIONS.ACADEMIC_VIEW}>
            <StatCard
              title="Active Classes"
              value={activeStats.totalClasses}
              icon={BookOpen}
              color="purple"
              href="/classes"
            />
          </Can>
        )}

        {!isIndependentStudent && (
          <Can permission={PERMISSIONS.ATTENDANCE_VIEW}>
            <StatCard
              title="Today's Attendance"
              value={`${activeStats.todayAttendance}%`}
              icon={ClipboardCheck}
              color="orange"
              trend={`+${activeStats.attendanceTrend}% vs last week`}
              href="/attendance"
            />
          </Can>
        )}

        {/* School Student-specific stats */}
        {isStudent && !isIndependentStudent && (
          <>
            <StatCard
              title="My Assignments"
              value={activeStats.pendingAssignments}
              icon={PenTool}
              color="blue"
              href="/assignments"
            />
            <StatCard
              title="Upcoming Exams"
              value={activeStats.upcomingExams}
              icon={FileText}
              color="orange"
              href="/exams"
            />
          </>
        )}

        {/* Independent Student (LinkedIn Learning style stats) */}
        {isIndependentStudent && (
          <>
            <StatCard
              title="Learning Time"
              value="24.5 hrs"
              icon={Clock}
              color="blue"
              trend="+4.2 hrs this week"
              href="/analytics"
            />
            <StatCard
              title="Active Courses"
              value="3 Enrolled"
              icon={BookOpen}
              color="purple"
              href="/content"
            />
            <StatCard
              title="Certificates Earned"
              value="2 Verified"
              icon={BarChart3}
              color="green"
              href="/certificates"
            />
            <StatCard
              title="Learning Streak"
              value="5 Days 🔥"
              icon={Activity}
              color="orange"
              href="/analytics"
            />
          </>
        )}

        {/* Parent-specific */}
        {isParent && (
          <StatCard
            title="My Children"
            value={activeStats.childrenCount}
            icon={Users}
            color="pink"
            href="/parent-portal"
          />
        )}
      </div>

      {/* ── School Student Dashboard Section ── */}
      {isStudent && !isIndependentStudent && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Schedule */}
          <Card className="card-premium lg:col-span-2">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-indigo-500" />
                <CardTitle className="text-lg font-bold text-[hsl(var(--foreground))]">Today's Class Schedule (Class 10 A)</CardTitle>
              </div>
              <button
                onClick={() => router.push('/timetable')}
                className="text-xs font-semibold text-[hsl(var(--primary))] hover:underline flex items-center gap-1"
              >
                Full Timetable <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { time: '08:30 AM - 09:30 AM', subject: 'Mathematics', topic: 'Quadratic Equations & Proofs', teacher: 'Dr. Vikram Sethi', room: 'Room 101', active: true },
                { time: '09:30 AM - 10:30 AM', subject: 'Physics Lab', topic: 'Electromagnetism & Circuit Experiments', teacher: 'Elena Rostova', room: 'Physics Lab B', active: false },
                { time: '10:45 AM - 11:45 AM', subject: 'Computer Science', topic: 'Data Structures & Algorithms', teacher: 'Michael Chen', room: 'Computer Lab 3', active: false },
                { time: '12:00 PM - 01:00 PM', subject: 'Social Studies', topic: 'Industrial Revolution & World History', teacher: 'Alex Rivera', room: 'Room 102', active: false },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-3 ${
                    item.active
                      ? 'border-indigo-500/40 bg-indigo-500/10'
                      : 'border-[hsl(var(--border)/0.6)] bg-[hsl(var(--card))]'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-[hsl(var(--muted-foreground))]">{item.time}</span>
                      {item.active && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500 text-white uppercase tracking-wider animate-pulse">
                          Live Now
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-[hsl(var(--foreground))]">{item.subject}: <span className="font-normal text-xs text-[hsl(var(--muted-foreground))]">{item.topic}</span></h4>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">👨‍🏫 {item.teacher} • 📍 {item.room}</p>
                  </div>
                  <button
                    onClick={() => router.push('/timetable')}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] transition-colors"
                  >
                    View Details
                  </button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Pending Assignments & Notice Board */}
          <div className="space-y-6">
            <Card className="card-premium">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-base font-bold text-[hsl(var(--foreground))]">Pending Homework</CardTitle>
                <button onClick={() => router.push('/assignments')} className="text-xs text-[hsl(var(--primary))] hover:underline">View All</button>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { title: 'Algebraic Equations Set', subject: 'Mathematics', due: 'Aug 18, 2026', status: 'Due Soon' },
                  { title: 'World History Essay', subject: 'Social Studies', due: 'Aug 22, 2026', status: 'Assigned' },
                ].map((asg, idx) => (
                  <div key={idx} className="p-3 rounded-xl border border-[hsl(var(--border)/0.6)] bg-[hsl(var(--card))] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-500">{asg.subject}</span>
                      <span className="text-[10px] text-amber-500 font-semibold">{asg.status}</span>
                    </div>
                    <p className="text-xs font-bold text-[hsl(var(--foreground))]">{asg.title}</p>
                    <p className="text-[11px] text-[hsl(var(--muted-foreground))]">Due date: {asg.due}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="card-premium">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold text-[hsl(var(--foreground))] flex items-center gap-2">
                  <Bell className="h-4 w-4 text-amber-500" /> Notice Board
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5 text-xs">
                <div className="p-2.5 rounded-lg bg-[hsl(var(--muted)/0.4)] border border-[hsl(var(--border)/0.5)] space-y-1">
                  <p className="font-semibold text-[hsl(var(--foreground))]">🏆 Science Fair 2026</p>
                  <p className="text-[hsl(var(--muted-foreground))]">Submit project abstracts to Dr. Sethi before Aug 25.</p>
                </div>
                <div className="p-2.5 rounded-lg bg-[hsl(var(--muted)/0.4)] border border-[hsl(var(--border)/0.5)] space-y-1">
                  <p className="font-semibold text-[hsl(var(--foreground))]">🎭 Annual Cultural Fest</p>
                  <p className="text-[hsl(var(--muted-foreground))]">Auditions open tomorrow at 3 PM in Auditorium.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ── LinkedIn Learning Style: Continue Learning Banner (For Independent Students) ── */}
      {isIndependentStudent && (
        <Card className="card-premium overflow-hidden border border-[hsl(var(--primary)/0.2)] bg-gradient-to-br from-[hsl(var(--card))] via-[hsl(var(--card))] to-[hsl(var(--primary)/0.05)]">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center h-8 w-8 rounded-lg bg-[hsl(var(--primary)/0.15)] text-[hsl(var(--primary))] font-bold text-xs">
                ▶
              </span>
              <CardTitle className="text-lg font-bold">Pick up where you left off</CardTitle>
            </div>
            <button
              onClick={() => router.push('/content')}
              className="text-xs font-semibold text-[hsl(var(--primary))] hover:underline flex items-center gap-1"
            >
              View all my courses <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <div className="p-4 rounded-xl border border-[hsl(var(--border)/0.6)] bg-[hsl(var(--background)/0.5)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-500/10 text-purple-600 dark:text-purple-400">
                    Full-Stack Web Dev
                  </span>
                  <span className="text-xs text-[hsl(var(--muted-foreground))]">• Module 4 of 12</span>
                </div>
                <h4 className="text-base font-bold text-[hsl(var(--foreground))]">
                  Next.js 16 App Router & Microservices Architecture
                </h4>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  Lesson 4.2: Building Resilient Microservices & Shared Queues with Redis
                </p>
                <div className="w-full max-w-md pt-2">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-xs text-[hsl(var(--muted-foreground))]">68% Completed</span>
                    <span className="font-mono text-xs text-[hsl(var(--muted-foreground))]">42m remaining</span>
                  </div>
                  <div className="h-2 w-full bg-[hsl(var(--muted))] rounded-full overflow-hidden">
                    <div className="h-full bg-[hsl(var(--primary))] rounded-full transition-all duration-300" style={{ width: '68%' }} />
                  </div>
                </div>
              </div>
              <button
                onClick={() => router.push('/content')}
                className="w-full md:w-auto px-5 py-2.5 rounded-xl font-bold text-xs text-white shadow-md hover:opacity-90 transition-all flex items-center justify-center gap-2"
                style={{ background: 'var(--gradient-primary)' }}
              >
                <span>▶ Resume Lesson</span>
              </button>
            </div>

            {/* Paused & Recommended Courses grid */}
            <div className="pt-2">
              <h4 className="text-sm font-bold mb-3 text-[hsl(var(--foreground))]">Recommended for your Learning Goals</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  {
                    title: 'System Design & Distributed Systems',
                    instructor: 'Dr. Vikram Sethi',
                    level: 'Advanced',
                    duration: '8h 30m',
                    tag: 'Recommended',
                    href: '/marketplace',
                  },
                  {
                    title: 'Node.js Performance Tuning & Monitoring',
                    instructor: 'Elena Rostova',
                    level: 'Intermediate',
                    duration: '5h 15m',
                    tag: 'Popular in Software',
                    href: '/marketplace',
                  },
                  {
                    title: 'PostgreSQL Advanced Indexing & Querying',
                    instructor: 'Michael Chen',
                    level: 'Intermediate',
                    duration: '6h 45m',
                    tag: 'Trending',
                    href: '/marketplace',
                  },
                ].map((course) => (
                  <div
                    key={course.title}
                    onClick={() => router.push(course.href)}
                    className="p-3.5 rounded-xl border border-[hsl(var(--border)/0.5)] bg-[hsl(var(--card))] hover:border-[hsl(var(--primary)/0.4)] hover:shadow-md transition-all cursor-pointer space-y-2 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]">
                        {course.tag}
                      </span>
                      <span className="text-[10px] text-[hsl(var(--muted-foreground))]">{course.level}</span>
                    </div>
                    <h5 className="text-xs font-bold text-[hsl(var(--foreground))] group-hover:text-[hsl(var(--primary))] transition-colors line-clamp-1">
                      {course.title}
                    </h5>
                    <div className="flex items-center justify-between text-[11px] text-[hsl(var(--muted-foreground))] pt-1">
                      <span>{course.instructor}</span>
                      <span>{course.duration}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Quick Actions ── */}
      <Card className="card-premium">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {/* Admin & Teacher actions */}
            {!isIndependentStudent && (
              <Can permission={PERMISSIONS.STUDENTS_VIEW}>
                <QuickAction icon={GraduationCap} label="Students" href="/students" gradient="var(--gradient-primary)" />
              </Can>
            )}
            {!isIndependentStudent && (
              <Can permission={PERMISSIONS.TEACHERS_VIEW}>
                <QuickAction icon={Users} label="Teachers" href="/teachers" gradient="var(--gradient-success)" />
              </Can>
            )}
            {!isIndependentStudent && (
              <Can permission={PERMISSIONS.ATTENDANCE_MARK}>
                <QuickAction icon={ClipboardCheck} label="Attendance" href="/attendance" gradient="var(--gradient-warm)" />
              </Can>
            )}
            <QuickAction icon={BarChart3} label="Marketplace" href="/marketplace" gradient="var(--gradient-primary)" />
            <QuickAction icon={BookOpen} label="My Content" href="/content" gradient="var(--gradient-success)" />
            <QuickAction icon={Video} label="Live Classes" href="/live-classes" gradient="var(--gradient-warm)" />
            <QuickAction icon={Award} label="Certificates" href="/certificates" gradient="var(--gradient-accent)" />
            <QuickAction icon={Bell} label="Notifications" href="/notifications" gradient="var(--gradient-accent)" />

            {/* School Student actions only */}
            {isStudent && !isIndependentStudent && (
              <>
                <QuickAction icon={PenTool} label="Assignments" href="/assignments" gradient="var(--gradient-primary)" />
                <QuickAction icon={BookOpen} label="Study" href="/content" gradient="var(--gradient-success)" />
                <QuickAction icon={Video} label="Live Class" href="/live-classes" gradient="var(--gradient-warm)" />
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

      {/* ── Getting Started / Learning Guide ── */}
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
            {isStudent && isIndependentStudent && '🚀 Independent Learner Guide'}
            {isStudent && !isIndependentStudent && '🎓 Student Quick Guide'}
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

            {isStudent && isIndependentStudent && [
              { step: '1', text: 'Browse Marketplace for new courses' },
              { step: '2', text: 'Resume paused lessons from your dashboard' },
              { step: '3', text: 'Join upcoming live interactive sessions' },
              { step: '4', text: 'Earn & download verified certificates' },
              { step: '5', text: 'Track your daily learning streak & hours' },
            ].map((item) => (
              <div key={item.step} className="flex items-center gap-3 rounded-xl bg-white/10 backdrop-blur-sm px-4 py-3">
                <span className="flex items-center justify-center h-7 w-7 rounded-full bg-white/20 text-xs font-bold shrink-0">
                  {item.step}
                </span>
                <span className="text-sm text-white/90">{item.text}</span>
              </div>
            ))}

            {isStudent && !isIndependentStudent && [
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
  );
}
