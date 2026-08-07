'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, User, MapPin, Plus, Edit, Trash2 } from 'lucide-react';
import type { Period } from '@/types';

interface TimetableGridProps {
  periods: Period[];
  isLoading?: boolean;
  onAddPeriod?: (dayOfWeek: number, timeSlot: string) => void;
  onEditPeriod?: (period: Period) => void;
  onDeletePeriod?: (periodId: string) => void;
  readonly?: boolean;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TIME_SLOTS = [
  '08:00 - 08:45',
  '08:45 - 09:30',
  '09:30 - 10:15',
  '10:15 - 10:30', // Break
  '10:30 - 11:15',
  '11:15 - 12:00',
  '12:00 - 12:45',
  '12:45 - 01:30', // Lunch
  '01:30 - 02:15',
  '02:15 - 03:00',
  '03:00 - 03:45',
];

const BREAK_SLOTS = ['10:15 - 10:30', '12:45 - 01:30'];

export function TimetableGrid({
  periods,
  isLoading,
  onAddPeriod,
  onEditPeriod,
  onDeletePeriod,
  readonly = false,
}: TimetableGridProps) {
  // Group periods by day and time slot
  const periodsByDayAndTime = periods.reduce((acc, period) => {
    const key = `${period.dayOfWeek}-${period.startTime}-${period.endTime}`;
    acc[key] = period;
    return acc;
  }, {} as Record<string, Period>);

  const getPeriod = (dayIndex: number, timeSlot: string) => {
    const [startTime, endTime] = timeSlot.split(' - ');
    const key = `${dayIndex}-${startTime}-${endTime}`;
    return periodsByDayAndTime[key];
  };

  const isBreak = (timeSlot: string) => BREAK_SLOTS.includes(timeSlot);

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 77 }).map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="overflow-x-auto">
        <div className="min-w-[1000px]">
          {/* Header */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            <div className="font-semibold text-sm text-gray-700 p-2">Time</div>
            {DAYS.map((day) => (
              <div key={day} className="font-semibold text-sm text-gray-700 text-center p-2">
                {day}
              </div>
            ))}
          </div>

          {/* Time slots */}
          <div className="space-y-2">
            {TIME_SLOTS.map((timeSlot) => (
              <div key={timeSlot} className="grid grid-cols-7 gap-2">
                {/* Time column */}
                <div className={`text-xs p-2 flex items-center justify-center border rounded ${
                  isBreak(timeSlot) ? 'bg-gray-100 text-gray-500' : 'bg-white'
                }`}>
                  <Clock className="w-3 h-3 mr-1" />
                  {timeSlot}
                </div>

                {/* Day columns */}
                {DAYS.map((day, dayIndex) => {
                  if (isBreak(timeSlot)) {
                    return (
                      <div
                        key={`${day}-${timeSlot}`}
                        className="bg-gray-50 border border-dashed rounded p-2 flex items-center justify-center text-xs text-gray-500"
                      >
                        {timeSlot.includes('10:15') ? 'Break' : 'Lunch'}
                      </div>
                    );
                  }

                  const period = getPeriod(dayIndex, timeSlot);

                  if (!period) {
                    return (
                      <div
                        key={`${day}-${timeSlot}`}
                        className="border border-dashed rounded p-2 hover:bg-gray-50 transition-colors relative group"
                      >
                        {!readonly && onAddPeriod && (
                          <button
                            onClick={() => onAddPeriod(dayIndex, timeSlot)}
                            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Plus className="w-4 h-4 text-gray-400" />
                          </button>
                        )}
                      </div>
                    );
                  }

                  return (
                    <div
                      key={`${day}-${timeSlot}`}
                      className="border rounded p-2 bg-blue-50 hover:bg-blue-100 transition-colors relative group"
                    >
                      <div className="space-y-1">
                        <div className="flex items-start justify-between">
                          <Badge variant="default" className="text-xs">
                            {period.subject?.name || 'Subject'}
                          </Badge>
                          {!readonly && (
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {onEditPeriod && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-5 w-5 p-0"
                                  onClick={() => onEditPeriod(period)}
                                >
                                  <Edit className="w-3 h-3" />
                                </Button>
                              )}
                              {onDeletePeriod && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-5 w-5 p-0 text-red-600"
                                  onClick={() => onDeletePeriod(period.id)}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                        
                        {period.teacher && (
                          <div className="flex items-center text-xs text-gray-600">
                            <User className="w-3 h-3 mr-1" />
                            {period.teacher.firstName} {period.teacher.lastName}
                          </div>
                        )}
                        
                        {period.room && (
                          <div className="flex items-center text-xs text-gray-600">
                            <MapPin className="w-3 h-3 mr-1" />
                            {period.room.name}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t flex items-center gap-4 text-xs text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-50 border rounded" />
          <span>Regular Period</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-50 border border-dashed rounded" />
          <span>Break/Lunch</span>
        </div>
        {!readonly && (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border border-dashed rounded" />
            <span>Empty Slot (click to add)</span>
          </div>
        )}
      </div>
    </Card>
  );
}
