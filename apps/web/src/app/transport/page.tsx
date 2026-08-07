/**
 * Module 20: ERP - Transport Management
 * FR-TRANSPORT-001 to FR-TRANSPORT-015: School bus and route management
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
import { transportService } from '@/services/transport.service';
import { useAuthStore } from '@/stores/auth.store';

export default function TransportPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [selectedRoute, setSelectedRoute] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'buses' | 'routes' | 'students'>('buses');

  // Real API integration
  const { data: busesResponse, isLoading } = useQuery({
    queryKey: ['transport-buses', user?.schoolId],
    queryFn: () => transportService.listBuses(user?.schoolId),
    enabled: !!user?.schoolId,
  });

  const { data: routesResponse } = useQuery({
    queryKey: ['transport-routes', user?.schoolId],
    queryFn: () => transportService.listRoutes(user?.schoolId),
    enabled: !!user?.schoolId,
  });

  // Transform API data
  const buses = Array.isArray(busesResponse) ? busesResponse : busesResponse?.buses || [];
  const routes = Array.isArray(routesResponse) ? routesResponse : routesResponse?.routes || [];
  
  const transportData = {
    stats: {
      totalBuses: buses.length,
      activeBuses: buses.filter((b: any) => b.status === 'ACTIVE').length,
      totalRoutes: routes.length,
      totalStudents: buses.reduce((sum: number, b: any) => sum + (b.currentOccupancy || 0), 0),
      averageCapacity: buses.length > 0 
        ? Math.round((buses.reduce((sum: number, b: any) => sum + (b.currentOccupancy || 0), 0) / 
            buses.reduce((sum: number, b: any) => sum + (b.capacity || 0), 0)) * 100)
        : 0,
    },
    buses,
    routes,
    students: [], // Will be loaded separately when needed
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

  const filteredBuses = transportData?.buses.filter((bus: any) => {
    const matchesRoute = selectedRoute === 'all' || bus.routeId === selectedRoute;
    const matchesSearch = bus.busNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bus.driver.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRoute && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Transport Management</h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage school buses, routes, and student assignments
            </p>
          </div>
          <Can permission={PERMISSIONS.TRANSPORT_MANAGE}>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => router.push('/transport/track')}>
                🗺️ Live Tracking
              </Button>
              <Button onClick={() => router.push('/transport/add')}>
                + Add Bus
              </Button>
            </div>
          </Can>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Total Buses</p>
            <p className="text-3xl font-bold text-gray-900">{transportData?.stats.totalBuses}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Active Buses</p>
            <p className="text-3xl font-bold text-green-600">{transportData?.stats.activeBuses}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Total Routes</p>
            <p className="text-3xl font-bold text-blue-600">{transportData?.stats.totalRoutes}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Students</p>
            <p className="text-3xl font-bold text-purple-600">{transportData?.stats.totalStudents}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Avg Capacity</p>
            <p className="text-3xl font-bold text-orange-600">{transportData?.stats.averageCapacity}%</p>
          </CardContent>
        </Card>
      </div>

      {/* View Mode Toggle */}
      <div className="mb-6">
        <div className="inline-flex rounded-lg border p-1 bg-white">
          <button
            onClick={() => setViewMode('buses')}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              viewMode === 'buses'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🚌 Buses
          </button>
          <button
            onClick={() => setViewMode('routes')}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              viewMode === 'routes'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🗺️ Routes
          </button>
          <button
            onClick={() => setViewMode('students')}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              viewMode === 'students'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            👥 Students
          </button>
        </div>
      </div>

      {/* Buses View */}
      {viewMode === 'buses' && (
        <>
          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  placeholder="Search by bus number or driver..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Select value={selectedRoute} onChange={(e) => setSelectedRoute(e.target.value)}>
                  <option value="all">All Routes</option>
                  {transportData?.routes.map((route: any) => (
                    <option key={route.id} value={route.id}>
                      {route.name}
                    </option>
                  ))}
                </Select>
                <Select>
                  <option value="all">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="MAINTENANCE">Maintenance</option>
                  <option value="INACTIVE">Inactive</option>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Buses List */}
          <div className="grid grid-cols-1 gap-4">
            {filteredBuses?.map((bus: any) => (
              <Card key={bus.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                          <span className="text-3xl">🚌</span>
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-gray-900">{bus.busNumber}</h3>
                          <p className="text-sm text-gray-600">{bus.routeName}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={bus.status === 'ACTIVE' ? 'success' : 'warning'}>
                              {bus.status}
                            </Badge>
                            {bus.gpsEnabled && (
                              <Badge variant="info" className="text-xs">
                                📍 GPS Enabled
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Driver</p>
                          <p className="font-semibold text-gray-900">{bus.driver.name}</p>
                          <p className="text-xs text-gray-600">{bus.driver.phone}</p>
                          <p className="text-xs text-gray-500">Lic: {bus.driver.license}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Attendant</p>
                          {bus.attendant ? (
                            <>
                              <p className="font-semibold text-gray-900">{bus.attendant.name}</p>
                              <p className="text-xs text-gray-600">{bus.attendant.phone}</p>
                            </>
                          ) : (
                            <p className="text-sm text-gray-500">Not assigned</p>
                          )}
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Occupancy</p>
                          <p className="font-semibold text-gray-900">
                            {bus.currentOccupancy}/{bus.capacity} students
                          </p>
                          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mt-1">
                            <div
                              className="h-full bg-blue-600"
                              style={{ width: `${(bus.currentOccupancy / bus.capacity) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="border-t pt-3">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Last Maintenance:</p>
                            <p className="font-medium text-gray-900">
                              {new Date(bus.lastMaintenance).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Next Maintenance:</p>
                            <p className="font-medium text-gray-900">
                              {new Date(bus.nextMaintenance).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="ml-4 flex flex-col gap-2">
                      <Button size="sm" onClick={() => router.push(`/transport/buses/${bus.id}`)}>
                        View Details
                      </Button>
                      {bus.gpsEnabled && (
                        <Button size="sm" variant="outline">
                          Track Live
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Routes View */}
      {viewMode === 'routes' && (
        <div className="grid grid-cols-1 gap-6">
          {transportData?.routes.map((route: any) => (
            <Card key={route.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{route.name}</h3>
                    <p className="text-sm text-gray-600">Code: {route.code} • Area: {route.area}</p>
                  </div>
                  <Button size="sm" onClick={() => router.push(`/transport/routes/${route.id}`)}>
                    View Details
                  </Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Distance</p>
                    <p className="font-semibold text-gray-900">{route.distance} km</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Est. Time</p>
                    <p className="font-semibold text-gray-900">{route.estimatedTime} min</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Stops</p>
                    <p className="font-semibold text-gray-900">{route.totalStops}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Students</p>
                    <p className="font-semibold text-gray-900">{route.totalStudents}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Morning Timing</p>
                    <p className="font-medium text-gray-900">
                      {route.morningStartTime} - {route.morningEndTime}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Evening Timing</p>
                    <p className="font-medium text-gray-900">
                      {route.eveningStartTime} - {route.eveningEndTime}
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Key Stops:</p>
                  <div className="flex flex-wrap gap-2">
                    {route.stops.map((stop: any) => (
                      <Badge key={stop.id} variant="secondary">
                        {stop.name} ({stop.time})
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Students View */}
      {viewMode === 'students' && (
        <Card>
          <CardHeader>
            <CardTitle>Students Using Transport ({transportData?.students.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transportData?.students.map((student: any) => (
                <div key={student.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                          <span className="text-lg font-bold text-indigo-600">
                            {student.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{student.name}</h4>
                          <p className="text-sm text-gray-600">
                            {student.class} • {student.admissionNumber}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Route & Bus:</p>
                          <p className="font-medium text-gray-900">{student.routeName}</p>
                          <p className="text-xs text-gray-600">{student.busNumber}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Pickup Stop:</p>
                          <p className="font-medium text-gray-900">{student.stopName}</p>
                          <p className="text-xs text-gray-600">
                            Pickup: {student.pickupTime} • Drop: {student.dropTime}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Parent Contact:</p>
                          <p className="font-medium text-gray-900">{student.parentContact}</p>
                          <p className="text-xs text-gray-600">{student.address}</p>
                        </div>
                      </div>
                    </div>

                    <Button size="sm" variant="outline" onClick={() => router.push(`/students/${student.id}`)}>
                      View Profile
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
