/**
 * Events & Calendar Management
 */

'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import Link from 'next/link';

export default function EventsPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState<'list' | 'calendar'>('list');

  const events = [
    { id: '1', title: 'Annual Sports Day', date: new Date(), type: 'SPORTS', participants: 450 },
    { id: '2', title: 'Parent-Teacher Meeting', date: addDays(new Date(), 3), type: 'ACADEMIC', participants: 280 },
    { id: '3', title: 'Science Fair', date: addDays(new Date(), 7), type: 'ACADEMIC', participants: 150 },
  ];

  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Events & Calendar</h1>
          <p className="text-muted-foreground">Manage school events and activities</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setView(view === 'list' ? 'calendar' : 'list')}>
            {view === 'list' ? '📅 Calendar' : '📋 List'} View
          </Button>
          <Link href="/events/create">
            <Button>+ Create Event</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Total Events</div>
          <div className="text-3xl font-bold">{events.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Upcoming</div>
          <div className="text-3xl font-bold text-blue-600">
            {events.filter(e => e.date >= new Date()).length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">This Month</div>
          <div className="text-3xl font-bold text-green-600">
            {events.filter(e => e.date.getMonth() === new Date().getMonth()).length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Total Participants</div>
          <div className="text-3xl font-bold text-purple-600">
            {events.reduce((sum, e) => sum + e.participants, 0)}
          </div>
        </Card>
      </div>

      {view === 'list' ? (
        <Card>
          <div className="p-4 border-b">
            <h3 className="font-semibold">Upcoming Events</h3>
          </div>
          <div className="divide-y">
            {events.map(event => (
              <div key={event.id} className="p-4 hover:bg-muted/50 cursor-pointer">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-semibold">{event.title}</h4>
                    <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                      <span>📅 {format(event.date, 'MMM dd, yyyy')}</span>
                      <span>👥 {event.participants} participants</span>
                    </div>
                  </div>
                  <Badge>{event.type}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <Card className="p-4">
          <div className="grid grid-cols-7 gap-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center font-semibold p-2">{day}</div>
            ))}
            {monthDays.map(day => {
              const dayEvents = events.filter(e => 
                e.date.toDateString() === day.toDateString()
              );
              return (
                <div key={day.toISOString()} className={`border rounded p-2 min-h-[80px] ${
                  day.toDateString() === new Date().toDateString() ? 'bg-blue-50 border-blue-300' : ''
                }`}>
                  <div className="text-sm font-medium">{format(day, 'd')}</div>
                  {dayEvents.map(event => (
                    <div key={event.id} className="text-xs bg-blue-100 rounded px-1 mt-1 truncate">
                      {event.title}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
