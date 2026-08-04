/**
 * Module 04: Academic Management - Timetable Editor
 * FR-TIMETABLE-005: Edit and manage timetable schedules
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { academicService } from '@/services/academic.service';
import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Loader2, Save, X, Plus, Clock, MapPin, User } from 'lucide-react';
import { Can } from '@/components/auth/can';
import { PERMISSIONS } from '@/config/permissions';

interface Period {
  id?: string;
  day: string;
  startTime: string;
  endTime: string;
  subjectId: string;
  subjectName?: string;
  teacherId: string;
  teacherName?: string;
  roomId?: string;
  roomName?: string;
  type: 'lecture' | 'practical' | 'break';
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TIME_SLOTS = [
  { start: '08:00', end: '08:45' },
  { start: '08:45', end: '09:30' },
  { start: '09:30', end: '10:15' },
  { start: '10:15', end: '10:30', isBreak: true },
  { start: '10:30', end: '11:15' },
  { start: '11:15', end: '12:00' },
  { start: '12:00', end: '12:45' },
  { start: '12:45', end: '13:30', isBreak: true },
  { start: '13:30', end: '14:15' },
  { start: '14:15', end: '15:00' },
];

export default function TimetableEditPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [periods, setPeriods] = useState<Period[]>([]);
  const [editingCell, setEditingCell] = useState<{ day: string; time: string } | null>(null);

  // Fetch classes
  const { data: classesData } = useQuery({
    queryKey: ['classes', user?.schoolId],
    queryFn: () => academicService.getClasses({ limit: 100 }),
    enabled: !!user?.schoolId,
  });

  // Fetch subjects
  const { data: subjectsData } = useQuery({
    queryKey: ['subjects', user?.schoolId],
    queryFn: () => academicService.getSubjects({ limit: 100 }),
    enabled: !!user?.schoolId,
  });

  // Fetch teachers
  const { data: teachersData } = useQuery({
    queryKey: ['teachers', user?.schoolId],
    queryFn: () => academicService.getTeachers({ limit: 100 }),
    enabled: !!user?.schoolId,
  });

  // Fetch existing timetable
  const { data: timetableData, isLoading } = useQuery({
    queryKey: ['timetable', selectedClass, selectedSection],
    queryFn: () => academicService.getTimetable(selectedClass, selectedSection),
    enabled: !!(selectedClass && selectedSection),
  });

  const saveTimetableMutation = useMutation({
    mutationFn: (data: { classId: string; sectionId: string; periods: Period[] }) =>
      academicService.updateTimetable(data.classId, data.sectionId, data.periods),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetable'] });
      toast.success('Timetable saved successfully');
    },
    onError: () => {
      toast.error('Failed to save timetable');
    },
  });

  const getPeriodForSlot = (day: string, timeSlot: { start: string; end: string }) => {
    return periods.find(
      (p) => p.day === day && p.startTime === timeSlot.start && p.endTime === timeSlot.end
    );
  };

  const addPeriod = (day: string, timeSlot: { start: string; end: string }, data: Partial<Period>) => {
    const newPeriod: Period = {
      day,
      startTime: timeSlot.start,
      endTime: timeSlot.end,
      subjectId: data.subjectId || '',
      teacherId: data.teacherId || '',
      roomId: data.roomId,
      type: timeSlot.isBreak ? 'break' : 'lecture',
      ...data,
    };

    setPeriods([...periods.filter(p => !(p.day === day && p.startTime === timeSlot.start)), newPeriod]);
    setEditingCell(null);
  };

  const removePeriod = (day: string, startTime: string) => {
    setPeriods(periods.filter(p => !(p.day === day && p.startTime === startTime)));
  };

  const handleSave = () => {
    if (!selectedClass || !selectedSection) {
      toast.error('Please select class and section');
      return;
    }

    saveTimetableMutation.mutate({
      classId: selectedClass,
      sectionId: selectedSection,
      periods,
    });
  };

  const classes = classesData?.items || [];
  const subjects = subjectsData?.items || [];
  const teachers = teachersData?.items || [];

  return (
    <Can permission={PERMISSIONS.TIMETABLE_UPDATE}>
      <div className="max-w-[1400px] mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Timetable Editor</h1>
              <p className="mt-2 text-sm text-gray-600">
                Create and manage class schedules
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => router.push('/timetable')}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={saveTimetableMutation.isPending || !selectedClass || !selectedSection}
              >
                {saveTimetableMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Timetable
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Class Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Select Class & Section</CardTitle>
            <CardDescription>Choose the class and section to edit timetable</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
                <Select
                  value={selectedClass}
                  onChange={(e) => {
                    setSelectedClass(e.target.value);
                    setSelectedSection('');
                    setPeriods([]);
                  }}
                >
                  <option value="">Select Class</option>
                  {classes.map((cls: any) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Section</label>
                <Select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  disabled={!selectedClass}
                >
                  <option value="">Select Section</option>
                  {selectedClass &&
                    classes
                      .find((c: any) => c.id === selectedClass)
                      ?.sections?.map((section: any) => (
                        <option key={section.id} value={section.id}>
                          {section.name}
                        </option>
                      ))}
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timetable Grid */}
        {selectedClass && selectedSection && (
          <Card>
            <CardHeader>
              <CardTitle>Weekly Schedule</CardTitle>
              <CardDescription>
                Click on a cell to add or edit a period. Empty cells can be filled with subjects.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border p-3 text-left text-sm font-semibold text-gray-700 min-w-[100px]">
                          Time
                        </th>
                        {DAYS.map((day) => (
                          <th key={day} className="border p-3 text-center text-sm font-semibold text-gray-700 min-w-[150px]">
                            {day}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {TIME_SLOTS.map((timeSlot) => (
                        <tr key={timeSlot.start} className={timeSlot.isBreak ? 'bg-yellow-50' : ''}>
                          <td className="border p-3 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <div>
                                <div className="font-medium">{timeSlot.start}</div>
                                <div className="text-xs text-gray-500">{timeSlot.end}</div>
                              </div>
                            </div>
                          </td>
                          {DAYS.map((day) => {
                            const period = getPeriodForSlot(day, timeSlot);
                            const isEditing = editingCell?.day === day && editingCell?.time === timeSlot.start;

                            if (timeSlot.isBreak) {
                              return (
                                <td key={day} className="border p-3 text-center">
                                  <Badge variant="warning" className="text-xs">
                                    Break
                                  </Badge>
                                </td>
                              );
                            }

                            return (
                              <td
                                key={day}
                                className={`border p-2 cursor-pointer hover:bg-gray-50 transition-colors ${
                                  isEditing ? 'bg-blue-50' : ''
                                }`}
                                onClick={() => {
                                  if (!isEditing) {
                                    setEditingCell({ day, time: timeSlot.start });
                                  }
                                }}
                              >
                                {period ? (
                                  <div className="space-y-1">
                                    <div className="flex items-center justify-between">
                                      <span className="font-medium text-sm text-blue-600">
                                        {subjects.find((s: any) => s.id === period.subjectId)?.name || 'Unknown'}
                                      </span>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          removePeriod(day, timeSlot.start);
                                        }}
                                        className="text-red-500 hover:text-red-700"
                                      >
                                        <X className="h-3 w-3" />
                                      </button>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-gray-600">
                                      <User className="h-3 w-3" />
                                      <span>{teachers.find((t: any) => t.id === period.teacherId)?.name || 'TBD'}</span>
                                    </div>
                                    {period.roomId && (
                                      <div className="flex items-center gap-1 text-xs text-gray-500">
                                        <MapPin className="h-3 w-3" />
                                        <span>Room {period.roomId}</span>
                                      </div>
                                    )}
                                  </div>
                                ) : isEditing ? (
                                  <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                                    <Select
                                      className="text-xs"
                                      onChange={(e) => {
                                        const subjectId = e.target.value;
                                        if (subjectId) {
                                          addPeriod(day, timeSlot, { subjectId, teacherId: '' });
                                        }
                                      }}
                                    >
                                      <option value="">Select Subject</option>
                                      {subjects.map((subject: any) => (
                                        <option key={subject.id} value={subject.id}>
                                          {subject.name}
                                        </option>
                                      ))}
                                    </Select>
                                  </div>
                                ) : (
                                  <div className="text-center text-gray-400 text-xs py-3">
                                    <Plus className="h-4 w-4 mx-auto" />
                                    <span>Add Period</span>
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        {(!selectedClass || !selectedSection) && (
          <Card className="mt-6 bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-blue-900">Getting Started</p>
                  <p className="text-sm text-blue-800 mt-1">
                    Select a class and section to start creating the timetable. You can add subjects, assign teachers, and specify room numbers for each period.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Can>
  );
}
