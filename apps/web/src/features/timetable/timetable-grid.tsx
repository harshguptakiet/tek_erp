'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  SelectRoot,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Clock, User, MapPin, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Period {
  id: string;
  day: string;
  periodNumber: number;
  startTime: string;
  endTime: string;
  subject: string;
  teacher: string;
  room?: string;
  periodType?: 'LECTURE' | 'LAB' | 'ACTIVITY' | 'BREAK';
  hasConflict?: boolean;
}

interface TimetableGridProps {
  periods: Period[];
  editable?: boolean;
  onPeriodClick?: (period: Period) => void;
  onPeriodUpdate?: (period: Period) => void;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const PERIOD_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8];

export function TimetableGrid({
  periods,
  editable = false,
  onPeriodClick,
  onPeriodUpdate,
}: TimetableGridProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const getPeriodByDayAndNumber = (day: string, periodNumber: number) => {
    return periods.find((p) => p.day === day && p.periodNumber === periodNumber);
  };

  const getPeriodTypeColor = (type?: string) => {
    switch (type) {
      case 'LECTURE':
        return 'bg-blue-100 border-blue-300 hover:bg-blue-200';
      case 'LAB':
        return 'bg-purple-100 border-purple-300 hover:bg-purple-200';
      case 'ACTIVITY':
        return 'bg-green-100 border-green-300 hover:bg-green-200';
      case 'BREAK':
        return 'bg-gray-100 border-gray-300 hover:bg-gray-200';
      default:
        return 'bg-white border-gray-300 hover:bg-gray-50';
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            Grid View
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            List View
          </Button>
        </div>

        <div className="flex gap-2">
          <Badge variant="info" className="flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
            Lecture
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <div className="w-2 h-2 bg-purple-500 rounded-full" />
            Lab
          </Badge>
          <Badge variant="success" className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            Activity
          </Badge>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <Card className="p-4 overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border p-2 bg-muted w-24 text-left">Period</th>
                {DAYS.map((day) => (
                  <th key={day} className="border p-2 bg-muted text-center">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERIOD_NUMBERS.map((periodNumber) => (
                <tr key={periodNumber}>
                  <td className="border p-2 bg-muted font-medium text-center">
                    {periodNumber}
                  </td>
                  {DAYS.map((day) => {
                    const period = getPeriodByDayAndNumber(day, periodNumber);
                    return (
                      <td
                        key={`${day}-${periodNumber}`}
                        className={cn(
                          'border p-2 h-24 align-top cursor-pointer transition-colors',
                          period ? getPeriodTypeColor(period.periodType) : 'bg-gray-50 hover:bg-gray-100'
                        )}
                        onClick={() => period && onPeriodClick?.(period)}
                      >
                        {period ? (
                          <div className="space-y-1">
                            <p className="font-medium text-sm line-clamp-1">
                              {period.subject}
                            </p>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <User className="h-3 w-3" />
                              <span className="line-clamp-1">{period.teacher}</span>
                            </div>
                            {period.room && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                <span>{period.room}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>{period.startTime} - {period.endTime}</span>
                            </div>
                            {period.hasConflict && (
                              <Badge variant="error" className="text-xs">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Conflict
                              </Badge>
                            )}
                          </div>
                        ) : editable ? (
                          <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
                            + Add Period
                          </div>
                        ) : null}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      ) : (
        <div className="space-y-2">
          {DAYS.map((day) => {
            const dayPeriods = periods.filter((p) => p.day === day);
            return (
              <Card key={day} className="p-4">
                <h3 className="font-semibold mb-3">{day}</h3>
                {dayPeriods.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No periods scheduled</p>
                ) : (
                  <div className="space-y-2">
                    {dayPeriods.map((period) => (
                      <div
                        key={period.id}
                        className={cn(
                          'p-3 rounded-lg border-2 cursor-pointer',
                          getPeriodTypeColor(period.periodType)
                        )}
                        onClick={() => onPeriodClick?.(period)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <p className="font-medium">{period.subject}</p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                {period.teacher}
                              </span>
                              {period.room && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  {period.room}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-sm text-right">
                            <Badge variant="secondary">Period {period.periodNumber}</Badge>
                            <p className="text-xs text-muted-foreground mt-1">
                              {period.startTime} - {period.endTime}
                            </p>
                          </div>
                        </div>
                        {period.hasConflict && (
                          <Badge variant="error" className="mt-2">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Schedule Conflict Detected
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
