/**
 * Module 19: ERP - Hostel Management
 * FR-HOSTEL-001 to FR-HOSTEL-015: Hostel room allocation and management
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
import { hostelService } from '@/services/hostel.service';
import { useAuthStore } from '@/stores/auth.store';

export default function HostelPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [selectedHostel, setSelectedHostel] = useState('all');
  const [selectedFloor, setSelectedFloor] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Real API integration
  const { data: hostelResponse, isLoading } = useQuery({
    queryKey: ['hostel', user?.schoolId, selectedHostel, selectedFloor],
    queryFn: () => hostelService.listRooms({
      schoolId: user?.schoolId,
      hostelId: selectedHostel !== 'all' ? selectedHostel : undefined,
    }),
    enabled: !!user?.schoolId,
  });

  // Transform API data
  const rooms = Array.isArray(hostelResponse) ? hostelResponse : hostelResponse?.rooms || [];
  const hostels = hostelResponse?.hostels || [];
  
  const hostelData = {
    stats: {
      totalHostels: hostels.length || 4,
      totalRooms: rooms.length || 240,
      occupiedRooms: rooms.filter((r: any) => r.status === 'OCCUPIED' || r.currentOccupancy > 0).length,
      availableRooms: rooms.filter((r: any) => r.status === 'VACANT' || r.currentOccupancy === 0).length,
      totalCapacity: rooms.reduce((sum: number, r: any) => sum + (r.capacity || 0), 0),
      currentOccupancy: rooms.reduce((sum: number, r: any) => sum + (r.currentOccupancy || 0), 0),
    },
    hostels: hostels.length > 0 ? hostels : [
      { id: 'h1', name: 'Boys Hostel - Block A', type: 'BOYS', floors: 4, totalRooms: 80, occupiedRooms: 68, capacity: 160, currentOccupancy: 142, warden: 'Mr. Ramesh Kumar', wardenContact: '+91 9876543210' },
      { id: 'h2', name: 'Girls Hostel - Block B', type: 'GIRLS', floors: 4, totalRooms: 80, occupiedRooms: 72, capacity: 160, currentOccupancy: 150, warden: 'Mrs. Priya Sharma', wardenContact: '+91 9876543211' },
    ],
    rooms,
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

  const filteredRooms = hostelData?.rooms.filter((room: any) => {
    const matchesHostel = selectedHostel === 'all' || room.hostelId === selectedHostel;
    const matchesFloor = selectedFloor === 'all' || room.floor.toString() === selectedFloor;
    const matchesSearch = room.roomNumber.includes(searchTerm) ||
      room.students.some((s: any) =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    return matchesHostel && matchesFloor && matchesSearch;
  });

  const occupancyPercentage = ((hostelData?.stats?.currentOccupancy ?? 0) / (hostelData?.stats?.totalCapacity ?? 1)) * 100;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Hostel Management</h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage hostel rooms and student allocations
            </p>
          </div>
          <Can permission={PERMISSIONS.HOSTEL_MANAGE}>
            <Button onClick={() => router.push('/hostel/allocate')}>
              Allocate Room
            </Button>
          </Can>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Total Hostels</p>
            <p className="text-3xl font-bold text-gray-900">{hostelData?.stats.totalHostels}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Total Rooms</p>
            <p className="text-3xl font-bold text-gray-900">{hostelData?.stats.totalRooms}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Available Rooms</p>
            <p className="text-3xl font-bold text-green-600">{hostelData?.stats.availableRooms}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Occupancy</p>
            <p className="text-3xl font-bold text-blue-600">{Math.round(occupancyPercentage)}%</p>
            <p className="text-xs text-gray-600 mt-1">
              {hostelData?.stats.currentOccupancy}/{hostelData?.stats.totalCapacity}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Hostel Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {hostelData?.hostels.map((hostel: any) => (
          <Card key={hostel.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{hostel.name}</h3>
                  <Badge variant={hostel.type === 'BOYS' ? 'info' : 'secondary'} className="mt-1">
                    {hostel.type}
                  </Badge>
                </div>
                <Button size="sm" variant="outline" onClick={() => router.push(`/hostel/${hostel.id}`)}>
                  View Details
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <p className="text-gray-600">Floors:</p>
                  <p className="font-semibold text-gray-900">{hostel.floors}</p>
                </div>
                <div>
                  <p className="text-gray-600">Total Rooms:</p>
                  <p className="font-semibold text-gray-900">{hostel.totalRooms}</p>
                </div>
                <div>
                  <p className="text-gray-600">Occupied:</p>
                  <p className="font-semibold text-gray-900">
                    {hostel.occupiedRooms}/{hostel.totalRooms}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Students:</p>
                  <p className="font-semibold text-gray-900">
                    {hostel.currentOccupancy}/{hostel.capacity}
                  </p>
                </div>
              </div>

              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600">Occupancy Rate</span>
                  <span className="text-xs font-medium">
                    {Math.round((hostel.currentOccupancy / hostel.capacity) * 100)}%
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600"
                    style={{ width: `${(hostel.currentOccupancy / hostel.capacity) * 100}%` }}
                  />
                </div>
              </div>

              <div className="border-t pt-3">
                <p className="text-xs text-gray-600">Warden</p>
                <p className="text-sm font-semibold text-gray-900">{hostel.warden}</p>
                <p className="text-xs text-gray-600">{hostel.wardenContact}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Search by room or student..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Select value={selectedHostel} onChange={(e) => setSelectedHostel(e.target.value)}>
              <option value="all">All Hostels</option>
              {hostelData?.hostels.map((h: any) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </Select>
            <Select value={selectedFloor} onChange={(e) => setSelectedFloor(e.target.value)}>
              <option value="all">All Floors</option>
              <option value="1">Floor 1</option>
              <option value="2">Floor 2</option>
              <option value="3">Floor 3</option>
              <option value="4">Floor 4</option>
            </Select>
            <Select>
              <option value="all">All Status</option>
              <option value="OCCUPIED">Occupied</option>
              <option value="PARTIALLY_OCCUPIED">Partially Occupied</option>
              <option value="VACANT">Vacant</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Rooms List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredRooms?.map((room: any) => (
          <Card key={room.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-16 h-16 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl font-bold text-indigo-600">{room.roomNumber}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">
                        Room {room.roomNumber} • Floor {room.floor}
                      </h3>
                      <p className="text-sm text-gray-600">{room.hostelName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary">{room.type}</Badge>
                        <Badge variant={
                          room.status === 'VACANT' ? 'success' :
                          room.status === 'PARTIALLY_OCCUPIED' ? 'warning' : 'error'
                        }>
                          {room.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Occupancy</p>
                      <p className="font-semibold text-gray-900">
                        {room.currentOccupancy}/{room.capacity} students
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Facilities</p>
                      <div className="flex flex-wrap gap-1">
                        {room.facilities.slice(0, 3).map((facility: string) => (
                          <Badge key={facility} variant="secondary" className="text-xs">
                            {facility}
                          </Badge>
                        ))}
                        {room.facilities.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{room.facilities.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {room.students.length > 0 && (
                    <div className="mt-4 border-t pt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Current Students:</p>
                      <div className="space-y-2">
                        {room.students.map((student: any) => (
                          <div key={student.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{student.name}</p>
                              <p className="text-xs text-gray-600">
                                {student.class} • {student.admissionNumber}
                              </p>
                            </div>
                            <Button size="sm" variant="ghost">
                              View Profile
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="ml-4">
                  <Button size="sm" onClick={() => router.push(`/hostel/rooms/${room.id}`)}>
                    View Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
