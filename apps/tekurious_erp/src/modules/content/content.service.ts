import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { EventBusService } from '../../events/event-bus.service';
import {
  CreateContentDto,
  UpdateContentDto,
  ReviewContentDto,
  ContentWorkflowActionDto,
  CreateCollectionDto,
  SaveDraftDto,
  ModerateContentDto,
  CreateLearningPathDto,
  ContentSearchDto,
} from './dto/content.dto';

@Injectable()
export class ContentService {
  constructor(
    private prisma: PrismaService,
    private eventBus: EventBusService,
  ) {}

  // ─────────────────────────────────────────────────────────────────────────
  // FR-CONTENT-001: Create Content
  // ─────────────────────────────────────────────────────────────────────────
  async createContent(userId: string, dto: CreateContentDto) {
    const content = await this.prisma.content.create({
      data: {
        creatorId: dto.creatorId,
        title: dto.title,
        description: dto.description,
        contentType: dto.contentType as any,
        status: 'DRAFT',
        subjectId: dto.subjectId,
        topicId: dto.topicId,
        grade: dto.grade,
        board: dto.board as any,
        fileUrl: dto.fileUrl,
        fileSize: dto.fileSize,
        fileMimeType: dto.fileMimeType,
        duration: dto.duration,
        difficultyLevel: dto.difficultyLevel as any,
        language: dto.language || 'en',
        tags: dto.tags || [],
        keywords: dto.keywords || [],
        learningOutcomes: dto.learningOutcomes || [],
        isFree: dto.isFree ?? true,
        price: dto.price as any,
        thumbnail: dto.thumbnail,
      },
    });

    this.eventBus.publish('content.created', {
      contentId: content.id,
      contentType: content.contentType,
      createdBy: userId,
    });

    return content;
  }

