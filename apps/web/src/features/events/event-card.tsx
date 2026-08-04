'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { format } from 'date-fns';

interface EventCardProps {
  event: {
    id: string;
    title: string;
    description: string;
    startDate: string;
    endDate?: string;
    location?: string;
    category: string;
    maxParticipants?: number;
    registeredCount?: number;
    status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED';
    isRegistered?: boolean;
  };
  onRegister?: (eventId: string) => void;
  onView?: (eventId: string) => void;
  isRegistering?: boolean;
}

export function EventCard({ event, onRegister, onView, isRegistering }: EventCardProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return <Badge variant="success">Published</Badge>;
      case 'DRAFT':
        return <Badge variant="secondary">Draft</Badge>;
      case 'CANCELLED':
        return <Badge variant="destructive">Cancelled</Badge>;
      case 'COMPLETED':
        return <Badge variant="default">Completed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      ACADEMIC: 'bg-blue-100 text-blue-700',
      SPORTS: 'bg-green-100 text-green-700',
      CULTURAL: 'bg-purple-100 text-purple-700',
      WORKSHOP: 'bg-amber-100 text-amber-700',
      CONFERENCE: 'bg-pink-100 text-pink-700',
      SOCIAL: 'bg-indigo-100 text-indigo-700',
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  const isFull = event.maxParticipants && event.registeredCount
    ? event.registeredCount >= event.maxParticipants
    : false;

  const isUpcoming = new Date(event.startDate) > new Date();
  const isPast = event.endDate ? new Date(event.endDate) < new Date() : false;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {/* Status Banner */}
      {event.status === 'CANCELLED' && (
        <div className="bg-red-500 text-white px-4 py-2 text-sm font-medium flex items-center gap-2">
          <XCircle className="w-4 h-4" />
          This event has been cancelled
        </div>
      )}
      {isFull && event.status === 'PUBLISHED' && (
        <div className="bg-amber-500 text-white px-4 py-2 text-sm font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          Registration Full
        </div>
      )}
      {event.isRegistered && (
        <div className="bg-green-500 text-white px-4 py-2 text-sm font-medium flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          You are registered for this event
        </div>
      )}

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={getCategoryColor(event.category)}>
                {event.category}
              </Badge>
              {getStatusBadge(event.status)}
            </div>
            <h3 className="text-lg font-semibold mb-2 line-clamp-2">
              {event.title}
            </h3>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {event.description}
        </p>

        {/* Event Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>
              {format(new Date(event.startDate), 'MMM dd, yyyy')}
              {event.endDate && ` - ${format(new Date(event.endDate), 'MMM dd, yyyy')}`}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>{format(new Date(event.startDate), 'h:mm a')}</span>
          </div>

          {event.location && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{event.location}</span>
            </div>
          )}

          {event.maxParticipants && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="w-4 h-4" />
              <span>
                {event.registeredCount || 0} / {event.maxParticipants} participants
              </span>
            </div>
          )}
        </div>

        {/* Progress Bar (if applicable) */}
        {event.maxParticipants && event.registeredCount && (
          <div className="mb-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  isFull ? 'bg-red-500' : 'bg-blue-600'
                }`}
                style={{
                  width: `${Math.min(
                    (event.registeredCount / event.maxParticipants) * 100,
                    100
                  )}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onView?.(event.id)}
          >
            View Details
          </Button>
          {!event.isRegistered &&
            event.status === 'PUBLISHED' &&
            isUpcoming &&
            !isFull && (
              <Button
                className="flex-1"
                onClick={() => onRegister?.(event.id)}
                disabled={isRegistering}
              >
                {isRegistering ? 'Registering...' : 'Register'}
              </Button>
            )}
        </div>
      </div>
    </Card>
  );
}
