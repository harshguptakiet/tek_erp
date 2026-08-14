/**
 * Live Bus Tracking Component
 * Real-time GPS tracking with route visualization and ETA calculation
 * Features: Live location updates, route display, stop markers, student tracking
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SelectRoot, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  MapPin,
  Navigation,
  Clock,
  Users,
  AlertCircle,
  RefreshCw,
  Maximize2,
  Phone,
  Info,
} from 'lucide-react';
import { useBuses, useRoutes } from './use-transport';
import { cn } from '@/lib/utils';

interface BusLocation {
  busId: string;
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  timestamp: string;
  status: 'MOVING' | 'STOPPED' | 'IDLE';
}

interface Stop {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  arrivalTime: string;
  eta: number; // minutes
  status: 'PENDING' | 'ARRIVED' | 'DEPARTED';
  studentsCount: number;
}

export function LiveTrackingMap() {
  const [selectedBusId, setSelectedBusId] = useState<string | null>(null);
  const [busLocation, setBusLocation] = useState<BusLocation | null>(null);
  const [routeStops, setRouteStops] = useState<Stop[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [mapView, setMapView] = useState<'standard' | 'satellite'>('standard');
  const mapRef = useRef<HTMLDivElement>(null);

  const { data: busesData } = useBuses({ status: 'ACTIVE', gpsEnabled: true });
  const { data: routesData } = useRoutes();

  const buses = Array.isArray(busesData) ? busesData : busesData?.buses || [];
  const routes = Array.isArray(routesData) ? routesData : routesData?.routes || [];

  const selectedBus = buses.find((b: any) => b.id === selectedBusId);
  const selectedRoute = routes.find((r: any) => r.id === selectedBus?.routeId);

  // Simulate live location updates (replace with actual GPS API)
  useEffect(() => {
    if (!selectedBusId || !autoRefresh) return;

    const interval = setInterval(() => {
      // Mock location update - replace with actual GPS API call
      const mockLocation: BusLocation = {
        busId: selectedBusId,
        latitude: 12.9716 + Math.random() * 0.01,
        longitude: 77.5946 + Math.random() * 0.01,
        speed: Math.random() * 60,
        heading: Math.random() * 360,
        timestamp: new Date().toISOString(),
        status: Math.random() > 0.3 ? 'MOVING' : 'STOPPED',
      };
      setBusLocation(mockLocation);

      // Mock stops data
      const mockStops: Stop[] = [
        {
          id: '1',
          name: 'Central Bus Stop',
          latitude: 12.9716,
          longitude: 77.5946,
          arrivalTime: '07:30 AM',
          eta: 5,
          status: 'DEPARTED',
          studentsCount: 12,
        },
        {
          id: '2',
          name: 'MG Road Junction',
          latitude: 12.9756,
          longitude: 77.6066,
          arrivalTime: '07:45 AM',
          eta: 2,
          status: 'PENDING',
          studentsCount: 8,
        },
        {
          id: '3',
          name: 'Brigade Road Corner',
          latitude: 12.9726,
          longitude: 77.6006,
          arrivalTime: '08:00 AM',
          eta: 15,
          status: 'PENDING',
          studentsCount: 15,
        },
        {
          id: '4',
          name: 'School Main Gate',
          latitude: 12.9696,
          longitude: 77.5976,
          arrivalTime: '08:15 AM',
          eta: 30,
          status: 'PENDING',
          studentsCount: 0,
        },
      ];
      setRouteStops(mockStops);
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [selectedBusId, autoRefresh]);

  const handleRefresh = () => {
    if (selectedBusId) {
      // Trigger immediate refresh
      setBusLocation(null);
      setTimeout(() => {
        const mockLocation: BusLocation = {
          busId: selectedBusId,
          latitude: 12.9716,
          longitude: 77.5946,
          speed: 45,
          heading: 90,
          timestamp: new Date().toISOString(),
          status: 'MOVING',
        };
        setBusLocation(mockLocation);
      }, 500);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <SelectRoot value={selectedBusId || ''} onValueChange={setSelectedBusId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a bus to track" />
                </SelectTrigger>
                <SelectContent>
                  {buses.map((bus: any) => (
                    <SelectItem key={bus.id} value={bus.id}>
                      {bus.busNumber} - {bus.routeName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </SelectRoot>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={!selectedBusId}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>

            <Button
              variant={autoRefresh ? 'default' : 'outline'}
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
            </Button>

            <SelectRoot value={mapView} onValueChange={(v: any) => setMapView(v)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="satellite">Satellite</SelectItem>
              </SelectContent>
            </SelectRoot>
          </div>
        </CardContent>
      </Card>

      {!selectedBusId ? (
        <Card>
          <CardContent className="p-12 text-center">
            <MapPin className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">Select a bus to start tracking</p>
            <p className="text-sm text-gray-600">
              Choose a bus from the dropdown above to view its live location and route
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Map Display */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Live Location</CardTitle>
                <div className="flex items-center gap-2">
                  {busLocation && (
                    <>
                      <Badge variant={busLocation.status === 'MOVING' ? 'default' : 'secondary'}>
                        {busLocation.status}
                      </Badge>
                      <Badge variant="outline">
                        <Clock className="h-3 w-3 mr-1" />
                        Updated {new Date(busLocation.timestamp).toLocaleTimeString()}
                      </Badge>
                    </>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {/* Map Container - Replace with actual map library (Google Maps, Leaflet, etc.) */}
                <div
                  ref={mapRef}
                  className="relative w-full h-[500px] bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center"
                >
                  <div className="text-center">
                    <MapPin className="h-16 w-16 mx-auto text-blue-600 mb-4" />
                    <p className="text-lg font-medium text-gray-900 mb-2">Map Integration</p>
                    <p className="text-sm text-gray-600 mb-4">
                      Integrate Google Maps or Leaflet here
                    </p>
                    {busLocation && (
                      <div className="bg-white rounded-lg p-4 inline-block shadow-lg">
                        <p className="text-sm text-gray-600">Current Location:</p>
                        <p className="font-mono text-sm">
                          {busLocation.latitude.toFixed(6)}, {busLocation.longitude.toFixed(6)}
                        </p>
                        <p className="text-sm text-gray-600 mt-2">Speed: {busLocation.speed.toFixed(1)} km/h</p>
                        <p className="text-sm text-gray-600">Heading: {busLocation.heading.toFixed(0)}°</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Map Legend */}
                <div className="mt-4 flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                    <span className="text-gray-600">Current Location</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-600"></div>
                    <span className="text-gray-600">Completed Stops</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-600"></div>
                    <span className="text-gray-600">Pending Stops</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 border-2 border-blue-600 bg-transparent"></div>
                    <span className="text-gray-600">Planned Route</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bus Info & Stops */}
          <div className="space-y-4">
            {/* Bus Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Bus Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Bus Number</p>
                  <p className="font-semibold text-gray-900">{selectedBus?.busNumber}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Route</p>
                  <p className="font-semibold text-gray-900">{selectedRoute?.name}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Driver</p>
                  <p className="font-semibold text-gray-900">{selectedBus?.driver.name}</p>
                  <Button variant="link" size="sm" className="h-auto p-0 text-blue-600">
                    <Phone className="h-3 w-3 mr-1" />
                    {selectedBus?.driver.phone}
                  </Button>
                </div>

                {selectedBus?.attendant && (
                  <div>
                    <p className="text-sm text-gray-600">Attendant</p>
                    <p className="font-semibold text-gray-900">{selectedBus.attendant.name}</p>
                    <Button variant="link" size="sm" className="h-auto p-0 text-blue-600">
                      <Phone className="h-3 w-3 mr-1" />
                      {selectedBus.attendant.phone}
                    </Button>
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-600">Students Onboard</p>
                  <p className="font-semibold text-gray-900">
                    {selectedBus?.currentOccupancy}/{selectedBus?.capacity}
                  </p>
                  <div className="w-full h-2 bg-gray-200 rounded-full mt-2">
                    <div
                      className="h-full bg-blue-600 rounded-full"
                      style={{
                        width: `${(selectedBus?.currentOccupancy / selectedBus?.capacity) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                {busLocation && busLocation.status === 'STOPPED' && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>Bus is currently stopped</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Route Stops */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Route Stops</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {routeStops.map((stop, index) => (
                    <div key={stop.id} className="relative">
                      {/* Timeline connector */}
                      {index < routeStops.length - 1 && (
                        <div
                          className={cn(
                            'absolute left-3 top-8 w-0.5 h-12',
                            stop.status === 'DEPARTED' ? 'bg-green-600' : 'bg-gray-300'
                          )}
                        />
                      )}

                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            'w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1',
                            stop.status === 'DEPARTED'
                              ? 'bg-green-600 text-white'
                              : stop.status === 'ARRIVED'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-300 text-gray-600'
                          )}
                        >
                          {stop.status === 'DEPARTED' ? (
                            <span className="text-xs">✓</span>
                          ) : (
                            <span className="text-xs">{index + 1}</span>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900 text-sm">{stop.name}</p>
                              <p className="text-xs text-gray-600">{stop.arrivalTime}</p>
                            </div>
                            {stop.status === 'PENDING' && (
                              <Badge variant="outline" className="text-xs">
                                ETA {stop.eta}m
                              </Badge>
                            )}
                            {stop.status === 'DEPARTED' && (
                              <Badge variant="default" className="text-xs bg-green-600">
                                Completed
                              </Badge>
                            )}
                          </div>

                          {stop.studentsCount > 0 && (
                            <div className="flex items-center gap-1 mt-1 text-xs text-gray-600">
                              <Users className="h-3 w-3" />
                              <span>{stop.studentsCount} students</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardContent className="p-4 space-y-2">
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Phone className="h-4 w-4 mr-2" />
                  Call Driver
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Users className="h-4 w-4 mr-2" />
                  View Student List
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Info className="h-4 w-4 mr-2" />
                  Route Details
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Maximize2 className="h-4 w-4 mr-2" />
                  Fullscreen Map
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
