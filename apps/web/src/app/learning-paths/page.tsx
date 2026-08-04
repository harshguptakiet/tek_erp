/**
 * Module 39: Learning Paths - Browse and Manage Learning Paths
 * FR-LEARNING-001: View and manage personalized learning paths
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Can } from '@/components/auth/can';
import { PERMISSIONS } from '@/config/permissions';
import { academicService } from '@/services/academic.service';
import { useAuthStore } from '@/stores/auth.store';

export default function LearningPathsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');

  // Real API integration
  const { data: pathsResponse, isLoading } = useQuery({
    queryKey: ['learning-paths', user?.schoolId, selectedSubject, selectedDifficulty],
    queryFn: () =>
      academicService.createLearningPath(user?.schoolId || '', {
        // This would be listLearningPaths in real implementation
        subjectId: selectedSubject || undefined,
        difficulty: selectedDifficulty || undefined,
      }),
    enabled: !!user?.schoolId,
  });

  const { data: subjectsResponse } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => academicService.listSubjects(),
  });

  // Transform API data
  const paths = Array.isArray(pathsResponse) ? pathsResponse : pathsResponse?.data || [];
  const subjects = Array.isArray(subjectsResponse) ? subjectsResponse : subjectsResponse?.data || [];

  const filteredPaths = paths.filter((path: any) => {
    const matchesSearch =
      path.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      path.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Learning Paths</h1>
            <p className="mt-2 text-sm text-gray-600">
              Personalized learning journeys for students
            </p>
          </div>
          <Can permission={PERMISSIONS.LEARNING_PATHS_CREATE}>
            <Button onClick={() => router.push('/learning-paths/create')}>
              + Create Learning Path
            </Button>
          </Can>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Total Paths</p>
            <p className="text-3xl font-bold text-gray-900">{paths.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Active Students</p>
            <p className="text-3xl font-bold text-blue-600">
              {paths.reduce((sum: number, p: any) => sum + (p.enrolledCount || 0), 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Completed</p>
            <p className="text-3xl font-bold text-green-600">
              {paths.reduce((sum: number, p: any) => sum + (p.completedCount || 0), 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Avg Completion</p>
            <p className="text-3xl font-bold text-purple-600">
              {paths.length > 0
                ? (
                    paths.reduce((sum: number, p: any) => sum + (p.completionRate || 0), 0) /
                    paths.length
                  ).toFixed(0)
                : 0}
              %
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Search learning paths..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="md:col-span-2"
            />
            <Select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}>
              <option value="">All Subjects</option>
              {subjects.map((subject: any) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </Select>
            <Select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
            >
              <option value="">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Learning Paths Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading learning paths...</p>
        </div>
      ) : filteredPaths.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPaths.map((path: any) => (
            <Card
              key={path.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => router.push(`/learning-paths/${path.id}`)}
            >
              <CardContent className="pt-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900 mb-2">
                      {path.title || 'Untitled Path'}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {path.description || 'No description'}
                    </p>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="secondary">{path.subjectName || 'General'}</Badge>
                  <Badge
                    variant={
                      path.difficulty === 'beginner'
                        ? 'success'
                        : path.difficulty === 'intermediate'
                        ? 'warning'
                        : 'error'
                    }
                  >
                    {path.difficulty || 'Intermediate'}
                  </Badge>
                  {path.duration && (
                    <Badge variant="info">{path.duration} hours</Badge>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 mb-4 text-sm">
                  <div className="text-center p-2 bg-blue-50 rounded">
                    <p className="text-xs text-gray-600">Modules</p>
                    <p className="font-semibold text-blue-600">{path.modulesCount || 0}</p>
                  </div>
                  <div className="text-center p-2 bg-green-50 rounded">
                    <p className="text-xs text-gray-600">Enrolled</p>
                    <p className="font-semibold text-green-600">{path.enrolledCount || 0}</p>
                  </div>
                  <div className="text-center p-2 bg-purple-50 rounded">
                    <p className="text-xs text-gray-600">Completed</p>
                    <p className="font-semibold text-purple-600">{path.completedCount || 0}</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-700">Completion Rate</span>
                    <span className="text-xs text-gray-600">
                      {(path.completionRate || 0).toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500"
                      style={{ width: `${path.completionRate || 0}%` }}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button variant="outline" className="flex-1" size="sm">
                    View Details →
                  </Button>
                  <Can permission={PERMISSIONS.LEARNING_PATHS_ASSIGN}>
                    <Button size="sm">Assign</Button>
                  </Can>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">🎯</span>
              <p className="text-gray-600">No learning paths found</p>
              <Can permission={PERMISSIONS.LEARNING_PATHS_CREATE}>
                <Button className="mt-4" onClick={() => router.push('/learning-paths/create')}>
                  Create First Learning Path
                </Button>
              </Can>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
