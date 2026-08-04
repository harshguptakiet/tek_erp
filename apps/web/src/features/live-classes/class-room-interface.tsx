'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  Users,
  MessageSquare,
  Hand,
  Settings,
  PhoneOff,
  MoreVertical,
  Maximize,
} from 'lucide-react';

interface Participant {
  id: string;
  name: string;
  role: 'teacher' | 'student';
  isMuted: boolean;
  isVideoOn: boolean;
  isHandRaised: boolean;
}

interface Message {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: string;
}

interface ClassRoomInterfaceProps {
  classId: string;
  className: string;
  currentUser: {
    id: string;
    name: string;
    role: 'teacher' | 'student';
  };
  onLeave?: () => void;
}

export function ClassRoomInterface({
  classId,
  className,
  currentUser,
  onLeave,
}: ClassRoomInterfaceProps) {
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const [showParticipants, setShowParticipants] = useState(true);
  const [duration, setDuration] = useState(0);

  // Mock data
  const [participants, setParticipants] = useState<Participant[]>([
    {
      id: '1',
      name: 'John Doe (Teacher)',
      role: 'teacher',
      isMuted: false,
      isVideoOn: true,
      isHandRaised: false,
    },
    {
      id: '2',
      name: 'Alice Smith',
      role: 'student',
      isMuted: true,
      isVideoOn: true,
      isHandRaised: false,
    },
    {
      id: '3',
      name: 'Bob Johnson',
      role: 'student',
      isMuted: true,
      isVideoOn: false,
      isHandRaised: true,
    },
  ]);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      userId: '1',
      userName: 'John Doe',
      message: 'Welcome to the class everyone!',
      timestamp: new Date().toISOString(),
    },
  ]);

  const [newMessage, setNewMessage] = useState('');

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const toggleMute = () => setIsMuted(!isMuted);
  const toggleVideo = () => setIsVideoOn(!isVideoOn);
  const toggleScreenShare = () => setIsScreenSharing(!isScreenSharing);
  const toggleHandRaise = () => setIsHandRaised(!isHandRaised);

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      userId: currentUser.id,
      userName: currentUser.name,
      message: newMessage,
      timestamp: new Date().toISOString(),
    };

    setMessages([...messages, message]);
    setNewMessage('');
  };

  const handleLeave = () => {
    if (confirm('Are you sure you want to leave this class?')) {
      onLeave?.();
    }
  };

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 px-4 py-3 flex items-center justify-between border-b border-gray-700">
        <div>
          <h1 className="text-lg font-semibold">{className}</h1>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Badge variant="destructive" className="animate-pulse">
              ⬤ LIVE
            </Badge>
            <span>{formatDuration(duration)}</span>
            <span>•</span>
            <span>{participants.length} participants</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="text-white">
            <Settings className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="text-white">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video Area */}
        <div className="flex-1 flex flex-col">
          {/* Main Video */}
          <div className="flex-1 relative bg-black">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Video className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                <p className="text-gray-500">Main Video Stream</p>
                <p className="text-sm text-gray-600 mt-2">
                  {isScreenSharing ? 'Screen Sharing Active' : 'Camera Feed'}
                </p>
              </div>
            </div>

            {/* Video Controls Overlay */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
              <Button
                variant={isMuted ? 'destructive' : 'secondary'}
                size="lg"
                onClick={toggleMute}
                className="rounded-full w-12 h-12"
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </Button>
              <Button
                variant={!isVideoOn ? 'destructive' : 'secondary'}
                size="lg"
                onClick={toggleVideo}
                className="rounded-full w-12 h-12"
              >
                {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </Button>
              <Button
                variant={isScreenSharing ? 'default' : 'secondary'}
                size="lg"
                onClick={toggleScreenShare}
                className="rounded-full w-12 h-12"
              >
                <Monitor className="w-5 h-5" />
              </Button>
              {currentUser.role === 'student' && (
                <Button
                  variant={isHandRaised ? 'default' : 'secondary'}
                  size="lg"
                  onClick={toggleHandRaise}
                  className="rounded-full w-12 h-12"
                >
                  <Hand className="w-5 h-5" />
                </Button>
              )}
              <Button
                variant="destructive"
                size="lg"
                onClick={handleLeave}
                className="rounded-full w-12 h-12"
              >
                <PhoneOff className="w-5 h-5" />
              </Button>
            </div>

            {/* Participant Videos Grid (small) */}
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              {participants.slice(0, 4).map((participant) => (
                <div
                  key={participant.id}
                  className="w-32 h-24 bg-gray-800 rounded-lg overflow-hidden border-2 border-gray-700 relative"
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    {participant.isVideoOn ? (
                      <Video className="w-8 h-8 text-gray-500" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-xl">
                        {participant.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-2 py-1">
                    <p className="text-xs truncate">{participant.name}</p>
                  </div>
                  {!participant.isMuted && (
                    <div className="absolute top-2 right-2">
                      <Mic className="w-4 h-4 text-green-500" />
                    </div>
                  )}
                  {participant.isHandRaised && (
                    <div className="absolute top-2 left-2">
                      <Hand className="w-4 h-4 text-yellow-500 animate-bounce" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
          {/* Sidebar Tabs */}
          <div className="flex border-b border-gray-700">
            <button
              onClick={() => setShowChat(true)}
              className={`flex-1 px-4 py-3 text-sm font-medium ${
                showChat ? 'bg-gray-700 text-white' : 'text-gray-400'
              }`}
            >
              <MessageSquare className="w-4 h-4 inline mr-2" />
              Chat
            </button>
            <button
              onClick={() => setShowChat(false)}
              className={`flex-1 px-4 py-3 text-sm font-medium ${
                !showChat ? 'bg-gray-700 text-white' : 'text-gray-400'
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              People ({participants.length})
            </button>
          </div>

          {/* Chat Panel */}
          {showChat && (
            <div className="flex-1 flex flex-col">
              <ScrollArea className="flex-1 p-4">
                {messages.map((msg) => (
                  <div key={msg.id} className="mb-4">
                    <div className="flex items-start gap-2">
                      <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm flex-shrink-0">
                        {msg.userName.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{msg.userName}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-300 mt-1">{msg.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </ScrollArea>

              <div className="p-4 border-t border-gray-700">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Button onClick={sendMessage} size="sm">
                    Send
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Participants Panel */}
          {!showChat && (
            <ScrollArea className="flex-1 p-4">
              {participants.map((participant) => (
                <div
                  key={participant.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-700 mb-2"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-sm">
                    {participant.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{participant.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {participant.role === 'teacher' && (
                        <Badge variant="secondary" className="text-xs">
                          Teacher
                        </Badge>
                      )}
                      {participant.isHandRaised && (
                        <Hand className="w-3 h-3 text-yellow-500" />
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {participant.isMuted ? (
                      <MicOff className="w-4 h-4 text-red-500" />
                    ) : (
                      <Mic className="w-4 h-4 text-green-500" />
                    )}
                    {participant.isVideoOn ? (
                      <Video className="w-4 h-4 text-green-500" />
                    ) : (
                      <VideoOff className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                </div>
              ))}
            </ScrollArea>
          )}
        </div>
      </div>
    </div>
  );
}
