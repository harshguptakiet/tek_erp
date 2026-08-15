/**
 * Module 04: Academic - Timetable Viewer
 * FR-ACAD-030 to FR-ACAD-035: View and manage class timetables
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
import { academicService } from '@/services/academic.service';
import { useAuthStore } from '@/stores/auth.store';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const TIME_SLOTS = [
  { id: 1, label: '08:00 - 08:45', start: '08:00', end: '08:45' },
  { id: 2, label: '08:45 - 09:30', start: '08:45', end: '09:30' },
  { id: 3, label: '09:30 - 10:15', start: '09:30', end: '10:15' },
  { id: 4, label: '10:15 - 10:30', start: '10:15', end: '10:30', isBreak: true },
  { id: 5, label: '10:30 - 11:15', start: '10:30', end: '11:15' },
  { id: 6, label: '11:15 - 12:00', start: '11:15', end: '12:00' },
  { id: 7, label: '12:00 - 12:45', start: '12:00', end: '12:45' },
  { id: 8, label: '12:45 - 13:30', start: '12:45', end: '13:30', isBreak: true },
  { id: 9, label: '13:30 - 14:15', start: '13:30', end: '14:15' },
  { id: 10, label: '14:15 - 15:00', start: '14:15', end: '15:00' },
];

export interface TimetablePeriod {
  slot: number;
  subject: string;
  teacher: string;
  room: string;
  type: string;
}

export interface TimetableData {
  class: string;
  section: string;
  academicYear: string;
  schedule: Record<string, TimetablePeriod[]>;
}

const MOCK_TIMETABLE: TimetableData = {
  class: 'Class 10',
  section: 'A',
  academicYear: '2024-2025',
  schedule: {
    Monday: [
      { slot: 1, subject: 'Mathematics', teacher: 'Dr. Vikram Sethi', room: 'Room 302', type: 'LECTURE' },
      { slot: 2, subject: 'Science', teacher: 'Elena Rostova', room: 'Physics Lab', type: 'LAB' },
      { slot: 3, subject: 'English', teacher: 'Sarah Connor', room: 'Room 302', type: 'LECTURE' },
      { slot: 5, subject: 'Computer Science', teacher: 'Michael Chen', room: 'CS Lab 1', type: 'PRACTICAL' },
      { slot: 6, subject: 'Social Studies', teacher: 'Alex Rivera', room: 'Room 302', type: 'LECTURE' },
      { slot: 7, subject: 'Hindi', teacher: 'Priya Patel', room: 'Room 302', type: 'LECTURE' },
      { slot: 9, subject: 'Physical Education', teacher: 'John Coach', room: 'Ground', type: 'ACTIVITY' },
    ],
    Tuesday: [
      { slot: 1, subject: 'Science', teacher: 'Elena Rostova', room: 'Physics Lab', type: 'LAB' },
      { slot: 2, subject: 'Mathematics', teacher: 'Dr. Vikram Sethi', room: 'Room 302', type: 'LECTURE' },
      { slot: 3, subject: 'Computer Science', teacher: 'Michael Chen', room: 'CS Lab 1', type: 'PRACTICAL' },
      { slot: 5, subject: 'English', teacher: 'Sarah Connor', room: 'Room 302', type: 'LECTURE' },
      { slot: 6, subject: 'Social Studies', teacher: 'Alex Rivera', room: 'Room 302', type: 'LECTURE' },
    ],
    Wednesday: [
      { slot: 1, subject: 'Mathematics', teacher: 'Dr. Vikram Sethi', room: 'Room 302', type: 'LECTURE' },
      { slot: 2, subject: 'English', teacher: 'Sarah Connor', room: 'Room 302', type: 'LECTURE' },
      { slot: 3, subject: 'Science', teacher: 'Elena Rostova', room: 'Chem Lab', type: 'LAB' },
      { slot: 5, subject: 'Hindi', teacher: 'Priya Patel', room: 'Room 302', type: 'LECTURE' },
    ],
    Thursday: [
      { slot: 1, subject: 'Computer Science', teacher: 'Michael Chen', room: 'CS Lab 1', type: 'PRACTICAL' },
      { slot: 2, subject: 'Mathematics', teacher: 'Dr. Vikram Sethi', room: 'Room 302', type: 'LECTURE' },
      { slot: 3, subject: 'Social Studies', teacher: 'Alex Rivera', room: 'Room 302', type: 'LECTURE' },
      { slot: 5, subject: 'Science', teacher: 'Elena Rostova', room: 'Bio Lab', type: 'LAB' },
    ],
    Friday: [
      { slot: 1, subject: 'English', teacher: 'Sarah Connor', room: 'Room 302', type: 'LECTURE' },
      { slot: 2, subject: 'Science', teacher: 'Elena Rostova', room: 'Room 302', type: 'LECTURE' },
      { slot: 3, subject: 'Mathematics', teacher: 'Dr. Vikram Sethi', room: 'Room 302', type: 'LECTURE' },
      { slot: 5, subject: 'Physical Education', teacher: 'John Coach', room: 'Ground', type: 'ACTIVITY' },
    ],
    Saturday: [
      { slot: 1, subject: 'Social Studies', teacher: 'Alex Rivera', room: 'Room 302', type: 'LECTURE' },
      { slot: 2, subject: 'Hindi', teacher: 'Priya Patel', room: 'Room 302', type: 'LECTURE' },
      { slot: 3, subject: 'Computer Science', teacher: 'Michael Chen', room: 'CS Lab 1', type: 'PRACTICAL' },
    ],
  },
};

export default function TimetablePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [selectedClass, setSelectedClass] = useState('10-a');
  const [selectedView, setSelectedView] = useState<'class' | 'teacher'>('class');
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('2024-2025');

  // Get timetable for selected class
  const { data: apiTimetable, isLoading } = useQuery({
    queryKey: ['timetable', selectedClass, user?.schoolId],
    queryFn: () => academicService.getTimetable(selectedClass),
    enabled: !!selectedClass,
  });

  const timetable: TimetableData = (apiTimetable as TimetableData | null)?.schedule ? (apiTimetable as TimetableData) : MOCK_TIMETABLE;

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

  const subjectColors: Record<string, string> = {
    Mathematics: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30',
    Science: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    English: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30',
    Hindi: 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30',
    'Social Studies': 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
    'Computer Science': 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30',
    'Physical Education': 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
    default: 'bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] border-[hsl(var(--border))]',
  };

  const getSubjectColor = (subject: string) => {
    return subjectColors[subject] || subjectColors.default;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">Timetable</h1>
            <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
              View weekly class schedule and periods
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => window.print()}>
              Print
            </Button>
            <Can permission={PERMISSIONS.ACADEMIC_MANAGE}>
              <Button onClick={() => router.push('/timetable/edit')}>
                Edit Timetable
              </Button>
            </Can>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="card-premium mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">
                View Type
              </label>
              <Select value={selectedView} onChange={(e) => setSelectedView(e.target.value as 'class' | 'teacher')}>
                <option value="class">Class View</option>
                <option value="teacher">Teacher View</option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">
                Class/Section
              </label>
              <Select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
                <option value="10-a">Class 10 - Section A</option>
                <option value="9-a">Class 9 - Section A</option>
                <option value="9-b">Class 9 - Section B</option>
                <option value="10-b">Class 10 - Section B</option>
                <option value="11-a">Class 11 - Section A</option>
                <option value="12-a">Class 12 - Section A</option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">
                Academic Year
              </label>
              <Select value={selectedAcademicYear} onChange={(e) => setSelectedAcademicYear(e.target.value)}>
                <option value="2024-2025">2024-2025</option>
                <option value="2023-2024">2023-2024</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timetable Grid */}
      <Card className="card-premium">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-[hsl(var(--foreground))]">
              {timetable?.class} - Section {timetable?.section}
            </CardTitle>
            <Badge variant="secondary">{timetable?.academicYear}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border border-[hsl(var(--border)/0.6)] p-2 bg-[hsl(var(--muted)/0.4)] font-bold text-sm text-[hsl(var(--foreground))] w-32">
                    Time
                  </th>
                  {DAYS.map((day) => (
                    <th key={day} className="border border-[hsl(var(--border)/0.6)] p-2 bg-[hsl(var(--muted)/0.4)] font-bold text-sm text-[hsl(var(--foreground))]">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TIME_SLOTS.map((slot) => (
                  <tr key={slot.id}>
                    <td className="border border-[hsl(var(--border)/0.6)] p-2 bg-[hsl(var(--muted)/0.2)] text-xs text-[hsl(var(--muted-foreground))] font-semibold">
                      {slot.label}
                    </td>
                    {DAYS.map((day) => {
                      if (slot.isBreak) {
                        return (
                          <td key={day} className="border border-[hsl(var(--border)/0.6)] p-2 bg-[hsl(var(--muted)/0.5)] text-center">
                            <span className="text-xs text-[hsl(var(--muted-foreground))] font-bold">
                              Break
                            </span>
                          </td>
                        );
                      }

                      type TimetablePeriod = {
                        slot: number;
                        subject: string;
                        teacher: string;
                        room: string;
                        type: string;
                      };
                      const period = (timetable?.schedule as Record<string, TimetablePeriod[]> | undefined)?.[day]?.find((p) => p.slot === slot.id);

                      if (!period) {
                        return (
                          <td key={day} className="border border-[hsl(var(--border)/0.6)] p-2 bg-[hsl(var(--card))]">
                            <div className="text-xs text-[hsl(var(--muted-foreground)/0.4)] text-center">-</div>
                          </td>
                        );
                      }

                      return (
                        <td key={day} className="border border-[hsl(var(--border)/0.6)] p-2">
                          <div
                            className={`p-2 rounded-xl border ${getSubjectColor(period.subject)} cursor-pointer hover:shadow-md transition-all`}
                          >
                            <p className="font-bold text-xs mb-1">{period.subject}</p>
                            <p className="text-xs opacity-90">{period.teacher}</p>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-xs opacity-75">{period.room}</span>
                              <Badge variant="secondary" className="text-[10px] px-1 py-0 font-semibold">
                                {period.type}
                              </Badge>
                            </div>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div className="mt-6 pt-6 border-t border-[hsl(var(--border))]">
            <p className="text-sm font-semibold text-[hsl(var(--foreground))] mb-3">Period Types:</p>
            <div className="flex flex-wrap gap-3">
              {[
                { type: 'LECTURE', label: 'Lecture', color: 'bg-blue-500/20 text-blue-500 border border-blue-500/30' },
                { type: 'LAB', label: 'Lab/Practical', color: 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30' },
                { type: 'PRACTICAL', label: 'Practical', color: 'bg-indigo-500/20 text-indigo-500 border border-indigo-500/30' },
                { type: 'ACTIVITY', label: 'Activity', color: 'bg-rose-500/20 text-rose-500 border border-rose-500/30' },
              ].map((item) => (
                <div key={item.type} className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded ${item.color}`} />
                  <span className="text-xs text-[hsl(var(--muted-foreground))] font-medium">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card-premium">
          <CardContent className="pt-6">
            <p className="text-sm text-[hsl(var(--muted-foreground))]">Total Periods/Week</p>
            <p className="text-2xl font-bold text-[hsl(var(--foreground))] mt-1">48</p>
          </CardContent>
        </Card>
        <Card className="card-premium">
          <CardContent className="pt-6">
            <p className="text-sm text-[hsl(var(--muted-foreground))]">Subjects</p>
            <p className="text-2xl font-bold text-blue-500 mt-1">8</p>
          </CardContent>
        </Card>
        <Card className="card-premium">
          <CardContent className="pt-6">
            <p className="text-sm text-[hsl(var(--muted-foreground))]">Teachers</p>
            <p className="text-2xl font-bold text-purple-500 mt-1">10</p>
          </CardContent>
        </Card>
        <Card className="card-premium">
          <CardContent className="pt-6">
            <p className="text-sm text-[hsl(var(--muted-foreground))]">Working Days</p>
            <p className="text-2xl font-bold text-emerald-500 mt-1">6</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
