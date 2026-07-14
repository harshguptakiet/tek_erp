import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { EventBusService } from '../../events/event-bus.service';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService, private eventBus: EventBusService) {}

  // FR-SEARCH-001: Global search across all entity types
  async globalSearch(userId: string, dto: {
    q: string; entityTypes?: string[]; page?: number; limit?: number;
  }) {
    const page = dto.page || 1;
    const limit = dto.limit || 20;
    const q = dto.q.trim();
    if (!q || q.length < 2) return { results: [], total: 0, query: q };

    // Search the SearchIndex
    const where: any = {
      isActive: true,
      searchableText: { contains: q, mode: 'insensitive' },
      ...(dto.entityTypes?.length
        ? { entityType: { in: dto.entityTypes } }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.searchIndex.findMany({
        where,
        orderBy: [{ popularity: 'desc' }, { updatedAt: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.searchIndex.count({ where }),
    ]);

    // Log search query
    await this.prisma.searchQuery.create({
      data: { userId, query: q, resultsCount: total },
    });

    // Update popularity
    if (items.length > 0) {
      await this.prisma.searchIndex.updateMany({
        where: { id: { in: items.map((i) => i.id) } },
        data: { lastAccessedAt: new Date() },
      });
    }

    return {
      query: q,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      results: items,
    };
  }

  // FR-SEARCH-002: Search content specifically
  async searchContent(userId: string, dto: {
    q: string; contentType?: string; grade?: number;
    board?: string; subjectId?: string; isFree?: boolean;
    page?: number; limit?: number;
  }) {
    const page = dto.page || 1;
    const limit = dto.limit || 20;

    const where: any = {
      deletedAt: null,
      status: 'PUBLISHED' as any,
      ...(dto.q
        ? {
            OR: [
              { title: { contains: dto.q, mode: 'insensitive' } },
              { description: { contains: dto.q, mode: 'insensitive' } },
              { tags: { hasSome: [dto.q] } },
            ],
          }
        : {}),
      ...(dto.contentType ? { contentType: dto.contentType } : {}),
      ...(dto.grade ? { grade: dto.grade } : {}),
      ...(dto.board ? { board: dto.board } : {}),
      ...(dto.subjectId ? { subjectId: dto.subjectId } : {}),
      ...(dto.isFree !== undefined ? { isFree: dto.isFree } : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.content.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ viewCount: 'desc' }, { rating: 'desc' }],
        select: {
          id: true, title: true, description: true, contentType: true,
          grade: true, board: true, thumbnail: true, duration: true,
          isFree: true, price: true, viewCount: true, rating: true,
        },
      }),
      this.prisma.content.count({ where }),
    ]);

    return { query: dto.q, total, page, limit, results: items };
  }

  // FR-SEARCH-003: Search users
  async searchUsers(q: string, organizationId?: string, page = 1, limit = 20) {
    const where: any = {
      status: 'ACTIVE',
      deletedAt: null,
      OR: [
        { firstName: { contains: q, mode: 'insensitive' } },
        { lastName: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
      ],
      ...(organizationId
        ? { organizationUsers: { some: { organizationId, isActive: true } } }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        select: { id: true, firstName: true, lastName: true, email: true, status: true },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { query: q, total, page, limit, results: items };
  }

  // FR-SEARCH-004: Search questions (for exam building)
  async searchQuestions(dto: {
    q?: string; grade?: number; board?: string; subjectId?: string;
    topicId?: string; difficultyLevel?: string; questionType?: string;
    page?: number; limit?: number;
  }) {
    const page = dto.page || 1;
    const limit = dto.limit || 20;

    const where: any = {
      isActive: true,
      ...(dto.q ? { question: { contains: dto.q, mode: 'insensitive' } } : {}),
      ...(dto.grade ? { grade: dto.grade } : {}),
      ...(dto.board ? { board: dto.board } : {}),
      ...(dto.subjectId ? { subjectId: dto.subjectId } : {}),
      ...(dto.topicId ? { topicId: dto.topicId } : {}),
      ...(dto.difficultyLevel ? { difficultyLevel: dto.difficultyLevel } : {}),
      ...(dto.questionType ? { questionType: dto.questionType } : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.questionBank.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { usageCount: 'desc' },
        select: {
          id: true, question: true, questionType: true, marks: true,
          difficultyLevel: true, grade: true, board: true,
        },
      }),
      this.prisma.questionBank.count({ where }),
    ]);

    return { total, page, limit, results: items };
  }

  // FR-DISC-001: Get search suggestions / autocomplete
  async getSuggestions(q: string) {
    if (!q || q.length < 2) return { suggestions: [] };

    const [indexSuggestions, savedSuggestions] = await Promise.all([
      this.prisma.searchIndex.findMany({
        where: { title: { startsWith: q, mode: 'insensitive' }, isActive: true },
        orderBy: { popularity: 'desc' },
        take: 5,
        select: { title: true, entityType: true, entityId: true },
      }),
      this.prisma.searchSuggestion.findMany({
        where: { query: { startsWith: q, mode: 'insensitive' }, isActive: true },
        orderBy: { searchCount: 'desc' },
        take: 5,
        select: { query: true, suggestion: true },
      }),
    ]);

    return {
      query: q,
      suggestions: [
        ...indexSuggestions.map((s) => ({ text: s.title, type: s.entityType, id: s.entityId })),
        ...savedSuggestions.map((s) => ({ text: s.suggestion, type: 'QUERY' })),
      ].slice(0, 8),
    };
  }

  // FR-DISC-002: Index entity for search
  async indexEntity(dto: {
    entityType: string; entityId: string; title: string;
    searchableText: string; description?: string; metadata?: any;
  }) {
    return this.prisma.searchIndex.upsert({
      where: { entityType_entityId: { entityType: dto.entityType, entityId: dto.entityId } },
      create: {
        entityType: dto.entityType,
        entityId: dto.entityId,
        title: dto.title,
        searchableText: dto.searchableText,
        description: dto.description,
        metadata: dto.metadata,
        isActive: true,
      },
      update: {
        title: dto.title,
        searchableText: dto.searchableText,
        description: dto.description,
        metadata: dto.metadata,
        updatedAt: new Date(),
      },
    });
  }

  // FR-FILTER-001: Get trending searches
  async getTrendingSearches(limit = 10) {
    const trending = await this.prisma.searchQuery.groupBy({
      by: ['query'],
      _count: { query: true },
      orderBy: { _count: { query: 'desc' } },
      take: limit,
    });

    return { trending: trending.map((t) => ({ query: t.query, count: t._count.query })) };
  }

  // FR-ANALYTICS-001: Search analytics
  async getSearchAnalytics(filters: { startDate?: string; endDate?: string }) {
    const where: any = {
      ...(filters.startDate || filters.endDate
        ? {
            timestamp: {
              ...(filters.startDate ? { gte: new Date(filters.startDate) } : {}),
              ...(filters.endDate ? { lte: new Date(filters.endDate) } : {}),
            },
          }
        : {}),
    };

    const [totalSearches, uniqueQueries, zeroResultQueries] = await Promise.all([
      this.prisma.searchQuery.count({ where }),
      this.prisma.searchQuery.groupBy({ by: ['query'], where }),
      this.prisma.searchQuery.count({ where: { ...where, resultsCount: 0 } }),
    ]);

    const topQueries = await this.prisma.searchQuery.groupBy({
      by: ['query'],
      where,
      _count: { query: true },
      orderBy: { _count: { query: 'desc' } },
      take: 10,
    });

    return {
      period: filters,
      totalSearches,
      uniqueQueries: uniqueQueries.length,
      zeroResultQueries,
      successRate:
        totalSearches > 0
          ? (((totalSearches - zeroResultQueries) / totalSearches) * 100).toFixed(1)
          : '0',
      topQueries: topQueries.map((q) => ({ query: q.query, count: q._count.query })),
    };
  }
}
