/**
 * Student Promotion Wizard
 * Bulk promote students to next class/year
 */

'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  ArrowRight,
  Users,
  CheckCircle,
  AlertCircle,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';

interface Student {
  id: string;
  rollNumber: string;
  name: string;
  currentClass: string;
  promoted: boolean;
  failed: boolean;
  remarks?: string;
}

interface PromotionWizardProps {
  sourceYearId: string;
  sourceYearName: string;
  targetYearId: string;
  targetYearName: string;
  onComplete: () => void;
  onCancel: () => void;
}

export function StudentPromotionWizard({
  sourceYearId,
  sourceYearName,
  targetYearId,
  targetYearName,
  onComplete,
  onCancel,
}: PromotionWizardProps) {
  const [step, setStep] = useState(1);
  const [selectedClass, setSelectedClass] = useState('');
  const [targetClass, setTargetClass] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);

  // Mock data - replace with actual API
  const classes = [
    { id: 'class-9', name: 'Class 9', students: 45 },
    { id: 'class-10', name: 'Class 10', students: 42 },
    { id: 'class-11', name: 'Class 11', students: 38 },
  ];

  const mockStudents: Student[] = [
    { id: '1', rollNumber: '101', name: 'John Doe', currentClass: 'Class 9', promoted: true, failed: false },
    { id: '2', rollNumber: '102', name: 'Jane Smith', currentClass: 'Class 9', promoted: true, failed: false },
    { id: '3', rollNumber: '103', name: 'Bob Johnson', currentClass: 'Class 9', promoted: false, failed: true, remarks: 'Failed in Math' },
    { id: '4', rollNumber: '104', name: 'Alice Williams', currentClass: 'Class 9', promoted: true, failed: false },
    { id: '5', rollNumber: '105', name: 'Charlie Brown', currentClass: 'Class 9', promoted: true, failed: false },
  ];

  const handleLoadStudents = () => {
    if (!selectedClass) {
      toast.error('Please select a class');
      return;
    }
    // Load students from selected class
    setStudents(mockStudents);
    // Auto-select promoted students
    const promotedIds = new Set(mockStudents.filter((s) => s.promoted).map((s) => s.id));
    setSelectedStudents(promotedIds);
    setStep(2);
  };

  const toggleStudent = (studentId: string) => {
    const newSelected = new Set(selectedStudents);
    if (newSelected.has(studentId)) {
      newSelected.delete(studentId);
    } else {
      newSelected.add(studentId);
    }
    setSelectedStudents(newSelected);
  };

  const toggleAll = () => {
    if (selectedStudents.size === students.filter((s) => !s.failed).length) {
      setSelectedStudents(new Set());
    } else {
      const allPromoted = new Set(students.filter((s) => !s.failed).map((s) => s.id));
      setSelectedStudents(allPromoted);
    }
  };

  const handlePromote = async () => {
    if (!targetClass) {
      toast.error('Please select target class');
      return;
    }

    if (selectedStudents.size === 0) {
      toast.error('Please select at least one student');
      return;
    }

    setIsProcessing(true);
    try {
      // TODO: Replace with actual API call
      console.log('Promoting students:', {
        studentIds: Array.from(selectedStudents),
        targetClass,
        sourceYear: sourceYearId,
        targetYear: targetYearId,
      });
      await new Promise((resolve) => setTimeout(resolve, 2000));
      toast.success(`Successfully promoted ${selectedStudents.size} students`);
      setStep(3);
    } catch (error) {
      toast.error('Failed to promote students');
    } finally {
      setIsProcessing(false);
    }
  };

  const promotedCount = students.filter((s) => s.promoted).length;
  const failedCount = students.filter((s) => s.failed).length;

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-4">
        <div className={`flex items-center gap-2 ${step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
            1
          </div>
          <span className="text-sm font-medium">Select Class</span>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground" />
        <div className={`flex items-center gap-2 ${step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
            2
          </div>
          <span className="text-sm font-medium">Review Students</span>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground" />
        <div className={`flex items-center gap-2 ${step >= 3 ? 'text-primary' : 'text-muted-foreground'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
            3
          </div>
          <span className="text-sm font-medium">Complete</span>
        </div>
      </div>

      {/* Step 1: Select Class */}
      {step === 1 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Select Source Class</h3>
          
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <Info className="h-4 w-4 inline mr-2" />
                Promoting from <strong>{sourceYearName}</strong> to <strong>{targetYearName}</strong>
              </p>
            </div>

            <div>
              <Label>Select Class</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <option value="">Select a class</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} ({cls.students} students)
                  </option>
                ))}
              </Select>
            </div>

            <Button onClick={handleLoadStudents} disabled={!selectedClass} className="w-full">
              Load Students
            </Button>
          </div>
        </Card>
      )}

      {/* Step 2: Review and Select Students */}
      {step === 2 && (
        <>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Select Students to Promote</h3>
              <Button variant="outline" size="sm" onClick={toggleAll}>
                {selectedStudents.size === students.filter((s) => !s.failed).length ? 'Deselect All' : 'Select All Eligible'}
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold">{students.length}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Eligible</p>
                <p className="text-2xl font-bold text-green-600">{promotedCount}</p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Failed</p>
                <p className="text-2xl font-bold text-red-600">{failedCount}</p>
              </div>
            </div>

            <div>
              <Label>Target Class</Label>
              <Select value={targetClass} onValueChange={setTargetClass}>
                <option value="">Select target class</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </Select>
            </div>
          </Card>

          <Card>
            <div className="divide-y max-h-96 overflow-y-auto">
              {students.map((student) => (
                <div
                  key={student.id}
                  className={`p-4 flex items-center justify-between ${student.failed ? 'bg-red-50' : 'hover:bg-muted/50'}`}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <Checkbox
                      checked={selectedStudents.has(student.id)}
                      onCheckedChange={() => toggleStudent(student.id)}
                      disabled={student.failed}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{student.name}</span>
                        <span className="text-sm text-muted-foreground">({student.rollNumber})</span>
                      </div>
                      {student.remarks && (
                        <p className="text-sm text-red-600 mt-1">{student.remarks}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    {student.failed ? (
                      <Badge className="bg-red-500">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Failed
                      </Badge>
                    ) : (
                      <Badge className="bg-green-500">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Eligible
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(1)}>
              Back
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button onClick={handlePromote} disabled={isProcessing || selectedStudents.size === 0 || !targetClass}>
                {isProcessing ? 'Promoting...' : `Promote ${selectedStudents.size} Students`}
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Step 3: Complete */}
      {step === 3 && (
        <Card className="p-12 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Promotion Complete!</h2>
          <p className="text-muted-foreground mb-6">
            Successfully promoted {selectedStudents.size} students from {selectedClass} to {targetClass}
          </p>
          <Button onClick={onComplete}>
            Done
          </Button>
        </Card>
      )}
    </div>
  );
}
