'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  User, 
  FileText, 
  Heart,
  TrendingUp,
  Award,
  BookOpen,
  Clock
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';

interface StudentDetailsProps {
  student: any;
  documents?: any[];
  healthRecords?: any[];
  attendance?: any;
  performance?: any;
  isLoading?: boolean;
}

export function StudentDetails({
  student,
  documents = [],
  healthRecords = [],
  attendance,
  performance,
  isLoading,
}: StudentDetailsProps) {
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex items-start gap-6">
            <Skeleton className="w-32 h-32 rounded-full" />
            <div className="flex-1 space-y-4">
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const documentColumns: ColumnDef<any>[] = [
    {
      accessorKey: 'type',
      header: 'Document Type',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{row.original.type}</span>
        </div>
      ),
    },
    {
      accessorKey: 'title',
      header: 'Title',
    },
    {
      accessorKey: 'uploadedAt',
      header: 'Upload Date',
      cell: ({ row }) => new Date(row.original.uploadedAt).toLocaleDateString(),
    },
    {
      accessorKey: 'size',
      header: 'Size',
      cell: ({ row }) => `${(row.original.size / 1024).toFixed(2)} KB`,
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <Button variant="ghost" size="sm">
          Download
        </Button>
      ),
    },
  ];

  const healthColumns: ColumnDef<any>[] = [
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => new Date(row.original.date).toLocaleDateString(),
    },
    {
      accessorKey: 'type',
      header: 'Record Type',
    },
    {
      accessorKey: 'description',
      header: 'Description',
    },
    {
      accessorKey: 'doctor',
      header: 'Doctor/Nurse',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-start gap-6">
          <Avatar className="w-32 h-32">
            <AvatarImage src={student.profilePicture} alt={student.fullName} />
            <AvatarFallback className="text-2xl">
              {student.firstName?.[0]}{student.lastName?.[0]}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold">{student.fullName}</h1>
                <p className="text-lg text-muted-foreground mt-1">
                  Class {student.class} - Section {student.section}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => router.push(`/students/${student.id}/edit`)}
                >
                  Edit Profile
                </Button>
                <Badge
                  variant={student.status === 'ACTIVE' ? 'success' : 'secondary'}
                  className="h-fit"
                >
                  {student.status}
                </Badge>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Admission:</span>
                <span>{student.admissionNumber}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{student.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{student.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>DOB: {new Date(student.dateOfBirth).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Attendance</p>
              <p className="text-2xl font-bold">{attendance?.percentage || 0}%</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Score</p>
              <p className="text-2xl font-bold">{performance?.average || 0}%</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Award className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Rank</p>
              <p className="text-2xl font-bold">#{performance?.rank || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Assignments</p>
              <p className="text-2xl font-bold">{performance?.assignments || 0}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="health">Health Records</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Personal Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Full Name</span>
                  <span className="font-medium">{student.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Gender</span>
                  <span className="font-medium">{student.gender}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Blood Group</span>
                  <span className="font-medium">{student.bloodGroup || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nationality</span>
                  <span className="font-medium">{student.nationality || 'N/A'}</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Guardian Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Father's Name</span>
                  <span className="font-medium">{student.fatherName || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mother's Name</span>
                  <span className="font-medium">{student.motherName || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Guardian Phone</span>
                  <span className="font-medium">{student.guardianPhone || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Guardian Email</span>
                  <span className="font-medium">{student.guardianEmail || 'N/A'}</span>
                </div>
              </div>
            </Card>
          </div>

          <Card className="p-6">
            <h3 className="font-semibold mb-4">Address</h3>
            <div className="flex items-start gap-2">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <p>{student.address || 'No address provided'}</p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Student Documents</h3>
              <Button>Upload Document</Button>
            </div>
            <DataTable
              columns={documentColumns}
              data={documents}
              searchKey="title"
              searchPlaceholder="Search documents..."
            />
          </Card>
        </TabsContent>

        <TabsContent value="health">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Health Records</h3>
              <Button>Add Record</Button>
            </div>
            <DataTable
              columns={healthColumns}
              data={healthRecords}
              searchKey="type"
              searchPlaceholder="Search health records..."
            />
          </Card>
        </TabsContent>

        <TabsContent value="attendance">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Attendance Overview</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                <span>Present Days</span>
                <span className="font-bold text-green-600">{attendance?.present || 0}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                <span>Absent Days</span>
                <span className="font-bold text-red-600">{attendance?.absent || 0}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                <span>Leave Days</span>
                <span className="font-bold text-yellow-600">{attendance?.leave || 0}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-primary/10 rounded-lg">
                <span className="font-medium">Attendance Percentage</span>
                <span className="text-2xl font-bold text-primary">
                  {attendance?.percentage || 0}%
                </span>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Academic Performance</h3>
            <div className="space-y-4">
              {performance?.subjects?.map((subject: any) => (
                <div key={subject.id} className="p-4 bg-muted rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{subject.name}</span>
                    <Badge variant="info">{subject.score}%</Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${subject.score}%` }}
                    />
                  </div>
                </div>
              )) || (
                <p className="text-center text-muted-foreground py-8">
                  No performance data available
                </p>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
