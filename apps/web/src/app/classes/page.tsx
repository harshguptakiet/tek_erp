/**
 * Module 04: Academic Management - Classes
 * FR-ACAD-001 to FR-ACAD-010: Class and Section Management
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Can } from '@/components/auth/can';
import { PERMISSIONS } from '@/config/permissions';
import { academicService } from '@/services/academic.service';
import { useAuthStore } from '@/stores/auth.store';

const MOCK_CLASSES = [
  {
    id: 'cls-10',
    name: 'Class 10',
    sections: ['A', 'B', 'C'],
    totalStudents: 120,
    classTeacher: 'Dr. Vikram Sethi',
    status: 'ACTIVE',
  },
  {
    id: 'cls-11',
    name: 'Class 11 - Science',
    sections: ['PCM-A', 'PCB-B'],
    totalStudents: 85,
    classTeacher: 'Elena Rostova',
    status: 'ACTIVE',
  },
  {
    id: 'cls-12',
    name: 'Class 12 - Computer Science',
    sections: ['CS-1', 'CS-2'],
    totalStudents: 78,
    classTeacher: 'Michael Chen',
    status: 'ACTIVE',
  },
  {
    id: 'cls-9',
    name: 'Class 9',
    sections: ['A', 'B'],
    totalStudents: 90,
    classTeacher: 'Alex Rivera',
    status: 'ACTIVE',
  },
];

export default function ClassesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuthStore();

  // Real API integration - fetches from backend
  const { data: classStructure, isLoading } = useQuery({
    queryKey: ['classes', user?.schoolId],
    queryFn: () => academicService.getClassStructure(user?.schoolId || ''),
    enabled: !!user?.schoolId,
  });

  // Transform API data to match UI format with mock fallback
  const apiClasses = classStructure?.classes?.map((cls: any) => ({
    id: cls.id,
    name: cls.name,
    sections: cls.sections?.map((s: any) => s.name) || [],
    totalStudents: cls.sections?.reduce((acc: number, s: any) => acc + (s.studentCount || 0), 0) || 0,
    classTeacher: cls.sections?.[0]?.classTeacher?.name || 'Not Assigned',
    status: 'ACTIVE',
  })) || [];

  const classes = apiClasses.length > 0 ? apiClasses : MOCK_CLASSES;

  const filteredClasses = classes.filter((c: any) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.classTeacher.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">Classes & Sections</h1>
            <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
              Manage classes, sections, and student assignments
            </p>
          </div>
          <Can permission={PERMISSIONS.ACADEMIC_MANAGE}>
            <Button onClick={() => router.push('/classes/create')}>
              Create Class
            </Button>
          </Can>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card className="card-premium">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">Total Classes</p>
              <p className="text-3xl font-bold text-[hsl(var(--foreground))] mt-1">{classes?.length || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="card-premium">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">Total Sections</p>
              <p className="text-3xl font-bold text-blue-500 mt-1">
                {classes?.reduce((acc: number, c: any) => acc + c.sections.length, 0) || 0}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="card-premium">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">Total Students</p>
              <p className="text-3xl font-bold text-emerald-500 mt-1">
                {classes?.reduce((acc: number, c: any) => acc + c.totalStudents, 0) || 0}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="card-premium">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">Avg per Class</p>
              <p className="text-3xl font-bold text-purple-500 mt-1">
                {classes?.length ? Math.round(classes.reduce((acc: number, c: any) => acc + c.totalStudents, 0) / classes.length) : 0}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="card-premium mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-grow">
              <Input
                type="search"
                placeholder="Search classes or teachers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Classes Table */}
      <Card className="card-premium overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Class</TableHead>
              <TableHead>Sections</TableHead>
              <TableHead>Total Students</TableHead>
              <TableHead>Class Teacher</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClasses?.map((classItem: any) => (
              <TableRow key={classItem.id} className="cursor-pointer hover:bg-[hsl(var(--muted)/0.5)]">
                <TableCell>
                  <p className="font-semibold text-[hsl(var(--foreground))]">{classItem.name}</p>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {classItem.sections.map((section: string) => (
                      <Badge key={section} variant="info" className="text-xs">
                        {section}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-medium text-[hsl(var(--foreground))]">{classItem.totalStudents}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-[hsl(var(--foreground))]">{classItem.classTeacher}</span>
                </TableCell>
                <TableCell>
                  <Badge variant={classItem.status === 'ACTIVE' ? 'success' : 'secondary'}>
                    {classItem.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => router.push(`/classes/${classItem.id}`)}
                    >
                      View
                    </Button>
                    <Can permission={PERMISSIONS.ACADEMIC_MANAGE}>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => router.push(`/classes/${classItem.id}/edit`)}
                      >
                        Edit
                      </Button>
                    </Can>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
