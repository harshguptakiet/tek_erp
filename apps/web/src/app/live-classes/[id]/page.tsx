/**
 * Module 11: Live Classes - Live Class Detail
 * FR-LIVE-001 to FR-LIVE-010, FR-VIDEO-001 to FR-VIDEO-010
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Can } from '@/components/auth/can';
import { PERMISSIONS } from '@/config/permissions';
import { toast } from 'sonner';

interface LiveClassDetailPageProps {
  params: {
    id: string;
  };
}

export default function LiveClassDetailPage({ params }: LiveClassDetailPageProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'participants' | 'resources' | 'analytics'>('overview');

  // Mock data - replace with actual API call
  const { data: classData, isLoading } = useQuery({
    queryKey: ['live-class', params.id],
    queryFn: async () => ({
      id: params.id,
      title: 'Introduction to Quantum Physics',
      description: 'Learn the fundamentals of quantum mechanics, wave-particle duality, and the uncertainty principle.',
      subject: 'Physics',
      class: 'Class 12',
      section: 'A',
      teacher: {
        id: 't1',
        name: 'Dr. Rajesh Kumar',
        avatar: null,
        employeeId: 'EMP001',
      },
      status: 'LIVE',
      scheduledStart: '2024-08-02T10:00:00Z',
      scheduledEnd: '2024-08-02T11:00:00Z',
      actualStart: '2024-08-02T10:05:00Z',
      actualEnd: null,
      platform: 'ZOOM',
      meetingUrl: 'https://zoom.us/j/123456789',
      meetingId: '123 456 789',
      meetingPassword: 'qwerty',
      maxParticipants: 100,
      enableChat: true,
      enableScreenShare: true,
      enableWhiteboard: true,
      enableRecording: true,
      recordingUrl: null,
      participants: [
        {
          id: 'p1',
          userId: 'u1',
          userName: 'Aarav Kumar',
          avatar: null,
          joinedAt: '2024-08-02T10:02:00Z',
          leftAt: null,
          duration: 3600, // seconds
          isRemoved: false,
          status: 'JOINED',
        },
        {
          id: 'p2',
          userId: 'u2',
          userName: 'Diya Sharma',
          avatar: null,
          joinedAt: '2024-08-02T10:03:00Z',
          leftAt: null,
          duration: 3540,
          isRemoved: false,
          status: 'JOINED',
        },
        {
          id: 'p3',
          userId: 'u3',
          userName: 'Rohan Patel',
          avatar: null,
          joinedAt: '2024-08-02T10:00:00Z',
          leftAt: '2024-08-02T10:45:00Z',
          duration: 2700,
          isRemoved: false,
          status: 'LEFT',
        },
      ],
      resources: [
        {
          id: 'r1',
          title: 'Quantum Mechanics Introduction.pdf',
          fileUrl: '/files/quantum-intro.pdf',
          uploadedAt: '2024-08-02T09:50:00Z',
        },
        {
          id: 'r2',
          title: 'Wave-Particle Duality Slides.pptx',
          fileUrl: '/files/wave-particle.pptx',
          uploadedAt: '2024-08-02T09:55:00Z',
        },
      ],
      analytics: {
        totalEnrolled: 45,
        totalJoined: 38,
        currentlyJoined: 35,
        averageDuration: 50, // minutes
        attendanceRate: 84.4,
        engagementScore: 87,
      },
    }),
  });

  const joinMutation = useMutation({
    mutationFn: async () => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return { meetingUrl: classData?.meetingUrl };
    },
    onSuccess: (data) => {
      if (data.meetingUrl) {
        window.open(data.meetingUrl, '_blank');
        toast.success('Opening live class...');
      }
    },
    onError: () => {
      toast.error('Failed to join class');
    },
  });

  const endClassMutation = useMutation({
    mutationFn: async () => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return { success: true };
    },
    onSuccess: () => {
      toast.success('Live class ended successfully');
      router.push('/live-classes');
    },
    onError: () => {
      toast.error('Failed to end class');
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-gray-600">Live class not found</p>
          <Button className="mt-4" onClick={() => router.push('/live-classes')}>
            Back to Live Classes
          </Button>
        </div>
      </div>
    );
  }

  const isLive = classData.status === 'LIVE';
  const isCompleted = classData.status === 'COMPLETED';
  const isScheduled = classData.status === 'SCHEDULED';
  const canJoin = isLive || isScheduled;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Button variant="ghost" size="sm" onClick={() => router.push('/live-classes')}>
            ← Back
          </Button>
        </div>

        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{classData.title}</h1>
              {isLive && (
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
                  </div>
                  <Badge variant="success">LIVE NOW</Badge>
                </div>
              )}
              {isScheduled && <Badge variant="info">SCHEDULED</Badge>}
              {isCompleted && <Badge variant="secondary">COMPLETED</Badge>}
              {classData.status === 'CANCELLED' && <Badge variant="error">CANCELLED</Badge>}
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{classData.subject}</Badge>
                <Badge variant="secondary">{classData.class} - {classData.section}</Badge>
              </div>
              <span>•</span>
              <span>👨‍🏫 {classData.teacher.name}</span>
              <span>•</span>
              <span>{classData.platform === 'ZOOM' ? '🎥 Zoom' : classData.platform === 'GOOGLE_MEET' ? '📹 Google Meet' : classData.platform === 'TEAMS' ? '💼 Teams' : '🔗 Custom'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {canJoin && (
              <Button
                onClick={() => joinMutation.mutate()}
                disabled={joinMutation.isPending}
                size="lg"
              >
                {isLive ? 'Join Now' : 'Join Class'}
              </Button>
            )}
            {isCompleted && classData.recordingUrl && (
              <Button onClick={() => window.open(classData.recordingUrl!, '_blank')}>
                Watch Recording
              </Button>
            )}
            <Can permission={PERMISSIONS.LIVE_CLASSES_UPDATE}>
              {isLive && (
                <Button
                  variant="destructive"
                  onClick={() => {
                    if (confirm('Are you sure you want to end this live class?')) {
                      endClassMutation.mutate();
                    }
                  }}
                  disabled={endClassMutation.isPending}
                >
                  End Class
                </Button>
              )}
              {isScheduled && (
                <Button variant="outline" onClick={() => router.push(`/live-classes/${params.id}/edit`)}>
                  Edit
                </Button>
              )}
            </Can>
          </div>
        </div>
      </div>

      {/* Live Alert */}
      {isLive && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-green-900">Class is live now!</p>
              <p className="text-sm text-green-700">
                {classData.analytics.currentlyJoined} participants currently joined
              </p>
            </div>
            <Button onClick={() => joinMutation.mutate()} disabled={joinMutation.isPending}>
              Join Now
            </Button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b mb-6">
        <div className="flex gap-6">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'participants', label: `Participants (${classData.participants.length})` },
            { id: 'resources', label: `Resources (${classData.resources.length})` },
            { id: 'analytics', label: 'Analytics' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 px-1 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600 font-medium'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Class Info */}
          <Card>
            <CardHeader>
              <CardTitle>Class Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Description</p>
                <p className="text-gray-900">{classData.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Scheduled Time</p>
                  <p className="font-medium text-gray-900">
                    {new Date(classData.scheduledStart).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Duration</p>
                  <p className="font-medium text-gray-900">
                    {Math.round(
                      (new Date(classData.scheduledEnd).getTime() -
                        new Date(classData.scheduledStart).getTime()) /
                        60000
                    )}{' '}
                    minutes
                  </p>
                </div>
              </div>

              {classData.actualStart && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Actual Start</p>
                    <p className="font-medium text-gray-900">
                      {new Date(classData.actualStart).toLocaleString()}
                    </p>
                  </div>
                  {classData.actualEnd && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Actual End</p>
                      <p className="font-medium text-gray-900">
                        {new Date(classData.actualEnd).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Meeting Details */}
          {(isLive || isScheduled) && (
            <Card>
              <CardHeader>
                <CardTitle>Meeting Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Meeting ID</p>
                    <p className="font-mono font-medium text-gray-900">{classData.meetingId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Password</p>
                    <p className="font-mono font-medium text-gray-900">{classData.meetingPassword}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Meeting URL</p>
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-sm text-blue-600 break-all">{classData.meetingUrl}</p>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        navigator.clipboard.writeText(classData.meetingUrl);
                        toast.success('Link copied to clipboard');
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Chat</p>
                    <p className="font-semibold text-gray-900">{classData.enableChat ? '✅ Enabled' : '❌ Disabled'}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Screen Share</p>
                    <p className="font-semibold text-gray-900">{classData.enableScreenShare ? '✅ Enabled' : '❌ Disabled'}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Whiteboard</p>
                    <p className="font-semibold text-gray-900">{classData.enableWhiteboard ? '✅ Enabled' : '❌ Disabled'}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Recording</p>
                    <p className="font-semibold text-gray-900">{classData.enableRecording ? '✅ Enabled' : '❌ Disabled'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Teacher Info */}
          <Card>
            <CardHeader>
              <CardTitle>Instructor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-purple-600">
                    {classData.teacher.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{classData.teacher.name}</p>
                  <p className="text-sm text-gray-600">Employee ID: {classData.teacher.employeeId}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'participants' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Participants</CardTitle>
              <div className="text-sm text-gray-600">
                {classData.participants.filter((p) => !p.leftAt).length} currently joined
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Participant</TableHead>
                  <TableHead>Joined At</TableHead>
                  <TableHead>Left At</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classData.participants.map((participant) => (
                  <TableRow key={participant.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-indigo-600">
                            {participant.userName.charAt(0)}
                          </span>
                        </div>
                        <span className="font-medium">{participant.userName}</span>
                      </div>
                    </TableCell>
                    <TableCell>{new Date(participant.joinedAt).toLocaleTimeString()}</TableCell>
                    <TableCell>
                      {participant.leftAt
                        ? new Date(participant.leftAt).toLocaleTimeString()
                        : '-'}
                    </TableCell>
                    <TableCell>{Math.round(participant.duration / 60)} min</TableCell>
                    <TableCell>
                      {participant.leftAt ? (
                        <Badge variant="secondary">LEFT</Badge>
                      ) : (
                        <Badge variant="success">JOINED</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Can permission={PERMISSIONS.LIVE_CLASSES_UPDATE}>
                        {!participant.leftAt && (
                          <Button size="sm" variant="ghost">
                            Remove
                          </Button>
                        )}
                      </Can>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {activeTab === 'resources' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Class Resources</CardTitle>
              <Can permission={PERMISSIONS.LIVE_CLASSES_UPDATE}>
                <Button size="sm">Upload Resource</Button>
              </Can>
            </div>
          </CardHeader>
          <CardContent>
            {classData.resources.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">No resources uploaded yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {classData.resources.map((resource) => (
                  <div
                    key={resource.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center">
                        <span className="text-xl">📄</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{resource.title}</p>
                        <p className="text-sm text-gray-600">
                          Uploaded {new Date(resource.uploadedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Button size="sm" onClick={() => window.open(resource.fileUrl, '_blank')}>
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-gray-600">Total Enrolled</p>
                <p className="text-3xl font-bold text-gray-900">{classData.analytics.totalEnrolled}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-gray-600">Total Joined</p>
                <p className="text-3xl font-bold text-green-600">{classData.analytics.totalJoined}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-gray-600">Attendance Rate</p>
                <p className="text-3xl font-bold text-blue-600">{classData.analytics.attendanceRate}%</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Engagement Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Average Duration</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {classData.analytics.averageDuration} min
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Engagement Score</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {classData.analytics.engagementScore}/100
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Engagement Score</p>
                <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-600"
                    style={{ width: `${classData.analytics.engagementScore}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
