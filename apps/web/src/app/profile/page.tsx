'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  User, Mail, Phone, Calendar, MapPin, Edit, Camera, Loader2,
  BookOpen, Award, Clock, Flame, ShieldCheck, CheckCircle2, Sparkles,
  Briefcase, ArrowUpRight
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [uploading] = useState(false);

  // Fetch complete user profile
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/users/${user?.id}`);
        if (!response.ok) return null;
        return response.json();
      } catch {
        return null;
      }
    },
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const userData = profile || user;
  const isStudent = user?.role === 'STUDENT' || userData?.role === 'STUDENT';
  const isIndependentStudent =
    isStudent && !user?.schoolId && !user?.organizationId && !user?.tenantId;

  // Synced mock data for Independent Learner Profile
  const independentLearnerProfile = {
    headline: 'Independent Software Engineer & Microservices Architect',
    bio: 'Passionate about building resilient distributed systems, modern full-stack web applications with Next.js 16, and high-performance database architectures.',
    planTier: 'Pro Learner Access',
    learningHours: '24.5 hrs',
    activeCoursesCount: 3,
    certificatesCount: 2,
    streakDays: 5,
    targetRole: 'Senior Full-Stack Architect',
    skills: [
      'Next.js 16', 'TypeScript', 'NestJS', 'PostgreSQL Indexing',
      'Redis Streams', 'Microservices', 'Docker', 'System Design'
    ],
    enrolledCourses: [
      {
        title: 'Next.js 16 App Router & Microservices Architecture',
        progress: 68,
        remainingTime: '42m remaining',
        status: 'In Progress',
      },
      {
        title: 'PostgreSQL Database Performance & Query Indexing',
        progress: 100,
        remainingTime: 'Completed',
        status: 'Completed',
      },
      {
        title: 'Node.js Advanced Async & Event Loops',
        progress: 45,
        remainingTime: '2h 10m remaining',
        status: 'In Progress',
      },
    ],
    verifiedCertificates: [
      {
        title: 'Next.js 16 App Router & Microservices Architecture',
        issued: 'August 10, 2026',
        id: 'CERT-2026-98412',
      },
      {
        title: 'PostgreSQL Database Performance & Query Indexing',
        issued: 'June 01, 2026',
        id: 'CERT-2026-55410',
      },
    ],
  };

  return (
    <div className="container py-8 max-w-5xl space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">My Profile</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            {isIndependentStudent
              ? 'Independent Learner Account & Skill Portfolio'
              : 'View and manage your personal details and academic credentials'}
          </p>
        </div>
        <Button onClick={() => router.push('/profile/edit')} style={{ background: 'var(--gradient-primary)' }}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Profile
        </Button>
      </div>

      {/* Profile Card Header */}
      <Card className="card-premium overflow-hidden border border-[hsl(var(--border)/0.6)]">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-start gap-6">
            {/* Profile Picture */}
            <div className="relative shrink-0">
              <div className="h-28 w-28 rounded-2xl bg-[hsl(var(--primary)/0.1)] border-2 border-[hsl(var(--primary)/0.3)] flex items-center justify-center overflow-hidden shadow-md">
                {userData?.profilePicture ? (
                  <img
                    src={userData.profilePicture}
                    alt={userData?.firstName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="h-14 w-14 text-[hsl(var(--primary))]" />
                )}
              </div>
              <Button
                size="sm"
                className="absolute -bottom-2 -right-2 h-8 w-8 rounded-xl p-0 shadow-md"
                disabled={uploading}
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Basic Info */}
            <div className="flex-1 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-bold text-[hsl(var(--foreground))]">
                  {userData?.firstName || 'Leo'} {userData?.lastName || 'Solo'}
                </h2>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                  {isIndependentStudent ? 'Independent Learner' : userData?.role || 'Student'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  Active
                </span>
              </div>

              {isIndependentStudent && (
                <p className="text-sm font-medium text-[hsl(var(--primary))] flex items-center gap-1.5">
                  <Briefcase className="h-4 w-4" />
                  {independentLearnerProfile.headline}
                </p>
              )}

              <p className="text-xs text-[hsl(var(--muted-foreground))] max-w-2xl">
                {isIndependentStudent ? independentLearnerProfile.bio : 'Registered platform user.'}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-[hsl(var(--muted-foreground))] pt-1">
                <div className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-[hsl(var(--primary))]" />
                  <span>{userData?.email || 'independent.student@demo.com'}</span>
                </div>
                {userData?.phone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-[hsl(var(--primary))]" />
                    <span>{userData.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-[hsl(var(--primary))]" />
                  <span>San Francisco, CA (Remote)</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Independent Student Stats & Learning Sync Section ── */}
      {isIndependentStudent && (
        <>
          {/* B2C Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="card-premium p-4 border border-[hsl(var(--border)/0.5)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-[hsl(var(--muted-foreground))]">Total Learning Time</p>
                  <p className="text-2xl font-bold text-[hsl(var(--foreground))] mt-1">
                    {independentLearnerProfile.learningHours}
                  </p>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                    +4.2 hrs this week
                  </p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Clock className="h-5 w-5" />
                </div>
              </div>
            </Card>

            <Card className="card-premium p-4 border border-[hsl(var(--border)/0.5)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-[hsl(var(--muted-foreground))]">Enrolled Courses</p>
                  <p className="text-2xl font-bold text-[hsl(var(--foreground))] mt-1">
                    {independentLearnerProfile.activeCoursesCount} Active
                  </p>
                  <p className="text-[11px] text-[hsl(var(--primary))] font-semibold mt-0.5">
                    Target: Senior Architect
                  </p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400">
                  <BookOpen className="h-5 w-5" />
                </div>
              </div>
            </Card>

            <Card className="card-premium p-4 border border-[hsl(var(--border)/0.5)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-[hsl(var(--muted-foreground))]">Verified Credentials</p>
                  <p className="text-2xl font-bold text-[hsl(var(--foreground))] mt-1">
                    {independentLearnerProfile.certificatesCount} Verified
                  </p>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                    100% Score Achieved
                  </p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <Award className="h-5 w-5" />
                </div>
              </div>
            </Card>

            <Card className="card-premium p-4 border border-[hsl(var(--border)/0.5)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-[hsl(var(--muted-foreground))]">Learning Streak</p>
                  <p className="text-2xl font-bold text-[hsl(var(--foreground))] mt-1">
                    {independentLearnerProfile.streakDays} Days 🔥
                  </p>
                  <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-0.5">
                    Personal Best Record
                  </p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <Flame className="h-5 w-5" />
                </div>
              </div>
            </Card>
          </div>

          {/* Enrolled Courses & Verified Skills Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Active Enrolled Courses */}
            <Card className="card-premium p-5 border border-[hsl(var(--border)/0.5)] space-y-4">
              <div className="flex items-center justify-between border-b border-[hsl(var(--border)/0.5)] pb-3">
                <h3 className="font-bold text-base flex items-center gap-2 text-[hsl(var(--foreground))]">
                  <BookOpen className="h-4 w-4 text-[hsl(var(--primary))]" />
                  Active Course Progress
                </h3>
                <button
                  onClick={() => router.push('/content')}
                  className="text-xs font-semibold text-[hsl(var(--primary))] hover:underline flex items-center gap-1"
                >
                  My Content Library <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="space-y-3">
                {independentLearnerProfile.enrolledCourses.map((c) => (
                  <div
                    key={c.title}
                    className="p-3.5 rounded-xl border border-[hsl(var(--border)/0.4)] bg-[hsl(var(--background)/0.5)] space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-[hsl(var(--foreground))] line-clamp-1">{c.title}</h4>
                      <Badge variant={c.progress === 100 ? 'success' : 'secondary'} className="text-[10px]">
                        {c.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-[hsl(var(--muted-foreground))]">
                      <span>{c.progress}% Completed</span>
                      <span className="font-mono">{c.remainingTime}</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[hsl(var(--primary))] rounded-full transition-all duration-300"
                        style={{ width: `${c.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Verified Skills & Credentials */}
            <Card className="card-premium p-5 border border-[hsl(var(--border)/0.5)] space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-[hsl(var(--border)/0.5)] pb-3 mb-4">
                  <h3 className="font-bold text-base flex items-center gap-2 text-[hsl(var(--foreground))]">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    Verified Skills & Badges
                  </h3>
                  <button
                    onClick={() => router.push('/certificates')}
                    className="text-xs font-semibold text-[hsl(var(--primary))] hover:underline flex items-center gap-1"
                  >
                    View Certificates <ArrowUpRight className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 mb-5">
                  {independentLearnerProfile.skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] border border-[hsl(var(--border)/0.5)] shadow-xs"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Verified Credentials Showcase */}
                <h4 className="text-xs font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-2">
                  Issued Credentials
                </h4>
                <div className="space-y-2">
                  {independentLearnerProfile.verifiedCertificates.map((cert) => (
                    <div
                      key={cert.id}
                      onClick={() => router.push('/certificates')}
                      className="p-3 rounded-xl border border-[hsl(var(--border)/0.4)] bg-[hsl(var(--background)/0.5)] flex items-center justify-between cursor-pointer hover:border-[hsl(var(--primary)/0.4)] transition-all"
                    >
                      <div>
                        <p className="text-xs font-bold text-[hsl(var(--foreground))] line-clamp-1">{cert.title}</p>
                        <p className="text-[10px] text-[hsl(var(--muted-foreground))] font-mono">{cert.id} • Issued {cert.issued}</p>
                      </div>
                      <Sparkles className="h-4 w-4 text-amber-500 shrink-0 ml-2" />
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </>
      )}

      {/* Standard Details (Personal & Contact) */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="card-premium">
          <CardHeader>
            <CardTitle className="text-base font-bold">Personal Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="flex justify-between border-b border-[hsl(var(--border)/0.5)] pb-2">
              <span className="text-[hsl(var(--muted-foreground))]">Learning Account Type</span>
              <span className="font-bold text-[hsl(var(--foreground))]">
                {isIndependentStudent ? 'Independent Student (B2C)' : userData?.role}
              </span>
            </div>
            <div className="flex justify-between border-b border-[hsl(var(--border)/0.5)] pb-2">
              <span className="text-[hsl(var(--muted-foreground))]">Language</span>
              <span className="font-semibold text-[hsl(var(--foreground))]">English (US)</span>
            </div>
            <div className="flex justify-between border-b border-[hsl(var(--border)/0.5)] pb-2">
              <span className="text-[hsl(var(--muted-foreground))]">Timezone</span>
              <span className="font-semibold text-[hsl(var(--foreground))]">UTC-07:00 (Pacific Time)</span>
            </div>
          </CardContent>
        </Card>

        <Card className="card-premium">
          <CardHeader>
            <CardTitle className="text-base font-bold">Account & Security</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="flex justify-between border-b border-[hsl(var(--border)/0.5)] pb-2">
              <span className="text-[hsl(var(--muted-foreground))]">Two-Factor Auth</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">Protected</span>
            </div>
            <div className="flex justify-between border-b border-[hsl(var(--border)/0.5)] pb-2">
              <span className="text-[hsl(var(--muted-foreground))]">Subscription Tier</span>
              <span className="font-bold text-[hsl(var(--primary))]">Pro Learner Access</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[hsl(var(--muted-foreground))]">Status</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">Verified Active</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
