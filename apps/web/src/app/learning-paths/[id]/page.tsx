/**
 * Module 39: Learning Paths - Learning Path Detail
 * FR-LEARNING-002: View detailed learning path with modules
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { use } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Can } from '@/components/auth/can';
import { PERMISSIONS } from '@/config/permissions';
import { academicService } from '@/services/academic.service';
import { useAuthStore } from '@/stores/auth.store';
import toast from 'react-hot-toast';

type TabId = 'overview' | 'modules' | 'students' | 'analytics';

export default function LearningPathDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  // Real API integration - using placeholder for learning path detail
  // In real implementation, this would be academicService.getLearningPath(id)
  const { data: pathResponse, isLoading } = useQuery({
    queryKey: ['learning-path', id],
    queryFn: async () => {
      // Placeholder - would be actual API call
      return {
        id,
        title: 'Advanced Mathematics Mastery',
        description: 'Complete path to master advanced mathematics concepts',
        subjectId: 'math-101',
        subjectName: 'Mathematics',
        difficulty: 'advanced',
        duration: 120,
        modulesCount: 12,
        enrolledCount: 45,
        completedCount: 12,
        completionRate: 26.7,
        createdBy: 'Dr. Smith',
        createdAt: new Date().toISOString(),
        modules: [
          {
            id: 'm1',
            title: 'Calculus Fundamentals',
            description: 'Introduction to limits and derivatives',
            duration: 10,
            order: 1,
            isRequired: true,
            completionRate: 80,
          },
          {
            id: 'm2',
            title: 'Integration Techniques',
            description: 'Master various integration methods',
            duration: 12,
            order: 2,
            isRequired: true,
            completionRate: 65,
          },
          {
            id: 'm3',
            title: 'Differential Equations',
            description: 'Solve complex differential equations',
            duration: 15,
            order: 3,
            isRequired: true,
            completionRate: 45,
          },
        ],
      };
    },
    enabled: !!id,
  });

  const path = pathResponse;

  // Assign to student mutation
  const assignMutation = useMutation({
    mutationFn: (studentId: string) =>
      academicService.assignLearningPath(studentId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning-path', id] });
      toast.success('Learning path assigned successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to assign learning path');
    },
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

  if (!path) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-gray-600">Learning path not found</p>
          <Button className="mt-4" onClick={() => router.push('/learning-paths')}>
            Back to Learning Paths
          </Button>
        </div>
      </div>
    );
  }

  const tabs: { id: TabId; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'modules', label: `Modules (${path.modulesCount})` },
    { id: 'students', label: `Students (${path.enrolledCount})` },
    { id: 'analytics', label: 'Analytics' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <Button variant="ghost" size="sm" onClick={() => router.push('/learning-paths')}>
              ← Back
            </Button>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">{path.title}</h1>
              <Badge
                variant={
                  path.difficulty === 'beginner'
                    ? 'success'
                    : path.difficulty === 'intermediate'
                    ? 'warning'
                    : 'error'
                }
              >
                {path.difficulty}
              </Badge>
            </div>
            <p className="mt-2 text-gray-600 max-w-3xl">{path.description}</p>
          </div>
          <Can permission={PERMISSIONS.LEARNING_PATHS_ASSIGN}>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => router.push(`/learning-paths/${id}/edit`)}>
                Edit
              </Button>
              <Button onClick={() => router.push(`/learning-paths/${id}/assign`)}>
                Assign to Students
              </Button>
            </div>
          </Can>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Total Modules</p>
            <p className="text-2xl font-bold">{path.modulesCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Duration</p>
            <p className="text-2xl font-bold">{path.duration}h</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Enrolled Students</p>
            <p className="text-2xl font-bold text-blue-600">{path.enrolledCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Completion Rate</p>
            <p className="text-2xl font-bold text-green-600">{path.completionRate.toFixed(0)}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
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

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Path Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Subject</p>
                  <Badge variant="secondary">{path.subjectName}</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Difficulty Level</p>
                  <Badge
                    variant={
                      path.difficulty === 'beginner'
                        ? 'success'
                        : path.difficulty === 'intermediate'
                        ? 'warning'
                        : 'error'
                    }
                  >
                    {path.difficulty}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Created By</p>
                  <p className="text-gray-900">{path.createdBy}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Created On</p>
                  <p className="text-gray-900">
                    {new Date(path.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Progress Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Overall Completion</span>
                    <span className="text-sm text-gray-600">{path.completionRate.toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500"
                      style={{ width: `${path.completionRate}%` }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 pt-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600">Enrolled</p>
                    <p className="text-2xl font-bold text-blue-600">{path.enrolledCount}</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600">Completed</p>
                    <p className="text-2xl font-bold text-green-600">{path.completedCount}</p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <p className="text-sm text-gray-600">In Progress</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {path.enrolledCount - path.completedCount}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'modules' && (
        <Card>
          <CardHeader>
            <CardTitle>Learning Modules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {path.modules?.map((module: any, index: number) => (
                <div
                  key={module.id}
                  className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="font-bold text-indigo-600">{module.order}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900">{module.title}</h4>
                        <p className="text-sm text-gray-600">{module.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {module.isRequired && (
                          <Badge variant="error" className="text-xs">
                            Required
                          </Badge>
                        )}
                        <Badge variant="secondary" className="text-xs">
                          {module.duration}h
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-600">Completion Rate</span>
                          <span className="text-xs font-medium">{module.completionRate}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500"
                            style={{ width: `${module.completionRate}%` }}
                          />
                        </div>
                      </div>
                      <Button size="sm" variant="ghost">
                        View Module →
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'students' && (
        <Card>
          <CardHeader>
            <CardTitle>Enrolled Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-gray-500">
              <p>Student enrollment list will be displayed here</p>
              <p className="text-sm mt-2">Showing progress for each student in the path</p>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <p>Analytics and insights will be displayed here</p>
                <p className="text-sm mt-2">
                  Module completion rates, time spent, and student performance metrics
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
