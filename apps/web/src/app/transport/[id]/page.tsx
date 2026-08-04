'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { transportService } from '@/services/transport.service';
import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Loader2, Bus, MapPin, Users, Clock, Edit } from 'lucide-react';

export default function TransportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const busId = params.id as string;

  // Fetch bus details
  const { data: bus, isLoading: busLoading } = useQuery({
    queryKey: ['bus', busId],
    queryFn: () => transportService.getBus(busId),
    enabled: !!busId,
  });

  // Fetch routes for this bus
  const { data: routes, isLoading: routesLoading } = useQuery({
    queryKey: ['bus-routes', busId],
    queryFn: () => transportService.listRoutes(user?.schoolId),
    enabled: !!user?.schoolId,
  });

  // Fetch students assigned to this bus
  const { data: assignments, isLoading: assignmentsLoading } = useQuery({
    queryKey: ['bus-assignments', busId],
    queryFn: async () => {
      // This would be a dedicated endpoint in real implementation
      const response = await fetch(`/api/transport/buses/${busId}/assignments`);
      return response.json();
    },
    enabled: !!busId,
  });

  const isLoading = busLoading || routesLoading || assignmentsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!bus) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">Bus not found</p>
            <Button onClick={() => router.push('/transport')} className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Transport
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Filter routes for this bus
  const busRoutes = routes?.filter((route: any) => route.busId === busId) || [];

  return (
    <div className="container py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/transport')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Bus className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{bus.busNumber}</h1>
              <p className="text-muted-foreground">Bus Details</p>
            </div>
          </div>
        </div>
        <Button onClick={() => router.push(`/transport/${busId}/edit`)}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Bus
        </Button>
      </div>

      {/* Status Badge */}
      <div className="mb-6">
        <Badge variant={bus.status === 'active' ? 'default' : 'secondary'}>
          {bus.status?.toUpperCase() || 'ACTIVE'}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Bus Number</p>
              <p className="font-semibold">{bus.busNumber}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Registration Number</p>
              <p className="font-semibold">{bus.registrationNumber || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Capacity</p>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <p className="font-semibold">{bus.capacity} seats</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Current Occupancy</p>
              <div className="flex items-center gap-2">
                <p className="font-semibold">
                  {assignments?.length || 0} / {bus.capacity}
                </p>
                <div className="flex-1">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{
                        width: `${((assignments?.length || 0) / bus.capacity) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Driver Info */}
        <Card>
          <CardHeader>
            <CardTitle>Driver Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {bus.driver ? (
              <>
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-semibold">{bus.driver.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Contact Number</p>
                  <p className="font-semibold">{bus.driver.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">License Number</p>
                  <p className="font-semibold">{bus.driver.licenseNumber || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Experience</p>
                  <p className="font-semibold">{bus.driver.experience || 'N/A'} years</p>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                No driver assigned
              </p>
            )}
          </CardContent>
        </Card>

        {/* Routes */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Routes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {busRoutes.length > 0 ? (
              <div className="space-y-4">
                {busRoutes.map((route: any) => (
                  <div
                    key={route.id}
                    className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold">{route.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {route.stops?.length || 0} stops
                        </p>
                      </div>
                      <Badge variant="outline">{route.direction || 'ONE-WAY'}</Badge>
                    </div>
                    
                    {/* Stops */}
                    {route.stops && route.stops.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {route.stops.map((stop: any, index: number) => (
                          <div
                            key={index}
                            className="flex items-center gap-3 text-sm"
                          >
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-primary" />
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span className="font-mono">{stop.time}</span>
                            </div>
                            <span>{stop.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No routes assigned to this bus
              </p>
            )}
          </CardContent>
        </Card>

        {/* Assigned Students */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Assigned Students ({assignments?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {assignments && assignments.length > 0 ? (
              <div className="space-y-3">
                {assignments.map((assignment: any) => (
                  <div
                    key={assignment.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="font-semibold text-sm">
                          {assignment.student?.name?.charAt(0) || 'S'}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold">{assignment.student?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {assignment.student?.class} - {assignment.student?.section}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{assignment.stop?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Pickup: {assignment.stop?.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No students assigned to this bus
              </p>
            )}
          </CardContent>
        </Card>

        {/* Maintenance Info (if available) */}
        {bus.lastMaintenance && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Maintenance History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Last Maintenance</p>
                  <p className="font-semibold">
                    {new Date(bus.lastMaintenance).toLocaleDateString()}
                  </p>
                </div>
                {bus.nextMaintenance && (
                  <div>
                    <p className="text-sm text-muted-foreground">Next Maintenance</p>
                    <p className="font-semibold">
                      {new Date(bus.nextMaintenance).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
              {bus.maintenanceNotes && (
                <div>
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <p className="text-sm mt-1">{bus.maintenanceNotes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
