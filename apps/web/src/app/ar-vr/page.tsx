/**
 * Module 06: AR/VR Learning - Experience Catalog
 * FR-CONTENT-026: Browse AR/VR educational experiences
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

type ExperienceType = 'AR' | 'VR' | '3D_MODEL' | 'SIMULATION' | 'VIRTUAL_LAB';
type DeviceSupport = 'MOBILE' | 'TABLET' | 'DESKTOP' | 'VR_HEADSET';

interface ArVrExperience {
  id: string;
  title: string;
  description: string;
  type: ExperienceType;
  subject: string;
  grade: string;
  duration: string;
  deviceSupport: DeviceSupport[];
  rating: number;
  views: number;
  isWebXR: boolean;
  thumbnail: string;
  tags: string[];
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
}

export default function ArVrPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<ExperienceType | 'ALL'>('ALL');
  const [filterSubject, setFilterSubject] = useState('ALL');
  const [filterDevice, setFilterDevice] = useState<DeviceSupport | 'ALL'>('ALL');

  const { data: experiences, isLoading } = useQuery({
    queryKey: ['ar-vr-experiences', searchQuery, filterType, filterSubject, filterDevice],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 800));
      return [
        {
          id: 'ar1',
          title: 'Solar System AR Explorer',
          description: 'Explore planets and moons in augmented reality with interactive 3D models',
          type: 'AR' as ExperienceType,
          subject: 'Science',
          grade: 'Class 8',
          duration: '30 min',
          deviceSupport: ['MOBILE', 'TABLET'] as DeviceSupport[],
          rating: 4.9,
          views: 4520,
          isWebXR: true,
          thumbnail: '/thumbnails/solar-ar.jpg',
          tags: ['Astronomy', 'Planets', 'Interactive'],
          difficulty: 'BEGINNER' as const,
        },
        {
          id: 'vr1',
          title: 'Virtual Chemistry Lab',
          description: 'Perform chemistry experiments safely in a fully immersive VR environment',
          type: 'VR' as ExperienceType,
          subject: 'Chemistry',
          grade: 'Class 10',
          duration: '45 min',
          deviceSupport: ['VR_HEADSET', 'DESKTOP'] as DeviceSupport[],
          rating: 4.8,
          views: 2890,
          isWebXR: true,
          thumbnail: '/thumbnails/chem-vr.jpg',
          tags: ['Lab', 'Experiments', 'Safety'],
          difficulty: 'INTERMEDIATE' as const,
        },
        {
          id: 'sim1',
          title: 'Human Anatomy 3D Tour',
          description: 'Navigate through human body systems with detailed 3D anatomical models',
          type: '3D_MODEL' as ExperienceType,
          subject: 'Biology',
          grade: 'Class 11',
          duration: '60 min',
          deviceSupport: ['DESKTOP', 'TABLET', 'VR_HEADSET'] as DeviceSupport[],
          rating: 4.7,
          views: 3210,
          isWebXR: false,
          thumbnail: '/thumbnails/anatomy-3d.jpg',
          tags: ['Anatomy', 'Medical', '3D'],
          difficulty: 'ADVANCED' as const,
        },
        {
          id: 'lab1',
          title: 'Physics Mechanics Simulator',
          description: 'Simulate Newton\'s laws, projectile motion, and collisions interactively',
          type: 'SIMULATION' as ExperienceType,
          subject: 'Physics',
          grade: 'Class 11',
          duration: '40 min',
          deviceSupport: ['DESKTOP', 'TABLET'] as DeviceSupport[],
          rating: 4.9,
          views: 5670,
          isWebXR: false,
          thumbnail: '/thumbnails/physics-sim.jpg',
          tags: ['Mechanics', 'Newton', 'Simulation'],
          difficulty: 'INTERMEDIATE' as const,
        },
        {
          id: 'vr2',
          title: 'Historical Monuments VR Tour',
          description: 'Virtual tour of Taj Mahal, Qutub Minar, and other Indian heritage sites',
          type: 'VR' as ExperienceType,
          subject: 'History',
          grade: 'Class 7',
          duration: '35 min',
          deviceSupport: ['VR_HEADSET', 'MOBILE'] as DeviceSupport[],
          rating: 4.6,
          views: 1890,
          isWebXR: true,
          thumbnail: '/thumbnails/history-vr.jpg',
          tags: ['Heritage', 'India', 'Culture'],
          difficulty: 'BEGINNER' as const,
        },
        {
          id: 'ar2',
          title: 'Geometry Shapes AR Builder',
          description: 'Build and manipulate 3D geometric shapes in your physical space',
          type: 'AR' as ExperienceType,
          subject: 'Mathematics',
          grade: 'Class 9',
          duration: '25 min',
          deviceSupport: ['MOBILE', 'TABLET'] as DeviceSupport[],
          rating: 4.5,
          views: 2340,
          isWebXR: true,
          thumbnail: '/thumbnails/geometry-ar.jpg',
          tags: ['Geometry', 'Shapes', 'Spatial'],
          difficulty: 'BEGINNER' as const,
        },
      ] as ArVrExperience[];
    },
  });

  const filtered = experiences?.filter((exp) => {
    const matchesSearch = !searchQuery || exp.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'ALL' || exp.type === filterType;
    const matchesSubject = filterSubject === 'ALL' || exp.subject === filterSubject;
    const matchesDevice = filterDevice === 'ALL' || exp.deviceSupport.includes(filterDevice);
    return matchesSearch && matchesType && matchesSubject && matchesDevice;
  });

  const getTypeIcon = (type: ExperienceType) => {
    switch (type) {
      case 'AR': return '📱';
      case 'VR': return '🥽';
      case '3D_MODEL': return '🎲';
      case 'SIMULATION': return '⚙️';
      case 'VIRTUAL_LAB': return '🧪';
    }
  };

  const getTypeBadge = (type: ExperienceType) => {
    const variants: Record<ExperienceType, 'info' | 'success' | 'warning' | 'secondary'> = {
      AR: 'info',
      VR: 'success',
      '3D_MODEL': 'warning',
      SIMULATION: 'secondary',
      VIRTUAL_LAB: 'info',
    };
    return variants[type];
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-6" />
        <div className="grid md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">AR/VR Learning Experiences</h1>
        <p className="mt-2 text-sm text-gray-600">
          Immersive augmented and virtual reality educational content
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-2xl font-bold">{experiences?.length ?? 0}</p>
            <p className="text-sm text-gray-500">Total Experiences</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-2xl font-bold text-blue-600">
              {experiences?.filter((e) => e.type === 'AR').length ?? 0}
            </p>
            <p className="text-sm text-gray-500">AR Experiences</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-2xl font-bold text-green-600">
              {experiences?.filter((e) => e.type === 'VR').length ?? 0}
            </p>
            <p className="text-sm text-gray-500">VR Experiences</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-2xl font-bold text-purple-600">
              {experiences?.filter((e) => e.isWebXR).length ?? 0}
            </p>
            <p className="text-sm text-gray-500">WebXR Compatible</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Search experiences..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Select value={filterType} onChange={(e) => setFilterType(e.target.value as ExperienceType | 'ALL')}>
              <option value="ALL">All Types</option>
              <option value="AR">Augmented Reality</option>
              <option value="VR">Virtual Reality</option>
              <option value="3D_MODEL">3D Models</option>
              <option value="SIMULATION">Simulations</option>
              <option value="VIRTUAL_LAB">Virtual Labs</option>
            </Select>
            <Select value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)}>
              <option value="ALL">All Subjects</option>
              <option value="Science">Science</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Physics">Physics</option>
              <option value="Biology">Biology</option>
              <option value="Mathematics">Mathematics</option>
              <option value="History">History</option>
            </Select>
            <Select value={filterDevice} onChange={(e) => setFilterDevice(e.target.value as DeviceSupport | 'ALL')}>
              <option value="ALL">All Devices</option>
              <option value="MOBILE">Mobile</option>
              <option value="TABLET">Tablet</option>
              <option value="DESKTOP">Desktop</option>
              <option value="VR_HEADSET">VR Headset</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Experience Grid */}
      <Can permission={PERMISSIONS.CONTENT_VIEW}>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered?.map((exp) => (
            <Card key={exp.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push(`/ar-vr/${exp.id}`)}>
              <div className="h-40 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-t-lg flex items-center justify-center text-6xl">
                {getTypeIcon(exp.type)}
              </div>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={getTypeBadge(exp.type)}>{exp.type.replace('_', ' ')}</Badge>
                  {exp.isWebXR && <Badge variant="info">WebXR</Badge>}
                </div>
                <CardTitle className="text-lg">{exp.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{exp.description}</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {exp.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary">{tag}</Badge>
                  ))}
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>{exp.subject} · {exp.grade}</span>
                  <span>⭐ {exp.rating}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>{exp.duration}</span>
                  <span>{exp.views.toLocaleString()} views</span>
                </div>
                <Button className="w-full mt-4" onClick={(e) => { e.stopPropagation(); router.push(`/ar-vr/${exp.id}`); }}>
                  Launch Experience
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        {filtered?.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              No AR/VR experiences match your filters.
            </CardContent>
          </Card>
        )}
      </Can>
    </div>
  );
}
