/**
 * Module 09: Academic - Resource & Room Booking
 * FR-RES-001: Manage and book school resources and rooms
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

type ResourceType = 'CLASSROOM' | 'LAB' | 'AUDITORIUM' | 'SPORTS' | 'LIBRARY' | 'CONFERENCE';
type BookingStatus = 'AVAILABLE' | 'BOOKED' | 'MAINTENANCE';

interface Resource {
  id: string;
  name: string;
  type: ResourceType;
  capacity: number;
  floor: string;
  amenities: string[];
  status: BookingStatus;
  currentBooking?: {
    by: string;
    from: string;
    to: string;
    purpose: string;
  };
}

export default function ResourcesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<ResourceType | 'ALL'>('ALL');
  const [filterStatus, setFilterStatus] = useState<BookingStatus | 'ALL'>('ALL');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Mock data
  const { data: resourcesData, isLoading } = useQuery({
    queryKey: ['resources', selectedDate],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 800));
      return [
        {
          id: 'r1',
          name: 'Room 201',
          type: 'CLASSROOM' as ResourceType,
          capacity: 40,
          floor: '2nd Floor',
          amenities: ['Projector', 'Whiteboard', 'AC'],
          status: 'AVAILABLE' as BookingStatus,
        },
        {
          id: 'r2',
          name: 'Physics Lab',
          type: 'LAB' as ResourceType,
          capacity: 30,
          floor: '1st Floor',
          amenities: ['Lab Equipment', 'Safety Gear', 'Fume Hood'],
          status: 'BOOKED' as BookingStatus,
          currentBooking: {
            by: 'Prof. Priya Singh',
            from: '10:00 AM',
            to: '12:00 PM',
            purpose: 'Class 11 Physics Practical',
          },
        },
        {
          id: 'r3',
          name: 'Main Auditorium',
          type: 'AUDITORIUM' as ResourceType,
          capacity: 500,
          floor: 'Ground Floor',
          amenities: ['Stage', 'Sound System', 'Projector', 'AC', 'Green Room'],
          status: 'AVAILABLE' as BookingStatus,
        },
        {
          id: 'r4',
          name: 'Chemistry Lab',
          type: 'LAB' as ResourceType,
          capacity: 30,
          floor: '1st Floor',
          amenities: ['Lab Equipment', 'Safety Gear', 'Chemical Storage'],
          status: 'MAINTENANCE' as BookingStatus,
        },
        {
          id: 'r5',
          name: 'Sports Ground',
          type: 'SPORTS' as ResourceType,
          capacity: 100,
          floor: 'Ground Floor',
          amenities: ['Football Goal', 'Cricket Pitch', 'Running Track'],
          status: 'BOOKED' as BookingStatus,
          currentBooking: {
            by: 'Mr. Suresh Verma (Sports Teacher)',
            from: '02:00 PM',
            to: '04:00 PM',
            purpose: 'Inter-class Football Match',
          },
        },
        {
          id: 'r6',
          name: 'Computer Lab 1',
          type: 'LAB' as ResourceType,
          capacity: 40,
          floor: '3rd Floor',
          amenities: ['40 Computers', 'Projector', 'AC', 'Server Room'],
          status: 'AVAILABLE' as BookingStatus,
        },
        {
          id: 'r7',
          name: 'Conference Room A',
          type: 'CONFERENCE' as ResourceType,
          capacity: 20,
          floor: '2nd Floor',
          amenities: ['Video Conferencing', 'Whiteboard', 'AC', 'WiFi'],
          status: 'AVAILABLE' as BookingStatus,
        },
        {
          id: 'r8',
          name: 'Library Reading Hall',
          type: 'LIBRARY' as ResourceType,
          capacity: 80,
          floor: '2nd Floor',
          amenities: ['Reading Tables', 'WiFi', 'AC', 'Silent Zone'],
          status: 'AVAILABLE' as BookingStatus,
        },
        {
          id: 'r9',
          name: 'Room 305',
          type: 'CLASSROOM' as ResourceType,
          capacity: 35,
          floor: '3rd Floor',
          amenities: ['Projector', 'Whiteboard'],
          status: 'BOOKED' as BookingStatus,
          currentBooking: {
            by: 'Dr. Rajesh Kumar',
            from: '09:00 AM',
            to: '11:00 AM',
            purpose: 'Class 12 Mathematics',
          },
        },
        {
          id: 'r10',
          name: 'Mini Auditorium',
          type: 'AUDITORIUM' as ResourceType,
          capacity: 150,
          floor: '1st Floor',
          amenities: ['Stage', 'Sound System', 'Projector', 'AC'],
          status: 'AVAILABLE' as BookingStatus,
        },
      ] as Resource[];
    },
  });

  const bookMutation = useMutation({
    mutationFn: async (resourceId: string) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return resourceId;
    },
    onSuccess: () => {
      toast.success('Resource booked successfully');
    },
    onError: () => {
      toast.error('Failed to book resource');
    },
  });

  const filteredResources = resourcesData?.filter((resource) => {
    const matchesSearch = 
      resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.amenities.some(a => a.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = filterType === 'ALL' || resource.type === filterType;
    const matchesStatus = filterStatus === 'ALL' || resource.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const stats = {
    total: resourcesData?.length || 0,
    available: resourcesData?.filter((r) => r.status === 'AVAILABLE').length || 0,
    booked: resourcesData?.filter((r) => r.status === 'BOOKED').length || 0,
    maintenance: resourcesData?.filter((r) => r.status === 'MAINTENANCE').length || 0,
  };

  const getResourceTypeIcon = (type: ResourceType) => {
    const icons = {
      CLASSROOM: '🏫',
      LAB: '🔬',
      AUDITORIUM: '🎭',
      SPORTS: '⚽',
      LIBRARY: '📚',
      CONFERENCE: '💼',
    };
    return icons[type];
  };

  const getResourceTypeColor = (type: ResourceType) => {
    const colors = {
      CLASSROOM: 'bg-blue-100 text-blue-800',
      LAB: 'bg-purple-100 text-purple-800',
      AUDITORIUM: 'bg-pink-100 text-pink-800',
      SPORTS: 'bg-green-100 text-green-800',
      LIBRARY: 'bg-yellow-100 text-yellow-800',
      CONFERENCE: 'bg-indigo-100 text-indigo-800',
    };
    return colors[type];
  };


  return (
    <Can
      permission={PERMISSIONS.ACADEMIC_VIEW}
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-gray-600">You don't have permission to view resources</p>
          </div>
        </div>
      }
    >
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Resources & Room Booking</h1>
              <p className="mt-2 text-sm text-gray-600">
                View availability and book school resources and rooms
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-48"
              />
              <Can permission={PERMISSIONS.ACADEMIC_CREATE}>
                <Button onClick={() => router.push('/resources/book')}>
                  + New Booking
                </Button>
              </Can>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Total Resources</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setFilterStatus('AVAILABLE')}>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Available</p>
                <p className="text-3xl font-bold text-green-600">{stats.available}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setFilterStatus('BOOKED')}>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Booked</p>
                <p className="text-3xl font-bold text-orange-600">{stats.booked}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setFilterStatus('MAINTENANCE')}>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Maintenance</p>
                <p className="text-3xl font-bold text-red-600">{stats.maintenance}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                placeholder="Search by name or amenities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              <Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
              >
                <option value="ALL">All Types</option>
                <option value="CLASSROOM">Classrooms</option>
                <option value="LAB">Labs</option>
                <option value="AUDITORIUM">Auditoriums</option>
                <option value="SPORTS">Sports Facilities</option>
                <option value="LIBRARY">Library</option>
                <option value="CONFERENCE">Conference Rooms</option>
              </Select>

              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
              >
                <option value="ALL">All Status</option>
                <option value="AVAILABLE">Available</option>
                <option value="BOOKED">Booked</option>
                <option value="MAINTENANCE">Under Maintenance</option>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Resources Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading resources...</p>
          </div>
        ) : filteredResources && filteredResources.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((resource) => (
              <Card
                key={resource.id}
                className={`hover:shadow-lg transition-shadow ${
                  resource.status === 'MAINTENANCE' ? 'opacity-75' : ''
                }`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-3xl">{getResourceTypeIcon(resource.type)}</span>
                      <div>
                        <CardTitle className="text-lg">{resource.name}</CardTitle>
                        <p className="text-xs text-gray-500">{resource.floor}</p>
                      </div>
                    </div>
                    <Badge
                      variant={
                        resource.status === 'AVAILABLE'
                          ? 'success'
                          : resource.status === 'BOOKED'
                          ? 'warning'
                          : 'error'
                      }
                    >
                      {resource.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Type:</span>
                      <Badge className={getResourceTypeColor(resource.type)}>
                        {resource.type}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Capacity:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {resource.capacity} persons
                      </span>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 mb-2">Amenities:</p>
                      <div className="flex flex-wrap gap-1">
                        {resource.amenities.map((amenity, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {amenity}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {resource.currentBooking && (
                      <div className="border-t pt-3 mt-3">
                        <p className="text-xs font-medium text-gray-700 mb-1">
                          Current Booking:
                        </p>
                        <p className="text-xs text-gray-600">
                          👤 {resource.currentBooking.by}
                        </p>
                        <p className="text-xs text-gray-600">
                          🕐 {resource.currentBooking.from} - {resource.currentBooking.to}
                        </p>
                        <p className="text-xs text-gray-600">
                          📋 {resource.currentBooking.purpose}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center gap-2 mt-4">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => router.push(`/resources/${resource.id}`)}
                      >
                        View Details
                      </Button>

                      {resource.status === 'AVAILABLE' && (
                        <Can permission={PERMISSIONS.ACADEMIC_CREATE}>
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={() => bookMutation.mutate(resource.id)}
                            disabled={bookMutation.isPending}
                          >
                            {bookMutation.isPending ? 'Booking...' : 'Book Now'}
                          </Button>
                        </Can>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600">No resources found matching your criteria</p>
          </div>
        )}

        {/* Today's Schedule */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Today's Booking Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {resourcesData
                ?.filter((r) => r.status === 'BOOKED')
                .map((resource) => (
                  <div key={resource.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getResourceTypeIcon(resource.type)}</span>
                      <div>
                        <p className="font-medium text-gray-900">{resource.name}</p>
                        <p className="text-xs text-gray-600">
                          {resource.currentBooking?.from} - {resource.currentBooking?.to} • {resource.currentBooking?.by}
                        </p>
                      </div>
                    </div>
                    <Badge variant="warning">In Use</Badge>
                  </div>
                ))}
              {resourcesData?.filter((r) => r.status === 'BOOKED').length === 0 && (
                <p className="text-center text-gray-600 py-4">No bookings for today</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Can>
  );
}
