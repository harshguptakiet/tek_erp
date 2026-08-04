'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Download,
  FileText,
  FileVideo,
  FileAudio,
  File,
} from 'lucide-react';
import { useState } from 'react';

interface ContentPlayerProps {
  content: {
    id: string;
    title: string;
    contentType: string;
    url: string;
    duration?: number;
    description?: string;
  };
  onComplete?: () => void;
}

export function ContentPlayer({ content, onComplete }: ContentPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const getContentIcon = (type: string) => {
    if (type.includes('video')) return FileVideo;
    if (type.includes('audio')) return FileAudio;
    if (type.includes('pdf') || type.includes('document')) return FileText;
    return File;
  };

  const renderPlayer = () => {
    const type = content.contentType.toLowerCase();

    // Video Player
    if (type.includes('video')) {
      return (
        <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
          <video
            src={content.url}
            controls
            className="w-full h-full"
            onEnded={onComplete}
          >
            Your browser does not support the video tag.
          </video>
        </div>
      );
    }

    // Audio Player
    if (type.includes('audio')) {
      return (
        <div className="bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg p-8 flex items-center justify-center">
          <div className="text-center text-white space-y-4">
            <FileAudio className="w-16 h-16 mx-auto opacity-80" />
            <h3 className="text-xl font-semibold">{content.title}</h3>
            <audio
              src={content.url}
              controls
              className="w-full mt-4"
              onEnded={onComplete}
            >
              Your browser does not support the audio element.
            </audio>
          </div>
        </div>
      );
    }

    // PDF Viewer
    if (type.includes('pdf')) {
      return (
        <div className="border rounded-lg overflow-hidden">
          <iframe
            src={content.url}
            className="w-full h-[600px]"
            title={content.title}
          />
        </div>
      );
    }

    // Document/Text Viewer
    if (type.includes('document') || type.includes('text')) {
      return (
        <Card className="p-8">
          <div className="prose max-w-none">
            <iframe
              src={content.url}
              className="w-full h-[600px] border-0"
              title={content.title}
            />
          </div>
        </Card>
      );
    }

    // Image Viewer
    if (type.includes('image')) {
      return (
        <div className="border rounded-lg overflow-hidden">
          <img
            src={content.url}
            alt={content.title}
            className="w-full h-auto"
          />
        </div>
      );
    }

    // Default - Download option
    return (
      <Card className="p-12 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-4">
          <File className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold mb-2">{content.title}</h3>
        <p className="text-gray-600 mb-4">
          This file type cannot be previewed in the browser
        </p>
        <Button asChild>
          <a href={content.url} download target="_blank" rel="noopener noreferrer">
            <Download className="w-4 h-4 mr-2" />
            Download File
          </a>
        </Button>
      </Card>
    );
  };

  const Icon = getContentIcon(content.contentType);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <Icon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-1">{content.title}</h2>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{content.contentType}</Badge>
              {content.duration && (
                <span className="text-sm text-gray-500">
                  {Math.floor(content.duration / 60)}:{String(content.duration % 60).padStart(2, '0')}
                </span>
              )}
            </div>
          </div>
        </div>
        <Button variant="outline" size="sm" asChild>
          <a href={content.url} download target="_blank" rel="noopener noreferrer">
            <Download className="w-4 h-4" />
          </a>
        </Button>
      </div>

      {/* Description */}
      {content.description && (
        <Card className="p-4 bg-gray-50">
          <p className="text-sm text-gray-700">{content.description}</p>
        </Card>
      )}

      {/* Player */}
      {renderPlayer()}

      {/* Actions */}
      <div className="flex justify-center gap-2">
        <Button variant="outline" size="sm" onClick={onComplete}>
          Mark as Complete
        </Button>
        <Button variant="outline" size="sm">
          Add to Favorites
        </Button>
        <Button variant="outline" size="sm">
          Report Issue
        </Button>
      </div>
    </div>
  );
}
