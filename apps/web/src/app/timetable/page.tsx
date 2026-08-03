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

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TIME_SLOTS = [
  { id: '1', start: '08:00', end: '08:45', label: '8:00 - 8:45 AM' },
  { id: '2', start: '08:45', end: '09:30', label: '8:45 - 9:30 AM' },
  { id: '3', start: '09:30', end: '10:15', label: '9:30 - 10:15 AM' },
  { id: '4', start: '10:15', end: '10:30', label: 'Break', isBreak: true },
  { id: '5', start: '10:30', end: '11:15', label: '10:30 - 11:15 AM' },
  { id: '6', start: '11:15', end: '12:00', label: '11:15 - 12:00 PM' },
  { id: '7', start: '12:00', end: '12:45', label: '12:00 - 12:45 PM' },
  { id: '8', start: '12:45', end: '13:30', label: 'Lunch Break', isBreak: true },
  { id: '9', start: '13:30', end: '14:15', label: '1:30 - 2:15 PM' },
  { id: '10', start: '14:15', end: '15:00', label: '2:15 - 3:00 PM' },
];

export default function TimetablePage() {
  const router = useRouter();
  const [selectedClass, setSelectedClass] = useState('10-a');
  const [selectedView, setSelectedView] = useState<'class' | 'teacher'>('class');

  // Mock data - replace with actual API call
  const { data: timetable, isLoading } = useQuery({
    queryKey: ['timetable', selectedClass, selectedView],
    queryFn: async () => ({
      class: 'Class 10',
      section: 'A',
      academicYear: '2024-2025',
      schedule: {
        Monday: [
          { slot: '1', subject: 'Mathematics', teacher: 'Mr. Kumar', room: '201', type: 'LECTURE' },
          { slot: '2', subject: 'Mathematics', teacher: 'Mr. Kumar', room: '201', type: 'LECTURE' },
          { slot: '3', subject: 'Science', teacher: 'Dr. Verma', room: '301', type: 'LAB' },
          { slot: '5', subject: 'English', teacher: 'Mrs. Singh', room: '105', type: 'LECTURE' },
          { slot: '6', subject: 'English', teacher: 'Mrs. Singh', room: '105', type: 'LECTURE' },
          { slot: '7', subject: 'Physical Education', teacher: 'Mr. Reddy', room: 'Ground', type: 'PRACTICAL' },
          { slot: '9', subject: 'Hindi', teacher: 'Mrs. Patel', room: '203', type: 'LECTURE' },
          { slot: '10', subject: 'Social Studies', teacher: 'Mr. Sharma', room: '204', type: 'LECTURE' },
        ],
        Tuesday: [
          { slot: '1', subject: 'Science', teacher: 'Dr. Verma', room: '301', type: 'LECTURE' },
          { slot: '2', subject: 'Science', teacher: 'Dr. Verma', room: '301', type: 'LECTURE' },
          { slot: '3', subject: 'Mathematics', teacher: 'Mr. Kumar', room: '201', type: 'LECTURE' },
          { slot: '5', subject: 'Social Studies', teacher: 'Mr. Sharma', room: '204', type: 'LECTURE' },
          { slot: '6', subject: 'Hindi', teacher: 'Mrs. Patel', room: '203', type: 'LECTURE' },
          { slot: '7', subject: 'Computer Science', teacher: 'Mr. Khan', room: 'Lab 1', type: 'LAB' },
          { slot: '9', subject: 'English', teacher: 'Mrs. Singh', room: '105', type: 'LECTURE' },
          { slot: '10', subject: 'Library', teacher: 'Librarian', room: 'Library', type: 'ACTIVITY' },
        ],
        Wednesday: [
          { slot: '1', subject: 'Mathematics', teacher: 'Mr. Kumar', room: '201', type: 'LECTURE' },
          { slot: '2', subject: 'English', teacher: 'Mrs. Singh', room: '105', type: 'LECTURE' },
          { slot: '3', subject: 'Science', teacher: 'Dr. Verma', room: '301', type: 'LECTURE' },
          { slot: '5', subject: 'Hindi', teacher: 'Mrs. Patel', room: '203', type: 'LECTURE' },
          { slot: '6', subject: 'Social Studies', teacher: 'Mr. Sharma', room: '204', type: 'LECTURE' },
          { slot: '7', subject: 'Art & Craft', teacher: 'Ms. Gupta', room: 'Art Room', type: 'PRACTICAL' },
          { slot: '9', subject: 'Computer Science', teacher: 'Mr. Khan', room: 'Lab 1', type: 'LAB' },
          { slot: '10', subject: 'Mathematics', teacher: 'Mr. Kumar', room: '201', type: 'LECTURE' },
        ],
        Thursday: [
          { slot: '1', subject: 'English', teacher: 'Mrs. Singh', room: '105', type: 'LECTURE' },
          { slot: '2', subject: 'Science', teacher: 'Dr. Verma', room: '301', type: 'LECTURE' },
          { slot: '3', subject: 'Mathematics', teacher: 'Mr. Kumar', room: '201', type: 'LECTURE' },
          { slot: '5', subject: 'Physical Education', teacher: 'Mr. Reddy', room: 'Ground', type: 'PRACTICAL' },
          { slot: '6', subject: 'Hindi', teacher: 'Mrs. Patel', room: '203', type: 'LECTURE' },
          { slot: '7', subject: 'Social Studies', teacher: 'Mr. Sharma', room: '204', type: 'LECTURE' },
          { slot: '9', subject: 'Science', teacher: 'Dr. Verma', room: '301', type: 'LAB' },
          { slot: '10', subject: 'Computer Science', teacher: 'Mr. Khan', room: 'Lab 1', type: 'LECTURE' },
        ],
        Friday: [
          { slot: '1', subject: 'Mathematics', teacher: 'Mr. Kumar', room: '201', type: 'LECTURE' },
          { slot: '2', subject: 'Hindi', teacher: 'Mrs. Patel', room: '203', type: 'LECTURE' },
          { slot: '3', subject: 'English', teacher: 'Mrs. Singh', room: '105', type: 'LECTURE' },
          { slot: '5', subject: 'Science', teacher: 'Dr. Verma', room: '301', type: 'LECTURE' },
          { slot: '6', subject: 'Social Studies', teacher: 'Mr. Sharma', room: '204', type: 'LECTURE' },
          { slot: '7', subject: 'Music', teacher: 'Mr. Desai', room: 'Music Room', type: 'PRACTICAL' },
          { slot: '9', subject: 'Computer Science', teacher: 'Mr. Khan', room: 'Lab 1', type: 'LECTURE' },
          { slot: '10', subject: 'Assembly/Class Teacher', teacher: 'Mrs. Sharma', room: '201', type: 'ACTIVITY' },
        ],
        Saturday: [
          { slot: '1', subject: 'Mathematics', teacher: 'Mr. Kumar', room: '201', type: 'LECTURE' },
          { slot: '2', subject: 'Science', teacher: 'Dr. Verma', room: '301', type: 'LECTURE' },
          { slot: '3', subject: 'English', teacher: 'Mrs. Singh', room: '105', type: 'LECTURE' },
          { slot: '5', subject: 'Sports', teacher: 'Mr. Reddy', room: 'Ground', type: 'PRACTICAL' },
          { slot: '6', subject: 'Co-curricular', teacher: 'Various', room: 'Various', type: 'ACTIVITY' },
        ],
      },
    }),
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

  const subjectColors: Record<string, string> = {
    Mathematics: 'bg-blue-100 text-blue-800 border-blue-200',
    Science: 'bg-green-100 text-green-800 border-green-200',
    English: 'bg-purple-100 text-purple-800 border-purple-200',
    Hindi: 'bg-orange-100 text-orange-800 border-orange-200',
    'Social Studies': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Computer Science': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    'Physical Education': 'bg-red-100 text-red-800 border-red-200',
    default: 'bg-gray-100 text-gray-800 border-gray-200',
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
            <h1 className="text-3xl font-bold text-gray-900">Timetable</h1>
            <p className="mt-2 text-sm text-gray-600">
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
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                View Type
              </label>
              <Select value={selectedView} onChange={(e) => setSelectedView(e.target.value as any)}>
                <option value="class">Class View</option>
                <option value="teacher">Teacher View</option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Class/Section
              </label>
              <Select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
                <option value="9-a">Class 9 - Section A</option>
                <option value="9-b">Class 9 - Section B</option>
                <option value="10-a">Class 10 - Section A</option>
                <option value="10-b">Class 10 - Section B</option>
                <option value="11-a">Class 11 - Section A</option>
                <option value="12-a">Class 12 - Section A</option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Academic Year
              </label>
              <Select value="2024-2025">
                <option value="2024-2025">2024-2025</option>
                <option value="2023-2024">2023-2024</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timetable Grid */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
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
                  <th className="border p-2 bg-gray-50 font-semibold text-sm text-gray-700 w-32">
                    Time
                  </th>
                  {DAYS.map((day) => (
                    <th key={day} className="border p-2 bg-gray-50 font-semibold text-sm text-gray-700">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TIME_SLOTS.map((slot) => (
                  <tr key={slot.id}>
                    <td className="border p-2 bg-gray-50 text-xs text-gray-600 font-medium">
                      {slot.label}
                    </td>
                    {DAYS.map((day) => {
                      if (slot.isBreak) {
                        return (
                          <td key={day} className="border p-2 bg-gray-100 text-center">
                            <span className="text-xs text-gray-500 font-medium">
                              {slot.label}
                            </span>
                          </td>
                        );
                      }

                      type TimetablePeriod = {
                        slot: string;
                        subject: string;
                        teacher: string;
                        room: string;
                        type: string;
                      };
                      const period = (timetable?.schedule as Record<string, TimetablePeriod[]> | undefined)?.[day]?.find((p) => p.slot === slot.id);

                      if (!period) {
                        return (
                          <td key={day} className="border p-2 bg-white">
                            <div className="text-xs text-gray-400 text-center">-</div>
                          </td>
                        );
                      }

                      return (
                        <td key={day} className="border p-2">
                          <div
                            className={`p-2 rounded border ${getSubjectColor(period.subject)} cursor-pointer hover:shadow-md transition-shadow`}
                          >
                            <p className="font-semibold text-xs mb-1">{period.subject}</p>
                            <p className="text-xs opacity-80">{period.teacher}</p>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-xs opacity-70">{period.room}</span>
                              <Badge variant="secondary" className="text-[10px] px-1 py-0">
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
          <div className="mt-6 pt-6 border-t">
            <p className="text-sm font-medium text-gray-700 mb-3">Period Types:</p>
            <div className="flex flex-wrap gap-3">
              {[
                { type: 'LECTURE', label: 'Lecture', color: 'bg-blue-100 text-blue-800' },
                { type: 'LAB', label: 'Lab/Practical', color: 'bg-green-100 text-green-800' },
                { type: 'PRACTICAL', label: 'Practical', color: 'bg-purple-100 text-purple-800' },
                { type: 'ACTIVITY', label: 'Activity', color: 'bg-yellow-100 text-yellow-800' },
              ].map((item) => (
                <div key={item.type} className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded ${item.color}`} />
                  <span className="text-xs text-gray-600">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Total Periods/Week</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">48</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Subjects</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">8</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Teachers</p>
            <p className="text-2xl font-bold text-purple-600 mt-1">10</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Working Days</p>
            <p className="text-2xl font-bold text-green-600 mt-1">6</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
