/**
 * ID Card Generator Component
 * Generate and print ID cards for students, teachers, and staff
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SelectRoot, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Download, CreditCard, Printer, QrCode } from 'lucide-react';

export function IDCardGenerator() {
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('students');

  // Mock data
  const students = [
    {
      id: 'S001',
      name: 'Rahul Kumar',
      class: 'Class 10-A',
      rollNo: '101',
      photo: null,
      bloodGroup: 'O+',
      contact: '+91 9876543210',
      validUntil: '2027-03-31',
    },
    {
      id: 'S002',
      name: 'Priya Sharma',
      class: 'Class 10-A',
      rollNo: '102',
      photo: null,
      bloodGroup: 'A+',
      contact: '+91 9876543211',
      validUntil: '2027-03-31',
    },
  ];

  const teachers = [
    {
      id: 'T001',
      name: 'Dr. Amit Singh',
      designation: 'Senior Teacher',
      department: 'Science',
      photo: null,
      bloodGroup: 'B+',
      contact: '+91 9876543220',
      validUntil: '2027-12-31',
    },
  ];

  const toggleStudent = (id: string) => {
    setSelectedStudents(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedStudents.length === students.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(students.map(s => s.id));
    }
  };

  const generateBulk = () => {
    console.log('Generating ID cards for:', selectedStudents);
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="students">
            <CreditCard className="h-4 w-4 mr-2" />
            Students
          </TabsTrigger>
          <TabsTrigger value="teachers">
            <CreditCard className="h-4 w-4 mr-2" />
            Teachers & Staff
          </TabsTrigger>
        </TabsList>

        {/* Students Tab */}
        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Student ID Cards</CardTitle>
                <div className="flex items-center gap-4">
                  <SelectRoot value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Classes</SelectItem>
                      <SelectItem value="10-A">Class 10-A</SelectItem>
                      <SelectItem value="10-B">Class 10-B</SelectItem>
                      <SelectItem value="11-A">Class 11-A</SelectItem>
                    </SelectContent>
                  </SelectRoot>
                  <Button
                    onClick={selectAll}
                    variant="outline"
                    size="sm"
                  >
                    {selectedStudents.length === students.length ? 'Deselect All' : 'Select All'}
                  </Button>
                  <Button
                    onClick={generateBulk}
                    disabled={selectedStudents.length === 0}
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Print {selectedStudents.length} Card{selectedStudents.length !== 1 ? 's' : ''}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {students.map((student) => (
                  <div
                    key={student.id}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      selectedStudents.includes(student.id)
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => toggleStudent(student.id)}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedStudents.includes(student.id)}
                        onCheckedChange={() => toggleStudent(student.id)}
                      />
                      <div className="flex-1">
                        {/* ID Card Preview */}
                        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-lg p-4 text-white shadow-lg">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <p className="text-xs opacity-90">Student ID</p>
                              <p className="font-mono text-lg font-bold">{student.id}</p>
                            </div>
                            <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center">
                              <QrCode className="h-12 w-12 text-indigo-600" />
                            </div>
                          </div>

                          <div className="bg-white rounded-lg p-3 text-gray-900">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                                <span className="text-lg font-bold text-gray-600">
                                  {student.name.charAt(0)}
                                </span>
                              </div>
                              <div className="flex-1">
                                <p className="font-semibold">{student.name}</p>
                                <p className="text-xs text-gray-600">{student.class}</p>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <p className="text-gray-600">Roll No:</p>
                                <p className="font-semibold">{student.rollNo}</p>
                              </div>
                              <div>
                                <p className="text-gray-600">Blood:</p>
                                <p className="font-semibold">{student.bloodGroup}</p>
                              </div>
                            </div>

                            <div className="mt-2 pt-2 border-t text-xs">
                              <p className="text-gray-600">Valid Until:</p>
                              <p className="font-semibold">{student.validUntil}</p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-2 flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1">
                            View Full
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Teachers Tab */}
        <TabsContent value="teachers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Teacher & Staff ID Cards</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {teachers.map((teacher) => (
                  <div key={teacher.id} className="border rounded-lg p-4">
                    {/* ID Card Preview */}
                    <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg p-4 text-white shadow-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-xs opacity-90">Teacher ID</p>
                          <p className="font-mono text-lg font-bold">{teacher.id}</p>
                        </div>
                        <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center">
                          <QrCode className="h-12 w-12 text-green-600" />
                        </div>
                      </div>

                      <div className="bg-white rounded-lg p-3 text-gray-900">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-lg font-bold text-gray-600">
                              {teacher.name.charAt(0)}
                            </span>
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold">{teacher.name}</p>
                            <p className="text-xs text-gray-600">{teacher.designation}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <p className="text-gray-600">Department:</p>
                            <p className="font-semibold">{teacher.department}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Blood:</p>
                            <p className="font-semibold">{teacher.bloodGroup}</p>
                          </div>
                        </div>

                        <div className="mt-2 pt-2 border-t text-xs">
                          <p className="text-gray-600">Valid Until:</p>
                          <p className="font-semibold">{teacher.validUntil}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-2 flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        View Full
                      </Button>
                      <Button size="sm">
                        <Printer className="h-3 w-3 mr-1" />
                        Print
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
