'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FileUploader } from '@/components/ui/file-uploader';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  SelectRoot,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileVideo, FileText, FileImage, FileAudio, Upload, X } from 'lucide-react';
import { useCreateContent } from './use-content';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const contentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  contentType: z.enum(['VIDEO', 'PDF', 'IMAGE', 'AUDIO', 'DOCUMENT']),
  subjectId: z.string().min(1, 'Subject is required'),
  classId: z.string().min(1, 'Class is required'),
  tags: z.array(z.string()).optional(),
  isPublic: z.boolean().default(false),
});

type ContentFormData = z.infer<typeof contentSchema>;

interface ContentUploaderProps {
  subjects?: Array<{ id: string; name: string }>;
  classes?: Array<{ id: string; name: string }>;
  onSuccess?: () => void;
}

export function ContentUploader({ subjects = [], classes = [], onSuccess }: ContentUploaderProps) {
  const router = useRouter();
  const createContent = useCreateContent();
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<ContentFormData>({
    resolver: zodResolver(contentSchema),
    defaultValues: {
      isPublic: false,
      tags: [],
    },
  });

  const contentType = watch('contentType');

  const getAcceptedFileTypes = () => {
    switch (contentType) {
      case 'VIDEO':
        return '.mp4,.mov,.avi,.mkv';
      case 'PDF':
        return '.pdf';
      case 'IMAGE':
        return '.jpg,.jpeg,.png,.gif,.webp';
      case 'AUDIO':
        return '.mp3,.wav,.ogg,.m4a';
      case 'DOCUMENT':
        return '.doc,.docx,.ppt,.pptx,.txt';
      default:
        return '*';
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'VIDEO':
        return <FileVideo className="h-8 w-8 text-purple-500" />;
      case 'PDF':
      case 'DOCUMENT':
        return <FileText className="h-8 w-8 text-blue-500" />;
      case 'IMAGE':
        return <FileImage className="h-8 w-8 text-green-500" />;
      case 'AUDIO':
        return <FileAudio className="h-8 w-8 text-orange-500" />;
      default:
        return <FileText className="h-8 w-8 text-gray-500" />;
    }
  };

  const addTag = () => {
    if (tagInput && !tags.includes(tagInput)) {
      const newTags = [...tags, tagInput];
      setTags(newTags);
      setValue('tags', newTags);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    const newTags = tags.filter((t) => t !== tag);
    setTags(newTags);
    setValue('tags', newTags);
  };

  const onSubmit = async (data: ContentFormData) => {
    if (files.length === 0) {
      toast.error('Please select a file to upload');
      return;
    }

    setIsUploading(true);
    try {
      // Simulate upload progress
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i);
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      // In real app, upload file to storage first
      const fileUrl = URL.createObjectURL(files[0]);

      await createContent.mutateAsync({
        ...data,
        fileUrl,
        fileName: files[0].name,
        fileSize: files[0].size,
        tags,
      });

      toast.success('Content uploaded successfully');
      onSuccess?.();
      router.push('/content');
    } catch (error) {
      console.error('Failed to upload content:', error);
      toast.error('Failed to upload content');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="details">Content Details</TabsTrigger>
          <TabsTrigger value="file">Upload File</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <Card className="p-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Title <span className="text-red-500">*</span>
                </label>
                <Input
                  {...register('title')}
                  placeholder="Introduction to Algebra"
                />
                {errors.title && (
                  <p className="text-sm text-red-500">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  {...register('description')}
                  placeholder="Describe the content..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Content Type <span className="text-red-500">*</span>
                  </label>
                  <SelectRoot
                    onValueChange={(value) => setValue('contentType', value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VIDEO">Video</SelectItem>
                      <SelectItem value="PDF">PDF Document</SelectItem>
                      <SelectItem value="IMAGE">Image</SelectItem>
                      <SelectItem value="AUDIO">Audio</SelectItem>
                      <SelectItem value="DOCUMENT">Document</SelectItem>
                    </SelectContent>
                  </SelectRoot>
                  {errors.contentType && (
                    <p className="text-sm text-red-500">{errors.contentType.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <SelectRoot
                    onValueChange={(value) => setValue('subjectId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </SelectRoot>
                  {errors.subjectId && (
                    <p className="text-sm text-red-500">{errors.subjectId.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Class <span className="text-red-500">*</span>
                  </label>
                  <SelectRoot
                    onValueChange={(value) => setValue('classId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </SelectRoot>
                  {errors.classId && (
                    <p className="text-sm text-red-500">{errors.classId.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Tags</label>
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    placeholder="Add tags (press Enter)"
                  />
                  <Button type="button" onClick={addTag} variant="outline">
                    Add
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => removeTag(tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="file" className="space-y-4">
          <Card className="p-6">
            <div className="space-y-4">
              {!contentType ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>Please select a content type first</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    {getFileIcon(contentType)}
                    <div>
                      <h3 className="font-medium">
                        Upload {contentType.toLowerCase()} file
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Accepted formats: {getAcceptedFileTypes()}
                      </p>
                    </div>
                  </div>

                  <FileUploader
                    value={files}
                    onChange={setFiles}
                    maxFiles={1}
                    maxSize={contentType === 'VIDEO' ? 500 * 1024 * 1024 : 50 * 1024 * 1024}
                    accept={getAcceptedFileTypes()}
                    showPreview={true}
                  />

                  {isUploading && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Uploading...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <Progress value={uploadProgress} />
                    </div>
                  )}

                  {files.length > 0 && !isUploading && (
                    <div className="bg-muted p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{files[0].name}</p>
                          <p className="text-sm text-muted-foreground">
                            {(files[0].size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setFiles([])}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting || isUploading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || isUploading || files.length === 0}>
          {isUploading ? 'Uploading...' : isSubmitting ? 'Saving...' : 'Upload Content'}
        </Button>
      </div>
    </form>
  );
}
