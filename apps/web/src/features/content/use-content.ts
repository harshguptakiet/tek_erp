import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contentService } from '@/services/content.service';
import { useAuthStore } from '@/stores/auth.store';
import { toast } from 'sonner';

// Query Keys
export const contentKeys = {
  all: ['content'] as const,
  lists: () => [...contentKeys.all, 'list'] as const,
  list: (filters: any) => [...contentKeys.lists(), filters] as const,
  details: () => [...contentKeys.all, 'detail'] as const,
  detail: (id: string) => [...contentKeys.details(), id] as const,
  bySubject: (subjectId: string) => [...contentKeys.all, 'subject', subjectId] as const,
  byTeacher: (teacherId: string) => [...contentKeys.all, 'teacher', teacherId] as const,
  collections: () => [...contentKeys.all, 'collections'] as const,
  collection: (id: string) => [...contentKeys.collections(), id] as const,
};

// Fetch content list
export function useContent(filters?: any) {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: contentKeys.list(filters || {}),
    queryFn: () => contentService.searchContent(filters),
    enabled: !!user?.schoolId,
  });
}

// Fetch single content by ID
export function useContentById(id: string) {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: contentKeys.detail(id),
    queryFn: () => contentService.getContent(id),
    enabled: !!user?.schoolId && !!id,
  });
}

// Fetch collections
export function useCollections(filters?: any) {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: [...contentKeys.collections(), filters],
    queryFn: () => contentService.listCollections(filters),
    enabled: !!user?.schoolId,
  });
}

// Fetch single collection
export function useCollection(id: string) {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: contentKeys.collection(id),
    queryFn: () => contentService.getCollection(id),
    enabled: !!user?.schoolId && !!id,
  });
}

// Create content metadata mutation
export function useCreateContent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => contentService.createContent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contentKeys.lists() });
      toast.success('Content created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create content: ${error.message}`);
    },
  });
}

// Update content mutation
export function useUpdateContent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      contentService.updateContent(id, data),
    onSuccess: (_data: any, variables: { id: string; data: any }) => {
      queryClient.invalidateQueries({ queryKey: contentKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: contentKeys.lists() });
      toast.success('Content updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update content: ${error.message}`);
    },
  });
}

// Delete content mutation
export function useDeleteContent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => contentService.deleteContent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contentKeys.lists() });
      toast.success('Content deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete content: ${error.message}`);
    },
  });
}

// Create collection mutation
export function useCreateCollection() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => contentService.createCollection(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contentKeys.collections() });
      toast.success('Collection created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create collection: ${error.message}`);
    },
  });
}

// Add content to collection mutation
export function useAddContentToCollection() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ collectionId, contentId }: { collectionId: string; contentId: string }) =>
      contentService.addToCollection(collectionId, contentId),
    onSuccess: (_data: any, variables: { collectionId: string; contentId: string }) => {
      queryClient.invalidateQueries({ queryKey: contentKeys.collection(variables.collectionId) });
      toast.success('Content added to collection');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add content: ${error.message}`);
    },
  });
}

// Remove content from collection mutation
export function useRemoveContentFromCollection() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ collectionId, contentId }: { collectionId: string; contentId: string }) =>
      contentService.removeFromCollection(collectionId, contentId),
    onSuccess: (_data: any, variables: { collectionId: string; contentId: string }) => {
      queryClient.invalidateQueries({ queryKey: contentKeys.collection(variables.collectionId) });
      toast.success('Content removed from collection');
    },
    onError: (error: Error) => {
      toast.error(`Failed to remove content: ${error.message}`);
    },
  });
}

// Tag content mutation
export function useTagContent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ contentId, tags }: { contentId: string; tags: string[] }) =>
      contentService.tagContent(contentId, tags),
    onSuccess: (_data: any, variables: { contentId: string; tags: string[] }) => {
      queryClient.invalidateQueries({ queryKey: contentKeys.detail(variables.contentId) });
      toast.success('Tags updated');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update tags: ${error.message}`);
    },
  });
}
