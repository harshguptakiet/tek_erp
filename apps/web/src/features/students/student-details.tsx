'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Mail, Phone, User, FileText, Heart,
  TrendingUp, Award, BookOpen, ShieldCheck,
  CreditCard, UserCheck, Download, Edit3,
  CheckCircle2, Sparkles
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';

export interface StudentDetailRecord {
  id?: string;
  admissionNumber?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  middleName?: string;
  email?: string;
  phone?: string;
  status?: string;
  profilePicture?: string;
  class?: string;
  section?: string;
  rollNumber?: string;
  gender?: string;
  dateOfBirth?: string | Date;
  bloodGroup?: string;
  address?: string;
  fatherName?: string;
  motherName?: string;
  guardianPhone?: string;
  parentName?: string;
  parentPhone?: string;
  parentEmail?: string;
}

export interface StudentDocumentRecord {
  id?: string;
  type?: string;
  title?: string;
  uploadedAt?: string | Date;
  url?: string;
}

export interface HealthRecordEntry {
  id?: string;
  type?: string;
  title?: string;
  description?: string;
  date?: string | Date;
}

export interface AttendanceSummaryRecord {
  percentage?: number;
  present?: number;
  total?: number;
  absent?: number;
}

export interface PerformanceSummaryRecord {
  gpa?: string;
  rank?: string;
  grade?: string;
}

interface StudentDetailsProps {
  student: StudentDetailRecord;
  documents?: StudentDocumentRecord[];
  healthRecords?: HealthRecordEntry[];
  attendance?: AttendanceSummaryRecord;
  performance?: PerformanceSummaryRecord;
  isLoading?: boolean;
}

