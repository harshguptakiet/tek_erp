/**
 * Module 14: AR/VR Learning - Browse AR/VR Modules
 * FR-ARVR-001 to FR-ARVR-010: Access immersive learning experiences
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
import { contentService } from '@/services/content.service';
import { academicService } from '@/services/academic.service';
import { useAuthStore } from '@/stores/auth.store';

export default function ARVRPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedDevice, setSelectedDevice] = useState('');

  // Real API integration
  const { data: modulesResponse, isLoading } = useQuery({
    queryKey: ['arvr-modules', user?.schoolId, selectedSubject, selectedType],
    queryFn: () =>
      contentService.listContent({
        schoolId: user?.schoolId,
        contentType: 'ARVR',
        subjectId: selectedSubject || undefined,
      }),
    enabled: !!user?.schoolId,
  });

  const { data: subjectsResponse } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => academicService.listSubjects(),
  });

  // Transform API data
  const modules = Array.isArray(modulesResponse)
    ? modulesResponse
    : modulesResponse?.data || [];
  const subjects = Array.isArray(subjectsResponse) ? subjectsResponse : subjectsResponse?.data || [];

  const filteredModules = modules.filter((module: any) => {
    const matchesSearch =
      module.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      module.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !selectedType || module.experienceType === selectedType;
    const matchesDevice = !selectedDevice || module.supportedDevices?.includes(selectedDevice);
    return matchesSearch && matchesType && matchesDevice;
  });

  const arCount = modules.filter((m: any) => m.experienceType === 'AR').length;
  const vrCount = modules.filter((m: any) => m.experienceType === 'VR').length;
  const mixedCount = modules.filter((m: any) => m.experienceType === 'MIXED').length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">AR/VR Learning</h1>
            <p className="mt-2 text-sm text-gray-600">
              Immersive educational experiences with augmented and virtual reality
            </p>
          </div>
          <Button variant="outline" onClick={() => router.push('/ar-vr/my-experiences')}>
            My Experiences
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="pt-6">
            <p className="text-blue-100 text-sm">Total Modules</p>
            <p className="text-3xl font-bold">{modules.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="pt-6">
            <p className="text-purple-100 text-sm">AR Experiences</p>
            <p className="text-3xl font-bold">{arCount}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-pink-500 to-pink-600 text-white">
          <CardContent className="pt-6">
            <p className="text-pink-100 text-sm">VR Experiences</p>
            <p className="text-3xl font-bold">{vrCount}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
          <CardContent className="pt-6">
            <p className="text-indigo-100 text-sm">Mixed Reality</p>
            <p className="text-3xl font-bold">{mixedCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Input
              placeholder="Search modules..."
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
            <Select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
              <option value="">All Types</option>
              <option value="AR">Augmented Reality</option>
              <option value="VR">Virtual Reality</option>
              <option value="MIXED">Mixed Reality</option>
            </Select>
            <Select value={selectedDevice} onChange={(e) => setSelectedDevice(e.target.value)}>
              <option value="">All Devices</option>
              <option value="mobile">Mobile</option>
              <option value="tablet">Tablet</option>
              <option value="headset">VR Headset</option>
              <option value="desktop">Desktop</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Modules Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading AR/VR modules...</p>
        </div>
      ) : filteredModules.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredModules.map((module: any) => (
            <Card
              key={module.id}
              className="hover:shadow-xl transition-all cursor-pointer overflow-hidden"
              onClick={() => router.push(`/ar-vr/${module.id}`)}
            >
              {/* Thumbnail */}
              <div className="h-48 bg-gradient-to-br from-purple-400 via-pink-500 to-blue-500 flex items-center justify-center relative">
                {module.thumbnail ? (
                  <img
                    src={module.thumbnail}
                    alt={module.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-6xl">
                    {module.experienceType === 'AR' ? '🔍' : module.experienceType === 'VR' ? '🥽' : '🌐'}
                  </span>
                )}
                <Badge
                  variant="info"
                  className="absolute top-3 right-3 bg-white text-gray-900"
                >
                  {module.experienceType || 'AR'}
                </Badge>
              </div>

              <CardContent className="pt-4">
                {/* Title & Subject */}
                <div className="mb-3">
                  <h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-1">
                    {module.title || 'Untitled Module'}
                  </h3>
                  <Badge variant="secondary" className="text-xs">
                    {module.subjectName || 'General'}
                  </Badge>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                  {module.description || 'No description available'}
                </p>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 mb-4 text-xs">
                  <div className="text-center p-2 bg-blue-50 rounded">
                    <p className="text-gray-600">Duration</p>
                    <p className="font-semibold text-blue-600">
                      {module.duration || 15} min
                    </p>
                  </div>
                  <div className="text-center p-2 bg-green-50 rounded">
                    <p className="text-gray-600">Users</p>
                    <p className="font-semibold text-green-600">
                      {module.usersCount || 0}
                    </p>
                  </div>
                  <div className="text-center p-2 bg-purple-50 rounded">
                    <p className="text-gray-600">Rating</p>
                    <p className="font-semibold text-purple-600">
                      ★ {(module.rating || 0).toFixed(1)}
                    </p>
                  </div>
                </div>

                {/* Devices */}
                <div className="mb-4">
                  <p className="text-xs text-gray-600 mb-1">Supported Devices:</p>
                  <div className="flex flex-wrap gap-1">
                    {(module.supportedDevices || ['mobile', 'tablet']).map((device: string) => (
                      <Badge key={device} variant="secondary" className="text-xs">
                        {device}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Action */}
                <Button className="w-full" onClick={(e) => e.stopPropagation()}>
                  Launch Experience →
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">🥽</span>
              <p className="text-gray-600">No AR/VR modules found</p>
              <p className="text-sm text-gray-500 mt-2">
                Check back later for immersive learning experiences
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Banner */}
      <Card className="mt-8 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <span className="text-4xl">💡</span>
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Getting Started with AR/VR Learning
              </h3>
              <p className="text-sm text-gray-700 mb-3">
                Experience immersive learning with augmented and virtual reality modules. You'll
                need compatible devices and browsers to access these experiences.
              </p>
              <Button variant="outline" size="sm">
                View Requirements →
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
