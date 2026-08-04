/**
 * Module 04: Academic - Subject Detail
 * FR-SUBJECT-002: View subject catalog entry
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { use } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Can } from '@/components/auth/can';
import { PERMISSIONS } from '@/config/permissions';
import { academicService } from '@/services/academic.service';

type TabId = 'overview' | 'teachers' | 'syllabus';

export default function SubjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  // Real API integration - get all subjects and find the one we need
  const { data: subjects, isLoading } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => academicService.listSubjects(),
  });

  const subject = subjects?.find((s: any) => s.id === id);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <p className="text-gray-500">Subject not found</p>
            <Button className="mt-4" onClick={() => router.push('/subjects')}>
              Back to subjects
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const tabs: { id: TabId; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'teachers', label: 'Teachers' },
    { id: 'syllabus', label: 'Syllabus' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <Button variant="ghost" size="sm" onClick={() => router.push('/subjects')}>
            ← Subjects
          </Button>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">{subject.name}</h1>
            <Badge variant="secondary">{subject.code}</Badge>
            <Badge variant={subject.category === 'CORE' ? 'info' : 'warning'}>
              {subject.category}
            </Badge>
            {subject.labRequired && <Badge variant="success">Lab required</Badge>}
          </div>
          <p className="mt-2 text-gray-600 max-w-3xl">{subject.description}</p>
        </div>
        <Can permission={PERMISSIONS.SUBJECTS_CREATE}>
          <Button variant="outline" onClick={() => router.push(`/subjects/create?id=${id}`)}>
            Edit subject
          </Button>
        </Can>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Students enrolled</p>
            <p className="text-2xl font-bold">{subject.totalStudents}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Weekly hours</p>
            <p className="text-2xl font-bold">{subject.weeklyHours}h</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Practical hours</p>
            <p className="text-2xl font-bold">{subject.practicalHours}h</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Assigned teachers</p>
            <p className="text-2xl font-bold">{subject.teachers.length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'overview' && (
        <Card>
          <CardHeader>
            <CardTitle>Classes offering this subject</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {subject.classes.map((cls) => (
                <Badge key={cls} variant="secondary">
                  {cls}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'teachers' && (
        <Card>
          <CardHeader>
            <CardTitle>Assigned teachers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {subject.teachers.map((teacher) => (
              <div
                key={teacher.id}
                className="flex items-center justify-between p-4 rounded-lg border border-gray-200"
              >
                <div>
                  <p className="font-medium text-gray-900">{teacher.name}</p>
                  <p className="text-sm text-gray-500">{teacher.specialization}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => router.push(`/teachers/${teacher.id}`)}>
                  View profile
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {activeTab === 'syllabus' && (
        <Card>
          <CardHeader>
            <CardTitle>Syllabus topics</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              {subject.syllabusTopics.map((topic) => (
                <li key={topic}>{topic}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