export function StudentDetails({
  student,
  documents = [],
  healthRecords = [],
  attendance = { percentage: 94, present: 142, total: 151, absent: 9 },
  performance = { gpa: '3.8 / 4.0', rank: '4th in Class', grade: 'A+' },
  isLoading,
}: StudentDetailsProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-48 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
        <div className="h-96 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
      </div>
    );
  }

  const documentColumns: ColumnDef<StudentDocumentRecord>[] = [
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-[hsl(var(--primary))]" />
          <span className="font-semibold text-xs">{row.original.type || 'Document'}</span>
        </div>
      ),
    },
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }) => <span className="text-xs font-medium">{row.original.title || 'Student Record'}</span>
    },
    {
      accessorKey: 'uploadedAt',
      header: 'Date Uploaded',
      cell: ({ row }) => <span className="text-xs text-[hsl(var(--muted-foreground))]">{new Date(row.original.uploadedAt || Date.now()).toLocaleDateString()}</span>,
    },
    {
      id: 'actions',
      header: 'Action',
      cell: () => (
        <Button variant="ghost" size="sm" className="h-8 text-xs text-[hsl(var(--primary))]">
          <Download className="h-3.5 w-3.5 mr-1" /> Download
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Cover Banner Header Card */}
      <Card className="card-premium overflow-hidden border border-[hsl(var(--border)/0.5)] p-0">
        {/* Decorative Top Gradient Banner */}
        <div className="h-32 w-full relative" style={{ background: 'var(--gradient-primary)' }}>
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md text-white border border-white/30">
              Admission #{student.admissionNumber || 'STU-2024-001'}
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 backdrop-blur-md text-emerald-200 border border-emerald-400/30">
              {student.status || 'ACTIVE'}
            </span>
          </div>
        </div>

        {/* Profile Details Bar */}
        <div className="p-6 pt-0 relative flex flex-col md:flex-row items-start md:items-end justify-between gap-6 -mt-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
            <Avatar className="h-28 w-28 ring-4 ring-[hsl(var(--background))] shadow-xl border border-[hsl(var(--border))]">
              <AvatarImage src={student.profilePicture} alt={student.fullName} />
              <AvatarFallback className="text-2xl font-black text-white" style={{ background: 'var(--gradient-primary)' }}>
                {student.firstName?.[0]}{student.lastName?.[0]}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight">{student.fullName || `${student.firstName} ${student.lastName}`}</h1>
                <span title="Verified Student">
                  <ShieldCheck className="h-5 w-5 text-emerald-500" />
                </span>
              </div>
              <p className="text-sm font-semibold text-[hsl(var(--primary))] flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Class {student.class || '10'} — Section {student.section || 'A'}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-[hsl(var(--muted-foreground))] pt-1">
                <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" />{student.email}</span>
                {student.phone && <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" />{student.phone}</span>}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/students/${student.id}/edit`)}
              className="text-xs h-9 font-semibold flex-1 md:flex-initial"
            >
              <Edit3 className="h-3.5 w-3.5 mr-1.5" /> Edit Profile
            </Button>
            <Button
              size="sm"
              className="text-xs h-9 font-semibold text-white flex-1 md:flex-initial shadow-md"
              style={{ background: 'var(--gradient-primary)' }}
            >
              <Sparkles className="h-3.5 w-3.5 mr-1.5" /> Student Card
            </Button>
          </div>
        </div>
      </Card>

      {/* KPI Overview Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="card-premium p-4 border border-[hsl(var(--border)/0.4)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Attendance Rate</p>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{attendance.percentage || 94}%</p>
            </div>
            <div className="h-10 w-10 rounded-xl flex items-center justify-center text-white" style={{ background: 'var(--gradient-success)' }}>
              <UserCheck className="h-5 w-5" />
            </div>
          </div>
        </Card>

        <Card className="card-premium p-4 border border-[hsl(var(--border)/0.4)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">GPA / Marks</p>
              <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">{performance.gpa || '3.8 / 4.0'}</p>
            </div>
            <div className="h-10 w-10 rounded-xl flex items-center justify-center text-white" style={{ background: 'var(--gradient-primary)' }}>
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
        </Card>

        <Card className="card-premium p-4 border border-[hsl(var(--border)/0.4)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Class Rank</p>
              <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{performance.rank || '4th'}</p>
            </div>
            <div className="h-10 w-10 rounded-xl flex items-center justify-center text-white" style={{ background: 'var(--gradient-warm)' }}>
              <Award className="h-5 w-5" />
            </div>
          </div>
        </Card>

        <Card className="card-premium p-4 border border-[hsl(var(--border)/0.4)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Fee Status</p>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">Paid</p>
            </div>
            <div className="h-10 w-10 rounded-xl flex items-center justify-center text-white" style={{ background: 'var(--gradient-accent)' }}>
              <CreditCard className="h-5 w-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 w-full md:w-auto h-11 p-1 bg-[hsl(var(--secondary))] rounded-xl border border-[hsl(var(--border)/0.4)]">
          <TabsTrigger value="overview" className="text-xs font-semibold rounded-lg data-[state=active]:bg-[hsl(var(--background))] data-[state=active]:shadow-sm">
            Overview
          </TabsTrigger>
          <TabsTrigger value="academics" className="text-xs font-semibold rounded-lg data-[state=active]:bg-[hsl(var(--background))] data-[state=active]:shadow-sm">
            Academics & Attendance
          </TabsTrigger>
          <TabsTrigger value="documents" className="text-xs font-semibold rounded-lg data-[state=active]:bg-[hsl(var(--background))] data-[state=active]:shadow-sm">
            Documents ({documents.length})
          </TabsTrigger>
          <TabsTrigger value="health" className="text-xs font-semibold rounded-lg data-[state=active]:bg-[hsl(var(--background))] data-[state=active]:shadow-sm">
            Health & Welfare
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Overview */}
        <TabsContent value="overview" className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Student Personal Info */}
            <Card className="card-premium p-6 md:col-span-2 border border-[hsl(var(--border)/0.4)] space-y-4">
              <h3 className="text-base font-bold flex items-center gap-2">
                <User className="h-4 w-4 text-[hsl(var(--primary))]" />
                Personal Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-[hsl(var(--secondary)/0.5)] rounded-xl">
                  <p className="text-[hsl(var(--muted-foreground))]">Full Name</p>
                  <p className="font-semibold text-sm mt-0.5">{student.fullName || `${student.firstName} ${student.lastName}`}</p>
                </div>
                <div className="p-3 bg-[hsl(var(--secondary)/0.5)] rounded-xl">
                  <p className="text-[hsl(var(--muted-foreground))]">Roll Number</p>
                  <p className="font-semibold text-sm mt-0.5">{student.rollNumber || '001'}</p>
                </div>
                <div className="p-3 bg-[hsl(var(--secondary)/0.5)] rounded-xl">
                  <p className="text-[hsl(var(--muted-foreground))]">Date of Birth</p>
                  <p className="font-semibold text-sm mt-0.5">{student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : 'Mar 20, 2009'}</p>
                </div>
                <div className="p-3 bg-[hsl(var(--secondary)/0.5)] rounded-xl">
                  <p className="text-[hsl(var(--muted-foreground))]">Gender & Blood Group</p>
                  <p className="font-semibold text-sm mt-0.5">{student.gender || 'Female'} ({student.bloodGroup || 'O+'})</p>
                </div>
              </div>
            </Card>

            {/* Guardian Card */}
            <Card className="card-premium p-6 border border-[hsl(var(--border)/0.4)] space-y-4">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Phone className="h-4 w-4 text-[hsl(var(--primary))]" />
                Guardian Information
              </h3>
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-[hsl(var(--secondary)/0.5)] rounded-xl space-y-1">
                  <p className="font-bold text-sm text-[hsl(var(--foreground))]">{student.parentName || 'Robert Student'}</p>
                  <p className="text-[hsl(var(--muted-foreground))]">Father / Primary Guardian</p>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-[hsl(var(--secondary)/0.3)] rounded-lg">
                  <span className="text-[hsl(var(--muted-foreground))]">Phone:</span>
                  <span className="font-mono font-medium">{student.parentPhone || '+1-555-0401'}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-[hsl(var(--secondary)/0.3)] rounded-lg">
                  <span className="text-[hsl(var(--muted-foreground))]">Email:</span>
                  <span className="font-mono font-medium truncate max-w-[150px]">{student.parentEmail || 'parent@demo.com'}</span>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Tab 2: Academics */}
        <TabsContent value="academics" className="space-y-4 pt-4">
          <Card className="card-premium p-6 border border-[hsl(var(--border)/0.4)] space-y-4">
            <h3 className="text-base font-bold flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-[hsl(var(--primary))]" />
              Academic Performance & Subject Breakdown
            </h3>
            <div className="space-y-3">
              {[
                { subject: 'Mathematics', score: '92%', grade: 'A+', teacher: 'Mr. John Teacher' },
                { subject: 'Science & Physics', score: '88%', grade: 'A', teacher: 'Dr. Sarah Connor' },
                { subject: 'English Literature', score: '95%', grade: 'A+', teacher: 'Ms. Emily Blunt' },
                { subject: 'Social Studies', score: '85%', grade: 'B+', teacher: 'Mr. Alan Grant' },
              ].map((sub, i) => (
                <div key={i} className="flex items-center justify-between p-3.5 bg-[hsl(var(--secondary)/0.4)] rounded-xl border border-[hsl(var(--border)/0.3)]">
                  <div>
                    <p className="font-bold text-sm">{sub.subject}</p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">Instructor: {sub.teacher}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-extrabold text-sm">{sub.score}</span>
                    <Badge variant="outline" className="font-bold text-xs bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] border-[hsl(var(--primary)/0.3)]">
                      {sub.grade}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Tab 3: Documents */}
        <TabsContent value="documents" className="space-y-4 pt-4">
          <Card className="card-premium p-6 border border-[hsl(var(--border)/0.4)]">
            <DataTable
              columns={documentColumns}
              data={documents.length > 0 ? documents : [
                { type: 'ID Card', title: 'Student Official Identification Card', uploadedAt: '2024-08-01' },
                { type: 'Birth Certificate', title: 'Government Birth Certificate Record', uploadedAt: '2024-08-01' },
                { type: 'Transfer Certificate', title: 'Previous School TC Verification', uploadedAt: '2024-08-01' },
              ]}
              searchKey="title"
              searchPlaceholder="Search student records…"
            />
          </Card>
        </TabsContent>

        {/* Tab 4: Health */}
        <TabsContent value="health" className="space-y-4 pt-4">
          <Card className="card-premium p-6 border border-[hsl(var(--border)/0.4)] space-y-4">
            <h3 className="text-base font-bold flex items-center gap-2">
              <Heart className="h-4 w-4 text-rose-500" />
              Health & Medical Records
            </h3>
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3 text-xs text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <span>Medical clearance on file. No known severe allergies recorded.</span>
            </div>
            {healthRecords && healthRecords.length > 0 && (
              <div className="space-y-2 pt-2">
                {healthRecords.map((record: HealthRecordEntry, idx: number) => (
                  <div key={idx} className="p-3 bg-[hsl(var(--secondary)/0.4)] rounded-xl border border-[hsl(var(--border)/0.3)] text-xs flex justify-between">
                    <div>
                      <p className="font-semibold">{record.title || record.type || 'Medical Checkup'}</p>
                      <p className="text-[hsl(var(--muted-foreground))]">{record.description || 'Routine health evaluation'}</p>
                    </div>
                    <span className="text-[hsl(var(--muted-foreground))]">{record.date ? new Date(record.date).toLocaleDateString() : 'Recent'}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
