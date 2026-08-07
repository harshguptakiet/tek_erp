'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Upload,
  X,
  File,
  FileVideo,
  FileImage,
  FileText,
  Music,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  url?: string;
  error?: string;
}

interface ContentUploadManagerProps {
  onComplete?: (files: Array<{ url: string; metadata: any }>) => void;
  allowedTypes?: string[];
  maxSizeInMB?: number;
  maxFiles?: number;
}

export function ContentUploadManager({
  onComplete,
  allowedTypes = ['video/*', 'image/*', 'application/pdf', 'audio/*'],
  maxSizeInMB = 100,
  maxFiles = 10,
}: ContentUploadManagerProps) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [metadata, setMetadata] = useState({
    title: '',
    description: '',
    category: '',
    tags: '',
    accessLevel: 'private',
    allowDownload: false,
  });
  const [isDragging, setIsDragging] = useState(false);

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('video/')) return <FileVideo className="w-8 h-8 text-blue-600" />;
    if (file.type.startsWith('image/')) return <FileImage className="w-8 h-8 text-green-600" />;
    if (file.type.startsWith('audio/')) return <Music className="w-8 h-8 text-purple-600" />;
    if (file.type.includes('pdf')) return <FileText className="w-8 h-8 text-red-600" />;
    return <File className="w-8 h-8 text-gray-600" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    // Check file size
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      return `File size exceeds ${maxSizeInMB}MB limit`;
    }

    // Check file type
    const isAllowed = allowedTypes.some((type) => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.replace('/*', ''));
      }
      return file.type === type;
    });

    if (!isAllowed) {
      return 'File type not allowed';
    }

    return null;
  };

  const handleFiles = (fileList: FileList) => {
    const newFiles: UploadFile[] = [];

    Array.from(fileList).forEach((file) => {
      // Check max files limit
      if (files.length + newFiles.length >= maxFiles) {
        toast.error(`Maximum ${maxFiles} files allowed`);
        return;
      }

      // Validate file
      const error = validateFile(file);
      if (error) {
        toast.error(`${file.name}: ${error}`);
        return;
      }

      newFiles.push({
        id: `${Date.now()}-${Math.random()}`,
        file,
        progress: 0,
        status: 'pending',
      });
    });

    setFiles([...files, ...newFiles]);
    toast.success(`${newFiles.length} file(s) added`);
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const droppedFiles = e.dataTransfer.files;
      if (droppedFiles.length > 0) {
        handleFiles(droppedFiles);
      }
    },
    [files]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const removeFile = (id: string) => {
    setFiles(files.filter((f) => f.id !== id));
  };

  const simulateUpload = async (fileId: string) => {
    // Simulate file upload with progress
    const fileIndex = files.findIndex((f) => f.id === fileId);
    if (fileIndex === -1) return;

    const updatedFiles = [...files];
    updatedFiles[fileIndex].status = 'uploading';
    setFiles(updatedFiles);

    // Simulate progress
    for (let progress = 0; progress <= 100; progress += 10) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const currentFiles = [...files];
      const idx = currentFiles.findIndex((f) => f.id === fileId);
      if (idx !== -1) {
        currentFiles[idx].progress = progress;
        if (progress === 100) {
          currentFiles[idx].status = 'completed';
          currentFiles[idx].url = `https://example.com/uploads/${currentFiles[idx].file.name}`;
        }
        setFiles(currentFiles);
      }
    }
  };

  const uploadAll = async () => {
    if (!metadata.title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    const pendingFiles = files.filter((f) => f.status === 'pending');
    if (pendingFiles.length === 0) {
      toast.error('No files to upload');
      return;
    }

    // Upload files sequentially (in real app, could be parallel)
    for (const file of pendingFiles) {
      await simulateUpload(file.id);
    }

    toast.success('All files uploaded successfully');

    // Call completion callback
    const uploadedFiles = files
      .filter((f) => f.status === 'completed')
      .map((f) => ({
        url: f.url!,
        metadata: {
          ...metadata,
          filename: f.file.name,
          size: f.file.size,
          type: f.file.type,
        },
      }));

    onComplete?.(uploadedFiles);
  };

  const categories = [
    'Lecture',
    'Tutorial',
    'Assignment',
    'Reference Material',
    'Exam Paper',
    'Practice Questions',
    'Other',
  ];

  const getTotalSize = () => {
    return files.reduce((total, f) => total + f.file.size, 0);
  };

  const getCompletedCount = () => {
    return files.filter((f) => f.status === 'completed').length;
  };

  return (
    <div className="space-y-6">
      {/* Metadata Form */}
      <Card>
        <CardHeader>
          <CardTitle>Content Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Enter content title"
                value={metadata.title}
                onChange={(e) => setMetadata({ ...metadata, title: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <Select
                value={metadata.category}
                onChange={(e) => setMetadata({ ...metadata, category: e.target.value })}
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <Textarea
              placeholder="Enter content description"
              value={metadata.description}
              onChange={(e) => setMetadata({ ...metadata, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
              <Input
                placeholder="e.g., chapter1, important, theory"
                value={metadata.tags}
                onChange={(e) => setMetadata({ ...metadata, tags: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Access Level</label>
              <Select
                value={metadata.accessLevel}
                onChange={(e) => setMetadata({ ...metadata, accessLevel: e.target.value })}
              >
                <option value="private">Private</option>
                <option value="class">Class Only</option>
                <option value="school">Entire School</option>
                <option value="public">Public</option>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              checked={metadata.allowDownload}
              onCheckedChange={(checked) =>
                setMetadata({ ...metadata, allowDownload: checked as boolean })
              }
            />
            <label className="text-sm">Allow students to download</label>
          </div>
        </CardContent>
      </Card>

      {/* Upload Area */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Upload Files</CardTitle>
            <Badge variant="secondary">
              {files.length}/{maxFiles} files
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Drop Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center transition-colors
              ${isDragging ? 'border-primary bg-primary/10' : 'border-gray-300'}
            `}
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">
              Drag & drop files here, or click to browse
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Max {maxSizeInMB}MB per file • Up to {maxFiles} files
            </p>
            <input
              type="file"
              multiple
              accept={allowedTypes.join(',')}
              onChange={(e) => e.target.files && handleFiles(e.target.files)}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload">
              <Button variant="outline" asChild>
                <span>Browse Files</span>
              </Button>
            </label>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">
                  Files ({getCompletedCount()}/{files.length} uploaded)
                </p>
                <p className="text-sm text-muted-foreground">
                  Total: {formatFileSize(getTotalSize())}
                </p>
              </div>

              {files.map((uploadFile) => (
                <Card key={uploadFile.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      {getFileIcon(uploadFile.file)}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{uploadFile.file.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatFileSize(uploadFile.file.size)}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            {uploadFile.status === 'completed' && (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            )}
                            {uploadFile.status === 'error' && (
                              <AlertCircle className="w-5 h-5 text-red-600" />
                            )}
                            {uploadFile.status === 'uploading' && (
                              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(uploadFile.id)}
                              disabled={uploadFile.status === 'uploading'}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {uploadFile.status !== 'pending' && (
                          <div className="mt-2">
                            <Progress value={uploadFile.progress} className="h-2" />
                            <p className="text-xs text-muted-foreground mt-1">
                              {uploadFile.progress}% •{' '}
                              {uploadFile.status === 'completed'
                                ? 'Completed'
                                : uploadFile.status === 'error'
                                ? uploadFile.error
                                : 'Uploading...'}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      {files.length > 0 && (
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setFiles([])}>
            Clear All
          </Button>
          <Button onClick={uploadAll} disabled={files.every((f) => f.status === 'completed')}>
            <Upload className="w-4 h-4 mr-2" />
            Upload All Files
          </Button>
        </div>
      )}
    </div>
  );
}
