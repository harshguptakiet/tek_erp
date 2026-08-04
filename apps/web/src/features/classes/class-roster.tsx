'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table } from '@/components/ui/table';
import {
  Search,
  Filter,
  Download,
  Upload,
  UserPlus,
  UserMinus,
  Mail,
  Phone,
  MoreVertical,
  CheckCircle,
  XCircle,
} from 'lucide-react';

interface Student {
  id: string;
  rollNumber: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
  attendance: number;
  performance: number;
  parent: string;
  joinDate: string;
}

interface ClassRosterProps {
  classId: string;
  className: string;
  students?: Student[];
  onAddStudent?: () => void;
  onRemoveStudents?: (studentIds: string[]) => void;
  onPromoteStudents?: (studentIds: string[]) => void;
}

export function ClassRoster({
  classId,
  className,
  students = [],
  onAddStudent,
  onRemoveStudents,
  onPromoteStudents,
}: ClassRosterProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const toggleSelectAll = () => {
    if (selectedStudents.size === filteredStudents.length) {
      setSelectedStudents(new Set());
    } else {
      setSelectedStudents(new Set(filteredStudents.map((s) => s.id)));
    }
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

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || student.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleBulkRemove = () => {
    if (selectedStudents.size === 0) return;
    if (
      confirm(
        `Are you sure you want to remove ${selectedStudents.size} student(s) from ${className}?`
      )
    ) {
      onRemoveStudents?.(Array.from(selectedStudents));
      setSelectedStudents(new Set());
    }
  };

  const handleBulkPromote = () => {
    if (selectedStudents.size === 0) return;
    if (
      confirm(
        `Are you sure you want to promote ${selectedStudents.size} student(s) to the next class?`
      )
    ) {
      onPromoteStudents?.(Array.from(selectedStudents));
      setSelectedStudents(new Set());
    }
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Roll Number', 'Name', 'Email', 'Phone', 'Status', 'Attendance %', 'Performance %', 'Parent'],
      ...filteredStudents.map((s) => [
        s.rollNumber,
        s.name,
        s.email,
        s.phone,
        s.status,
        s.attendance,
        s.performance,
        s.parent,
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${className.replace(/\s+/g, '-')}-roster.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const stats = {
    total: students.length,
    active: students.filter((s) => s.status === 'active').length,
    inactive: students.filter((s) => s.status === 'inactive').length,
    avgAttendance: (
      students.reduce((sum, s) => sum + s.attendance, 0) / students.length
    ).toFixed(1),
    avgPerformance: (
      students.reduce((sum, s) => sum + s.performance, 0) / students.length
    ).toFixed(1),
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total Students</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              <div className="text-sm text-muted-foreground">Active</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.inactive}</div>
              <div className="text-sm text-muted-foreground">Inactive</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.avgAttendance}%</div>
              <div className="text-sm text-muted-foreground">Avg Attendance</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.avgPerformance}%</div>
              <div className="text-sm text-muted-foreground">Avg Performance</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions Bar */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, roll number, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filters & Actions */}
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 border rounded-lg text-sm"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              <Button variant="outline" size="sm" onClick={exportToCSV}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>

              <Button variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>

              <Button size="sm" onClick={onAddStudent}>
                <UserPlus className="w-4 h-4 mr-2" />
                Add Student
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Bulk Actions */}
        {selectedStudents.size > 0 && (
          <div className="px-6 pb-4">
            <div className="flex items-center justify-between p-3 bg-primary/10 border border-primary/20 rounded-lg">
              <span className="text-sm font-medium">
                {selectedStudents.size} student(s) selected
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedStudents(new Set())}>
                  Clear
                </Button>
                <Button variant="outline" size="sm" onClick={handleBulkPromote}>
                  Promote
                </Button>
                <Button variant="destructive" size="sm" onClick={handleBulkRemove}>
                  <UserMinus className="w-4 h-4 mr-2" />
                  Remove
                </Button>
              </div>
            </div>
          </div>
        )}

        <CardContent>
          {filteredStudents.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {searchQuery || statusFilter !== 'all'
                ? 'No students found matching your filters'
                : 'No students in this class yet'}
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-3 w-12">
                      <Checkbox
                        checked={
                          selectedStudents.size === filteredStudents.length &&
                          filteredStudents.length > 0
                        }
                        onCheckedChange={toggleSelectAll}
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Roll No</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Student Name</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Contact</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Parent</th>
                    <th className="px-4 py-3 text-center text-sm font-medium">Attendance</th>
                    <th className="px-4 py-3 text-center text-sm font-medium">Performance</th>
                    <th className="px-4 py-3 text-center text-sm font-medium">Status</th>
                    <th className="px-4 py-3 text-center text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredStudents.map((student) => (
                    <tr
                      key={student.id}
                      className={`hover:bg-muted/50 ${
                        selectedStudents.has(student.id) ? 'bg-primary/5' : ''
                      }`}
                    >
                      <td className="px-4 py-3">
                        <Checkbox
                          checked={selectedStudents.has(student.id)}
                          onCheckedChange={() => toggleStudent(student.id)}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-sm">{student.rollNumber}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Joined: {new Date(student.joinDate).toLocaleDateString()}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs">{student.email}</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs">{student.phone}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {student.parent}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge
                          variant={
                            student.attendance >= 75
                              ? 'default'
                              : student.attendance >= 50
                              ? 'secondary'
                              : 'destructive'
                          }
                        >
                          {student.attendance}%
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge
                          variant={
                            student.performance >= 75
                              ? 'default'
                              : student.performance >= 50
                              ? 'secondary'
                              : 'destructive'
                          }
                        >
                          {student.performance}%
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge
                          variant={student.status === 'active' ? 'default' : 'secondary'}
                        >
                          {student.status === 'active' ? (
                            <CheckCircle className="w-3 h-3 mr-1" />
                          ) : (
                            <XCircle className="w-3 h-3 mr-1" />
                          )}
                          {student.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
