/**
 * Module 02: User Management - Teacher Profile Detail
 * FR-USER-019 to FR-USER-026: Complete teacher profile
 */

'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { userService } from '@/services/user.service';
import { academicService } from '@/services/academic.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Can } from '@/components/auth/can';
import { PERMISSIONS } from '@/config/permissions';
import { 
  Loader2, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  BookOpen, 
  Calendar, 
  Users, 
  Award,
  Clock,
  Edit,
  GraduationCap,
  FileText
} from 'lucide-react';
import Image from 'next/image';

export default function TeacherDetailPage() {
  const params = useParams();
  const router = useRouter();
  const teacherId = params.id as string;
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch teacher details
  const { data: teacher, isLoading } = useQuery({
    queryKey: ['teacher', teacherId],
    queryFn: () => userService.getUser(teacherId),
    enabled: !!teacherId,
  });

  // Fetch assigned classes
  const { data: classesData } = useQuery({
    queryKey: ['teacher-classes', teacherId],
    queryFn: () => academicService.getTeacherClasses(teacherId),
    enabled: !!teacherId,
  });

  // Fetch teaching schedule
  const { data: scheduleData } = useQuery({
    queryKey: ['teacher-schedule', teacherId],
    queryFn: () => academicService.getTeacherSchedule(teacherId),
    enabled: !!teacherId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-gray-600">Teacher not found</p>
          <Button className="mt-4" onClick={() => router.push('/teachers')}>
            Back to Teachers
          </Button>
        </div>
      </div>
    );
  }

  const classes = classesData?.items || [];
  const schedule = scheduleData?.items || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" size="sm" onClick={() => router.push('/teachers')}>
          ← Back to Teachers
        </Button>
      </div>

      {/* Profile Header */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Profile Picture */}
            <div className="flex-shrink-0">
              <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-200">
                {teacher.profilePicture ? (
                  <Image
                    src={teacher.profilePicture}
                    alt={teacher.fullName}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-600 text-4xl font-bold">
                    {teacher.firstName?.[0]}{teacher.lastName?.[0]}
                  </div>
                )}
              </div>
            </div>

            {/* Basic Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {teacher.firstName} {teacher.middleName} {teacher.lastName}
                  </h1>
                  <p className="text-lg text-gray-600 mt-1">{teacher.designation || 'Teacher'}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={teacher.status === 'ACTIVE' ? 'success' : 'secondary'}>
                      {teacher.status}
                    </Badge>
                    {teacher.isPermanent && (
                      <Badge variant="default">Permanent</Badge>
                    )}
                  </div>
                </div>
                <Can permission={PERMISSIONS.TEACHERS_UPDATE}>
                  <Button onClick={() => router.push(`/teachers/${teacherId}/edit`)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </Can>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Briefcase className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Employee ID</p>
                    <p className="font-mono font-semibold">{teacher.employeeId}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Calendar className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Joined</p>
                    <p className="font-semibold">
                      {teacher.joiningDate ? new Date(teacher.joiningDate).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <BookOpen className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Department</p>
                    <p className="font-semibold">{teacher.department || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Classes</p>
                <p className="text-2xl font-bold text-gray-900">{classes.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Subjects</p>
                <p className="text-2xl font-bold text-gray-900">{teacher.subjects?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Weekly Hours</p>
                <p className="text-2xl font-bold text-gray-900">{schedule.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Award className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Experience</p>
                <p className="text-2xl font-bold text-gray-900">
                  {teacher.experience || 0} yrs
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabbed Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="classes">Classes</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="qualifications">Qualifications</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{teacher.email}</p>
                  </div>
                </div>
                {teacher.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium">{teacher.phone}</p>
                    </div>
                  </div>
                )}
                {teacher.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Address</p>
                      <p className="font-medium">{teacher.address.street}</p>
                      <p className="text-sm text-gray-500">
                        {teacher.address.city}, {teacher.address.state} {teacher.address.postalCode}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Employment Details */}
            <Card>
              <CardHeader>
                <CardTitle>Employment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Employment Type</p>
                  <p className="font-medium">{teacher.employmentType || 'Full-time'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Department</p>
                  <p className="font-medium">{teacher.department || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Designation</p>
                  <p className="font-medium">{teacher.designation || 'Teacher'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Salary Grade</p>
                  <p className="font-medium">{teacher.salaryGrade || 'N/A'}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Subjects Teaching */}
          <Card>
            <CardHeader>
              <CardTitle>Subjects Teaching</CardTitle>
              <CardDescription>
                Subjects assigned to this teacher
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {teacher.subjects && teacher.subjects.length > 0 ? (
                  teacher.subjects.map((subject: any, idx: number) => (
                    <Badge key={idx} variant="secondary" className="px-3 py-1">
                      <BookOpen className="h-3 w-3 mr-1" />
                      {typeof subject === 'string' ? subject : subject.name}
                    </Badge>
                  ))
                ) : (
                  <p className="text-gray-500">No subjects assigned</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Classes Tab */}
        <TabsContent value="classes">
          <Card>
            <CardHeader>
              <CardTitle>Assigned Classes</CardTitle>
              <CardDescription>
                Classes where this teacher is teaching
              </CardDescription>
            </CardHeader>
            <CardContent>
              {classes.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No classes assigned</p>
              ) : (
                <div className="space-y-3">
                  {classes.map((cls: any) => (
                    <div
                      key={cls.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => router.push(`/classes/${cls.id}`)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Users className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{cls.name}</p>
                          <p className="text-sm text-gray-500">
                            {cls.studentCount || 0} students • {cls.subject}
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary">{cls.section}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Schedule</CardTitle>
              <CardDescription>
                Teaching timetable for this week
              </CardDescription>
            </CardHeader>
            <CardContent>
              {schedule.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No schedule available</p>
              ) : (
                <div className="space-y-2">
                  {schedule.map((slot: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-4 p-3 border rounded-lg">
                      <div className="flex items-center gap-2 text-sm text-gray-600 min-w-[120px]">
                        <Clock className="h-4 w-4" />
                        <span>{slot.day} {slot.time}</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{slot.subject}</p>
                        <p className="text-sm text-gray-500">{slot.className} - {slot.section}</p>
                      </div>
                      <Badge variant="secondary">{slot.room}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Qualifications Tab */}
        <TabsContent value="qualifications">
          <Card>
            <CardHeader>
              <CardTitle>Educational Qualifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teacher.qualifications && teacher.qualifications.length > 0 ? (
                  teacher.qualifications.map((qual: any, idx: number) => (
                    <div key={idx} className="flex items-start gap-4 p-4 border rounded-lg">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <GraduationCap className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{qual.degree}</p>
                        <p className="text-sm text-gray-600">{qual.institution}</p>
                        <p className="text-sm text-gray-500">{qual.year}</p>
                      </div>
                      <Badge variant="success">Verified</Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">No qualifications added</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
              <CardDescription>
                Uploaded certificates and documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {teacher.documents && teacher.documents.length > 0 ? (
                  teacher.documents.map((doc: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium">{doc.name}</p>
                          <p className="text-sm text-gray-500">{doc.type}</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">Download</Button>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">No documents uploaded</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
