/**
 * Module 17: Events - Event Calendar and Management
 * FR-EVENT-001 to FR-EVENT-010: School events and calendar
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Can } from '@/components/auth/can';
import { PERMISSIONS } from '@/config/permissions';

export default function EventsPage() {
  const router = useRouter();
  const [selectedMonth, setSelectedMonth] = useState('2024-08');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

  // Mock data - replace with actual API call
  const { data: eventsData, isLoading } = useQuery({
    queryKey: ['events', selectedMonth, selectedCategory],
    queryFn: async () => ({
      events: [
        {
          id: 'e1',
          title: 'Parent-Teacher Meeting',
          description: 'Quarterly PTM for all classes',
          date: '2024-08-15',
          startTime: '10:00',
          endTime: '14:00',
          category: 'MEETING',
          location: 'School Auditorium',
          organizer: 'Principal Office',
          attendees: 250,
          isAllDay: false,
        },
        {
          id: 'e2',
          title: 'Annual Sports Day',
          description: 'Inter-house sports competition',
          date: '2024-08-20',
          startTime: '08:00',
          endTime: '17:00',
          category: 'SPORTS',
          location: 'School Ground',
          organizer: 'Sports Department',
          attendees: 1200,
          isAllDay: true,
        },
        {
          id: 'e3',
          title: 'Science Exhibition',
          description: 'Student science projects showcase',
          date: '2024-08-25',
          startTime: '09:00',
          endTime: '16:00',
          category: 'ACADEMIC',
          location: 'Science Block',
          organizer: 'Science Department',
          attendees: 800,
          isAllDay: false,
        },
        {
          id: 'e4',
          title: 'Independence Day Celebration',
          description: 'Flag hoisting and cultural program',
          date: '2024-08-15',
          startTime: '08:00',
          endTime: '11:00',
          category: 'CULTURAL',
          location: 'School Ground',
          organizer: 'Cultural Committee',
          attendees: 1500,
          isAllDay: false,
        },
        {
          id: 'e5',
          title: 'Mid-Term Examinations Begin',
          description: 'Mid-term exams for all classes',
          date: '2024-08-10',
          startTime: '09:00',
          endTime: '12:00',
          category: 'EXAM',
          location: 'All Classrooms',
          organizer: 'Examination Cell',
          attendees: 1250,
          isAllDay: false,
        },
      ],
      upcomingCount: 5,
      todayCount: 0,
      monthCount: 5,
    }),
  });

  // Generate calendar days
  const generateCalendarDays = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    // Add empty cells for days before the first of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const getEventsForDay = (day: number) => {
    const [year, month] = selectedMonth.split('-');
    const dateStr = `${year}-${month}-${String(day).padStart(2, '0')}`;
    return eventsData?.events.filter((e: any) => e.date === dateStr) || [];
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      ACADEMIC: 'bg-blue-100 text-blue-800',
      SPORTS: 'bg-green-100 text-green-800',
      CULTURAL: 'bg-purple-100 text-purple-800',
      MEETING: 'bg-orange-100 text-orange-800',
      EXAM: 'bg-red-100 text-red-800',
      HOLIDAY: 'bg-gray-100 text-gray-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      ACADEMIC: '📚',
      SPORTS: '🏆',
      CULTURAL: '🎭',
      MEETING: '👥',
      EXAM: '📝',
      HOLIDAY: '🎉',
    };
    return icons[category] || '📅';
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

  const calendarDays = generateCalendarDays();
  const filteredEvents = selectedCategory === 'all'
    ? eventsData?.events
    : eventsData?.events.filter((e: any) => e.category === selectedCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">School Events</h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage and view all school events and activities
            </p>
          </div>
          <Can permission={PERMISSIONS.EVENTS_CREATE}>
            <Button onClick={() => router.push('/events/create')}>
              + Create Event
            </Button>
          </Can>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Today's Events</p>
            <p className="text-3xl font-bold text-blue-600">{eventsData?.todayCount || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Upcoming Events</p>
            <p className="text-3xl font-bold text-green-600">{eventsData?.upcomingCount || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">This Month</p>
            <p className="text-3xl font-bold text-purple-600">{eventsData?.monthCount || 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
                <option value="2024-07">July 2024</option>
                <option value="2024-08">August 2024</option>
                <option value="2024-09">September 2024</option>
                <option value="2024-10">October 2024</option>
              </Select>

              <Select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                <option value="all">All Categories</option>
                <option value="ACADEMIC">📚 Academic</option>
                <option value="SPORTS">🏆 Sports</option>
                <option value="CULTURAL">🎭 Cultural</option>
                <option value="MEETING">👥 Meetings</option>
                <option value="EXAM">📝 Exams</option>
                <option value="HOLIDAY">🎉 Holidays</option>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'calendar' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('calendar')}
              >
                Calendar
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                List
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-7 gap-2">
              {/* Day headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center font-semibold text-gray-700 py-2">
                  {day}
                </div>
              ))}

              {/* Calendar days */}
              {calendarDays.map((day, idx) => {
                const dayEvents = day ? getEventsForDay(day) : [];
                return (
                  <div
                    key={idx}
                    className={`min-h-24 border rounded-lg p-2 ${
                      day ? 'bg-white hover:bg-gray-50' : 'bg-gray-50'
                    }`}
                  >
                    {day && (
                      <>
                        <div className="text-sm font-semibold text-gray-900 mb-1">{day}</div>
                        <div className="space-y-1">
                          {dayEvents.slice(0, 2).map((event: any) => (
                            <div
                              key={event.id}
                              onClick={() => router.push(`/events/${event.id}`)}
                              className={`text-xs p-1 rounded cursor-pointer truncate ${getCategoryColor(
                                event.category
                              )}`}
                            >
                              {getCategoryIcon(event.category)} {event.title}
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <div className="text-xs text-gray-600 text-center">
                              +{dayEvents.length - 2} more
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          {filteredEvents?.map((event: any) => (
            <Card key={event.id} className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => router.push(`/events/${event.id}`)}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-indigo-100 rounded-lg flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold text-indigo-600">
                        {new Date(event.date).getDate()}
                      </span>
                      <span className="text-xs text-indigo-600">
                        {new Date(event.date).toLocaleString('default', { month: 'short' })}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">{event.title}</h3>
                        <p className="text-sm text-gray-600">{event.description}</p>
                      </div>
                      <Badge className={getCategoryColor(event.category)}>
                        {getCategoryIcon(event.category)} {event.category}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mt-3">
                      <div>
                        <span className="font-medium">Time:</span>{' '}
                        {event.isAllDay ? 'All Day' : `${event.startTime} - ${event.endTime}`}
                      </div>
                      <div>
                        <span className="font-medium">Location:</span> {event.location}
                      </div>
                      <div>
                        <span className="font-medium">Organizer:</span> {event.organizer}
                      </div>
                      <div>
                        <span className="font-medium">Attendees:</span> {event.attendees}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
