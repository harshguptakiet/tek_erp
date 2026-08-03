/**
 * Module 06: AR/VR Learning - Experience Viewer
 * FR-CONTENT-026: Launch and interact with AR/VR educational experiences
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

interface ExperienceDetail {
  id: string;
  title: string;
  description: string;
  type: 'AR' | 'VR' | '3D_MODEL' | 'SIMULATION' | 'VIRTUAL_LAB';
  subject: string;
  grade: string;
  duration: string;
  difficulty: string;
  rating: number;
  views: number;
  author: string;
  isWebXR: boolean;
  deviceSupport: string[];
  learningObjectives: string[];
  prerequisites: string[];
  tags: string[];
  instructions: string[];
}

export default function ArVrExperiencePage() {
  const router = useRouter();
  const params = useParams();
  const experienceId = params.id as string;
  const [isLaunching, setIsLaunching] = useState(false);
  const [activeTab, setActiveTab] = useState<'viewer' | 'details' | 'analytics'>('viewer');

  const { data: experience, isLoading } = useQuery({
    queryKey: ['ar-vr-experience', experienceId],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 800));
      return {
        id: experienceId,
        title: 'Virtual Chemistry Lab',
        description: 'Perform chemistry experiments safely in a fully immersive VR environment. Practice titration, observe chemical reactions, and learn lab safety protocols without physical materials.',
        type: 'VR' as const,
        subject: 'Chemistry',
        grade: 'Class 10',
        duration: '45 min',
        difficulty: 'INTERMEDIATE',
        rating: 4.8,
        views: 2890,
        author: 'Dr. Vikram Patel',
        isWebXR: true,
        deviceSupport: ['VR Headset', 'Desktop Browser'],
        learningObjectives: [
          'Understand titration procedures and calculations',
          'Observe acid-base neutralization reactions',
          'Follow proper laboratory safety protocols',
          'Identify common laboratory equipment',
          'Record and analyze experimental data',
        ],
        prerequisites: [
          'Basic understanding of acids and bases',
          'Class 9 Chemistry fundamentals',
        ],
        tags: ['Lab', 'Experiments', 'Safety', 'Titration'],
        instructions: [
          'Ensure your VR headset is connected and calibrated',
          'Use the controllers to interact with lab equipment',
          'Follow on-screen safety instructions before each experiment',
          'Complete the pre-lab quiz before starting experiments',
          'Save your results to track progress',
        ],
      } as ExperienceDetail;
    },
  });

  const launchMutation = useMutation({
    mutationFn: async () => {
      setIsLaunching(true);
      await new Promise((resolve) => setTimeout(resolve, 2000));
    },
    onSuccess: () => {
      toast.success('Experience launched! Put on your VR headset.');
      setIsLaunching(false);
    },
    onError: () => {
      toast.error('Failed to launch experience. Check device compatibility.');
      setIsLaunching(false);
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-2/3 mb-4" />
        <div className="h-96 bg-gray-200 rounded" />
      </div>
    );
  }

  if (!experience) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Button variant="outline" onClick={() => router.push('/ar-vr')} className="mb-4">
        ← Back to AR/VR Catalog
      </Button>

      <div className="flex flex-wrap items-center gap-2 mb-2">
        <h1 className="text-3xl font-bold text-gray-900">{experience.title}</h1>
        <Badge variant="success">{experience.type}</Badge>
        {experience.isWebXR && <Badge variant="info">WebXR</Badge>}
        <Badge variant="warning">{experience.difficulty}</Badge>
      </div>
      <p className="text-gray-600 mb-4">{experience.description}</p>

      <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-6">
        <span>{experience.subject} · {experience.grade}</span>
        <span>By {experience.author}</span>
        <span>{experience.duration}</span>
        <span>⭐ {experience.rating} ({experience.views.toLocaleString()} views)</span>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {(['viewer', 'details', 'analytics'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                activeTab === tab ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'viewer' ? 'Experience Viewer' : tab}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'viewer' && (
        <Can permission={PERMISSIONS.CONTENT_VIEW}>
          <Card className="mb-6">
            <CardContent className="p-0">
              <div className="relative h-96 bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 rounded-lg flex flex-col items-center justify-center text-white">
                {isLaunching ? (
                  <div className="text-center">
                    <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-lg font-medium">Launching VR Experience...</p>
                    <p className="text-sm text-indigo-200 mt-2">Initializing WebXR session</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="text-8xl mb-4">🥽</div>
                    <p className="text-xl font-medium mb-2">Virtual Chemistry Lab</p>
                    <p className="text-indigo-200 mb-6">Click Launch to start the immersive experience</p>
                    <Button
                      size="lg"
                      onClick={() => launchMutation.mutate()}
                      disabled={launchMutation.isPending}
                      className="bg-white text-indigo-900 hover:bg-indigo-50"
                    >
                      Launch Experience
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Device Compatibility</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {experience.deviceSupport.map((device) => (
                    <div key={device} className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      <span className="text-sm">{device}</span>
                    </div>
                  ))}
                </div>
                {experience.isWebXR && (
                  <p className="text-sm text-blue-600 mt-3">
                    WebXR supported — works in compatible browsers without app install
                  </p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Instructions</CardTitle></CardHeader>
              <CardContent>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                  {experience.instructions.map((instruction, i) => (
                    <li key={i}>{instruction}</li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </div>
        </Can>
      )}

      {activeTab === 'details' && (
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle>Learning Objectives</CardTitle></CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {experience.learningObjectives.map((obj, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-green-500 mt-0.5">✓</span>
                    {obj}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Prerequisites</CardTitle></CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {experience.prerequisites.map((pre, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-blue-500 mt-0.5">•</span>
                    {pre}
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex flex-wrap gap-2">
                {experience.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'analytics' && (
        <Can permission={PERMISSIONS.CONTENT_VIEW}>
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold text-blue-600">{experience.views.toLocaleString()}</p>
                <p className="text-sm text-gray-500">Total Views</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold text-green-600">78%</p>
                <p className="text-sm text-gray-500">Completion Rate</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold text-purple-600">{experience.rating}</p>
                <p className="text-sm text-gray-500">Average Rating</p>
              </CardContent>
            </Card>
          </div>
        </Can>
      )}
    </div>
  );
}
