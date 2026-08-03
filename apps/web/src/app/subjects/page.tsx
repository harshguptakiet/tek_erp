/**
 * Module 04: Academic - Subjects Management
 * FR-SUBJECT-001 to FR-SUBJECT-010: Subject catalog and curriculum
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Can } from '@/components/auth/can';
import { PERMISSIONS } from '@/config/permissions';

export default function SubjectsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedClass, setSelectedClass] = useState('all');

  // Mock data - replace with actual API call
  const { data: subjectsData, isLoading } = useQuery({
    queryKey: ['subjects', searchTerm, selectedCategory, selectedClass],
    queryFn: async () => ({
      stats: {
        totalSubjects: 45,
        coreSubjects: 15,
        electiveSubjects: 30,
        activeTeachers: 82,
      },
      subjects: [
        {
          id: 'sub1',
          name: 'Mathematics',
          code: 'MATH',
          category: 'CORE',
          description: 'Core mathematics including algebra, geometry, calculus',
          classes: ['Class 9', 'Class 10', 'Class 11', 'Class 12'],
          teachers: [
            { id: 't1', name: 'Dr. Rajesh Kumar', specialization: 'Algebra' },
            { id: 't2', name: 'Prof. Meera Patel', specialization: 'Calculus' },
          ],
          totalStudents: 450,
          weeklyHours: 6,
          labRequired: false,
          practicalHours: 0,
        },
        {
          id: 'sub2',
          name: 'Physics',
          code: 'PHY',
          category: 'CORE',
          description: 'Classical and modern physics with laboratory work',
          classes: ['Class 9', 'Class 10', 'Class 11', 'Class 12'],
          teachers: [
            { id: 't3', name: 'Prof. Priya Singh', specialization: 'Mechanics' },
          ],
          totalStudents: 380,
          weeklyHours: 5,
          labRequired: true,
          practicalHours: 2,
        },
        {
          id: 'sub3',
          name: 'Computer Science',
          code: 'CS',
          category: 'ELECTIVE',
          description: 'Programming, data structures, and computer fundamentals',
          classes: ['Class 11', 'Class 12'],
          teachers: [
            { id: 't4', name: 'Mr. Suresh Verma', specialization: 'Programming' },
          ],
          totalStudents: 180,
          weeklyHours: 4,
          labRequired: true,
          practicalHours: 2,
        },
        {
          id: 'sub4',
          name: 'Chemistry',
          code: 'CHEM',
          category: 'CORE',
          description: 'Organic, inorganic, and physical chemistry',
          classes: ['Class 9', 'Class 10', 'Class 11', 'Class 12'],
          teachers: [
            { id: 't5', name: 'Ms. Anjali Sharma', specialization: 'Organic Chemistry' },
          ],
          totalStudents: 420,
          weeklyHours: 5,
          labRequired: true,
          practicalHours: 2,
        },
        {
          id: 'sub5',
          name: 'English',
          code: 'ENG',
          category: 'CORE',
          description: 'Literature, grammar, and communication skills',
          classes: ['Class 9', 'Class 10', 'Class 11', 'Class 12'],
          teachers: [
            { id: 't6', name: 'Mrs. Kavita Reddy', specialization: 'Literature' },
          ],
          totalStudents: 500,
          weeklyHours: 4,
          labRequired: false,
          practicalHours: 0,
        },
      ],
    }),
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

  const filteredSubjects = subjectsData?.subjects.filter((subject: any) => {
    const matchesSearch =
      subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || subject.category === selectedCategory;
    const matchesClass = selectedClass === 'all' || subject.classes.includes(selectedClass);
    return matchesSearch && matchesCategory && matchesClass;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Subjects</h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage subject catalog and curriculum
            </p>
          </div>
          <Can permission={PERMISSIONS.SUBJECTS_CREATE}>
            <Button onClick={() => router.push('/subjects/create')}>
              + Add Subject
            </Button>
          </Can>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Total Subjects</p>
            <p className="text-3xl font-bold text-gray-900">{subjectsData?.stats.totalSubjects}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Core Subjects</p>
            <p className="text-3xl font-bold text-blue-600">{subjectsData?.stats.coreSubjects}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Elective Subjects</p>
            <p className="text-3xl font-bold text-purple-600">{subjectsData?.stats.electiveSubjects}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Active Teachers</p>
            <p className="text-3xl font-bold text-green-600">{subjectsData?.stats.activeTeachers}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Search subjects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="md:col-span-2"
            />
            <Select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
              <option value="all">All Categories</option>
              <option value="CORE">Core</option>
              <option value="ELECTIVE">Elective</option>
              <option value="OPTIONAL">Optional</option>
            </Select>
            <Select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
              <option value="all">All Classes</option>
              <option value="Class 9">Class 9</option>
              <option value="Class 10">Class 10</option>
              <option value="Class 11">Class 11</option>
              <option value="Class 12">Class 12</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredSubjects?.map((subject: any) => (
          <Card key={subject.id} className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => router.push(`/subjects/${subject.id}`)}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-xl text-gray-900">{subject.name}</h3>
                    <Badge variant={subject.category === 'CORE' ? 'info' : 'secondary'}>
                      {subject.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">Code: {subject.code}</p>
                  <p className="text-sm text-gray-700">{subject.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <p className="text-gray-600">Weekly Hours</p>
                  <p className="font-semibold text-gray-900">{subject.weeklyHours} hours</p>
                </div>
                <div>
                  <p className="text-gray-600">Total Students</p>
                  <p className="font-semibold text-gray-900">{subject.totalStudents}</p>
                </div>
                <div>
                  <p className="text-gray-600">Lab Required</p>
                  <p className="font-semibold text-gray-900">
                    {subject.labRequired ? `Yes (${subject.practicalHours}h)` : 'No'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Teachers</p>
                  <p className="font-semibold text-gray-900">{subject.teachers.length}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Classes:</p>
                <div className="flex flex-wrap gap-1">
                  {subject.classes.map((cls: string) => (
                    <Badge key={cls} variant="secondary" className="text-xs">
                      {cls}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4 mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Teachers:</p>
                <div className="space-y-2">
                  {subject.teachers.slice(0, 2).map((teacher: any) => (
                    <div key={teacher.id} className="flex items-center justify-between text-sm">
                      <span className="text-gray-900">{teacher.name}</span>
                      <span className="text-gray-600 text-xs">{teacher.specialization}</span>
                    </div>
                  ))}
                  {subject.teachers.length > 2 && (
                    <p className="text-xs text-gray-600">+{subject.teachers.length - 2} more</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredSubjects?.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">📚</span>
              <p className="text-gray-600">No subjects found</p>
              <Can permission={PERMISSIONS.SUBJECTS_CREATE}>
                <Button className="mt-4" onClick={() => router.push('/subjects/create')}>
                  Add First Subject
                </Button>
              </Can>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
