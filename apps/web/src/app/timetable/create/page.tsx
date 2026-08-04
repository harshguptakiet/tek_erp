/**
 * Module 04: Academic - Timetable Editor/Creator
 * FR-TIME-001 to FR-TIME-010: Create and manage timetables
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Can } from '@/components/auth/can';
import { PERMISSIONS } from '@/config/permissions';
import { toast } from 'sonner';
import { academicService } from '@/services/academic.service';
import { userService } from '@/services/user.service';
import { useAuthStore } from '@/stores/auth.store';

interface Period {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  subjectId?: string;
  teacherId?: string;
  roomId?: string;
}

export default function TimetableCreatePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [academicYear, setAcademicYear] = useState('2024-2025');
  const [periods, setPeriods] = useState<Period[]>([]);

  // Real API integration
  const { data: classResponse } = useQuery({
    queryKey: ['classes', user?.schoolId],
    queryFn: () => academicService.getClassStructure(user?.schoolId || ''),
    enabled: !!user?.schoolId,
  });

  const { data: subjectsResponse } = useQuery({
    queryKey: ['subjects', user?.schoolId, selectedClass],
    queryFn: () => academicService.getSubjects(user?.schoolId || '', selectedClass),
    enabled: !!user?.schoolId && !!selectedClass,
  });

  const { data: teachersResponse } = useQuery({
    queryKey: ['teachers', user?.schoolId],
    queryFn: () => userService.listTeachers(user?.schoolId || ''),
    enabled: !!user?.schoolId,
  });

  // Transform API data
  const classData = Array.isArray(classResponse) ? classResponse : classResponse?.classes || [];
  const subjectsData = Array.isArray(subjectsResponse) ? subjectsResponse : subjectsResponse?.subjects || [];
  const teachersData = Array.isArray(teachersResponse) ? teachersResponse : teachersResponse?.data || [];

  const { data: roomsResponse } = useQuery({
    queryKey: ['rooms', user?.schoolId],
    queryFn: () => academicService.getRooms(user?.schoolId || ''),
    enabled: !!user?.schoolId,
  });

  const roomsData = Array.isArray(roomsResponse) ? roomsResponse : roomsResponse?.rooms || [];

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const timeSlots = [
    { start: '08:00', end: '08:45' },
    { start: '08:45', end: '09:30' },
    { start: '09:30', end: '10:15' },
    { start: '10:15', end: '11:00' },
    { start: '11:00', end: '11:45' },
    { start: '11:45', end: '12:30' },
    { start: '12:30', end: '13:15' },
    { start: '13:15', end: '14:00' },
  ];

  // Initialize empty timetable
  const initializeTimetable = () => {
    const initialPeriods: Period[] = [];
    days.forEach((day) => {
      timeSlots.forEach((slot) => {
        initialPeriods.push({
          id: `${day}-${slot.start}`,
          day,
          startTime: slot.start,
          endTime: slot.end,
        });
      });
    });
    setPeriods(initialPeriods);
  };

  const updatePeriod = (periodId: string, field: keyof Period, value: string) => {
    setPeriods(
      periods.map((p) =>
        p.id === periodId ? { ...p, [field]: value } : p
      )
    );
  };

  const clearPeriod = (periodId: string) => {
    setPeriods(
      periods.map((p) =>
        p.id === periodId
          ? { ...p, subjectId: undefined, teacherId: undefined, roomId: undefined }
          : p
      )
    );
  };

  const saveMutation = useMutation({
    mutationFn: () => academicService.createTimetable(user?.schoolId || '', {
      classId: selectedClass,
      section: selectedSection,
      academicYear,
      periods: periods.filter(p => p.subjectId), // Only save assigned periods
    }),
    onSuccess: () => {
      toast.success('Timetable created successfully');
      router.push('/timetable');
    },
    onError: () => {
      toast.error('Failed to create timetable');
    },
  });

  const getSubjectForPeriod = (periodId: string) => {
    const period = periods.find((p) => p.id === periodId);
    if (!period?.subjectId) return null;
    return subjectsData?.find((s: any) => s.id === period.subjectId);
  };

  const getTeacherForPeriod = (periodId: string) => {
    const period = periods.find((p) => p.id === periodId);
    if (!period?.teacherId) return null;
    return teachersData?.find((t: any) => t.id === period.teacherId);
  };

  const getRoomForPeriod = (periodId: string) => {
    const period = periods.find((p) => p.id === periodId);
    if (!period?.roomId) return null;
    return roomsData?.find((r: any) => r.id === period.roomId);
  };

  const isPeriodAssigned = (periodId: string) => {
    const period = periods.find((p) => p.id === periodId);
    return period?.subjectId && period?.teacherId;
  };

  return (
    <Can
      permission={PERMISSIONS.TIMETABLE_CREATE}
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-gray-600">You don't have permission to create timetables</p>
            <Button className="mt-4" onClick={() => router.push('/timetable')}>
              Back to Timetable
            </Button>
          </div>
        </div>
      }
    >
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Button variant="ghost" size="sm" onClick={() => router.push('/timetable')}>
              ← Back to Timetable
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Create Timetable</h1>
          <p className="mt-2 text-sm text-gray-600">
            Set up class schedule for the academic year
          </p>
        </div>

        {/* Configuration */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Timetable Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Academic Year *
                </label>
                <Select value={academicYear} onChange={(e) => setAcademicYear(e.target.value)}>
                  <option value="2024-2025">2024-2025</option>
                  <option value="2025-2026">2025-2026</option>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Class *
                </label>
                <Select
                  value={selectedClass}
                  onChange={(e) => {
                    setSelectedClass(e.target.value);
                    setSelectedSection('');
                  }}
                >
                  <option value="">Select Class</option>
                  {classData?.map((cls: any) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Section *
                </label>
                <Select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  disabled={!selectedClass}
                >
                  <option value="">Select Section</option>
                  {classData
                    ?.find((c: any) => c.id === selectedClass)
                    ?.sections.map((section: string) => (
                      <option key={section} value={section}>
                        Section {section}
                      </option>
                    ))}
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  onClick={initializeTimetable}
                  disabled={!selectedClass || !selectedSection}
                  className="w-full"
                >
                  Initialize Timetable
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timetable Grid */}
        {periods.length > 0 && (
          <>
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    Weekly Schedule - {classData?.find((c: any) => c.id === selectedClass)?.name} Section {selectedSection}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setPeriods([])}>
                      Clear All
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => saveMutation.mutate()}
                      disabled={saveMutation.isPending}
                    >
                      {saveMutation.isPending ? 'Saving...' : 'Save Timetable'}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="border p-2 bg-gray-50 text-sm font-medium text-gray-700">
                          Time
                        </th>
                        {days.map((day) => (
                          <th key={day} className="border p-2 bg-gray-50 text-sm font-medium text-gray-700">
                            {day}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {timeSlots.map((slot) => (
                        <tr key={slot.start}>
                          <td className="border p-2 bg-gray-50 text-xs font-medium text-gray-700">
                            {slot.start}
                            <br />
                            {slot.end}
                          </td>
                          {days.map((day) => {
                            const periodId = `${day}-${slot.start}`;
                            const subject = getSubjectForPeriod(periodId);
                            const teacher = getTeacherForPeriod(periodId);
                            const room = getRoomForPeriod(periodId);
                            const isAssigned = isPeriodAssigned(periodId);

                            return (
                              <td key={periodId} className="border p-2">
                                {isAssigned ? (
                                  <div className={`p-2 rounded ${subject?.color || 'bg-gray-100'}`}>
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-xs font-semibold">{subject?.code}</span>
                                      <button
                                        onClick={() => clearPeriod(periodId)}
                                        className="text-gray-500 hover:text-red-600"
                                      >
                                        ×
                                      </button>
                                    </div>
                                    <p className="text-xs text-gray-700 truncate">
                                      {teacher?.name.split(' ')[0]}
                                    </p>
                                    {room && (
                                      <p className="text-xs text-gray-600">{room.name}</p>
                                    )}
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => {
                                      const modal = document.getElementById(`modal-${periodId}`);
                                      if (modal) (modal as HTMLDialogElement).showModal();
                                    }}
                                    className="w-full h-full min-h-[80px] hover:bg-gray-50 text-gray-400 text-xs rounded transition-colors"
                                  >
                                    + Add
                                  </button>
                                )}

                                {/* Period Assignment Modal */}
                                <dialog
                                  id={`modal-${periodId}`}
                                  className="rounded-lg p-6 shadow-xl backdrop:bg-black backdrop:bg-opacity-50"
                                >
                                  <div className="min-w-[400px]">
                                    <div className="flex items-center justify-between mb-4">
                                      <h3 className="font-bold text-lg">
                                        Assign Period - {day} {slot.start}
                                      </h3>
                                      <button
                                        onClick={() => {
                                          const modal = document.getElementById(`modal-${periodId}`);
                                          if (modal) (modal as HTMLDialogElement).close();
                                        }}
                                        className="text-gray-500 hover:text-gray-700"
                                      >
                                        ×
                                      </button>
                                    </div>

                                    <div className="space-y-4">
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                          Subject *
                                        </label>
                                        <Select
                                          value={periods.find((p) => p.id === periodId)?.subjectId || ''}
                                          onChange={(e) => updatePeriod(periodId, 'subjectId', e.target.value)}
                                        >
                                          <option value="">Select Subject</option>
                                          {subjectsData?.map((subject: any) => (
                                            <option key={subject.id} value={subject.id}>
                                              {subject.name}
                                            </option>
                                          ))}
                                        </Select>
                                      </div>

                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                          Teacher *
                                        </label>
                                        <Select
                                          value={periods.find((p) => p.id === periodId)?.teacherId || ''}
                                          onChange={(e) => updatePeriod(periodId, 'teacherId', e.target.value)}
                                        >
                                          <option value="">Select Teacher</option>
                                          {teachersData?.map((teacher: any) => (
                                            <option key={teacher.id} value={teacher.id}>
                                              {teacher.name} ({teacher.subject})
                                            </option>
                                          ))}
                                        </Select>
                                      </div>

                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                          Room
                                        </label>
                                        <Select
                                          value={periods.find((p) => p.id === periodId)?.roomId || ''}
                                          onChange={(e) => updatePeriod(periodId, 'roomId', e.target.value)}
                                        >
                                          <option value="">Select Room</option>
                                          {roomsData?.map((room: any) => (
                                            <option key={room.id} value={room.id}>
                                              {room.name} - {room.type} (Capacity: {room.capacity})
                                            </option>
                                          ))}
                                        </Select>
                                      </div>

                                      <div className="flex gap-2 pt-4">
                                        <Button
                                          variant="outline"
                                          onClick={() => {
                                            const modal = document.getElementById(`modal-${periodId}`);
                                            if (modal) (modal as HTMLDialogElement).close();
                                          }}
                                          className="flex-1"
                                        >
                                          Cancel
                                        </Button>
                                        <Button
                                          onClick={() => {
                                            const modal = document.getElementById(`modal-${periodId}`);
                                            if (modal) (modal as HTMLDialogElement).close();
                                          }}
                                          className="flex-1"
                                          disabled={!isPeriodAssigned(periodId)}
                                        >
                                          Assign
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                </dialog>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Legend */}
            <Card>
              <CardHeader>
                <CardTitle>Subject Legend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
                  {subjectsData?.map((subject: any) => (
                    <div key={subject.id} className={`p-2 rounded ${subject.color}`}>
                      <p className="text-xs font-semibold">{subject.code}</p>
                      <p className="text-xs">{subject.name}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Instructions */}
        {periods.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">
                  Select a class and section, then click "Initialize Timetable" to start creating the schedule
                </p>
                <div className="text-sm text-gray-500 space-y-2">
                  <p>📅 Click on any empty period to assign a subject and teacher</p>
                  <p>✏️ Click the × on an assigned period to clear it</p>
                  <p>💾 Don't forget to save your timetable when done</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Can>
  );
}
