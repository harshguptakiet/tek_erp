/**
 * Module 05: Content - Learning Path Detail
 * FR-CONTENT-011: View path details, progress tracking, and content navigation
 */

'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Can } from '@/components/auth/can';
import { PERMISSIONS } from '@/config/permissions';
import { toast } from 'sonner';

type StepStatus = 'COMPLETED' | 'IN_PROGRESS' | 'LOCKED' | 'AVAILABLE';

interface PathStep {
  id: string;
  order: number;
  title: string;
  contentType: string;
  duration: string;
  status: StepStatus;
  score?: number;
  completedAt?: string;
}

interface LearningPathDetail {
  id: string;
  title: string;
  description: string;
  subject: string;
  grade: string;
  difficulty: string;
  author: string;
  estimatedHours: number;
  enrolledCount: number;
  isEnrolled: boolean;
  progress: number;
  completedSteps: number;
  totalSteps: number;
  isAdaptive: boolean;
  certificateOnCompletion: boolean;
  steps: PathStep[];
}

export default function LearningPathDetailPage() {
  const router = useRouter();
  const params = useParams();
  const pathId = params.id as string;
  const [activeTab, setActiveTab] = useState<'overview' | 'content' | 'analytics'>('content');

  const { data: pathData, isLoading } = useQuery({
    queryKey: ['learning-path', pathId],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 800));
      return {
        id: pathId,
        title: 'Complete Mathematics Mastery - Class 10',
        description: 'Structured path from algebra basics to board exam preparation. Master key concepts through videos, practice quizzes, and mock tests.',
        subject: 'Mathematics',
        grade: 'Class 10',
        difficulty: 'INTERMEDIATE',
        author: 'Dr. Rajesh Kumar',
        estimatedHours: 40,
        enrolledCount: 342,
        isEnrolled: true,
        progress: 45,
        completedSteps: 11,
        totalSteps: 24,
        isAdaptive: true,
        certificateOnCompletion: true,
        steps: [
          { id: 's1', order: 1, title: 'Introduction to Algebra', contentType: 'VIDEO', duration: '45 min', status: 'COMPLETED' as StepStatus, score: 95, completedAt: '2024-07-10' },
          { id: 's2', order: 2, title: 'Linear Equations Practice', contentType: 'QUIZ', duration: '20 min', status: 'COMPLETED' as StepStatus, score: 88, completedAt: '2024-07-12' },
          { id: 's3', order: 3, title: 'Quadratic Equations Notes', contentType: 'DOCUMENT', duration: '15 pages', status: 'COMPLETED' as StepStatus, completedAt: '2024-07-14' },
          { id: 's4', order: 4, title: 'Polynomial Functions', contentType: 'VIDEO', duration: '50 min', status: 'IN_PROGRESS' as StepStatus },
          { id: 's5', order: 5, title: 'Polynomial Quiz', contentType: 'QUIZ', duration: '25 min', status: 'LOCKED' as StepStatus },
          { id: 's6', order: 6, title: 'Trigonometry Basics', contentType: 'VIDEO', duration: '55 min', status: 'LOCKED' as StepStatus },
          { id: 's7', order: 7, title: 'Trigonometry Practice Lab', contentType: 'LAB', duration: '60 min', status: 'LOCKED' as StepStatus },
          { id: 's8', order: 8, title: 'Board Exam Mock Test 1', contentType: 'QUIZ', duration: '180 min', status: 'LOCKED' as StepStatus },
        ],
      } as LearningPathDetail;
    },
  });

  const enrollMutation = useMutation({
    mutationFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
    },
    onSuccess: () => toast.success('Enrolled successfully!'),
    onError: () => toast.error('Enrollment failed.'),
  });

  const getStepStatusIcon = (status: StepStatus) => {
    switch (status) {
      case 'COMPLETED': return '✓';
      case 'IN_PROGRESS': return '▶';
      case 'LOCKED': return '🔒';
      case 'AVAILABLE': return '○';
    }
  };

  const getStepStatusColor = (status: StepStatus) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-700 border-green-200';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'LOCKED': return 'bg-gray-100 text-gray-400 border-gray-200';
      case 'AVAILABLE': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-2/3 mb-4" />
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-8" />
        <div className="h-64 bg-gray-200 rounded" />
      </div>
    );
  }

  if (!pathData) return null;

  const currentStep = pathData.steps.find((s) => s.status === 'IN_PROGRESS');

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Button variant="outline" onClick={() => router.push('/learning-paths')} className="mb-4">
        ← Back to Learning Paths
      </Button>

      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <h1 className="text-3xl font-bold text-gray-900">{pathData.title}</h1>
          <Badge variant="warning">{pathData.difficulty}</Badge>
          {pathData.isAdaptive && <Badge variant="info">Adaptive</Badge>}
        </div>
        <p className="text-gray-600 mb-4">{pathData.description}</p>
        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
          <span>{pathData.subject} · {pathData.grade}</span>
          <span>By {pathData.author}</span>
          <span>{pathData.estimatedHours}h estimated</span>
          <span>{pathData.enrolledCount} enrolled</span>
        </div>
      </div>

      {/* Progress Bar */}
      {pathData.isEnrolled && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">Overall Progress</span>
              <span className="text-blue-600 font-bold">{pathData.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
              <div className="bg-blue-600 h-3 rounded-full transition-all" style={{ width: `${pathData.progress}%` }} />
            </div>
            <p className="text-sm text-gray-500">
              {pathData.completedSteps} of {pathData.totalSteps} steps completed
              {pathData.certificateOnCompletion && pathData.progress < 100 && ' · Certificate available on completion'}
            </p>
            {currentStep && (
              <Button className="mt-4" onClick={() => router.push(`/content/${currentStep.id}`)}>
                Continue: {currentStep.title}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {!pathData.isEnrolled && (
        <Card className="mb-6">
          <CardContent className="pt-6 flex items-center justify-between">
            <div>
              <p className="font-medium">Ready to start this learning path?</p>
              <p className="text-sm text-gray-500">{pathData.totalSteps} steps · {pathData.estimatedHours} hours</p>
            </div>
            <Button onClick={() => enrollMutation.mutate()} disabled={enrollMutation.isPending}>
              Enroll Now
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {(['overview', 'content', 'analytics'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'overview' && (
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle>About This Path</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>{pathData.description}</p>
              <div className="pt-3 border-t space-y-2">
                <p><strong>Subject:</strong> {pathData.subject}</p>
                <p><strong>Grade Level:</strong> {pathData.grade}</p>
                <p><strong>Difficulty:</strong> {pathData.difficulty}</p>
                <p><strong>Content Steps:</strong> {pathData.totalSteps}</p>
                {pathData.isAdaptive && <p><strong>Adaptive:</strong> Content adjusts based on your performance</p>}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>What You&apos;ll Learn</CardTitle></CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Master algebraic concepts and equations</li>
                <li>• Solve quadratic and polynomial problems</li>
                <li>• Apply trigonometry in real-world scenarios</li>
                <li>• Prepare for board examinations with mock tests</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'content' && (
        <div className="space-y-3">
          {pathData.steps.map((step) => (
            <div
              key={step.id}
              className={`flex items-center gap-4 p-4 rounded-lg border ${getStepStatusColor(step.status)}`}
            >
              <span className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-lg font-medium border">
                {getStepStatusIcon(step.status)}
              </span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Step {step.order}</span>
                  <Badge variant="secondary">{step.contentType}</Badge>
                  {step.score !== undefined && (
                    <Badge variant="success">Score: {step.score}%</Badge>
                  )}
                </div>
                <p className={`font-medium ${step.status === 'LOCKED' ? 'text-gray-400' : 'text-gray-900'}`}>
                  {step.title}
                </p>
                <p className="text-sm text-gray-500">{step.duration}</p>
              </div>
              {step.status === 'IN_PROGRESS' && (
                <Button size="sm" onClick={() => router.push(`/content/${step.id}`)}>Continue</Button>
              )}
              {step.status === 'COMPLETED' && (
                <Button size="sm" variant="outline" onClick={() => router.push(`/content/${step.id}`)}>Review</Button>
              )}
              {step.status === 'LOCKED' && (
                <span className="text-xs text-gray-400">Complete previous step</span>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'analytics' && (
        <Can permission={PERMISSIONS.CONTENT_VIEW}>
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold text-blue-600">{pathData.progress}%</p>
                <p className="text-sm text-gray-500">Completion Rate</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold text-green-600">91%</p>
                <p className="text-sm text-gray-500">Average Quiz Score</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold text-purple-600">18h</p>
                <p className="text-sm text-gray-500">Time Spent</p>
              </CardContent>
            </Card>
          </div>
        </Can>
      )}
    </div>
  );
}
