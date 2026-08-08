/**
 * Room Allocation Wizard Component
 * Comprehensive wizard for allocating students to hostel rooms
 * Features: Student selection, room availability, bulk allocation, conflict detection
 */

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Search, Users, Home, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { useAllocateRoom, useRooms, useDeallocateRoom } from './use-hostel';
import { useStudents } from '@/features/students/use-students';
import { cn } from '@/lib/utils';

const allocationSchema = z.object({
  studentId: z.string().min(1, 'Student is required'),
  roomId: z.string().min(1, 'Room is required'),
  allocationDate: z.string().min(1, 'Allocation date is required'),
  expiryDate: z.string().optional(),
  bedNumber: z.string().optional(),
  monthlyFee: z.number().min(0, 'Fee must be positive'),
  remarks: z.string().optional(),
});

type AllocationFormData = z.infer<typeof allocationSchema>;

interface RoomAllocationWizardProps {
  open: boolean;
  onClose: () => void;
  preSelectedStudentId?: string;
  preSelectedRoomId?: string;
}

export function RoomAllocationWizard({
  open,
  onClose,
  preSelectedStudentId,
  preSelectedRoomId,
}: RoomAllocationWizardProps) {
  const [step, setStep] = useState(1);
  const [selectedStudents, setSelectedStudents] = useState<string[]>(
    preSelectedStudentId ? [preSelectedStudentId] : []
  );
  const [selectedRoom, setSelectedRoom] = useState<string | null>(preSelectedRoomId || null);
  const [searchStudent, setSearchStudent] = useState('');
  const [searchRoom, setSearchRoom] = useState('');
  const [filterGender, setFilterGender] = useState<string>('all');
  const [filterClass, setFilterClass] = useState<string>('all');
  const [allocating, setAllocating] = useState(false);

  const allocateRoomMutation = useAllocateRoom();

  // Fetch students without transport
  const { data: studentsData, isLoading: loadingStudents } = useStudents({
    hasHostel: false, // Students not already allocated
  });

  // Fetch available rooms
  const { data: roomsData, isLoading: loadingRooms } = useRooms({
    status: 'AVAILABLE',
  });

  const students = Array.isArray(studentsData) ? studentsData : (studentsData as any)?.data || (studentsData as any)?.students || [];
  const rooms = Array.isArray(roomsData) ? roomsData : roomsData?.rooms || [];

  const form = useForm<AllocationFormData>({
    resolver: zodResolver(allocationSchema),
    defaultValues: {
      allocationDate: new Date().toISOString().split('T')[0],
      monthlyFee: 5000,
    },
  });

  const filteredStudents = students.filter((student: any) => {
    const matchesSearch =
      searchStudent === '' ||
      student.name.toLowerCase().includes(searchStudent.toLowerCase()) ||
      student.admissionNumber.toLowerCase().includes(searchStudent.toLowerCase());
    const matchesGender = filterGender === 'all' || student.gender === filterGender;
    const matchesClass = filterClass === 'all' || student.class === filterClass;
    return matchesSearch && matchesGender && matchesClass;
  });

  const filteredRooms = rooms.filter((room: any) => {
    const matchesSearch =
      searchRoom === '' ||
      room.roomNumber.toLowerCase().includes(searchRoom.toLowerCase()) ||
      room.hostelName.toLowerCase().includes(searchRoom.toLowerCase());
    
    // Filter by gender compatibility if students selected
    if (selectedStudents.length > 0) {
      const selectedStudent = students.find((s: any) => s.id === selectedStudents[0]);
      if (selectedStudent) {
        const genderMatch =
          (selectedStudent.gender === 'MALE' && room.type === 'BOYS') ||
          (selectedStudent.gender === 'FEMALE' && room.type === 'GIRLS');
        return matchesSearch && genderMatch;
      }
    }
    
    return matchesSearch;
  });

  const selectedRoomData = rooms.find((r: any) => r.id === selectedRoom);
  const availableCapacity = selectedRoomData
    ? selectedRoomData.capacity - selectedRoomData.currentOccupancy
    : 0;

  const canProceed = {
    step1: selectedStudents.length > 0,
    step2: selectedRoom !== null && selectedStudents.length <= availableCapacity,
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleAllocate = async () => {
    if (!selectedRoom) return;

    setAllocating(true);
    try {
      // Allocate each selected student
      for (const studentId of selectedStudents) {
        await allocateRoomMutation.mutateAsync({
          studentId,
          roomId: selectedRoom,
          allocationDate: form.getValues('allocationDate'),
          expiryDate: form.getValues('expiryDate'),
          bedNumber: form.getValues('bedNumber'),
          monthlyFee: form.getValues('monthlyFee'),
          remarks: form.getValues('remarks'),
        });
      }
      onClose();
      form.reset();
      setStep(1);
      setSelectedStudents([]);
      setSelectedRoom(null);
    } catch (error) {
      console.error('Allocation failed:', error);
    } finally {
      setAllocating(false);
    }
  };

  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Room Allocation Wizard</DialogTitle>
          <DialogDescription>
            Allocate students to hostel rooms in 3 easy steps
          </DialogDescription>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center font-semibold',
                step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              )}
            >
              1
            </div>
            <span className={cn('text-sm font-medium', step >= 1 ? 'text-gray-900' : 'text-gray-500')}>
              Select Students
            </span>
          </div>

          <div className="flex-1 h-1 bg-gray-200 mx-4">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: step >= 2 ? '100%' : '0%' }}
            />
          </div>

          <div className="flex items-center gap-2">
            <div
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center font-semibold',
                step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              )}
            >
              2
            </div>
            <span className={cn('text-sm font-medium', step >= 2 ? 'text-gray-900' : 'text-gray-500')}>
              Select Room
            </span>
          </div>

          <div className="flex-1 h-1 bg-gray-200 mx-4">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: step >= 3 ? '100%' : '0%' }}
            />
          </div>

          <div className="flex items-center gap-2">
            <div
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center font-semibold',
                step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              )}
            >
              3
            </div>
            <span className={cn('text-sm font-medium', step >= 3 ? 'text-gray-900' : 'text-gray-500')}>
              Confirm
            </span>
          </div>
        </div>

        {/* Step 1: Select Students */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name or admission number..."
                  value={searchStudent}
                  onChange={(e) => setSearchStudent(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterGender} onValueChange={setFilterGender}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Genders</SelectItem>
                  <SelectItem value="MALE">Male</SelectItem>
                  <SelectItem value="FEMALE">Female</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterClass} onValueChange={setFilterClass}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  <SelectItem value="9">Class 9</SelectItem>
                  <SelectItem value="10">Class 10</SelectItem>
                  <SelectItem value="11">Class 11</SelectItem>
                  <SelectItem value="12">Class 12</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedStudents.length > 0 && (
              <Alert>
                <Users className="h-4 w-4" />
                <AlertDescription>
                  {selectedStudents.length} student{selectedStudents.length > 1 ? 's' : ''} selected
                </AlertDescription>
              </Alert>
            )}

            <div className="border rounded-lg max-h-96 overflow-y-auto">
              {loadingStudents ? (
                <div className="p-8 text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">Loading students...</p>
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="p-8 text-center text-gray-600">
                  <Users className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p>No students found</p>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredStudents.map((student: any) => (
                    <div
                      key={student.id}
                      className={cn(
                        'p-4 hover:bg-gray-50 cursor-pointer transition-colors',
                        selectedStudents.includes(student.id) && 'bg-blue-50'
                      )}
                      onClick={() => toggleStudentSelection(student.id)}
                    >
                      <div className="flex items-center gap-4">
                        <Checkbox
                          checked={selectedStudents.includes(student.id)}
                          onCheckedChange={() => toggleStudentSelection(student.id)}
                        />
                        <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                          <span className="text-lg font-semibold text-indigo-600">
                            {student.name.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{student.name}</p>
                          <p className="text-sm text-gray-600">
                            {student.class} • {student.admissionNumber}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant={student.gender === 'MALE' ? 'default' : 'secondary'}>
                            {student.gender}
                          </Badge>
                          <p className="text-xs text-gray-600 mt-1">{student.parentContact}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Select Room */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by room number or hostel name..."
                value={searchRoom}
                onChange={(e) => setSearchRoom(e.target.value)}
                className="pl-10"
              />
            </div>

            {selectedRoom && (
              <Alert>
                <Home className="h-4 w-4" />
                <AlertDescription>
                  Room {selectedRoomData?.roomNumber} selected • {availableCapacity} bed
                  {availableCapacity !== 1 ? 's' : ''} available
                </AlertDescription>
              </Alert>
            )}

            {selectedStudents.length > availableCapacity && selectedRoom && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Not enough capacity! Selected {selectedStudents.length} students but only{' '}
                  {availableCapacity} beds available.
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
              {loadingRooms ? (
                <div className="col-span-2 p-8 text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">Loading rooms...</p>
                </div>
              ) : filteredRooms.length === 0 ? (
                <div className="col-span-2 p-8 text-center text-gray-600">
                  <Home className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p>No available rooms found</p>
                </div>
              ) : (
                filteredRooms.map((room: any) => (
                  <Card
                    key={room.id}
                    className={cn(
                      'cursor-pointer transition-all hover:shadow-md',
                      selectedRoom === room.id && 'ring-2 ring-blue-600'
                    )}
                    onClick={() => setSelectedRoom(room.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-bold text-lg text-gray-900">Room {room.roomNumber}</p>
                          <p className="text-sm text-gray-600">
                            Floor {room.floor} • {room.hostelName}
                          </p>
                        </div>
                        {selectedRoom === room.id && (
                          <CheckCircle2 className="h-5 w-5 text-blue-600" />
                        )}
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Capacity:</span>
                          <span className="font-semibold">
                            {room.currentOccupancy}/{room.capacity}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Available:</span>
                          <span className="font-semibold text-green-600">
                            {room.capacity - room.currentOccupancy} beds
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Type:</span>
                          <Badge variant="secondary">{room.type}</Badge>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t">
                        <p className="text-xs text-gray-600 mb-1">Facilities:</p>
                        <div className="flex flex-wrap gap-1">
                          {room.facilities.slice(0, 3).map((facility: string) => (
                            <Badge key={facility} variant="outline" className="text-xs">
                              {facility}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {/* Step 3: Confirm Allocation */}
        {step === 3 && (
          <form onSubmit={form.handleSubmit(handleAllocate)} className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">Allocation Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Students:</span>
                  <span className="font-semibold">{selectedStudents.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Room:</span>
                  <span className="font-semibold">
                    {selectedRoomData?.roomNumber} ({selectedRoomData?.hostelName})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Remaining Capacity:</span>
                  <span className="font-semibold">
                    {availableCapacity - selectedStudents.length} beds
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="allocationDate">Allocation Date *</Label>
                <Input
                  id="allocationDate"
                  type="date"
                  {...form.register('allocationDate')}
                />
                {form.formState.errors.allocationDate && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.allocationDate.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="expiryDate">Expiry Date (Optional)</Label>
                <Input id="expiryDate" type="date" {...form.register('expiryDate')} />
              </div>

              <div>
                <Label htmlFor="bedNumber">Bed Number (Optional)</Label>
                <Input
                  id="bedNumber"
                  placeholder="e.g., B1, B2"
                  {...form.register('bedNumber')}
                />
              </div>

              <div>
                <Label htmlFor="monthlyFee">Monthly Fee (₹) *</Label>
                <Input
                  id="monthlyFee"
                  type="number"
                  {...form.register('monthlyFee', { valueAsNumber: true })}
                />
                {form.formState.errors.monthlyFee && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.monthlyFee.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="remarks">Remarks (Optional)</Label>
              <textarea
                id="remarks"
                rows={3}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                placeholder="Any additional notes..."
                {...form.register('remarks')}
              />
            </div>

            <div className="border rounded-lg p-4 max-h-48 overflow-y-auto">
              <p className="font-semibold text-gray-900 mb-3">Selected Students:</p>
              <div className="space-y-2">
                {selectedStudents.map((studentId) => {
                  const student = students.find((s: any) => s.id === studentId);
                  return (
                    <div key={studentId} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold text-indigo-600">
                            {student?.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{student?.name}</p>
                          <p className="text-xs text-gray-600">
                            {student?.class} • {student?.admissionNumber}
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary">{student?.gender}</Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          </form>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button type="button" variant="outline" onClick={step === 1 ? onClose : handleBack}>
            {step === 1 ? 'Cancel' : 'Back'}
          </Button>

          {step < 3 ? (
            <Button
              type="button"
              onClick={handleNext}
              disabled={
                (step === 1 && !canProceed.step1) ||
                (step === 2 && !canProceed.step2)
              }
            >
              Next
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleAllocate}
              disabled={allocating || !selectedRoom || selectedStudents.length === 0}
            >
              {allocating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Allocating...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Confirm Allocation
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
