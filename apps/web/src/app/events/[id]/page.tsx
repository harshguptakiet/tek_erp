/**
 * Module 08: Events - Event Detail Page
 * FR-EVENT-002: View event details and manage registrations
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { use } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Can } from '@/components/auth/can';
import { PERMISSIONS } from '@/config/permissions';
import { eventService } from '@/services/event.service';
import { useAuthStore } from '@/stores/auth.store';
import toast from 'react-hot-toast';

type TabId = 'overview' | 'participants' | 'schedule';

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  // Real API integration
  const { data: event, isLoading } = useQuery({
    queryKey: ['event', id],
    queryFn: () => eventService.getEvent(id),
    enabled: !!id,
  });

  const { data: participantsResponse } = useQuery({
    queryKey: ['event-participants', id],
    queryFn: () => eventService.listParticipants(id),
    enabled: !!id && activeTab === 'participants',
  });

  const participants = Array.isArray(participantsResponse)
    ? participantsResponse
    : participantsResponse?.data || [];

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: () => eventService.registerForEvent(id, user?.id || ''),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', id] });
      toast.success('Successfully registered for event!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to register');
    },
  });

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

  if (!event) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-gray-600">Event not found</p>
          <Button className="mt-4" onClick={() => router.push('/events')}>
            Back to Events
          </Button>
        </div>
      </div>
    );
  }

  const tabs: { id: TabId; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'participants', label: `Participants (${event.registeredCount || 0})` },
    { id: 'schedule', label: 'Schedule' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" size="sm" onClick={() => router.push('/events')}>
          ← Back
        </Button>
        <div className="mt-4 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{event.title || 'Event'}</h1>
            <div className="flex items-center gap-3 mt-2">
              <Badge
                variant={
                  event.status === 'published'
                    ? 'success'
                    : event.status === 'draft'
                    ? 'warning'
                    : 'secondary'
                }
              >
                {event.status || 'draft'}
              </Badge>
              <Badge variant="secondary">{event.eventType || 'General'}</Badge>
              {event.isPublic && <Badge variant="info">Public</Badge>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Can permission={PERMISSIONS.EVENTS_MANAGE}>
              <Button variant="outline" onClick={() => router.push(`/events/${id}/edit`)}>
                Edit
              </Button>
            </Can>
            {!event.isRegistered && (
              <Button onClick={() => registerMutation.mutate()} disabled={registerMutation.isPending}>
                {registerMutation.isPending ? 'Registering...' : 'Register'}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Event Image/Banner */}
      <div className="mb-8 h-64 bg-gradient-to-r from-blue-400 to-purple-500 rounded-xl flex items-center justify-center">
        {event.banner ? (
          <img src={event.banner} alt={event.title} className="w-full h-full object-cover rounded-xl" />
        ) : (
          <span className="text-8xl">{event.icon || '📅'}</span>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Date</p>
            <p className="text-lg font-bold text-gray-900">
              {new Date(event.startDate).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Location</p>
            <p className="text-lg font-bold text-gray-900">{event.location || 'TBA'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Registered</p>
            <p className="text-lg font-bold text-blue-600">
              {event.registeredCount || 0} / {event.maxParticipants || '∞'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Organizer</p>
            <p className="text-lg font-bold text-gray-900">{event.organizer || '-'}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>About This Event</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {event.description || 'No description available'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Start Date & Time</p>
                  <p className="text-gray-900">
                    {new Date(event.startDate).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">End Date & Time</p>
                  <p className="text-gray-900">
                    {event.endDate ? new Date(event.endDate).toLocaleString() : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Location</p>
                  <p className="text-gray-900">{event.location || 'To be announced'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Capacity</p>
                  <p className="text-gray-900">
                    {event.maxParticipants ? `${event.maxParticipants} people` : 'Unlimited'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'participants' && (
        <Card>
          <CardHeader>
            <CardTitle>Registered Participants</CardTitle>
          </CardHeader>
          <CardContent>
            {participants.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Registered On</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {participants.map((participant: any) => (
                    <TableRow key={participant.id}>
                      <TableCell className="font-medium">{participant.name || 'Unknown'}</TableCell>
                      <TableCell>{participant.role || '-'}</TableCell>
                      <TableCell>
                        {participant.registeredAt
                          ? new Date(participant.registeredAt).toLocaleDateString()
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={participant.attended ? 'success' : 'secondary'}>
                          {participant.attended ? 'Attended' : 'Registered'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>No participants yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'schedule' && (
        <Card>
          <CardHeader>
            <CardTitle>Event Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-gray-500">
              <p>Event schedule will be displayed here</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
