'use client';

import { useTeacher, useTeacherSubjects, useTeacherClasses } from './use-teachers';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Mail,
  Phone,
  Calendar,
  GraduationCap,
  Award,
  BookOpen,
  Users,
  Edit,
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

interface TeacherDetailsProps {
  teacherId: string;
}

export function TeacherDetails({ teacherId }: TeacherDetailsProps) {
  const { data: teacher, isLoading } = useTeacher(teacherId);
  const { data: subjects } = useTeacherSubjects(teacherId);
  const { data: classes } = useTeacherClasses(teacherId);

  if (isLoading) {
    return <TeacherDetailsSkeleton />;
  }

  if (!teacher) {
    return (
      <Card className="p-6">
        <p className="text-center text-muted-foreground">Teacher not found</p>
      </Card>
    );
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-500';
      case 'ON_LEAVE':
        return 'bg-yellow-500';
      case 'INACTIVE':
        return 'bg-gray-500';
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={teacher.avatar} alt={teacher.firstName} />
              <AvatarFallback>
                {getInitials(teacher.firstName, teacher.lastName)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">
                  {teacher.firstName} {teacher.lastName}
                </h1>
                <Badge className={getStatusColor(teacher.status)}>
                  {teacher.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Employee ID: {teacher.employeeId}
              </p>
              {teacher.specialization && (
                <p className="text-sm text-muted-foreground">
                  {teacher.specialization}
                </p>
              )}
            </div>
          </div>
          <Link href={`/teachers/${teacherId}/edit`}>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
        </div>

        <Separator className="my-6" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="text-sm font-medium">{teacher.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="text-sm font-medium">{teacher.phone}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Joined</p>
              <p className="text-sm font-medium">
                {format(new Date(teacher.dateOfJoining), 'MMM dd, yyyy')}
              </p>
            </div>
          </div>
          {teacher.qualification && (
            <div className="flex items-center gap-3">
              <GraduationCap className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Qualification</p>
                <p className="text-sm font-medium">{teacher.qualification}</p>
              </div>
            </div>
          )}
          {teacher.experience && (
            <div className="flex items-center gap-3">
              <Award className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Experience</p>
                <p className="text-sm font-medium">{teacher.experience} years</p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="subjects" className="w-full">
        <TabsList>
          <TabsTrigger value="subjects">
            <BookOpen className="h-4 w-4 mr-2" />
            Subjects
          </TabsTrigger>
          <TabsTrigger value="classes">
            <Users className="h-4 w-4 mr-2" />
            Classes
          </TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
        </TabsList>

        <TabsContent value="subjects" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Assigned Subjects</h3>
              <Button size="sm">Assign Subject</Button>
            </div>
            {subjects && subjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {subjects.map((subject: any) => (
                  <Card key={subject.id} className="p-4">
                    <h4 className="font-medium">{subject.name}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {subject.classes?.length || 0} classes
                    </p>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No subjects assigned yet
              </p>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="classes" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Assigned Classes</h3>
              <Button size="sm">Assign Class</Button>
            </div>
            {classes && classes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {classes.map((classItem: any) => (
                  <Card key={classItem.id} className="p-4">
                    <h4 className="font-medium">
                      {classItem.name} - {classItem.section}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {classItem.studentCount || 0} students
                    </p>
                    {classItem.role && (
                      <Badge variant="outline" className="mt-2">
                        {classItem.role}
                      </Badge>
                    )}
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No classes assigned yet
              </p>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
            <p className="text-muted-foreground">Performance data coming soon...</p>
          </Card>
        </TabsContent>

        <TabsContent value="attendance">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Attendance Records</h3>
            <p className="text-muted-foreground">Attendance data coming soon...</p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TeacherDetailsSkeleton() {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-start gap-4">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <Separator className="my-6" />
        <div className="grid grid-cols-3 gap-6">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </Card>
      <Card className="p-6">
        <Skeleton className="h-96 w-full" />
      </Card>
    </div>
  );
}
