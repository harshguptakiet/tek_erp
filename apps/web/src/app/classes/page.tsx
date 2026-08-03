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

export default function ClassesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data - replace with actual API call
  const { data: classes, isLoading } = useQuery({
    queryKey: ['classes', searchQuery],
    queryFn: async () => [
      { id: '1', name: 'Class 10', sections: ['A', 'B', 'C'], totalStudents: 120, classTeacher: 'Ms. Sharma', status: 'ACTIVE' },
      { id: '2', name: 'Class 9', sections: ['A', 'B', 'C', 'D'], totalStudents: 160, classTeacher: 'Mr. Kumar', status: 'ACTIVE' },
      { id: '3', name: 'Class 8', sections: ['A', 'B'], totalStudents: 80, classTeacher: 'Ms. Patel', status: 'ACTIVE' },
      { id: '4', name: 'Class 7', sections: ['A', 'B', 'C'], totalStudents: 120, classTeacher: 'Mr. Singh', status: 'ACTIVE' },
      { id: '5', name: 'Class 6', sections: ['A', 'B'], totalStudents: 80, classTeacher: 'Ms. Gupta', status: 'ACTIVE' },
    ],
  });

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
            <h1 className="text-3xl font-bold text-gray-900">Classes & Sections</h1>
            <p className="mt-2 text-sm text-gray-600">
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
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Total Classes</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{classes?.length || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Total Sections</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">
                {classes?.reduce((acc: number, c: any) => acc + c.sections.length, 0) || 0}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-3xl font-bold text-green-600 mt-1">
                {classes?.reduce((acc: number, c: any) => acc + c.totalStudents, 0) || 0}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Avg per Class</p>
              <p className="text-3xl font-bold text-purple-600 mt-1">
                {classes?.length ? Math.round(classes.reduce((acc: number, c: any) => acc + c.totalStudents, 0) / classes.length) : 0}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-grow">
              <Input
                type="search"
                placeholder="Search classes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Classes Table */}
      <Card>
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
            {classes?.map((classItem: any) => (
              <TableRow key={classItem.id} className="cursor-pointer hover:bg-gray-50">
                <TableCell>
                  <p className="font-medium text-gray-900">{classItem.name}</p>
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
                  <span className="font-medium">{classItem.totalStudents}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{classItem.classTeacher}</span>
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
