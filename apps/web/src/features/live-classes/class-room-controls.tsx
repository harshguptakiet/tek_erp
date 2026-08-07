'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  MonitorOff,
  PhoneOff,
  Users,
  MessageSquare,
  Hand,
  Settings,
  Maximize,
  Circle,
} from 'lucide-react';

interface ClassRoomControlsProps {
  classId: string;
  isHost?: boolean;
  participantCount?: number;
  onLeave?: () => void;
  onEndClass?: () => void;
}

export function ClassRoomControls({
  classId,
  isHost = false,
  participantCount = 0,
  onLeave,
  onEndClass,
}: ClassRoomControlsProps) {
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [handRaised, setHandRaised] = useState(false);

  return (
    <Card className="p-4">
      {/* Top Bar - Class Info */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Circle className="w-3 h-3 text-red-500 fill-red-500 animate-pulse" />
            <span className="text-sm font-medium">Live</span>
          </div>
          {isRecording && (
            <Badge variant="error" className="animate-pulse">
              <Circle className="w-2 h-2 mr-1 fill-white" />
              Recording
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">{participantCount} participants</span>
        </div>
      </div>

      {/* Main Controls */}
      <div className="flex items-center justify-center gap-3">
        {/* Audio Toggle */}
        <Button
          variant={audioEnabled ? 'default' : 'destructive'}
          size="lg"
          className="rounded-full w-14 h-14"
          onClick={() => setAudioEnabled(!audioEnabled)}
        >
          {audioEnabled ? (
            <Mic className="w-6 h-6" />
          ) : (
            <MicOff className="w-6 h-6" />
          )}
        </Button>

        {/* Video Toggle */}
        <Button
          variant={videoEnabled ? 'default' : 'destructive'}
          size="lg"
          className="rounded-full w-14 h-14"
          onClick={() => setVideoEnabled(!videoEnabled)}
        >
          {videoEnabled ? (
            <Video className="w-6 h-6" />
          ) : (
            <VideoOff className="w-6 h-6" />
          )}
        </Button>

        {/* Screen Share */}
        {isHost && (
          <Button
            variant={screenSharing ? 'default' : 'outline'}
            size="lg"
            className="rounded-full w-14 h-14"
            onClick={() => setScreenSharing(!screenSharing)}
          >
            {screenSharing ? (
              <Monitor className="w-6 h-6" />
            ) : (
              <MonitorOff className="w-6 h-6" />
            )}
          </Button>
        )}

        {/* Raise Hand */}
        {!isHost && (
          <Button
            variant={handRaised ? 'default' : 'outline'}
            size="lg"
            className="rounded-full w-14 h-14"
            onClick={() => setHandRaised(!handRaised)}
          >
            <Hand className={`w-6 h-6 ${handRaised ? 'animate-bounce' : ''}`} />
          </Button>
        )}

        {/* Chat */}
        <Button
          variant="outline"
          size="lg"
          className="rounded-full w-14 h-14"
        >
          <MessageSquare className="w-6 h-6" />
        </Button>

        {/* Participants */}
        <Button
          variant="outline"
          size="lg"
          className="rounded-full w-14 h-14"
        >
          <Users className="w-6 h-6" />
        </Button>

        {/* Settings */}
        <Button
          variant="outline"
          size="lg"
          className="rounded-full w-14 h-14"
        >
          <Settings className="w-6 h-6" />
        </Button>

        {/* Fullscreen */}
        <Button
          variant="outline"
          size="lg"
          className="rounded-full w-14 h-14"
        >
          <Maximize className="w-6 h-6" />
        </Button>

        {/* Leave/End Class */}
        <Button
          variant="destructive"
          size="lg"
          className="rounded-full w-14 h-14"
          onClick={isHost ? onEndClass : onLeave}
        >
          <PhoneOff className="w-6 h-6" />
        </Button>
      </div>

      {/* Status Messages */}
      <div className="mt-4 pt-4 border-t">
        <div className="flex flex-wrap gap-2 justify-center">
          {!audioEnabled && (
            <Badge variant="secondary">
              <MicOff className="w-3 h-3 mr-1" />
              Muted
            </Badge>
          )}
          {!videoEnabled && (
            <Badge variant="secondary">
              <VideoOff className="w-3 h-3 mr-1" />
              Camera off
            </Badge>
          )}
          {screenSharing && (
            <Badge variant="default">
              <Monitor className="w-3 h-3 mr-1" />
              Sharing screen
            </Badge>
          )}
          {handRaised && (
            <Badge variant="default" className="animate-pulse">
              <Hand className="w-3 h-3 mr-1" />
              Hand raised
            </Badge>
          )}
        </div>
      </div>

      {/* Recording Controls (Host only) */}
      {isHost && (
        <div className="mt-4 pt-4 border-t flex justify-center gap-2">
          <Button
            variant={isRecording ? 'destructive' : 'default'}
            size="sm"
            onClick={() => setIsRecording(!isRecording)}
          >
            <Circle className={`w-3 h-3 mr-2 ${isRecording ? 'animate-pulse' : ''}`} />
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </Button>
        </div>
      )}
    </Card>
  );
}
