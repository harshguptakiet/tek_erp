'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Hand,
  UserMinus,
  Search,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useMuteParticipant,
  useUnmuteParticipant,
  useRemoveParticipant,
} from './use-live-classes';
import { toast } from 'sonner';

interface Participant {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  role: 'TEACHER' | 'STUDENT';
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isHandRaised: boolean;
  joinTime: string;
  profilePicture?: string;
}

interface ParticipantListProps {
  classId: string;
  participants: Participant[];
  currentUserId: string;
  isHost?: boolean;
}

export function ParticipantList({
  classId,
  participants,
  currentUserId,
  isHost = false,
}: ParticipantListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const muteParticipant = useMuteParticipant();
  const unmuteParticipant = useUnmuteParticipant();
  const removeParticipant = useRemoveParticipant();

  const filteredParticipants = participants.filter((p) =>
    p.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.userEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const teachers = filteredParticipants.filter((p) => p.role === 'TEACHER');
  const students = filteredParticipants.filter((p) => p.role === 'STUDENT');

  const handleMuteToggle = async (participant: Participant) => {
    try {
      if (participant.isAudioEnabled) {
        await muteParticipant.mutateAsync({
          classId,
          participantId: participant.id || participant.userId,
        });
      } else {
        await unmuteParticipant.mutateAsync({
          classId,
          participantId: participant.id || participant.userId,
        });
      }
    } catch (error) {
      toast.error('Failed to toggle mute');
    }
  };

  const handleRemove = async (participant: Participant) => {
    if (window.confirm(`Remove ${participant.userName} from the class?`)) {
      try {
        await removeParticipant.mutateAsync({
          classId,
          participantId: participant.id || participant.userId,
        });
        toast.success(`${participant.userName} removed from class`);
      } catch (error) {
        toast.error('Failed to remove participant');
      }
    }
  };

  const renderParticipant = (participant: Participant) => (
    <div
      key={participant.id}
      className={cn(
        'flex items-center justify-between p-3 rounded-lg border',
        participant.isHandRaised && 'bg-yellow-50 border-yellow-300'
      )}
    >
      <div className="flex items-center gap-3 flex-1">
        <Avatar>
          <AvatarImage src={participant.profilePicture} alt={participant.userName} />
          <AvatarFallback>
            {participant.userName.split(' ').map((n) => n[0]).join('')}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium truncate">{participant.userName}</p>
            {participant.userId === currentUserId && (
              <Badge variant="info" className="text-xs">You</Badge>
            )}
            {participant.isHandRaised && (
              <Badge variant="warning" className="flex items-center gap-1">
                <Hand className="h-3 w-3" />
                Hand Raised
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground truncate">
            {participant.userEmail}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          {participant.isAudioEnabled ? (
            <Mic className="h-4 w-4 text-green-500" />
          ) : (
            <MicOff className="h-4 w-4 text-red-500" />
          )}
          {participant.isVideoEnabled ? (
            <Video className="h-4 w-4 text-green-500" />
          ) : (
            <VideoOff className="h-4 w-4 text-red-500" />
          )}
        </div>

        {isHost && participant.userId !== currentUserId && (
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleMuteToggle(participant)}
              disabled={muteParticipant.isPending || unmuteParticipant.isPending}
            >
              {participant.isAudioEnabled ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleRemove(participant)}
              disabled={removeParticipant.isPending}
            >
              <UserMinus className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <Card className="p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold">
            Participants ({participants.length})
          </h3>
        </div>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search participants..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4">
        {teachers.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">
              Teachers ({teachers.length})
            </h4>
            <div className="space-y-2">
              {teachers.map(renderParticipant)}
            </div>
          </div>
        )}

        {students.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">
              Students ({students.length})
            </h4>
            <div className="space-y-2">
              {students.map(renderParticipant)}
            </div>
          </div>
        )}

        {filteredParticipants.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No participants found
          </div>
        )}
      </div>
    </Card>
  );
}
