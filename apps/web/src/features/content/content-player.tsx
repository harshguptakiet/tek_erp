'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Download,
  Share2,
  BookmarkPlus,
  ThumbsUp,
  FileText,
  Clock,
  Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContentPlayerProps {
  content: {
    id: string;
    title: string;
    description?: string;
    contentType: 'VIDEO' | 'PDF' | 'IMAGE' | 'AUDIO' | 'DOCUMENT';
    fileUrl: string;
    duration?: number;
    views: number;
    likes: number;
    createdAt: string;
    author: {
      name: string;
      avatar?: string;
    };
    tags?: string[];
  };
  onComplete?: () => void;
  onLike?: () => void;
  onBookmark?: () => void;
}

export function ContentPlayer({ content, onComplete, onLike, onBookmark }: ContentPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    onLike?.();
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    onBookmark?.();
  };

  const renderPlayer = () => {
    switch (content.contentType) {
      case 'VIDEO':
        return (
          <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
            <video
              src={content.fileUrl}
              className="w-full h-full"
              controls
              onTimeUpdate={(e) => {
                const video = e.currentTarget;
                setProgress((video.currentTime / video.duration) * 100);
              }}
              onEnded={() => onComplete?.()}
            />
          </div>
        );

      case 'AUDIO':
        return (
          <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-[hsl(var(--border))] rounded-lg p-8">
            <div className="text-center mb-6">
              <div className="w-32 h-32 mx-auto bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-full flex items-center justify-center mb-4">
                <Volume2 className="h-16 w-16 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold">{content.title}</h3>
            </div>
            <audio
              src={content.fileUrl}
              className="w-full"
              controls
              onTimeUpdate={(e) => {
                const audio = e.currentTarget;
                setProgress((audio.currentTime / audio.duration) * 100);
              }}
              onEnded={() => onComplete?.()}
            />
          </div>
        );

      case 'PDF':
      case 'DOCUMENT':
        return (
          <div className="bg-gray-50 rounded-lg p-8 text-center min-h-[400px] flex flex-col items-center justify-center">
            <FileText className="h-24 w-24 text-gray-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">{content.title}</h3>
            <p className="text-muted-foreground mb-6">Document Preview</p>
            <div className="flex gap-2">
              <Button onClick={() => window.open(content.fileUrl, '_blank')}>
                View Document
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        );

      case 'IMAGE':
        return (
          <div className="bg-gray-50 rounded-lg overflow-hidden">
            <img
              src={content.fileUrl}
              alt={content.title}
              className="w-full h-auto max-h-[600px] object-contain"
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Player */}
      <Card className="p-6">
        {renderPlayer()}
      </Card>

      {/* Content Info */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-2">{content.title}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {content.views} views
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {new Date(content.createdAt).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                by {content.author.name}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleLike}
              className={cn(isLiked && 'text-red-500')}
            >
              <ThumbsUp className="h-4 w-4 mr-2" />
              {content.likes + (isLiked ? 1 : 0)}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleBookmark}
              className={cn(isBookmarked && 'text-blue-500')}
            >
              <BookmarkPlus className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Separator className="my-4" />

        <Tabs defaultValue="description" className="w-full">
          <TabsList>
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="related">Related Content</TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="space-y-4">
            <div>
              <p className="text-muted-foreground">
                {content.description || 'No description available'}
              </p>
            </div>

            {content.tags && content.tags.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {content.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="notes">
            <div className="text-center py-8 text-muted-foreground">
              <p>No notes yet. Start taking notes while learning!</p>
            </div>
          </TabsContent>

          <TabsContent value="related">
            <div className="text-center py-8 text-muted-foreground">
              <p>No related content available</p>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
