/**
 * Messages Center
 */

'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  const conversations = [
    { id: '1', name: 'John Doe (Parent)', lastMessage: 'Thank you for the update', unread: 2, time: new Date() },
    { id: '2', name: 'Math Department', lastMessage: 'Meeting scheduled for tomorrow', unread: 0, time: new Date() },
  ];

  const messages = selectedConversation ? [
    { id: '1', text: 'Hello, how is my child doing?', sender: 'them', time: new Date() },
    { id: '2', text: 'Your child is doing great! Making good progress.', sender: 'me', time: new Date() },
  ] : [];

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Messages</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversations List */}
        <Card className="lg:col-span-1">
          <div className="p-4 border-b">
            <Input placeholder="Search conversations..." />
          </div>
          <div className="divide-y max-h-[600px] overflow-y-auto">
            {conversations.map(conv => (
              <div
                key={conv.id}
                onClick={() => setSelectedConversation(conv.id)}
                className={`p-4 cursor-pointer hover:bg-muted/50 ${selectedConversation === conv.id ? 'bg-muted' : ''}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="font-semibold">{conv.name}</div>
                  {conv.unread > 0 && (
                    <Badge className="bg-blue-600">{conv.unread}</Badge>
                  )}
                </div>
                <div className="text-sm text-muted-foreground truncate">{conv.lastMessage}</div>
                <div className="text-xs text-muted-foreground mt-1">{format(conv.time, 'HH:mm')}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Message Thread */}
        <Card className="lg:col-span-2">
          {selectedConversation ? (
            <>
              <div className="p-4 border-b">
                <h3 className="font-semibold">{conversations.find(c => c.id === selectedConversation)?.name}</h3>
              </div>
              <div className="p-4 space-y-4 h-[450px] overflow-y-auto">
                {messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] p-3 rounded-lg ${
                      msg.sender === 'me' ? 'bg-blue-600 text-white' : 'bg-muted'
                    }`}>
                      <div>{msg.text}</div>
                      <div className={`text-xs mt-1 ${msg.sender === 'me' ? 'text-blue-100' : 'text-muted-foreground'}`}>
                        {format(msg.time, 'HH:mm')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Type your message..."
                    rows={2}
                  />
                  <Button onClick={() => setMessage('')}>Send</Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-[600px] text-muted-foreground">
              Select a conversation to start messaging
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
