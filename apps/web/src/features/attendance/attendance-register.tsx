'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { attendanceService } from '@/services/attendance.service';
import { toast } from 'sonner';
import { Check, X, Clock } from 'lucide-react';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  rollNumber: string;
  profilePicture?: string;
}

interface AttendanceRegisterProps {
  sectionId: string;
  students: Student[];
  date: string;
}

type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';

export function AttendanceRegister({
  sectionId,
  students,
  date,
}: AttendanceRegisterProps) {
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>(
    students.reduce((acc, student) => ({ ...acc, [student.id]: 'PRESENT' }), {})
  );
  const [notes, setNotes] = useState<Record<string, string>>({});

  const queryClient = useQueryClient();

  const markAttendanceMutation = useMutation({
    mutationFn: () =>
      attendanceService.markAttendance({
        sectionId,
        date,
        attendance: Object.entries(attendance).map(([studentId, status]) => ({
          studentId,
          status,
          notes: notes[studentId],
        })),
      }),
    onSuccess: () => {
      toast.success('Attendance marked successfully');
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
    onError: () => {
      toast.error('Failed to mark attendance');
    },
  });

  const toggleStatus = (studentId: string, status: AttendanceStatus) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: prev[studentId] === status ? 'PRESENT' : status,
    }));
  };

  const markAll = (status: AttendanceStatus) => {
    const newAttendance = students.reduce(
      (acc, student) => ({ ...acc, [student.id]: status }),
      {}
    );
    setAttendance(newAttendance);
  };

  const getStatusColor = (status: AttendanceStatus) => {
    switch (status) {
      case 'PRESENT':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'ABSENT':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'LATE':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'EXCUSED':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const counts = {
    present: Object.values(attendance).filter((s) => s === 'PRESENT').length,
    absent: Object.values(attendance).filter((s) => s === 'ABSENT').length,
    late: Object.values(attendance).filter((s) => s === 'LATE').length,
    excused: Object.values(attendance).filter((s) => s === 'EXCUSED').length,
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Present</p>
              <p className="text-2xl font-bold text-green-600">{counts.present}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Absent</p>
              <p className="text-2xl font-bold text-red-600">{counts.absent}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Late</p>
              <p className="text-2xl font-bold text-yellow-600">{counts.late}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Excused</p>
              <p className="text-2xl font-bold text-blue-600">{counts.excused}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bulk Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => markAll('PRESENT')}
            >
              Mark All Present
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => markAll('ABSENT')}
            >
              Mark All Absent
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Student List */}
      <Card>
        <CardHeader>
          <CardTitle>Student Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {students.map((student) => {
              const status = attendance[student.id];
              return (
                <div
                  key={student.id}
                  className={`border rounded-lg p-4 ${getStatusColor(status)}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center font-bold text-gray-600">
                        {student.firstName[0]}
                        {student.lastName[0]}
                      </div>
                      <div>
                        <p className="font-medium">
                          {student.firstName} {student.lastName}
                        </p>
                        <p className="text-sm opacity-75">
                          Roll No: {student.rollNumber}
                        </p>
                      </div>
                    </div>
                    <Badge variant={status === 'PRESENT' ? 'success' : 'default'}>
                      {status}
                    </Badge>
                  </div>

                  {/* Status Buttons */}
                  <div className="flex gap-2 mb-2">
                    <Button
                      size="sm"
                      variant={status === 'PRESENT' ? 'default' : 'outline'}
                      onClick={() => toggleStatus(student.id, 'PRESENT')}
                      className="flex-1"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Present
                    </Button>
                    <Button
                      size="sm"
                      variant={status === 'ABSENT' ? 'default' : 'outline'}
                      onClick={() => toggleStatus(student.id, 'ABSENT')}
                      className="flex-1"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Absent
                    </Button>
                    <Button
                      size="sm"
                      variant={status === 'LATE' ? 'default' : 'outline'}
                      onClick={() => toggleStatus(student.id, 'LATE')}
                      className="flex-1"
                    >
                      <Clock className="h-4 w-4 mr-1" />
                      Late
                    </Button>
                    <Button
                      size="sm"
                      variant={status === 'EXCUSED' ? 'default' : 'outline'}
                      onClick={() => toggleStatus(student.id, 'EXCUSED')}
                      className="flex-1"
                    >
                      Excused
                    </Button>
                  </div>

                  {/* Notes */}
                  {(status === 'ABSENT' || status === 'LATE' || status === 'EXCUSED') && (
                    <textarea
                      placeholder="Add notes (optional)..."
                      value={notes[student.id] || ''}
                      onChange={(e) =>
                        setNotes((prev) => ({
                          ...prev,
                          [student.id]: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      rows={2}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => window.history.back()}>
          Cancel
        </Button>
        <Button
          onClick={() => markAttendanceMutation.mutate()}
          disabled={markAttendanceMutation.isPending}
        >
          {markAttendanceMutation.isPending ? 'Saving...' : 'Submit Attendance'}
        </Button>
      </div>
    </div>
  );
}
