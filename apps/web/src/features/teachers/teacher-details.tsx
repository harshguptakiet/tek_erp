'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs } from '@/components/ui/tabs';
import { Avatar } from '@/components/ui/avatar';
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  BookOpen,
  Users,
  Clock,
  Award,
  TrendingUp,
  FileText,
} from 'lucide-react';

interface TeacherDetailsProps {
  teacher: {
    id: string;
    name: string;
    email: string;
    phone: string;
    employeeId: string;
    department: string;
    designation: string;
    joiningDate: string;
    qualification: string;
    experience: number;
    subjects: Array<{ id: string; name: string; class: string }>;
    classes: Array<{ id: string; name: string; section: string; studentCount: number }>;
    profilePicture?: string;
    address?: string;
    emergencyContact?: string;
    bloodGroup?: string;
  };
  stats?: {
    totalClasses: number;
    totalStudents: number;
    averageAttendance: number;
    averagePerformance: number;
    lessonsCompleted: number;
    pendingAssignments: number;
  };
}

export function TeacherDetails({ teacher, stats }: TeacherDetailsProps) {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Profile Picture */}
            <div className="flex flex-col items-center gap-3">
              <Avatar className="w-32 h-32">
                {teacher.profilePicture ? (
                  <img
                    src={teacher.profilePicture}
                    alt={teacher.name}
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary text-primary-foreground text-4xl font-bold">
                    {teacher.name.charAt(0)}
                  </div>
                )}
              </Avatar>
              <Button variant="outline" size="sm">
                Upload Photo
              </Button>
            </div>

            {/* Basic Info */}
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-3xl font-bold">{teacher.name}</h1>
                <p className="text-lg text-muted-foreground">
                  {teacher.designation} - {teacher.department}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{teacher.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{teacher.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>Joined: {new Date(teacher.joiningDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Award className="w-4 h-4 text-muted-foreground" />
                  <span>{teacher.experience} years experience</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Employee ID: {teacher.employeeId}</Badge>
                <Badge variant="secondary">{teacher.qualification}</Badge>
                {teacher.bloodGroup && (
                  <Badge variant="outline">Blood: {teacher.bloodGroup}</Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Users className="w-8 h-8 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{stats.totalClasses}</div>
                <div className="text-sm text-muted-foreground">Classes</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Users className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-bold">{stats.totalStudents}</div>
                <div className="text-sm text-muted-foreground">Students</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Clock className="w-8 h-8 mx-auto mb-2 text-green-600" />
                <div className="text-2xl font-bold">{stats.averageAttendance}%</div>
                <div className="text-sm text-muted-foreground">Attendance</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <TrendingUp className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                <div className="text-2xl font-bold">{stats.averagePerformance}%</div>
                <div className="text-sm text-muted-foreground">Performance</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <BookOpen className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                <div className="text-2xl font-bold">{stats.lessonsCompleted}</div>
                <div className="text-sm text-muted-foreground">Lessons Done</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <FileText className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
                <div className="text-2xl font-bold">{stats.pendingAssignments}</div>
                <div className="text-sm text-muted-foreground">Pending</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Card>
        <CardHeader>
          <div className="flex gap-2 border-b">
            <Button
              variant={activeTab === 'overview' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </Button>
            <Button
              variant={activeTab === 'subjects' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('subjects')}
            >
              Subjects
            </Button>
            <Button
              variant={activeTab === 'classes' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('classes')}
            >
              Classes
            </Button>
            <Button
              variant={activeTab === 'performance' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('performance')}
            >
              Performance
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Qualification</h3>
                <p className="text-muted-foreground">{teacher.qualification}</p>
              </div>

              {teacher.address && (
                <div>
                  <h3 className="font-semibold mb-2">Address</h3>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground" />
                    <p className="text-muted-foreground">{teacher.address}</p>
                  </div>
                </div>
              )}

              {teacher.emergencyContact && (
                <div>
                  <h3 className="font-semibold mb-2">Emergency Contact</h3>
                  <p className="text-muted-foreground">{teacher.emergencyContact}</p>
                </div>
              )}
            </div>
          )}

          {/* Subjects Tab */}
          {activeTab === 'subjects' && (
            <div className="space-y-3">
              {teacher.subjects.map((subject) => (
                <Card key={subject.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">{subject.name}</h4>
                        <p className="text-sm text-muted-foreground">{subject.class}</p>
                      </div>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Classes Tab */}
          {activeTab === 'classes' && (
            <div className="space-y-3">
              {teacher.classes.map((cls) => (
                <Card key={cls.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">
                          {cls.name} - {cls.section}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {cls.studentCount} students
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        View Class
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Performance Tab */}
          {activeTab === 'performance' && (
            <div className="space-y-6">
              <div className="text-center py-12 text-muted-foreground">
                Performance analytics will be displayed here
                <br />
                <span className="text-sm">
                  (Charts, student performance trends, teaching effectiveness metrics)
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
