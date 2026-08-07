'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Bus,
  MapPin,
  Clock,
  Users,
  Navigation,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

interface RouteCardProps {
  route: {
    id: string;
    name: string;
    routeNumber: string;
    startLocation: string;
    endLocation: string;
    stops: Array<{
      id: string;
      name: string;
      time: string;
      order: number;
    }>;
    distance?: number;
    duration?: number;
    assignedBus?: {
      id: string;
      vehicleNumber: string;
      capacity: number;
    };
    assignedStudents?: number;
    status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
  };
  onView?: (routeId: string) => void;
  onEdit?: (routeId: string) => void;
}

export function RouteCard({ route, onView, onEdit }: RouteCardProps) {
  const getStatusBadge = () => {
    switch (route.status) {
      case 'ACTIVE':
        return (
          <Badge variant="success" className="flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Active
          </Badge>
        );
      case 'INACTIVE':
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Inactive
          </Badge>
        );
      case 'MAINTENANCE':
        return (
          <Badge variant="warning" className="flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Maintenance
          </Badge>
        );
    }
  };

  const utilizationPercentage = route.assignedBus
    ? ((route.assignedStudents || 0) / route.assignedBus.capacity) * 100
    : 0;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Bus className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-lg">{route.name}</h3>
                <Badge variant="secondary">{route.routeNumber}</Badge>
              </div>
              {getStatusBadge()}
            </div>
          </div>
        </div>

        {/* Route Information */}
        <div className="space-y-3 mb-4">
          {/* Start and End Locations */}
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <div className="flex-1 text-sm">
              <span className="font-medium">{route.startLocation}</span>
              <span className="mx-2 text-gray-400">→</span>
              <span className="font-medium">{route.endLocation}</span>
            </div>
          </div>

          {/* Distance and Duration */}
          <div className="flex items-center gap-4 text-sm text-gray-600">
            {route.distance && (
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{route.distance} km</span>
              </div>
            )}
            {route.duration && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{route.duration} min</span>
              </div>
            )}
          </div>

          {/* Stops */}
          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">
              Stops ({route.stops.length})
            </div>
            <div className="flex flex-wrap gap-1">
              {route.stops.slice(0, 3).map((stop) => (
                <Badge key={stop.id} variant="outline" className="text-xs">
                  {stop.name}
                </Badge>
              ))}
              {route.stops.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{route.stops.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Assigned Bus Info */}
        {route.assignedBus && (
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium">Assigned Bus</div>
              <Badge variant="secondary" className="font-mono text-xs">
                {route.assignedBus.vehicleNumber}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="w-4 h-4" />
              <span>
                {route.assignedStudents || 0} / {route.assignedBus.capacity} students
              </span>
            </div>
            {/* Utilization Bar */}
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    utilizationPercentage >= 90
                      ? 'bg-red-500'
                      : utilizationPercentage >= 70
                      ? 'bg-amber-500'
                      : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(utilizationPercentage, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{utilizationPercentage.toFixed(0)}% utilized</span>
                {utilizationPercentage >= 90 && (
                  <span className="text-red-600 font-medium">Near capacity</span>
                )}
              </div>
            </div>
          </div>
        )}

        {!route.assignedBus && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2 text-sm text-amber-700">
              <AlertCircle className="w-4 h-4" />
              <span>No bus assigned to this route</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onView?.(route.id)}
          >
            View Details
          </Button>
          <Button
            variant="default"
            className="flex-1"
            onClick={() => onEdit?.(route.id)}
          >
            Edit Route
          </Button>
        </div>
      </div>
    </Card>
  );
}
