/**
 * Live Class Room Page
 * Interactive live class interface with video, participants, and chat
 */

'use client';

import { useParams, useRouter } from 'next/navigation';
import { ParticipantList } from '@/features/live-classes/participant-list';
import { ChatPanel } from '@/features/live-classes/chat-panel';
import { ClassRoomControls } from '@/features/live-classes/class-room-controls';
import { useLiveClass, useGetParticipants } from '@/features/live-classes/use-live-classes';
import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Video, VideoOff } from 'lucide-react';
import { useState } from 'react';

export default function LiveClassRoomPage() {
  const params = useParams();
  const router = useRouter();
  const classId = params.id as string;
  const { user } = useAuthStore();
  
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);

  const { data: liveClass, isLoading } = useLiveClass(classId);
  const { data: participants = [] } = useGetParticipants(classId);

  const isHost = user?.role === 'TEACHER' || user?.role === 'ADMIN';

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="h-8 w-48 bg-gray-200 rounded mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading class room...</p>
        </div>
      </div>
    );
  }

  if (!liveClass) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Class Not Found</h1>
          <Button onClick={() => router.push('/live-classes')}>
            Back to Live Classes
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="text-white hover:text-white hover:bg-gray-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Leave
          </Button>
          <div>
            <h1 className="text-white font-semibold">{liveClass.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="success" className="text-xs">Live</Badge>
              <span className="text-gray-400 text-xs">
                {participants.length} participants
              </span>
            </div>
          </div>
        </div>

        <ClassRoomControls classId={classId} isHost={isHost} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video Area */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 bg-black flex items-center justify-center relative">
            {isVideoEnabled ? (
              <div className="w-full h-full flex items-center justify-center">
                <Video className="h-24 w-24 text-gray-600" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-white text-lg">Video feed will appear here</p>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <VideoOff className="h-24 w-24 text-gray-600 mx-auto mb-4" />
                <p className="text-white">Video is off</p>
              </div>
            )}

            {/* Self Video (Small) */}
            <Card className="absolute bottom-4 right-4 w-48 h-36 bg-gray-800 border-gray-700">
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mx-auto mb-2">
                    <span className="text-white text-xl font-bold">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </span>
                  </div>
                  <p className="text-white text-sm">You</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-96 bg-white border-l flex flex-col">
          <div className="flex-1 overflow-hidden">
            <ParticipantList
              classId={classId}
              participants={participants}
              currentUserId={user?.id || ''}
              isHost={isHost}
            />
          </div>
          <div className="h-1/2 border-t">
            <ChatPanel
              classId={classId}
              currentUserId={user?.id || ''}
              currentUserRole={user?.role as any}
              isHost={isHost}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
