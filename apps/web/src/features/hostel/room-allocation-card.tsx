'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import {
  Home,
  Users,
  Bed,
  CheckCircle,
  AlertCircle,
  User,
  Plus,
  X,
} from 'lucide-react';

interface RoomAllocationCardProps {
  room: {
    id: string;
    roomNumber: string;
    building: string;
    floor: number;
    type: 'SINGLE' | 'DOUBLE' | 'TRIPLE' | 'DORMITORY';
    capacity: number;
    occupiedBeds: number;
    amenities?: string[];
    status: 'AVAILABLE' | 'FULL' | 'MAINTENANCE';
    residents?: Array<{
      id: string;
      name: string;
      studentId: string;
      avatar?: string;
      checkinDate: string;
    }>;
  };
  onAllocate?: (roomId: string) => void;
  onDeallocate?: (roomId: string, residentId: string) => void;
  onView?: (roomId: string) => void;
}

export function RoomAllocationCard({
  room,
  onAllocate,
  onDeallocate,
  onView,
}: RoomAllocationCardProps) {
  const availableBeds = room.capacity - room.occupiedBeds;
  const occupancyPercentage = (room.occupiedBeds / room.capacity) * 100;

  const getStatusBadge = () => {
    switch (room.status) {
      case 'AVAILABLE':
        return (
          <Badge variant="success" className="flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Available
          </Badge>
        );
      case 'FULL':
        return (
          <Badge variant="warning" className="flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Full
          </Badge>
        );
      case 'MAINTENANCE':
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Maintenance
          </Badge>
        );
    }
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      SINGLE: 'bg-purple-100 text-purple-700',
      DOUBLE: 'bg-blue-100 text-blue-700',
      TRIPLE: 'bg-green-100 text-green-700',
      DORMITORY: 'bg-amber-100 text-amber-700',
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Home className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Room {room.roomNumber}</h3>
              <p className="text-sm text-gray-600">
                {room.building} • Floor {room.floor}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            {getStatusBadge()}
            <Badge className={getTypeColor(room.type)}>
              {room.type}
            </Badge>
          </div>
        </div>

        {/* Capacity Info */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-sm">
              <Bed className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">Occupancy:</span>
              <span className="font-semibold">
                {room.occupiedBeds} / {room.capacity} beds
              </span>
            </div>
            <span className={`text-sm font-medium ${
              availableBeds === 0 ? 'text-red-600' :
              availableBeds <= 1 ? 'text-amber-600' :
              'text-green-600'
            }`}>
              {availableBeds} available
            </span>
          </div>

          {/* Occupancy Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                occupancyPercentage === 100
                  ? 'bg-red-500'
                  : occupancyPercentage >= 80
                  ? 'bg-amber-500'
                  : 'bg-green-500'
              }`}
              style={{ width: `${occupancyPercentage}%` }}
            />
          </div>
        </div>

        {/* Amenities */}
        {room.amenities && room.amenities.length > 0 && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">Amenities:</p>
            <div className="flex flex-wrap gap-1">
              {room.amenities.map((amenity) => (
                <Badge key={amenity} variant="outline" className="text-xs">
                  {amenity}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Residents */}
        {room.residents && room.residents.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">
                Current Residents ({room.residents.length})
              </span>
            </div>
            <div className="space-y-2">
              {room.residents.map((resident) => (
                <div
                  key={resident.id}
                  className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg"
                >
                  <Avatar className="w-8 h-8">
                    {resident.avatar ? (
                      <img src={resident.avatar} alt={resident.name} />
                    ) : (
                      <div className="w-full h-full bg-blue-100 flex items-center justify-center">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                    )}
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{resident.name}</p>
                    <p className="text-xs text-gray-500">ID: {resident.studentId}</p>
                  </div>
                  {onDeallocate && room.status !== 'MAINTENANCE' && (
                    <button
                      onClick={() => onDeallocate(room.id, resident.id)}
                      className="text-red-600 hover:bg-red-50 p-1 rounded transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {(!room.residents || room.residents.length === 0) && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg text-center">
            <Bed className="w-8 h-8 mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">No residents allocated</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onView?.(room.id)}
          >
            View Details
          </Button>
          {room.status !== 'MAINTENANCE' && availableBeds > 0 && onAllocate && (
            <Button
              variant="default"
              onClick={() => onAllocate(room.id)}
            >
              <Plus className="w-4 h-4 mr-1" />
              Allocate
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
