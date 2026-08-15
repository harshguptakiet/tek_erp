'use client';

import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Eye, Pencil, Phone, Mail, GraduationCap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Can } from '@/components/auth/can';
import { PERMISSIONS } from '@/config/permissions';

interface StudentGridCardProps {
  student: {
    id: string;
    firstName: string;
    lastName: string;
    fullName?: string;
    email: string;
    phone?: string;
    parentPhone?: string;
    admissionNumber?: string;
    class?: string;
    section?: string;
    status: string;
    profilePicture?: string;
  };
}

export function StudentGridCard({ student }: StudentGridCardProps) {
  const router = useRouter();
  const displayName = student.fullName || `${student.firstName} ${student.lastName}`;

  const statusVariants: Record<string, string> = {
    ACTIVE: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    INACTIVE: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20',
    SUSPENDED: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    GRADUATED: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    TRANSFERRED: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  };

  return (
    <Card className="card-premium p-5 flex flex-col justify-between group hover:shadow-xl transition-all duration-300 border border-[hsl(var(--border)/0.5)]">
      <div>
        {/* Top bar with Admission Badge & Status */}
        <div className="flex items-center justify-between mb-4">
          <span className="font-mono text-xs font-semibold bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] px-2.5 py-1 rounded-md border border-[hsl(var(--border)/0.3)]">
            #{student.admissionNumber || 'PENDING'}
          </span>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusVariants[student.status] || statusVariants.ACTIVE}`}>
            {student.status}
          </span>
        </div>

        {/* Profile Avatar & Info */}
        <div className="flex items-center gap-4 mb-4">
          <Avatar className="h-14 w-14 ring-2 ring-[hsl(var(--primary)/0.2)] group-hover:scale-105 transition-transform">
            <AvatarImage src={student.profilePicture} alt={displayName} />
            <AvatarFallback className="text-base font-bold text-white" style={{ background: 'var(--gradient-primary)' }}>
              {student.firstName?.[0]}{student.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-base truncate group-hover:text-[hsl(var(--primary))] transition-colors">
              {displayName}
            </h3>
            <p className="text-xs text-[hsl(var(--muted-foreground))] flex items-center gap-1.5 mt-0.5 truncate">
              <Mail className="h-3.5 w-3.5 shrink-0 text-[hsl(var(--muted-foreground))]" />
              {student.email}
            </p>
          </div>
        </div>

        {/* Academic Details Pill */}
        <div className="bg-[hsl(var(--secondary)/0.5)] p-3 rounded-xl mb-4 space-y-1.5 border border-[hsl(var(--border)/0.3)]">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[hsl(var(--muted-foreground))] flex items-center gap-1">
              <GraduationCap className="h-3.5 w-3.5" />
              Class & Section:
            </span>
            <span className="font-semibold text-[hsl(var(--foreground))]">
              {student.class ? `Class ${student.class}` : 'Unassigned'}
              {student.section ? ` - Sec ${student.section}` : ''}
            </span>
          </div>
          {student.parentPhone && (
            <div className="flex items-center justify-between text-xs pt-1 border-t border-[hsl(var(--border)/0.3)]">
              <span className="text-[hsl(var(--muted-foreground))] flex items-center gap-1">
                <Phone className="h-3.5 w-3.5" />
                Parent Contact:
              </span>
              <span className="font-medium">{student.parentPhone}</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-2 border-t border-[hsl(var(--border)/0.4)]">
        <Can permission={PERMISSIONS.STUDENTS_VIEW}>
          <Button
            onClick={() => router.push(`/students/${student.id}`)}
            variant="outline"
            className="flex-1 text-xs h-9 font-medium hover:bg-[hsl(var(--primary)/0.1)] hover:text-[hsl(var(--primary))]"
          >
            <Eye className="h-3.5 w-3.5 mr-1.5" />
            View Profile
          </Button>
        </Can>
        <Can permission={PERMISSIONS.STUDENTS_UPDATE}>
          <Button
            onClick={() => router.push(`/students/${student.id}/edit`)}
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
            title="Edit Student"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </Can>
      </div>
    </Card>
  );
}
