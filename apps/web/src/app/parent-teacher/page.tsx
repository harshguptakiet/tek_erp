/**
 * Module 16: Messaging - Parent-Teacher Communication
 * FR-PTM-001: Parent-teacher meetings and communication portal
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Can } from '@/components/auth/can';
import { PERMISSIONS } from '@/config/permissions';
import { toast } from 'sonner';

type MessageStatus = 'UNREAD' | 'READ' | 'REPLIED';
type MeetingStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED';

interface Message {
  id: string;
  from: string;
  fromRole: 'PARENT' | 'TEACHER';
  to: string;
  subject: string;
  message: string;
  timestamp: string;
  status: MessageStatus;
  replies?: number;
}

interface Meeting {
  id: string;
  parentName: string;
  teacherName: string;
  studentName: string;
  class: string;
  scheduledDate: string;
  scheduledTime: string;
  duration: number;
  purpose: string;
  status: MeetingStatus;
  location: string;
  notes?: string;
}

export default function ParentTeacherPortalPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'messages' | 'meetings'>('messages');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | MessageStatus | MeetingStatus>('ALL');
  const [showComposeDialog, setShowComposeDialog] = useState(false);
  const [composeForm, setComposeForm] = useState({
    to: '',
    subject: '',
    message: '',
  });

  // Mock messages data
  const { data: messagesData, isLoading: loadingMessages } = useQuery({
    queryKey: ['parent-teacher-messages'],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 800));
      return [
        {
          id: 'msg1',
          from: 'Mrs. Kavita Kumar (Parent)',
          fromRole: 'PARENT' as const,
          to: 'Dr. Rajesh Kumar (Mathematics)',
          subject: 'Doubt regarding Algebra homework',
          message: 'My son is having difficulty with the algebra homework. Could you please provide some guidance?',
          timestamp: '2024-08-01T10:30:00Z',
          status: 'REPLIED' as MessageStatus,
          replies: 2,
        },
        {
          id: 'msg2',
          from: 'Prof. Priya Singh (Physics)',
          fromRole: 'TEACHER' as const,
          to: 'Mr. Rajesh Sharma (Parent)',
          subject: 'Excellent performance in Mid-term',
          message: 'Your daughter Priya has shown excellent performance in the mid-term exam. She scored 95/100.',
          timestamp: '2024-08-01T14:20:00Z',
          status: 'READ' as MessageStatus,
        },
        {
          id: 'msg3',
          from: 'Ms. Anjali Verma (Parent)',
          fromRole: 'PARENT' as const,
          to: 'Ms. Anjali Sharma (Chemistry)',
          subject: 'Request for additional study material',
          message: 'Could you please share additional study material for organic chemistry chapter?',
          timestamp: '2024-08-02T09:15:00Z',
          status: 'UNREAD' as MessageStatus,
        },
        {
          id: 'msg4',
          from: 'Mr. Suresh Verma (English)',
          fromRole: 'TEACHER' as const,
          to: 'Mrs. Meera Patel (Parent)',
          subject: 'Concern about attendance',
          message: 'Arjun has been absent for the last 3 English classes. Please ensure regular attendance.',
          timestamp: '2024-07-31T11:45:00Z',
          status: 'READ' as MessageStatus,
        },
        {
          id: 'msg5',
          from: 'Mr. Vivaan Gupta (Parent)',
          fromRole: 'PARENT' as const,
          to: 'Dr. Meera Gupta (Biology)',
          subject: 'Thank you for extra classes',
          message: 'Thank you for conducting extra classes for biology practicals. It helped a lot.',
          timestamp: '2024-07-30T16:00:00Z',
          status: 'REPLIED' as MessageStatus,
          replies: 1,
        },
      ] as Message[];
    },
  });

  // Mock meetings data
  const { data: meetingsData, isLoading: loadingMeetings } = useQuery({
    queryKey: ['parent-teacher-meetings'],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 800));
      return [
        {
          id: 'meet1',
          parentName: 'Mr. Rajesh Kumar',
          teacherName: 'Dr. Rajesh Kumar (Mathematics)',
          studentName: 'Aarav Kumar',
          class: 'Class 10-A',
          scheduledDate: '2024-08-05',
          scheduledTime: '10:00 AM',
          duration: 30,
          purpose: 'Discuss academic progress and upcoming exams',
          status: 'SCHEDULED' as MeetingStatus,
          location: 'Staff Room 201',
        },
        {
          id: 'meet2',
          parentName: 'Mrs. Priya Sharma',
          teacherName: 'Prof. Priya Singh (Physics)',
          studentName: 'Priya Sharma',
          class: 'Class 10-A',
          scheduledDate: '2024-07-28',
          scheduledTime: '02:00 PM',
          duration: 20,
          purpose: 'Career guidance discussion',
          status: 'COMPLETED' as MeetingStatus,
          location: 'Conference Room A',
          notes: 'Discussed career options in engineering. Parent showed interest in coaching classes.',
        },
        {
          id: 'meet3',
          parentName: 'Mr. Suresh Verma',
          teacherName: 'Ms. Anjali Sharma (Chemistry)',
          studentName: 'Rahul Verma',
          class: 'Class 11-B',
          scheduledDate: '2024-08-10',
          scheduledTime: '11:30 AM',
          duration: 30,
          purpose: 'Address performance concerns',
          status: 'SCHEDULED' as MeetingStatus,
          location: 'Staff Room 202',
        },
        {
          id: 'meet4',
          parentName: 'Mrs. Ananya Singh',
          teacherName: 'Mr. Suresh Verma (English)',
          studentName: 'Ananya Singh',
          class: 'Class 9-C',
          scheduledDate: '2024-07-25',
          scheduledTime: '03:00 PM',
          duration: 15,
          purpose: 'Discuss extracurricular activities',
          status: 'CANCELLED' as MeetingStatus,
          location: 'Staff Room 203',
        },
      ] as Meeting[];
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (data: typeof composeForm) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return data;
    },
    onSuccess: () => {
      toast.success('Message sent successfully');
      setShowComposeDialog(false);
      setComposeForm({ to: '', subject: '', message: '' });
    },
    onError: () => {
      toast.error('Failed to send message');
    },
  });

  const filteredMessages = messagesData?.filter((msg) => {
    const matchesSearch = 
      msg.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || msg.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const filteredMeetings = meetingsData?.filter((meet) => {
    const matchesSearch = 
      meet.parentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      meet.teacherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      meet.studentName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || meet.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const messageStats = {
    total: messagesData?.length || 0,
    unread: messagesData?.filter((m) => m.status === 'UNREAD').length || 0,
    read: messagesData?.filter((m) => m.status === 'READ').length || 0,
    replied: messagesData?.filter((m) => m.status === 'REPLIED').length || 0,
  };

  const meetingStats = {
    total: meetingsData?.length || 0,
    scheduled: meetingsData?.filter((m) => m.status === 'SCHEDULED').length || 0,
    completed: meetingsData?.filter((m) => m.status === 'COMPLETED').length || 0,
    cancelled: meetingsData?.filter((m) => m.status === 'CANCELLED').length || 0,
  };

  const handleSendMessage = () => {
    if (!composeForm.to || !composeForm.subject || !composeForm.message) {
      toast.error('Please fill all required fields');
      return;
    }
    sendMessageMutation.mutate(composeForm);
  };


  return (
    <Can
      permission={PERMISSIONS.USERS_VIEW}
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-gray-600">You don't have permission to access this portal</p>
          </div>
        </div>
      }
    >
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Parent-Teacher Portal</h1>
              <p className="mt-2 text-sm text-gray-600">
                Communicate with teachers and schedule meetings
              </p>
            </div>
            <Button onClick={() => setShowComposeDialog(true)}>
              ✉️ New Message
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => setActiveTab('messages')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'messages'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            💬 Messages
            {messageStats.unread > 0 && (
              <Badge variant="error" className="ml-2">{messageStats.unread}</Badge>
            )}
          </button>

          <button
            onClick={() => setActiveTab('meetings')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'meetings'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            📅 Meetings
            {meetingStats.scheduled > 0 && (
              <Badge variant="warning" className="ml-2">{meetingStats.scheduled}</Badge>
            )}
          </button>
        </div>

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Total Messages</p>
                    <p className="text-3xl font-bold text-gray-900">{messageStats.total}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setFilterStatus('UNREAD')}>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Unread</p>
                    <p className="text-3xl font-bold text-red-600">{messageStats.unread}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setFilterStatus('READ')}>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Read</p>
                    <p className="text-3xl font-bold text-blue-600">{messageStats.read}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setFilterStatus('REPLIED')}>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Replied</p>
                    <p className="text-3xl font-bold text-green-600">{messageStats.replied}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    placeholder="Search messages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />

                  <Select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                  >
                    <option value="ALL">All Status</option>
                    <option value="UNREAD">Unread</option>
                    <option value="READ">Read</option>
                    <option value="REPLIED">Replied</option>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Messages List */}
            {loadingMessages ? (
              <div className="text-center py-12">
                <p className="text-gray-600">Loading messages...</p>
              </div>
            ) : filteredMessages && filteredMessages.length > 0 ? (
              <div className="space-y-3">
                {filteredMessages.map((message) => (
                  <Card
                    key={message.id}
                    className={`hover:shadow-lg transition-shadow cursor-pointer ${
                      message.status === 'UNREAD' ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                    onClick={() => router.push(`/parent-teacher/messages/${message.id}`)}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">
                              {message.fromRole === 'PARENT' ? '👨‍👩‍👧' : '👨‍🏫'}
                            </span>
                            <div>
                              <p className="font-semibold text-gray-900">{message.subject}</p>
                              <p className="text-sm text-gray-600">
                                {message.from} → {message.to}
                              </p>
                            </div>
                          </div>

                          <p className="text-sm text-gray-700 mt-2 line-clamp-2">
                            {message.message}
                          </p>

                          <div className="flex items-center gap-4 mt-3">
                            <span className="text-xs text-gray-500">
                              {new Date(message.timestamp).toLocaleString()}
                            </span>
                            {message.replies && message.replies > 0 && (
                              <Badge variant="info" className="text-xs">
                                💬 {message.replies} {message.replies === 1 ? 'reply' : 'replies'}
                              </Badge>
                            )}
                          </div>
                        </div>

                        <Badge
                          variant={
                            message.status === 'UNREAD'
                              ? 'error'
                              : message.status === 'READ'
                              ? 'warning'
                              : 'success'
                          }
                        >
                          {message.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-gray-600">No messages found</p>
              </div>
            )}
          </>
        )}

        {/* Meetings Tab */}
        {activeTab === 'meetings' && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Total Meetings</p>
                    <p className="text-3xl font-bold text-gray-900">{meetingStats.total}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setFilterStatus('SCHEDULED')}>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Scheduled</p>
                    <p className="text-3xl font-bold text-orange-600">{meetingStats.scheduled}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setFilterStatus('COMPLETED')}>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Completed</p>
                    <p className="text-3xl font-bold text-green-600">{meetingStats.completed}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setFilterStatus('CANCELLED')}>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Cancelled</p>
                    <p className="text-3xl font-bold text-red-600">{meetingStats.cancelled}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    placeholder="Search meetings..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />

                  <div className="flex gap-2">
                    <Select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value as any)}
                      className="flex-1"
                    >
                      <option value="ALL">All Status</option>
                      <option value="SCHEDULED">Scheduled</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </Select>

                    <Button onClick={() => router.push('/parent-teacher/meetings/schedule')}>
                      + Schedule Meeting
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Meetings List */}
            {loadingMeetings ? (
              <div className="text-center py-12">
                <p className="text-gray-600">Loading meetings...</p>
              </div>
            ) : filteredMeetings && filteredMeetings.length > 0 ? (
              <div className="space-y-3">
                {filteredMeetings.map((meeting) => (
                  <Card key={meeting.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div>
                              <p className="font-semibold text-gray-900">
                                {meeting.teacherName} ↔️ {meeting.parentName}
                              </p>
                              <p className="text-sm text-gray-600">
                                Student: {meeting.studentName} ({meeting.class})
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            <div>
                              <p className="text-gray-600">Date</p>
                              <p className="font-medium text-gray-900">
                                {new Date(meeting.scheduledDate).toLocaleDateString()}
                              </p>
                            </div>

                            <div>
                              <p className="text-gray-600">Time</p>
                              <p className="font-medium text-gray-900">
                                {meeting.scheduledTime} ({meeting.duration} min)
                              </p>
                            </div>

                            <div>
                              <p className="text-gray-600">Location</p>
                              <p className="font-medium text-gray-900">{meeting.location}</p>
                            </div>

                            <div>
                              <p className="text-gray-600">Purpose</p>
                              <p className="font-medium text-gray-900 line-clamp-2">{meeting.purpose}</p>
                            </div>
                          </div>

                          {meeting.notes && (
                            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
                              <p className="text-xs font-medium text-green-900 mb-1">Meeting Notes:</p>
                              <p className="text-xs text-green-800">{meeting.notes}</p>
                            </div>
                          )}
                        </div>

                        <div className="ml-4 flex flex-col gap-2">
                          <Badge
                            variant={
                              meeting.status === 'SCHEDULED'
                                ? 'warning'
                                : meeting.status === 'COMPLETED'
                                ? 'success'
                                : 'error'
                            }
                          >
                            {meeting.status}
                          </Badge>

                          {meeting.status === 'SCHEDULED' && (
                            <>
                              <Button size="sm" variant="outline">
                                Reschedule
                              </Button>
                              <Button size="sm" variant="outline" className="text-red-600">
                                Cancel
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-gray-600 mb-4">No meetings found</p>
                <Button onClick={() => router.push('/parent-teacher/meetings/schedule')}>
                  Schedule First Meeting
                </Button>
              </div>
            )}
          </>
        )}

        {/* Compose Message Dialog */}
        {showComposeDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="max-w-2xl w-full mx-4">
              <CardHeader>
                <CardTitle>Compose Message</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      To *
                    </label>
                    <Select
                      value={composeForm.to}
                      onChange={(e) => setComposeForm({ ...composeForm, to: e.target.value })}
                    >
                      <option value="">Select Recipient</option>
                      <option value="teacher1">Dr. Rajesh Kumar (Mathematics)</option>
                      <option value="teacher2">Prof. Priya Singh (Physics)</option>
                      <option value="teacher3">Ms. Anjali Sharma (Chemistry)</option>
                      <option value="teacher4">Mr. Suresh Verma (English)</option>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subject *
                    </label>
                    <Input
                      value={composeForm.subject}
                      onChange={(e) => setComposeForm({ ...composeForm, subject: e.target.value })}
                      placeholder="Enter subject..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Message *
                    </label>
                    <Textarea
                      value={composeForm.message}
                      onChange={(e) => setComposeForm({ ...composeForm, message: e.target.value })}
                      placeholder="Type your message..."
                      rows={6}
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowComposeDialog(false);
                        setComposeForm({ to: '', subject: '', message: '' });
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSendMessage}
                      disabled={sendMessageMutation.isPending}
                      className="flex-1"
                    >
                      {sendMessageMutation.isPending ? 'Sending...' : 'Send Message'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Can>
  );
}
