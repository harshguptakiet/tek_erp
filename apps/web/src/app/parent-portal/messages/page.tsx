/**
 * Parent Messages Page
 */

'use client';

import { useState } from 'react';
import { useParentMessages, useSendMessage } from '@/features/parent/use-parent';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export default function ParentMessagesPage() {
  const { data: messages } = useParentMessages();
  const sendMessageMutation = useSendMessage();
  const [showCompose, setShowCompose] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSend = async () => {
    await sendMessageMutation.mutateAsync({
      toUserId: 'teacher-id',
      subject,
      message,
    });
    setShowCompose(false);
    setSubject('');
    setMessage('');
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Messages</h1>
        <Button onClick={() => setShowCompose(!showCompose)}>Compose Message</Button>
      </div>

      {showCompose && (
        <Card className="p-6 space-y-4">
          <Input placeholder="Subject" value={subject} onChange={e => setSubject(e.target.value)} />
          <Textarea placeholder="Your message..." rows={4} value={message} onChange={e => setMessage(e.target.value)} />
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowCompose(false)}>Cancel</Button>
            <Button onClick={handleSend} disabled={sendMessageMutation.isPending}>Send</Button>
          </div>
        </Card>
      )}

      <div className="space-y-3">
        {messages?.map(msg => (
          <Card key={msg.id} className="p-4 hover:bg-muted/50 cursor-pointer">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h4 className="font-semibold">{msg.subject}</h4>
                  {!msg.isRead && <Badge className="bg-blue-100 text-blue-800">New</Badge>}
                </div>
                <p className="text-sm text-muted-foreground mb-2">{msg.fromName}</p>
                <p className="text-sm">{msg.message}</p>
              </div>
              <span className="text-xs text-muted-foreground">{format(new Date(msg.createdAt), 'MMM dd')}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
