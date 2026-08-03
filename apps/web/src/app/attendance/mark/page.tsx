/**
 * Module 10: Attendance - Mark Attendance
 * FR-ATT-001: Mark daily attendance for classes
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Can } from '@/components/auth/can';
import { PERMISSIONS } from '@/config/permissions';
import { toast } from 'sonner';

type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY' | 'EXCUSED';

interface Student {
  id: string;
  admissionNumber: string;
  name: string;
  rollNumber: string;
  status: AttendanceStatus;
  remarks?: string;
}

export default function MarkAttendancePage() {
  const router = useRouter();
  const today = new Date().toISOString().split('T')[0];
  
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [bulkAction, setBulkAction] = useState<AttendanceStatus | ''>('');

  // Mock data - replace with actual API
  const { data: classesData } = useQuery({
    queryKey: ['classes'],
    queryFn: async () => [
      { id: 'c1', name: 'Class 9', sections: ['A', 'B', 'C'] },
      { id: 'c2', name: 'Class 10', sections: ['A', 'B', 'C', 'D'] },
      { id: 'c3', name: 'Class 11', sections: ['A', 'B'] },
      { id: 'c4', name: 'Class 12', sections: ['A', 'B'] },
    ],
  });

  const { data: subjectsData } = useQuery({
    queryKey: ['subjects'],
    queryFn: async () => [
      { id: 's1', name: 'Mathematics', code: 'MATH' },
      { id: 's2', name: 'Physics', code: 'PHY' },
      { id: 's3', name: 'Chemistry', code: 'CHEM' },
      { id: 's4', name: 'English', code: 'ENG' },
      { id: 's5', name: 'Hindi', code: 'HIN' },
    ],
  });

  // Load students when class and section are selected
  const { data: studentsData, isLoading: loadingStudents } = useQuery({
    queryKey: ['students', selectedClass, selectedSection],
    queryFn: async () => {
      if (!selectedClass || !selectedSection) return [];
      await new Promise((resolve) => setTimeout(resolve, 800));
      return [
        { id: 's1', admissionNumber: 'ADM001', name: 'Aarav Kumar', rollNumber: '1' },
        { id: 's2', admissionNumber: 'ADM002', name: 'Priya Sharma', rollNumber: '2' },
        { id: 's3', admissionNumber: 'ADM003', name: 'Rahul Verma', rollNumber: '3' },
        { id: 's4', admissionNumber: 'ADM004', name: 'Ananya Singh', rollNumber: '4' },
        { id: 's5', admissionNumber: 'ADM005', name: 'Arjun Patel', rollNumber: '5' },
        { id: 's6', admissionNumber: 'ADM006', name: 'Diya Reddy', rollNumber: '6' },
        { id: 's7', admissionNumber: 'ADM007', name: 'Vivaan Gupta', rollNumber: '7' },
        { id: 's8', admissionNumber: 'ADM008', name: 'Ishita Joshi', rollNumber: '8' },
      ].map(s => ({ ...s, status: 'PRESENT' as AttendanceStatus }));
    },
    enabled: !!selectedClass && !!selectedSection,
  });

  // Initialize students when data loads
  useState(() => {
    if (studentsData) {
      setStudents(studentsData);
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return data;
    },
    onSuccess: () => {
      toast.success('Attendance saved successfully');
      router.push('/attendance');
    },
    onError: () => {
      toast.error('Failed to save attendance');
    },
  });


  const updateStudentStatus = (studentId: string, status: AttendanceStatus) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, status } : s))
    );
  };

  const updateStudentRemarks = (studentId: string, remarks: string) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, remarks } : s))
    );
  };

  const applyBulkAction = () => {
    if (bulkAction) {
      setStudents((prev) => prev.map((s) => ({ ...s, status: bulkAction })));
      toast.success(`Marked all as ${bulkAction.toLowerCase()}`);
      setBulkAction('');
    }
  };

  const handleSave = () => {
    if (!selectedClass || !selectedSection || !selectedSubject) {
      toast.error('Please select class, section, and subject');
      return;
    }

    const attendanceData = {
      date: selectedDate,
      classId: selectedClass,
      section: selectedSection,
      subjectId: selectedSubject,
      records: students.map((s) => ({
        studentId: s.id,
        status: s.status,
        remarks: s.remarks,
      })),
    };

    saveMutation.mutate(attendanceData);
  };

  const selectedClassData = classesData?.find((c: any) => c.id === selectedClass);
  
  const filteredStudents = students.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.admissionNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.rollNumber.includes(searchQuery)
  );

  const stats = {
    total: students.length,
    present: students.filter((s) => s.status === 'PRESENT').length,
    absent: students.filter((s) => s.status === 'ABSENT').length,
    late: students.filter((s) => s.status === 'LATE').length,
  };

  const attendancePercentage = stats.total > 0 
    ? ((stats.present / stats.total) * 100).toFixed(1) 
    : 0;


  return (
    <Can
      permission={PERMISSIONS.ATTENDANCE_MARK}
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-gray-600">You don't have permission to mark attendance</p>
            <Button className="mt-4" onClick={() => router.push('/attendance')}>
              Back to Attendance
            </Button>
          </div>
        </div>
      }
    >
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Button variant="ghost" size="sm" onClick={() => router.push('/attendance')}>
              ← Back
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mark Attendance</h1>
              <p className="mt-2 text-sm text-gray-600">
                Record student attendance for classes and subjects
              </p>
            </div>
            <Badge variant="info" className="text-lg px-4 py-2">
              📅 {new Date(selectedDate).toLocaleDateString('en-IN', { 
                weekday: 'short', 
                day: 'numeric', 
                month: 'short', 
                year: 'numeric' 
              })}
            </Badge>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Select Class Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date *
                </label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  max={today}
                />
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
                  {classesData?.map((cls: any) => (
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
                  {selectedClassData?.sections.map((section: string) => (
                    <option key={section} value={section}>
                      Section {section}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject *
                </label>
                <Select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                >
                  <option value="">Select Subject</option>
                  {subjectsData?.map((subject: any) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Students List */}
        {selectedClass && selectedSection && (
          <>
            {/* Stats and Actions */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Present</p>
                    <p className="text-2xl font-bold text-green-600">{stats.present}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Absent</p>
                    <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Late</p>
                    <p className="text-2xl font-bold text-orange-600">{stats.late}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Percentage</p>
                    <p className="text-2xl font-bold text-blue-600">{attendancePercentage}%</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Student List ({filteredStudents.length})</CardTitle>
                  <div className="flex items-center gap-2">
                    <Select
                      value={bulkAction}
                      onChange={(e) => setBulkAction(e.target.value as AttendanceStatus | '')}
                      className="w-40"
                    >
                      <option value="">Bulk Action</option>
                      <option value="PRESENT">Mark All Present</option>
                      <option value="ABSENT">Mark All Absent</option>
                      <option value="LATE">Mark All Late</option>
                    </Select>
                    {bulkAction && (
                      <Button size="sm" onClick={applyBulkAction}>
                        Apply
                      </Button>
                    )}
                  </div>
                </div>
                <div className="mt-4">
                  <Input
                    placeholder="Search by name, admission number, or roll number..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent>
                {loadingStudents ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">Loading students...</p>
                  </div>
                ) : filteredStudents.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">No students found</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredStudents.map((student) => (
                      <div
                        key={student.id}
                        className="border rounded-lg p-4 bg-gray-50"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                                {student.rollNumber}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">{student.name}</p>
                                <p className="text-sm text-gray-600">
                                  {student.admissionNumber}
                                </p>
                              </div>
                            </div>

                            <div className="grid grid-cols-5 gap-2 mt-3">
                              <button
                                type="button"
                                onClick={() => updateStudentStatus(student.id, 'PRESENT')}
                                className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                                  student.status === 'PRESENT'
                                    ? 'bg-green-600 text-white'
                                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                }`}
                              >
                                ✓ Present
                              </button>

                              <button
                                type="button"
                                onClick={() => updateStudentStatus(student.id, 'ABSENT')}
                                className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                                  student.status === 'ABSENT'
                                    ? 'bg-red-600 text-white'
                                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                }`}
                              >
                                ✗ Absent
                              </button>

                              <button
                                type="button"
                                onClick={() => updateStudentStatus(student.id, 'LATE')}
                                className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                                  student.status === 'LATE'
                                    ? 'bg-orange-600 text-white'
                                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                }`}
                              >
                                ⏰ Late
                              </button>

                              <button
                                type="button"
                                onClick={() => updateStudentStatus(student.id, 'HALF_DAY')}
                                className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                                  student.status === 'HALF_DAY'
                                    ? 'bg-yellow-600 text-white'
                                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                }`}
                              >
                                ½ Half Day
                              </button>

                              <button
                                type="button"
                                onClick={() => updateStudentStatus(student.id, 'EXCUSED')}
                                className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                                  student.status === 'EXCUSED'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                }`}
                              >
                                📝 Excused
                              </button>
                            </div>

                            {(student.status === 'ABSENT' || 
                              student.status === 'LATE' || 
                              student.status === 'EXCUSED') && (
                              <div className="mt-3">
                                <Input
                                  placeholder="Add remarks (optional)..."
                                  value={student.remarks || ''}
                                  onChange={(e) =>
                                    updateStudentRemarks(student.id, e.target.value)
                                  }
                                  className="text-sm"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex items-center justify-end gap-4 mt-6">
              <Button
                variant="outline"
                onClick={() => router.push('/attendance')}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={saveMutation.isPending || !selectedSubject}
                className="px-8"
              >
                {saveMutation.isPending ? 'Saving...' : 'Save Attendance'}
              </Button>
            </div>
          </>
        )}

        {!selectedClass && (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600">
              Please select class, section, and subject to start marking attendance
            </p>
          </div>
        )}
      </div>
    </Can>
  );
}
