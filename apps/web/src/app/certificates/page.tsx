/**
 * Certificates Page
 * Displays earned certificates for independent students, or generator for admins
 */

'use client';

import { useAuthStore } from '@/stores/auth.store';
import { CertificateGenerator } from '@/features/certificates/certificate-generator';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Award, Download, Share2, ShieldCheck, Sparkles, CheckCircle2, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

const myEarnedCertificates = [
  {
    id: 'cert-1',
    title: 'Next.js 16 App Router & Microservices Architecture',
    issuer: 'Tekurious Academy',
    issueDate: 'August 10, 2026',
    credentialId: 'CERT-2026-98412',
    type: 'Course Completion',
    skills: ['Next.js 16', 'Microservices', 'Redis Streams', 'NestJS', 'Prisma ORM'],
    gradient: 'var(--gradient-primary)',
    score: '98%',
  },
  {
    id: 'cert-2',
    title: 'Advanced Full-Stack Engineering Masterclass',
    issuer: 'Tekurious Academy',
    issueDate: 'July 15, 2026',
    credentialId: 'CERT-2026-77209',
    type: 'Professional Certification',
    skills: ['TypeScript', 'React 19', 'PostgreSQL', 'Docker', 'System Design'],
    gradient: 'var(--gradient-accent)',
    score: '95%',
  },
  {
    id: 'cert-3',
    title: 'PostgreSQL Database Performance & Query Indexing',
    issuer: 'Tekurious Academy',
    issueDate: 'June 01, 2026',
    credentialId: 'CERT-2026-55410',
    type: 'Skill Specialization',
    skills: ['PostgreSQL', 'Query Optimization', 'Database Indexing', 'SQL'],
    gradient: 'var(--gradient-success)',
    score: '100%',
  },
];

export default function CertificatesPage() {
  const { user } = useAuthStore();

  const isStudent = user?.role === 'STUDENT';
  const isAdminOrTeacher =
    user?.role === 'PLATFORM_ADMIN' ||
    user?.role === 'ORG_ADMIN' ||
    user?.role === 'SCHOOL_ADMIN' ||
    user?.role === 'TEACHER';

  const handleDownload = (title: string) => {
    toast.success(`Downloading certificate PDF for "${title}"`);
  };

  const handleShare = (credentialId: string) => {
    navigator.clipboard.writeText(`https://tekurious.com/verify/${credentialId}`);
    toast.success('Certificate verification link copied to clipboard!');
  };

  // If Admin or Teacher, show generator tool
  if (isAdminOrTeacher) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[hsl(var(--foreground))]">
            Certificate Generation
          </h1>
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            Generate achievement, participation, and merit certificates for students
          </p>
        </div>
        <CertificateGenerator />
      </div>
    );
  }

  // Student / Independent Student View: My Earned Certificates
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[hsl(var(--foreground))] flex items-center gap-3">
            <Award className="h-8 w-8 text-[hsl(var(--primary))]" />
            My Earned Certificates
          </h1>
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            Showcase of your verified course completions and achievements
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1.5 text-xs font-semibold gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            {myEarnedCertificates.length} Verified Credentials
          </Badge>
        </div>
      </div>

      {/* Certificates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {myEarnedCertificates.map((cert) => (
          <Card
            key={cert.id}
            className="card-premium overflow-hidden border border-[hsl(var(--border)/0.6)] flex flex-col justify-between"
          >
            {/* Certificate Header Banner */}
            <div
              className="p-6 text-white relative overflow-hidden flex flex-col justify-between h-36"
              style={{ background: cert.gradient }}
            >
              <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-white/10" />
              <div className="flex items-center justify-between relative z-10">
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white">
                  <Sparkles className="h-3 w-3" />
                  {cert.type}
                </span>
                <span className="text-xs font-mono font-bold bg-black/20 px-2 py-0.5 rounded text-white/90">
                  {cert.score}
                </span>
              </div>
              <div className="relative z-10">
                <p className="text-[11px] text-white/80 font-semibold">{cert.issuer}</p>
                <h3 className="text-base font-bold leading-snug line-clamp-2 text-white">
                  {cert.title}
                </h3>
              </div>
            </div>

            {/* Certificate Details */}
            <CardContent className="p-5 space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs border-b border-[hsl(var(--border)/0.5)] pb-3">
                  <span className="text-[hsl(var(--muted-foreground))]">Issued Date</span>
                  <span className="font-semibold text-[hsl(var(--foreground))]">{cert.issueDate}</span>
                </div>
                <div className="flex items-center justify-between text-xs border-b border-[hsl(var(--border)/0.5)] pb-3">
                  <span className="text-[hsl(var(--muted-foreground))]">Credential ID</span>
                  <span className="font-mono font-bold text-[hsl(var(--primary))]">{cert.credentialId}</span>
                </div>

                {/* Skills Verified */}
                <div className="space-y-1.5 pt-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                    Skills Verified
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {cert.skills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))]"
                      >
                        <CheckCircle2 className="h-2.5 w-2.5 text-emerald-500" />
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-3">
                <Button
                  size="sm"
                  onClick={() => handleDownload(cert.title)}
                  className="flex-1 text-xs font-semibold text-white shadow-sm"
                  style={{ background: 'var(--gradient-primary)' }}
                >
                  <Download className="h-3.5 w-3.5 mr-1.5" /> PDF
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShare(cert.credentialId)}
                  className="text-xs font-semibold"
                >
                  <Share2 className="h-3.5 w-3.5 mr-1.5" /> Share
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
