import { apiClient } from '../lib/axios';

// Content Service - Complete integration with backend API
export const contentService = {
  // ==================== CONTENT CRUD ====================
  createContent: async (data: {
    title: string;
    contentType: string;
    description?: string;
    url?: string;
    metadata?: any;
  }) => {
    const response = await apiClient.post('/content', data);
    return response.data;
  },

  getContent: async (id: string) => {
    const response = await apiClient.get(`/content/${id}`);
    return response.data;
  },

  updateContent: async (id: string, data: {
    title?: string;
    description?: string;
    metadata?: any;
  }) => {
    const response = await apiClient.put(`/content/${id}`, data);
    return response.data;
  },

  deleteContent: async (id: string) => {
    const response = await apiClient.delete(`/content/${id}`);
    return response.data;
  },

  // ==================== SEARCH & FILTER ====================
  searchContent: async (filters: {
    query?: string;
    contentType?: string;
    grade?: number;
    subjectId?: string;
    status?: string;
    creatorId?: string;
  }) => {
    const response = await apiClient.get('/content/search', {
      params: filters,
    });
    return response.data;
  },

  // ==================== REVIEWS ====================
  reviewContent: async (id: string, data: {
    rating: number;
    comment?: string;
  }) => {
    const response = await apiClient.post(`/content/${id}/reviews`, data);
    return response.data;
  },

  // ==================== WORKFLOW ====================
  workflowAction: async (id: string, data: {
    action: string;
    comments?: string;
  }) => {
    const response = await apiClient.post(`/content/${id}/workflow`, data);
    return response.data;
  },

  getVersionHistory: async (id: string) => {
    const response = await apiClient.get(`/content/${id}/versions`);
    return response.data;
  },

  // ==================== DRAFTS ====================
  saveDraft: async (data: {
    title: string;
    contentType: string;
    draftData: any;
  }) => {
    const response = await apiClient.post('/content/drafts', data);
    return response.data;
  },

  listDrafts: async () => {
    const response = await apiClient.get('/content/drafts/my');
    return response.data;
  },

  // ==================== COLLECTIONS ====================
  createCollection: async (data: {
    name: string;
    description?: string;
    isPublic?: boolean;
  }) => {
    const response = await apiClient.post('/content/collections', data);
    return response.data;
  },

  listCollections: async (isPublic?: boolean) => {
    const response = await apiClient.get('/content/collections', {
      params: isPublic !== undefined ? { isPublic } : {},
    });
    return response.data;
  },

  getCollection: async (collectionId: string) => {
    const response = await apiClient.get(`/content/collections/${collectionId}`);
    return response.data;
  },

  addToCollection: async (collectionId: string, contentId: string) => {
    const response = await apiClient.post(
      `/content/collections/${collectionId}/items/${contentId}`
    );
    return response.data;
  },

  removeFromCollection: async (collectionId: string, contentId: string) => {
    const response = await apiClient.delete(
      `/content/collections/${collectionId}/items/${contentId}`
    );
    return response.data;
  },

  // ==================== MODERATION ====================
  moderateContent: async (id: string, data: {
    action: string;
    reason?: string;
  }) => {
    const response = await apiClient.post(`/content/${id}/moderate`, data);
    return response.data;
  },

  getModerationQueue: async (status?: string) => {
    const response = await apiClient.get('/content/moderation/queue', {
      params: status ? { status } : {},
    });
    return response.data;
  },

  // ==================== LEARNING PATHS ====================
  createLearningPath: async (data: {
    name: string;
    description?: string;
    grade?: number;
    subjectId?: string;
  }) => {
    const response = await apiClient.post('/content/learning-paths', data);
    return response.data;
  },

  listLearningPaths: async (filters?: {
    grade?: number;
    subjectId?: string;
  }) => {
    const response = await apiClient.get('/content/learning-paths', {
      params: filters,
    });
    return response.data;
  },

  getLearningPath: async (pathId: string) => {
    const response = await apiClient.get(`/content/learning-paths/${pathId}`);
    return response.data;
  },

  enrollInLearningPath: async (pathId: string) => {
    const response = await apiClient.post(`/content/learning-paths/${pathId}/enroll`);
    return response.data;
  },

  updateLearningProgress: async (pathId: string, progress: number) => {
    const response = await apiClient.put(`/content/learning-paths/${pathId}/progress`, {
      progress,
    });
    return response.data;
  },

  // ==================== ANALYTICS ====================
  getContentAnalytics: async (id: string) => {
    const response = await apiClient.get(`/content/${id}/analytics`);
    return response.data;
  },

  getCreatorAnalytics: async (creatorId: string) => {
    const response = await apiClient.get(`/content/analytics/creator/${creatorId}`);
    return response.data;
  },

  // ==================== CURRICULUM ====================
  createCurriculum: async (data: {
    boardId: string;
    grade: number;
    name: string;
    description?: string;
  }) => {
    const response = await apiClient.post('/content/curriculum', data);
    return response.data;
  },

  listCurricula: async (filters?: {
    boardId?: string;
    isActive?: boolean;
  }) => {
    const response = await apiClient.get('/content/curriculum', {
      params: filters,
    });
    return response.data;
  },

  getCurriculum: async (curriculumId: string) => {
    const response = await apiClient.get(`/content/curriculum/${curriculumId}`);
    return response.data;
  },

  updateCurriculum: async (curriculumId: string, data: any) => {
    const response = await apiClient.put(`/content/curriculum/${curriculumId}`, data);
    return response.data;
  },

  deleteCurriculum: async (curriculumId: string) => {
    const response = await apiClient.delete(`/content/curriculum/${curriculumId}`);
    return response.data;
  },

  addSubjectToCurriculum: async (curriculumId: string, data: {
    subjectId: string;
    weeklyHours: number;
  }) => {
    const response = await apiClient.post(`/content/curriculum/${curriculumId}/subjects`, data);
    return response.data;
  },

  removeSubjectFromCurriculum: async (curriculumId: string, curriculumSubjectId: string) => {
    const response = await apiClient.delete(
      `/content/curriculum/${curriculumId}/subjects/${curriculumSubjectId}`
    );
    return response.data;
  },

  getCurriculumByGrade: async (boardId: string, grade: number) => {
    const response = await apiClient.get(`/content/curriculum/board/${boardId}/grade/${grade}`);
    return response.data;
  },

  // ==================== BULK OPERATIONS ====================
  bulkUploadContent: async (contents: any[]) => {
    const response = await apiClient.post('/content/bulk-upload', { contents });
    return response.data;
  },

  // ==================== TAGS ====================
  getPopularTags: async (limit?: number) => {
    const response = await apiClient.post('/content/tags/popular', { limit });
    return response.data;
  },

  tagContent: async (id: string, tags: string[]) => {
    const response = await apiClient.post(`/content/${id}/tag`, { tags });
    return response.data;
  },

  // ==================== RECOMMENDATIONS ====================
  getContentRecommendations: async (contentId?: string, limit?: number) => {
    const response = await apiClient.post('/content/recommendations', {
      contentId,
      limit,
    });
    return response.data;
  },

  duplicateContent: async (id: string) => {
    const response = await apiClient.post(`/content/${id}/duplicate`);
    return response.data;
  },

  // ==================== CURRICULUM UNITS ====================
  createCurriculumUnit: async (curriculumSubjectId: string, data: {
    name: string;
    description?: string;
  }) => {
    const response = await apiClient.post(
      `/content/curriculum/${curriculumSubjectId}/units`,
      data
    );
    return response.data;
  },

  reorderUnits: async (curriculumSubjectId: string, unitIds: string[]) => {
    const response = await apiClient.post(
      `/content/curriculum/${curriculumSubjectId}/units/reorder`,
      { unitIds }
    );
    return response.data;
  },

  mapContentToUnit: async (unitId: string, contentId: string) => {
    const response = await apiClient.post(
      `/content/curriculum/units/${unitId}/map/${contentId}`
    );
    return response.data;
  },

  getCurriculumProgress: async (curriculumId: string) => {
    const response = await apiClient.get(`/content/curriculum/${curriculumId}/progress`);
    return response.data;
  },

  cloneCurriculum: async (curriculumId: string, targetName: string) => {
    const response = await apiClient.post(`/content/curriculum/${curriculumId}/clone`, {
      targetName,
    });
    return response.data;
  },

  // ==================== ADVANCED FEATURES ====================
  archiveContent: async (id: string) => {
    const response = await apiClient.post(`/content/${id}/archive`);
    return response.data;
  },

  restoreContent: async (id: string) => {
    const response = await apiClient.post(`/content/${id}/restore`);
    return response.data;
  },

  transferContentOwnership: async (id: string, targetUserId: string) => {
    const response = await apiClient.post(`/content/${id}/transfer-ownership`, {
      targetUserId,
    });
    return response.data;
  },

  getContentAccessLog: async (id: string) => {
    const response = await apiClient.get(`/content/${id}/access-log`);
    return response.data;
  },

  setContentAccessRules: async (id: string, rules: any) => {
    const response = await apiClient.post(`/content/${id}/access-rules`, rules);
    return response.data;
  },

  scheduleContentPublish: async (id: string, publishAt: string) => {
    const response = await apiClient.post(`/content/${id}/schedule-publish`, {
      publishAt,
    });
    return response.data;
  },

  getContentDependencies: async (id: string) => {
    const response = await apiClient.get(`/content/${id}/dependencies`);
    return response.data;
  },

  validateContentStructure: async (id: string) => {
    const response = await apiClient.get(`/content/${id}/validate`);
    return response.data;
  },

  getContentExport: async (id: string) => {
    const response = await apiClient.get(`/content/${id}/export`);
    return response.data;
  },

  // ==================== LEARNING OUTCOMES ====================
  trackLearningOutcomes: async (id: string, outcomes: string[]) => {
    const response = await apiClient.post(`/content/${id}/outcomes`, { outcomes });
    return response.data;
  },

  getContentEffectiveness: async (id: string) => {
    const response = await apiClient.get(`/content/${id}/effectiveness`);
    return response.data;
  },

  // ==================== LIBRARIES & COLLECTIONS ====================
  createSubjectLibrary: async (schoolId: string, subjectId: string, contentIds: string[]) => {
    const response = await apiClient.post('/content/subject-libraries', {
      schoolId,
      subjectId,
      contentIds,
    });
    return response.data;
  },

  createFeaturedCollection: async (schoolId: string, data: {
    title: string;
    contentIds: string[];
  }) => {
    const response = await apiClient.post('/content/featured-collections', {
      schoolId,
      ...data,
    });
    return response.data;
  },

  bundleContent: async (title: string, contentIds: string[], price?: number) => {
    const response = await apiClient.post('/content/bundles', {
      title,
      contentIds,
      price,
    });
    return response.data;
  },

  getPersonalizedRecommendations: async () => {
    const response = await apiClient.get('/content/recommendations/personalized');
    return response.data;
  },
};
