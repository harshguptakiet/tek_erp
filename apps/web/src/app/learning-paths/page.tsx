/**
 * Module 05: Content - Learning Paths
 * FR-CONTENT-011: Browse and manage structured learning paths
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Can } from '@/components/auth/can';
import { PERMISSIONS } from '@/config/permissions';
import { toast } from 'sonner';

type PathDifficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
type PathStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

interface LearningPath {
  id: string;
  title: string;
  description: string;
  subject: string;
  grade: string;
  difficulty: PathDifficulty;
  status: PathStatus;
  stepCount: number;
  estimatedHours: number;
  enrolledCount: number;
  completionRate: number;
  isEnrolled: boolean;
  progress?: number;
  author: string;
  lastUpdated: string;
  tags: string[];
}

export default function LearningPathsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubject, setFilterSubject] = useState('ALL');
  const [filterDifficulty, setFilterDifficulty] = useState<PathDifficulty | 'ALL'>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ENROLLED' | 'AVAILABLE'>('ALL');

  const { data: pathsData, isLoading } = useQuery({
    queryKey: ['learning-paths', searchQuery, filterSubject, filterDifficulty, filterStatus],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 800));
      return [
        {
          id: 'lp1',
          title: 'Complete Mathematics Mastery - Class 10',
          description: 'Structured path from algebra basics to board exam preparation with quizzes and practice',
          subject: 'Mathematics',
          grade: 'Class 10',
          difficulty: 'INTERMEDIATE' as PathDifficulty,
          status: 'PUBLISHED' as PathStatus,
          stepCount: 24,
          estimatedHours: 40,
          enrolledCount: 342,
          completionRate: 68,
          isEnrolled: true,
          progress: 45,
          author: 'Dr. Rajesh Kumar',
          lastUpdated: '2024-07-20',
          tags: ['CBSE', 'Board Exam', 'Algebra'],
        },
        {
          id: 'lp2',
          title: 'Physics Fundamentals to Advanced',
          description: 'Progressive learning from mechanics to electromagnetism with virtual labs',
          subject: 'Physics',
          grade: 'Class 11',
          difficulty: 'ADVANCED' as PathDifficulty,
          status: 'PUBLISHED' as PathStatus,
          stepCount: 32,
          estimatedHours: 55,
          enrolledCount: 218,
          completionRate: 52,
          isEnrolled: false,
          author: 'Prof. Priya Singh',
          lastUpdated: '2024-07-18',
          tags: ['NEET', 'JEE', 'Mechanics'],
        },
        {
          id: 'lp3',
          title: 'English Communication Skills',
          description: 'Build reading, writing, and speaking skills through interactive exercises',
          subject: 'English',
          grade: 'Class 8',
          difficulty: 'BEGINNER' as PathDifficulty,
          status: 'PUBLISHED' as PathStatus,
          stepCount: 18,
          estimatedHours: 25,
          enrolledCount: 567,
          completionRate: 74,
          isEnrolled: true,
          progress: 82,
          author: 'Ms. Anita Sharma',
          lastUpdated: '2024-07-22',
          tags: ['Grammar', 'Writing', 'Speaking'],
        },
        {
          id: 'lp4',
          title: 'Chemistry Lab Skills Path',
          description: 'Hands-on chemistry concepts with virtual lab simulations and safety training',
          subject: 'Chemistry',
          grade: 'Class 10',
          difficulty: 'INTERMEDIATE' as PathDifficulty,
          status: 'PUBLISHED' as PathStatus,
          stepCount: 20,
          estimatedHours: 30,
          enrolledCount: 189,
          completionRate: 61,
          isEnrolled: false,
          author: 'Dr. Vikram Patel',
          lastUpdated: '2024-07-15',
          tags: ['Lab', 'Practical', 'Safety'],
        },
        {
          id: 'lp5',
          title: 'Computer Science Programming Basics',
          description: 'Introduction to Python programming with coding exercises and projects',
          subject: 'Computer Science',
          grade: 'Class 9',
          difficulty: 'BEGINNER' as PathDifficulty,
          status: 'DRAFT' as PathStatus,
          stepCount: 15,
          estimatedHours: 20,
          enrolledCount: 0,
          completionRate: 0,
          isEnrolled: false,
          author: 'Mr. Arjun Mehta',
          lastUpdated: '2024-07-25',
          tags: ['Python', 'Coding', 'Projects'],
        },
      ] as LearningPath[];
    },
  });

  const enrollMutation = useMutation({
    mutationFn: async (pathId: string) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return { pathId };
    },
    onSuccess: (_, pathId) => {
      toast.success('Successfully enrolled in learning path!');
      router.push(`/learning-paths/${pathId}`);
    },
    onError: () => toast.error('Failed to enroll. Please try again.'),
  });

  const filteredPaths = pathsData?.filter((path) => {
    const matchesSearch =
      !searchQuery ||
      path.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      path.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = filterSubject === 'ALL' || path.subject === filterSubject;
    const matchesDifficulty = filterDifficulty === 'ALL' || path.difficulty === filterDifficulty;
    const matchesStatus =
      filterStatus === 'ALL' ||
      (filterStatus === 'ENROLLED' && path.isEnrolled) ||
      (filterStatus === 'AVAILABLE' && !path.isEnrolled);
    return matchesSearch && matchesSubject && matchesDifficulty && matchesStatus;
  });

  const stats = {
    total: pathsData?.length ?? 0,
    enrolled: pathsData?.filter((p) => p.isEnrolled).length ?? 0,
    inProgress: pathsData?.filter((p) => p.isEnrolled && (p.progress ?? 0) < 100).length ?? 0,
    completed: pathsData?.filter((p) => p.isEnrolled && p.progress === 100).length ?? 0,
  };

  const getDifficultyColor = (difficulty: PathDifficulty) => {
    switch (difficulty) {
      case 'BEGINNER': return 'success';
      case 'INTERMEDIATE': return 'warning';
      case 'ADVANCED': return 'error';
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded" />
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Learning Paths</h1>
          <p className="mt-2 text-sm text-gray-600">
            Structured learning journeys with sequenced content and progress tracking
          </p>
        </div>
        <Can permission={PERMISSIONS.CONTENT_CREATE}>
          <Button onClick={() => router.push('/learning-paths/create')}>
            Create Learning Path
          </Button>
        </Can>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500">Total Paths</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500">Enrolled</p>
            <p className="text-2xl font-bold text-blue-600">{stats.enrolled}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500">In Progress</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.inProgress}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500">Completed</p>
            <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Search learning paths..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Select value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)}>
              <option value="ALL">All Subjects</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
              <option value="English">English</option>
              <option value="Computer Science">Computer Science</option>
            </Select>
            <Select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value as PathDifficulty | 'ALL')}
            >
              <option value="ALL">All Difficulties</option>
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
            </Select>
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'ALL' | 'ENROLLED' | 'AVAILABLE')}
            >
              <option value="ALL">All Paths</option>
              <option value="ENROLLED">My Enrolled</option>
              <option value="AVAILABLE">Available to Enroll</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Path Cards */}
      <div className="space-y-4">
        {filteredPaths?.map((path) => (
          <Card key={path.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h3 className="text-lg font-semibold text-gray-900">{path.title}</h3>
                    <Badge variant={getDifficultyColor(path.difficulty)}>{path.difficulty}</Badge>
                    {path.status === 'DRAFT' && <Badge variant="secondary">Draft</Badge>}
                    {path.isEnrolled && <Badge variant="info">Enrolled</Badge>}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{path.description}</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {path.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <span>{path.subject} · {path.grade}</span>
                    <span>{path.stepCount} steps</span>
                    <span>{path.estimatedHours}h estimated</span>
                    <span>{path.enrolledCount} enrolled</span>
                    <span>{path.completionRate}% completion rate</span>
                  </div>
                  {path.isEnrolled && path.progress !== undefined && (
                    <div className="mt-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Your Progress</span>
                        <span className="font-medium text-blue-600">{path.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${path.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  {path.isEnrolled ? (
                    <Button onClick={() => router.push(`/learning-paths/${path.id}`)}>
                      Continue Learning
                    </Button>
                  ) : path.status === 'PUBLISHED' ? (
                    <Button
                      onClick={() => enrollMutation.mutate(path.id)}
                      disabled={enrollMutation.isPending}
                    >
                      Enroll Now
                    </Button>
                  ) : null}
                  <Button variant="outline" onClick={() => router.push(`/learning-paths/${path.id}`)}>
                    View Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredPaths?.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              No learning paths match your filters.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