  // FR-CONTENT-002: Get Content
  async getContent(contentId: string) {
    const content = await this.prisma.content.findUnique({
      where: { id: contentId, deletedAt: null },
      include: {
        creator: { select: { id: true } },
        contentReviews: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });
    if (!content) throw new NotFoundException('Content not found');

    // Increment view count
    await this.prisma.content.update({
      where: { id: contentId },
      data: { viewCount: { increment: 1 } },
    });

    return content;
  }

  // FR-CONTENT-002: Update Content
  async updateContent(userId: string, contentId: string, dto: UpdateContentDto) {
    const content = await this.prisma.content.findUnique({
      where: { id: contentId, deletedAt: null },
    });
    if (!content) throw new NotFoundException('Content not found');

    if (content.isLocked) {
      throw new ForbiddenException('Content is locked and cannot be edited');
    }

    // Create a version snapshot before updating
    await this.prisma.contentVersion.create({
      data: {
        contentId,
        versionNumber: content.versionNumber,
        versionType: 'MINOR',
        title: content.title,
        description: content.description,
        thumbnail: content.thumbnail,
        fileUrl: content.fileUrl,
        fileSize: content.fileSize,
        fileMimeType: content.fileMimeType,
        metadata: {},
        status: content.status as any,
        changedBy: userId,
        changeNotes: dto.changeNotes,
      },
    });

    // Bump version
    const [major, minor] = content.versionNumber.split('.').map(Number);
    const newVersion = `${major}.${minor + 1}`;

    const updated = await this.prisma.content.update({
      where: { id: contentId },
      data: {
        title: dto.title ?? content.title,
        description: dto.description ?? content.description,
        fileUrl: dto.fileUrl ?? content.fileUrl,
        fileSize: dto.fileSize ?? content.fileSize,
        fileMimeType: dto.fileMimeType ?? content.fileMimeType,
        duration: dto.duration ?? content.duration,
        difficultyLevel: (dto.difficultyLevel ?? content.difficultyLevel) as any,
        tags: dto.tags ?? content.tags,
        keywords: dto.keywords ?? content.keywords,
        learningOutcomes: dto.learningOutcomes ?? content.learningOutcomes,
        isFree: dto.isFree ?? content.isFree,
        price: (dto.price ?? content.price) as any,
        thumbnail: dto.thumbnail ?? content.thumbnail,
        versionNumber: newVersion,
        status: 'DRAFT' as any, // editing resets to draft
      },
    });

    this.eventBus.publish('content.updated', { contentId, updatedBy: userId });
    return updated;
  }

  // FR-CONTENT-003: Delete Content (soft delete)
  async deleteContent(userId: string, contentId: string) {
    const content = await this.prisma.content.findUnique({
      where: { id: contentId, deletedAt: null },
    });
    if (!content) throw new NotFoundException('Content not found');

    await this.prisma.content.update({
      where: { id: contentId },
      data: { deletedAt: new Date(), status: 'ARCHIVED' as any },
    });

    this.eventBus.publish('content.deleted', { contentId, deletedBy: userId });
    return { success: true, message: 'Content deleted' };
  }

  // FR-CONTENT-004: Search & List Content
  async searchContent(dto: ContentSearchDto) {
    const page = dto.page || 1;
    const limit = dto.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {
      deletedAt: null,
      ...(dto.q
        ? {
            OR: [
              { title: { contains: dto.q, mode: 'insensitive' } },
              { description: { contains: dto.q, mode: 'insensitive' } },
              { tags: { hasSome: [dto.q] } },
              { keywords: { hasSome: [dto.q] } },
            ],
          }
        : {}),
      ...(dto.contentType ? { contentType: dto.contentType } : {}),
      ...(dto.grade ? { grade: dto.grade } : {}),
      ...(dto.board ? { board: dto.board } : {}),
      ...(dto.subjectId ? { subjectId: dto.subjectId } : {}),
      ...(dto.difficultyLevel ? { difficultyLevel: dto.difficultyLevel } : {}),
      ...(dto.isFree !== undefined ? { isFree: dto.isFree } : {}),
      ...(dto.status ? { status: dto.status } : { status: 'PUBLISHED' }),
      ...(dto.creatorId ? { creatorId: dto.creatorId } : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.content.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ viewCount: 'desc' }, { createdAt: 'desc' }],
        select: {
          id: true, title: true, description: true, contentType: true,
          status: true, grade: true, board: true, thumbnail: true,
          duration: true, difficultyLevel: true, isFree: true, price: true,
          viewCount: true, rating: true, ratingCount: true,
          language: true, tags: true, creatorId: true, publishedAt: true,
        },
      }),
      this.prisma.content.count({ where }),
    ]);

    return {
      data: items,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  // FR-CONTENT-005: Rate / Review Content
  async reviewContent(userId: string, contentId: string, dto: ReviewContentDto) {
    const content = await this.prisma.content.findUnique({
      where: { id: contentId, deletedAt: null },
    });
    if (!content) throw new NotFoundException('Content not found');

    const review = await this.prisma.contentReview.upsert({
      where: { contentId_userId: { contentId, userId } },
      create: { contentId, userId, rating: dto.rating, comment: dto.comment },
      update: { rating: dto.rating, comment: dto.comment },
    });

    // Recalculate average rating
    const stats = await this.prisma.contentReview.aggregate({
      where: { contentId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    await this.prisma.content.update({
      where: { id: contentId },
      data: {
        rating: stats._avg.rating as any,
        ratingCount: stats._count.rating,
      },
    });

    this.eventBus.publish('content.reviewed', {
      contentId,
      userId,
      rating: dto.rating,
    });

    return review;
  }

  // FR-CONTENT-006: Content Workflow (submit, review, approve, publish)
  async workflowAction(userId: string, contentId: string, dto: ContentWorkflowActionDto) {
    const content = await this.prisma.content.findUnique({
      where: { id: contentId, deletedAt: null },
    });
    if (!content) throw new NotFoundException('Content not found');

    const statusMap: Record<string, string> = {
      SUBMIT: 'PENDING_APPROVAL',
      ASSIGN_REVIEWER: 'PENDING_APPROVAL',
      APPROVE: 'APPROVED',
      REJECT: 'DRAFT',
      PUBLISH: 'PUBLISHED',
      ARCHIVE: 'ARCHIVED',
      UNPUBLISH: 'DRAFT',
    };

    const newStatus = statusMap[dto.action];
    if (!newStatus) throw new BadRequestException('Invalid workflow action');

    const existing = await this.prisma.contentWorkflow.findFirst({
      where: { contentId },
      orderBy: { createdAt: 'desc' },
    });

    const workflowData: any = {
      contentId,
      status: dto.action === 'SUBMIT' ? 'PENDING_REVIEW'
             : dto.action === 'ASSIGN_REVIEWER' ? 'UNDER_REVIEW'
             : dto.action === 'APPROVE' ? 'APPROVED'
             : dto.action === 'REJECT' ? 'REJECTED'
             : dto.action === 'PUBLISH' ? 'PUBLISHED'
             : dto.action === 'ARCHIVE' ? 'ARCHIVED'
             : 'DRAFT',
      submittedBy: userId,
    };

    if (dto.action === 'ASSIGN_REVIEWER' && dto.assignedTo) {
      workflowData.assignedTo = dto.assignedTo;
      workflowData.assignedAt = new Date();
    }
    if (dto.action === 'APPROVE') {
      workflowData.approvedBy = userId;
      workflowData.approvedAt = new Date();
    }
    if (dto.action === 'REJECT') {
      workflowData.rejectedBy = userId;
      workflowData.rejectedAt = new Date();
      workflowData.rejectionReason = dto.comment;
    }
    if (dto.action === 'PUBLISH') {
      workflowData.publishedBy = userId;
      workflowData.publishedAt = new Date();
    }

    const workflow = existing
      ? await this.prisma.contentWorkflow.update({
          where: { id: existing.id },
          data: { ...workflowData },
        })
      : await this.prisma.contentWorkflow.create({ data: workflowData });

    // Update content status
    await this.prisma.content.update({
      where: { id: contentId },
      data: {
        status: newStatus as any,
        ...(dto.action === 'PUBLISH' ? { publishedAt: new Date(), isLocked: true } : {}),
        ...(dto.action === 'ARCHIVE' ? { archivedAt: new Date() } : {}),
      },
    });

    this.eventBus.publish(`content.workflow.${dto.action.toLowerCase()}`, {
      contentId,
      action: dto.action,
      performedBy: userId,
      newStatus,
    });

    return { success: true, contentId, action: dto.action, newStatus, workflow };
  }

  // FR-CONTENT-007: Save Draft
  async saveDraft(userId: string, dto: SaveDraftDto) {
    const draft = await this.prisma.contentDraft.upsert({
      where: {
        id: dto.contentId || 'new',
      },
      create: {
        contentId: dto.contentId,
        createdBy: userId,
        title: dto.title,
        description: dto.description,
        contentType: dto.contentType as any,
        fileUrl: dto.fileUrl,
        lastSavedAt: new Date(),
      },
      update: {
        title: dto.title,
        description: dto.description,
        fileUrl: dto.fileUrl,
        lastSavedAt: new Date(),
      },
    });

    return draft;
  }

  async listDrafts(userId: string) {
    return this.prisma.contentDraft.findMany({
      where: { createdBy: userId, isSubmitted: false },
      orderBy: { lastSavedAt: 'desc' },
    });
  }

  // FR-CONTENT-008: Content Collections
  async createCollection(userId: string, dto: CreateCollectionDto) {
    const collection = await this.prisma.contentCollection.create({
      data: {
        name: dto.title,        // schema uses 'name'
        description: dto.description,
        createdBy: userId,
        isPublic: dto.isPublic ?? false,
        contentIds: dto.contentIds || [],
      },
    });

    this.eventBus.publish('content.collection.created', {
      collectionId: collection.id,
      createdBy: userId,
    });

    return collection;
  }

  async getCollection(collectionId: string) {
    const collection = await this.prisma.contentCollection.findUnique({
      where: { id: collectionId },
    });
    if (!collection) throw new NotFoundException('Collection not found');

    // Fetch content items
    const contentIds = collection.contentIds as string[];
    const items = await this.prisma.content.findMany({
      where: { id: { in: contentIds }, deletedAt: null },
      select: {
        id: true, title: true, contentType: true, thumbnail: true,
        duration: true, grade: true, isFree: true, rating: true,
      },
    });

    return { ...collection, items };
  }

  async listCollections(userId: string, isPublic?: boolean) {
    return this.prisma.contentCollection.findMany({
      where: {
        ...(isPublic !== undefined
          ? { isPublic }
          : { OR: [{ isPublic: true }, { createdBy: userId }] }),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async addToCollection(userId: string, collectionId: string, contentId: string) {
    const [collection, content] = await Promise.all([
      this.prisma.contentCollection.findUnique({ where: { id: collectionId } }),
      this.prisma.content.findUnique({ where: { id: contentId, deletedAt: null } }),
    ]);
    if (!collection) throw new NotFoundException('Collection not found');
    if (!content) throw new NotFoundException('Content not found');
    if (collection.createdBy !== userId)
      throw new ForbiddenException('Only the collection owner can add items');

    const existing = collection.contentIds as string[];
    if (existing.includes(contentId))
      throw new ConflictException('Content already in collection');

    return this.prisma.contentCollection.update({
      where: { id: collectionId },
      data: { contentIds: [...existing, contentId] },
    });
  }

  async removeFromCollection(userId: string, collectionId: string, contentId: string) {
    const collection = await this.prisma.contentCollection.findUnique({
      where: { id: collectionId },
    });
    if (!collection) throw new NotFoundException('Collection not found');
    if (collection.createdBy !== userId)
      throw new ForbiddenException('Only the collection owner can remove items');

    const filtered = (collection.contentIds as string[]).filter((id) => id !== contentId);
    return this.prisma.contentCollection.update({
      where: { id: collectionId },
      data: { contentIds: filtered },
    });
  }

  // FR-CONTENT-009: Content Moderation
  async moderateContent(moderatorId: string, contentId: string, dto: ModerateContentDto) {
    const content = await this.prisma.content.findUnique({
      where: { id: contentId, deletedAt: null },
    });
    if (!content) throw new NotFoundException('Content not found');

    const statusMap: Record<string, string> = {
      APPROVED: 'APPROVED',
      REJECTED: 'DRAFT',
      FLAGGED: 'PENDING_REVIEW',
      SUSPENDED: 'ARCHIVED',
    };

    await this.prisma.contentModeration.create({
      data: {
        contentId,
        moderatedBy: moderatorId,   // schema uses 'moderatedBy'
        decision: dto.decision,
        reason: dto.reason,
        moderatedAt: new Date(),    // schema uses 'moderatedAt'
      },
    });

    await this.prisma.content.update({
      where: { id: contentId },
      data: { status: statusMap[dto.decision] as any },
    });

    this.eventBus.publish('content.moderated', {
      contentId,
      decision: dto.decision,
      moderatorId,
    });

    return { success: true, contentId, decision: dto.decision };
  }

  async getModerationQueue(status?: string) {
    return this.prisma.contentModeration.findMany({
      where: status ? { decision: status } : {},
      orderBy: { moderatedAt: 'desc' },
      take: 100,
    });
  }

  // FR-CONTENT-010: Content Version History
  async getVersionHistory(contentId: string) {
    const content = await this.prisma.content.findUnique({
      where: { id: contentId, deletedAt: null },
    });
    if (!content) throw new NotFoundException('Content not found');

    const versions = await this.prisma.contentVersion.findMany({
      where: { contentId },
      orderBy: { createdAt: 'desc' },
    });

    return { contentId, currentVersion: content.versionNumber, versions };
  }

  // FR-CONTENT-011: Learning Paths
  async createLearningPath(userId: string, dto: CreateLearningPathDto) {
    const path = await this.prisma.learningPath.create({
      data: {
        name: dto.title,          // schema uses 'name'
        description: dto.description,
        createdBy: userId,
        isPublic: dto.isPublic ?? false,
        grade: dto.grade,
        subjectId: dto.subjectId,
        difficulty: dto.difficultyLevel as any,
        steps: dto.contentIds
          ? dto.contentIds.map((id, i) => ({ order: i + 1, contentId: id, type: 'CONTENT' }))
          : [],
      },
    });

    this.eventBus.publish('content.learning_path.created', {
      pathId: path.id,
      createdBy: userId,
    });

    return path;
  }

  async getLearningPath(pathId: string) {
    const path = await this.prisma.learningPath.findUnique({
      where: { id: pathId },
    });
    if (!path) throw new NotFoundException('Learning path not found');

    // steps is a JSON array of {order, contentId, type}
    const steps = (path.steps as any[]) || [];
    const contentIds = steps.map((s) => s.contentId).filter(Boolean);
    const contents = await this.prisma.content.findMany({
      where: { id: { in: contentIds }, deletedAt: null },
      select: {
        id: true, title: true, contentType: true, thumbnail: true,
        duration: true, grade: true, difficultyLevel: true,
      },
    });

    return { ...path, contents };
  }

  async listLearningPaths(grade?: number, subjectId?: string, userId?: string) {
    return this.prisma.learningPath.findMany({
      where: {
        ...(grade ? { grade } : {}),
        ...(subjectId ? { subjectId } : {}),
        OR: [{ isPublic: true }, ...(userId ? [{ createdBy: userId }] : [])],
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async enrollInLearningPath(userId: string, pathId: string) {
    const path = await this.prisma.learningPath.findUnique({ where: { id: pathId } });
    if (!path) throw new NotFoundException('Learning path not found');

    // schema: @@unique([pathId, studentId])
    const existing = await this.prisma.learningPathEnrollment.findUnique({
      where: { pathId_studentId: { pathId, studentId: userId } },
    });
    if (existing) throw new ConflictException('Already enrolled in this learning path');

    const enrollment = await this.prisma.learningPathEnrollment.create({
      data: { pathId, studentId: userId, progressPercent: 0, enrolledAt: new Date() },
    });

    this.eventBus.publish('content.learning_path.enrolled', {
      pathId,
      userId,
    });

    return enrollment;
  }

  async updateLearningProgress(userId: string, pathId: string, progress: number) {
    const enrollment = await this.prisma.learningPathEnrollment.findUnique({
      where: { pathId_studentId: { pathId, studentId: userId } },
    });
    if (!enrollment) throw new NotFoundException('Not enrolled in this learning path');

    return this.prisma.learningPathEnrollment.update({
      where: { pathId_studentId: { pathId, studentId: userId } },
      data: {
        progressPercent: progress as any,
        ...(progress >= 100 ? { completedAt: new Date() } : {}),
      },
    });
  }

  // FR-CONTENT-012: Content Analytics
  async getContentAnalytics(contentId: string) {
    const [content, reviews, purchases] = await Promise.all([
      this.prisma.content.findUnique({
        where: { id: contentId, deletedAt: null },
        select: {
          id: true, title: true, viewCount: true, rating: true,
          ratingCount: true, status: true, publishedAt: true,
        },
      }),
      this.prisma.contentReview.findMany({
        where: { contentId },
        select: { rating: true, createdAt: true },
      }),
      this.prisma.contentPurchase.count({ where: { contentId } }),
    ]);

    if (!content) throw new NotFoundException('Content not found');

    const ratingDist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((r) => { ratingDist[r.rating] = (ratingDist[r.rating] || 0) + 1; });

    return {
      contentId,
      title: content.title,
      viewCount: content.viewCount,
      averageRating: content.rating,
      totalReviews: content.ratingCount,
      totalPurchases: purchases,
      ratingDistribution: ratingDist,
      status: content.status,
      publishedAt: content.publishedAt,
    };
  }

  async getCreatorAnalytics(creatorId: string) {
    const [totalContent, publishedContent, totalViews] = await Promise.all([
      this.prisma.content.count({ where: { creatorId, deletedAt: null } }),
      this.prisma.content.count({ where: { creatorId, status: 'PUBLISHED', deletedAt: null } }),
      this.prisma.content.aggregate({
        where: { creatorId, deletedAt: null },
        _sum: { viewCount: true },
      }),
    ]);

    // Get content IDs for this creator to count purchases
    const contentIds = await this.prisma.content.findMany({
      where: { creatorId, deletedAt: null },
      select: { id: true },
    });
    const ids = contentIds.map((c) => c.id);

    const totalPurchases = ids.length > 0
      ? await this.prisma.contentPurchase.count({ where: { contentId: { in: ids } } })
      : 0;

    const contentByType = await this.prisma.content.groupBy({
      by: ['contentType'],
      where: { creatorId, deletedAt: null },
      _count: { id: true },
    });

    return {
      creatorId,
      totalContent,
      publishedContent,
      draftContent: totalContent - publishedContent,
      totalViews: totalViews._sum.viewCount || 0,
      totalPurchases,
      contentByType: contentByType.map((c) => ({
        type: c.contentType,
        count: c._count.id,
      })),
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FR-CONTENT-021 to 030: Curriculum Builder
  // ─────────────────────────────────────────────────────────────────────────

  async createCurriculum(userId: string, dto: any) {
    const curriculum = await this.prisma.curriculum.create({
      data: {
        boardId: dto.boardId,
        name: dto.name,
        code: dto.code,
        gradeRange: dto.gradeRange || { min: 1, max: 12 },
        description: dto.description,
        isActive: dto.isActive ?? true,
        effectiveFrom: dto.effectiveFrom ? new Date(dto.effectiveFrom) : null,
        effectiveTo: dto.effectiveTo ? new Date(dto.effectiveTo) : null,
      },
    });

    this.eventBus.publish('curriculum.created', {
      curriculumId: curriculum.id,
      createdBy: userId,
    });

    return curriculum;
  }

  async getCurriculum(curriculumId: string) {
    const curriculum = await this.prisma.curriculum.findUnique({
      where: { id: curriculumId },
      include: {
        board: { select: { id: true, name: true } },
        subjects: {
          include: {
            subject: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!curriculum) throw new NotFoundException('Curriculum not found');
    return curriculum;
  }

  async listCurricula(boardId?: string, isActive?: boolean) {
    return this.prisma.curriculum.findMany({
      where: {
        ...(boardId ? { boardId } : {}),
        ...(isActive !== undefined ? { isActive } : {}),
      },
      include: {
        board: { select: { id: true, name: true } },
        subjects: { include: { subject: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateCurriculum(userId: string, curriculumId: string, dto: any) {
    const curriculum = await this.prisma.curriculum.findUnique({
      where: { id: curriculumId },
    });

    if (!curriculum) throw new NotFoundException('Curriculum not found');

    const updated = await this.prisma.curriculum.update({
      where: { id: curriculumId },
      data: {
        name: dto.name ?? curriculum.name,
        description: dto.description ?? curriculum.description,
        gradeRange: dto.gradeRange ?? curriculum.gradeRange,
        isActive: dto.isActive ?? curriculum.isActive,
        effectiveFrom: dto.effectiveFrom ? new Date(dto.effectiveFrom) : curriculum.effectiveFrom,
        effectiveTo: dto.effectiveTo ? new Date(dto.effectiveTo) : curriculum.effectiveTo,
      },
    });

    this.eventBus.publish('curriculum.updated', {
      curriculumId,
      updatedBy: userId,
    });

    return updated;
  }

  async deleteCurriculum(userId: string, curriculumId: string) {
    const curriculum = await this.prisma.curriculum.findUnique({
      where: { id: curriculumId },
    });

    if (!curriculum) throw new NotFoundException('Curriculum not found');

    await this.prisma.curriculum.delete({
      where: { id: curriculumId },
    });

    this.eventBus.publish('curriculum.deleted', {
      curriculumId,
      deletedBy: userId,
    });

    return { success: true, message: 'Curriculum deleted' };
  }

  async addSubjectToCurriculum(userId: string, curriculumId: string, dto: any) {
    const [curriculum, subject] = await Promise.all([
      this.prisma.curriculum.findUnique({ where: { id: curriculumId } }),
      this.prisma.subject.findUnique({ where: { id: dto.subjectId } }),
    ]);

    if (!curriculum) throw new NotFoundException('Curriculum not found');
    if (!subject) throw new NotFoundException('Subject not found');

    const existing = await this.prisma.curriculumSubject.findUnique({
      where: {
        curriculumId_subjectId_grade: {
          curriculumId,
          subjectId: dto.subjectId,
          grade: dto.grade,
        },
      },
    });

    if (existing) {
      throw new ConflictException('Subject already exists in this curriculum for this grade');
    }

    const curriculumSubject = await this.prisma.curriculumSubject.create({
      data: {
        curriculumId,
        subjectId: dto.subjectId,
        grade: dto.grade,
        isMandatory: dto.isMandatory ?? true,
        isElective: dto.isElective ?? false,
        credits: dto.credits,
        hoursPerWeek: dto.hoursPerWeek,
      },
    });

    this.eventBus.publish('curriculum.subject_added', {
      curriculumId,
      subjectId: dto.subjectId,
      addedBy: userId,
    });

    return curriculumSubject;
  }

  async removeSubjectFromCurriculum(userId: string, curriculumId: string, curriculumSubjectId: string) {
    const curriculumSubject = await this.prisma.curriculumSubject.findUnique({
      where: { id: curriculumSubjectId },
    });

    if (!curriculumSubject) throw new NotFoundException('Curriculum subject not found');
    if (curriculumSubject.curriculumId !== curriculumId) {
      throw new BadRequestException('Subject does not belong to this curriculum');
    }

    await this.prisma.curriculumSubject.delete({
      where: { id: curriculumSubjectId },
    });

    this.eventBus.publish('curriculum.subject_removed', {
      curriculumId,
      curriculumSubjectId,
      removedBy: userId,
    });

    return { success: true, message: 'Subject removed from curriculum' };
  }

  async getCurriculumByGrade(boardId: string, grade: number) {
    const curricula = await this.prisma.curriculum.findMany({
      where: {
        boardId,
        isActive: true,
      },
      include: {
        subjects: {
          where: { grade },
          include: {
            subject: { select: { id: true, name: true, code: true } },
          },
        },
      },
    });

    return curricula.filter((c) => {
      const range = c.gradeRange as any;
      return grade >= range.min && grade <= range.max;
    });
  }

  async bulkUploadContent(userId: string, contents: any[]) {
    const created = await this.prisma.content.createMany({
      data: contents.map((c) => ({
        creatorId: userId,
        title: c.title,
        description: c.description,
        contentType: c.contentType,
        status: 'DRAFT',
        subjectId: c.subjectId,
        topicId: c.topicId,
        grade: c.grade,
        board: c.board,
        fileUrl: c.fileUrl,
        fileSize: c.fileSize,
        fileMimeType: c.fileMimeType,
        duration: c.duration,
        difficultyLevel: c.difficultyLevel,
        language: c.language || 'en',
        tags: c.tags || [],
        keywords: c.keywords || [],
        learningOutcomes: c.learningOutcomes || [],
        isFree: c.isFree ?? true,
        price: c.price,
        thumbnail: c.thumbnail,
      })),
    });

    this.eventBus.publish('content.bulk_uploaded', {
      count: created.count,
      uploadedBy: userId,
    });

    return { success: true, count: created.count };
  }

  async tagContent(userId: string, contentId: string, tags: string[]) {
    const content = await this.prisma.content.findUnique({
      where: { id: contentId, deletedAt: null },
    });

    if (!content) throw new NotFoundException('Content not found');

    const existingTags = content.tags as string[];
    const newTags = [...new Set([...existingTags, ...tags])];

    const updated = await this.prisma.content.update({
      where: { id: contentId },
      data: { tags: newTags },
    });

    return updated;
  }

  async getPopularTags(limit = 20) {
    const contents = await this.prisma.content.findMany({
      where: { deletedAt: null, status: 'PUBLISHED' },
      select: { tags: true },
    });

    const tagCounts: Record<string, number> = {};
    contents.forEach((c) => {
      (c.tags as string[]).forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    const sorted = Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([tag, count]) => ({ tag, count }));

    return sorted;
  }

  async duplicateContent(userId: string, contentId: string) {
    const content = await this.prisma.content.findUnique({
      where: { id: contentId, deletedAt: null },
    });

    if (!content) throw new NotFoundException('Content not found');

    const duplicate = await this.prisma.content.create({
      data: {
        creatorId: userId,
        title: `${content.title} (Copy)`,
        description: content.description,
        contentType: content.contentType,
        status: 'DRAFT',
        subjectId: content.subjectId,
        topicId: content.topicId,
        grade: content.grade,
        board: content.board,
        fileUrl: content.fileUrl,
        fileSize: content.fileSize,
        fileMimeType: content.fileMimeType,
        duration: content.duration,
        difficultyLevel: content.difficultyLevel,
        language: content.language,
        tags: content.tags,
        keywords: content.keywords,
        learningOutcomes: content.learningOutcomes,
        isFree: content.isFree,
        price: content.price,
        thumbnail: content.thumbnail,
        versionNumber: '1.0',
      },
    });

    this.eventBus.publish('content.duplicated', {
      originalId: contentId,
      duplicateId: duplicate.id,
      duplicatedBy: userId,
    });

    return duplicate;
  }

  async getContentRecommendations(userId: string, contentId?: string, limit = 10) {
    let baseContent;
    if (contentId) {
      baseContent = await this.prisma.content.findUnique({
        where: { id: contentId, deletedAt: null },
      });
      if (!baseContent) throw new NotFoundException('Content not found');
    }

    // Simple recommendation: same subject, grade, similar tags
    const where: any = {
      deletedAt: null,
      status: 'PUBLISHED',
      ...(contentId ? { id: { not: contentId } } : {}),
    };

    if (baseContent) {
      where.OR = [
        { subjectId: baseContent.subjectId },
        { grade: baseContent.grade },
        { tags: { hasSome: baseContent.tags as string[] } },
      ];
    }

    const recommendations = await this.prisma.content.findMany({
      where,
      take: limit,
      orderBy: [{ rating: 'desc' }, { viewCount: 'desc' }],
      select: {
        id: true,
        title: true,
        description: true,
        contentType: true,
        thumbnail: true,
        duration: true,
        grade: true,
        difficultyLevel: true,
        rating: true,
        viewCount: true,
        isFree: true,
        price: true,
      },
    });

    return recommendations;
  }
}
