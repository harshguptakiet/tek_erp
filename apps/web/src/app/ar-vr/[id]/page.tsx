/**
 * Module 14: AR/VR Learning - AR/VR Module Detail & Launcher
 * FR-ARVR-002: Launch and experience AR/VR module
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { use } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { contentService } from '@/services/content.service';
import { useAuthStore } from '@/stores/auth.store';
import toast from 'react-hot-toast';

type TabId = 'overview' | 'requirements' | 'reviews' | 'analytics';

export default function ARVRModuleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [isLaunching, setIsLaunching] = useState(false);

  // Real API integration
  const { data: moduleResponse, isLoading } = useQuery({
    queryKey: ['arvr-module', id],
    queryFn: () => contentService.getContent(id),
    enabled: !!id,
  });

  const module = moduleResponse;

  const handleLaunch = () => {
    setIsLaunching(true);
    toast.success('Launching AR/VR experience...');
    
    // In real implementation, this would:
    // 1. Check device compatibility
    // 2. Request necessary permissions (camera, sensors, etc.)
    // 3. Launch the AR/VR experience in appropriate mode
    // 4. Track usage analytics
    
    setTimeout(() => {
      setIsLaunching(false);
      // Simulate opening AR/VR experience
      // window.open(`/ar-vr/${id}/experience`, '_blank');
    }, 2000);
  };

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

  if (!module) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-gray-600">AR/VR module not found</p>
          <Button className="mt-4" onClick={() => router.push('/ar-vr')}>
            Back to AR/VR Modules
          </Button>
        </div>
      </div>
    );
  }

  const tabs: { id: TabId; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'requirements', label: 'Requirements' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'analytics', label: 'Analytics' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" size="sm" onClick={() => router.push('/ar-vr')}>
          ← Back
        </Button>
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Preview & Launch */}
          <div className="lg:col-span-2">
            {/* Preview Image/Video */}
            <div className="relative h-96 bg-gradient-to-br from-purple-400 via-pink-500 to-blue-500 rounded-xl overflow-hidden mb-6">
              {module.thumbnail ? (
                <img
                  src={module.thumbnail}
                  alt={module.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <span className="text-9xl">
                    {module.experienceType === 'AR' ? '🔍' : module.experienceType === 'VR' ? '🥽' : '🌐'}
                  </span>
                </div>
              )}
              <div className="absolute top-4 right-4">
                <Badge variant="info" className="bg-white text-gray-900 text-lg px-4 py-2">
                  {module.experienceType || 'AR'}
                </Badge>
              </div>
            </div>

            {/* Launch Button */}
            <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Ready to Experience?</h3>
                    <p className="text-indigo-100">
                      Launch the {module.experienceType === 'AR' ? 'augmented' : 'virtual'} reality module now
                    </p>
                  </div>
                  <Button
                    size="lg"
                    className="bg-white text-indigo-600 hover:bg-gray-100"
                    onClick={handleLaunch}
                    disabled={isLaunching}
                  >
                    {isLaunching ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        Launching...
                      </>
                    ) : (
                      <>
                        🚀 Launch Experience
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Module Info */}
          <div>
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {module.title || 'Untitled Module'}
                  </h1>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant="secondary">{module.subjectName || 'General'}</Badge>
                    <Badge variant={module.experienceType === 'AR' ? 'info' : 'success'}>
                      {module.experienceType || 'AR'}
                    </Badge>
                  </div>
                  <p className="text-gray-600 text-sm">
                    {module.description || 'No description available'}
                  </p>
                </div>

                <div className="border-t pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Duration</span>
                    <span className="font-medium">{module.duration || 15} minutes</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Users</span>
                    <span className="font-medium">{module.usersCount || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Rating</span>
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500">★</span>
                      <span className="font-medium">{(module.rating || 0).toFixed(1)}</span>
                      <span className="text-xs text-gray-500">
                        ({module.reviewCount || 0} reviews)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Supported Devices</p>
                  <div className="flex flex-wrap gap-2">
                    {(module.supportedDevices || ['mobile', 'tablet']).map((device: string) => (
                      <Badge key={device} variant="secondary">
                        {device}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Created By</p>
                  <p className="text-sm text-gray-600">{module.createdBy || 'Unknown'}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {module.createdAt ? new Date(module.createdAt).toLocaleDateString() : '-'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
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
              <CardTitle>About This Experience</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed mb-4">
                {module.description || 'No detailed description available.'}
              </p>
              
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Learning Objectives:</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Understand core concepts through immersive visualization</li>
                  <li>Interact with 3D models and simulations</li>
                  <li>Apply knowledge in realistic scenarios</li>
                  <li>Complete assessments within the experience</li>
                </ul>
              </div>

              {module.tags && module.tags.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Tags:</h4>
                  <div className="flex flex-wrap gap-2">
                    {module.tags.map((tag: string) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'requirements' && (
        <Card>
          <CardHeader>
            <CardTitle>System Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Device Requirements</h4>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Modern smartphone or tablet with AR/VR capabilities</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Camera access for AR experiences</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Gyroscope and accelerometer sensors</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Stable internet connection (minimum 5 Mbps)</span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Software Requirements</h4>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Latest version of Chrome, Safari, or Firefox</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>WebXR API support enabled</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Location services (optional for some features)</span>
                  </li>
                </ul>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> VR headsets (Oculus Quest, HTC Vive, etc.) provide the best experience
                  but are not required. Most modules work on standard mobile devices.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'reviews' && (
        <Card>
          <CardHeader>
            <CardTitle>User Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-gray-500">
              <p>Reviews will be displayed here</p>
              <p className="text-sm mt-2">Rate this experience after completing it</p>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'analytics' && (
        <Card>
          <CardHeader>
            <CardTitle>Usage Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-gray-500">
              <p>Analytics and usage statistics will be displayed here</p>
              <p className="text-sm mt-2">Track completion rates and engagement metrics</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
