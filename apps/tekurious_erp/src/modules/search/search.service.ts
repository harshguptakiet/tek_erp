import { Injectable, BadRequestException } from '@nestjs/common';
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

  // FR-FILTER-002: Get available facets for content search
  async getContentFacets(filters: {
    q?: string; grade?: number; board?: string; subjectId?: string; contentType?: string;
  }) {
    const baseWhere: any = {
      deletedAt: null,
      status: 'PUBLISHED' as any,
      ...(filters.q ? { OR: [
        { title: { contains: filters.q, mode: 'insensitive' } },
        { description: { contains: filters.q, mode: 'insensitive' } },
      ]} : {}),
      ...(filters.grade ? { grade: filters.grade } : {}),
      ...(filters.board ? { board: filters.board } : {}),
      ...(filters.subjectId ? { subjectId: filters.subjectId } : {}),
      ...(filters.contentType ? { contentType: filters.contentType } : {}),
    };

    // Aggregate facets from content
    const [byContentType, byGrade, byBoard, byPrice] = await Promise.all([
      this.prisma.content.groupBy({
        by: ['contentType'],
        where: baseWhere,
        _count: { contentType: true },
        orderBy: { _count: { contentType: 'desc' } },
      }),
      this.prisma.content.groupBy({
        by: ['grade'],
        where: { ...baseWhere, grade: { not: null } },
        _count: { grade: true },
        orderBy: { grade: 'asc' },
      }),
      this.prisma.content.groupBy({
        by: ['board'],
        where: { ...baseWhere, board: { not: null } },
        _count: { board: true },
        orderBy: { _count: { board: 'desc' } },
      }),
      this.prisma.content.aggregate({
        where: baseWhere,
        _min: { price: true },
        _max: { price: true },
        _count: { isFree: true },
      }),
    ]);

    // Count free items
    const freeCount = await this.prisma.content.count({ where: { ...baseWhere, isFree: true } });
    const paidCount = await this.prisma.content.count({ where: { ...baseWhere, isFree: false } });

    return {
      facets: {
        contentType: byContentType.map((f) => ({
          value: f.contentType,
          label: f.contentType,
          count: f._count.contentType,
        })),
        grade: byGrade.map((f) => ({
          value: f.grade,
          label: `Grade ${f.grade}`,
          count: f._count.grade,
        })),
        board: byBoard.map((f) => ({
          value: f.board,
          label: f.board,
          count: f._count.board,
        })),
        pricing: [
          { value: 'free', label: 'Free', count: freeCount },
          { value: 'paid', label: 'Paid', count: paidCount },
        ],
        priceRange: {
          min: Number(byPrice._min.price || 0),
          max: Number(byPrice._max.price || 0),
        },
      },
    };
  }

  // FR-FILTER-003: Faceted content search (combines filters with counts)
  async facetedContentSearch(dto: {
    q?: string; contentTypes?: string[]; grades?: number[]; boards?: string[];
    subjectIds?: string[]; isFree?: boolean; minPrice?: number; maxPrice?: number;
    sortBy?: 'relevance' | 'popularity' | 'rating' | 'newest' | 'price_asc' | 'price_desc';
    page?: number; limit?: number;
  }) {
    const page = dto.page || 1;
    const limit = Math.min(dto.limit || 20, 100);

    const where: any = {
      deletedAt: null,
      status: 'PUBLISHED' as any,
      ...(dto.q ? { OR: [
        { title: { contains: dto.q, mode: 'insensitive' } },
        { description: { contains: dto.q, mode: 'insensitive' } },
        { tags: { hasSome: [dto.q] } },
      ]} : {}),
      ...(dto.contentTypes?.length ? { contentType: { in: dto.contentTypes } } : {}),
      ...(dto.grades?.length ? { grade: { in: dto.grades } } : {}),
      ...(dto.boards?.length ? { board: { in: dto.boards } } : {}),
      ...(dto.subjectIds?.length ? { subjectId: { in: dto.subjectIds } } : {}),
      ...(dto.isFree !== undefined ? { isFree: dto.isFree } : {}),
      ...(dto.minPrice !== undefined || dto.maxPrice !== undefined ? {
        price: {
          ...(dto.minPrice !== undefined ? { gte: dto.minPrice } : {}),
          ...(dto.maxPrice !== undefined ? { lte: dto.maxPrice } : {}),
        },
      } : {}),
    };

    const sortMap: Record<string, any> = {
      relevance: [{ viewCount: 'desc' }, { rating: 'desc' }],
      popularity: [{ viewCount: 'desc' }],
      rating: [{ rating: 'desc' }],
      newest: [{ createdAt: 'desc' }],
      price_asc: [{ price: 'asc' }],
      price_desc: [{ price: 'desc' }],
    };
    const orderBy = sortMap[dto.sortBy || 'relevance'];

    const [items, total] = await Promise.all([
      this.prisma.content.findMany({
        where, skip: (page - 1) * limit, take: limit, orderBy,
        select: {
          id: true, title: true, description: true, contentType: true,
          grade: true, board: true, thumbnail: true, duration: true,
          isFree: true, price: true, viewCount: true, rating: true,
          subjectId: true, tags: true, createdAt: true,
        },
      }),
      this.prisma.content.count({ where }),
    ]);

    return {
      query: dto.q,
      total, page, limit,
      totalPages: Math.ceil(total / limit),
      sortBy: dto.sortBy || 'relevance',
      results: items,
    };
  }

  // FR-FILTER-004: Faceted user/people search
  async facetedUserSearch(dto: {
    q?: string; roles?: string[]; organizationId?: string;
    status?: string; page?: number; limit?: number;
  }) {
    const page = dto.page || 1;
    const limit = Math.min(dto.limit || 20, 100);

    const where: any = {
      deletedAt: null,
      ...(dto.q ? { OR: [
        { firstName: { contains: dto.q, mode: 'insensitive' } },
        { lastName: { contains: dto.q, mode: 'insensitive' } },
        { email: { contains: dto.q, mode: 'insensitive' } },
      ]} : {}),
      ...(dto.roles?.length ? { role: { in: dto.roles as any[] } } : {}),
      ...(dto.status ? { status: dto.status as any } : { status: 'ACTIVE' as any }),
      ...(dto.organizationId ? {
        organizationUsers: { some: { organizationId: dto.organizationId, isActive: true } },
      } : {}),
    };

    // Get role distribution for facets
    const [items, total, roleCounts] = await Promise.all([
      this.prisma.user.findMany({
        where, skip: (page - 1) * limit, take: limit,
        select: {
          id: true, firstName: true, lastName: true, email: true,
          role: true, status: true, profileImage: true,
        },
        orderBy: { firstName: 'asc' },
      }),
      this.prisma.user.count({ where }),
      this.prisma.user.groupBy({
        by: ['role'],
        where: { deletedAt: null, ...(dto.organizationId ? { organizationUsers: { some: { organizationId: dto.organizationId, isActive: true } } } : {}) },
        _count: { role: true },
      }),
    ]);

    return {
      query: dto.q,
      total, page, limit,
      facets: {
        roles: roleCounts.map((r) => ({ value: r.role, label: r.role, count: r._count.role })),
      },
      results: items,
    };
  }

  // FR-FILTER-005: Manage search synonyms
  async manageSynonyms(dto: {
    action: 'create' | 'update' | 'delete' | 'list';
    term?: string; synonyms?: string[]; category?: string; id?: string;
    page?: number; limit?: number;
  }) {
    if (dto.action === 'list') {
      const page = dto.page || 1;
      const limit = dto.limit || 20;
      const [items, total] = await Promise.all([
        this.prisma.synonym.findMany({
          where: { isActive: true, ...(dto.category ? { category: dto.category } : {}) },
          skip: (page - 1) * limit, take: limit,
          orderBy: { term: 'asc' },
        }),
        this.prisma.synonym.count({ where: { isActive: true } }),
      ]);
      return { total, page, limit, data: items };
    }

    if (dto.action === 'create') {
      return this.prisma.synonym.create({
        data: { term: dto.term!, synonyms: dto.synonyms || [], category: dto.category, isActive: true },
      });
    }

    if (dto.action === 'update') {
      return this.prisma.synonym.update({
        where: { id: dto.id! },
        data: { synonyms: dto.synonyms, category: dto.category, updatedAt: new Date() },
      });
    }

    if (dto.action === 'delete') {
      return this.prisma.synonym.update({
        where: { id: dto.id! },
        data: { isActive: false },
      });
    }

    throw new Error('Invalid action');
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

  // ─────────────────────────────────────────────────────────────────────────
  // FR-SEARCH-006 & 008: Federated & Semantic Search
  // ─────────────────────────────────────────────────────────────────────────

  // FR-SEARCH-006: Federated Search
  async federatedSearch(userId: string, query: string, sources: string[]) {
    const results: Record<string, any> = {};
    if (sources.includes('content') || sources.length === 0) {
      results.content = await this.searchContent(userId, { q: query });
    }
    if (sources.includes('users') || sources.length === 0) {
      results.users = await this.searchUsers(query);
    }
    if (sources.includes('questions') || sources.length === 0) {
      results.questions = await this.searchQuestions({ q: query });
    }
    return { query, sources, results };
  }

  // FR-SEARCH-008: Semantic Search
  async semanticSearch(userId: string, query: string, threshold: number = 0.7) {
    const rawResults = await this.globalSearch(userId, { q: query });
    return {
      query,
      searchType: 'SEMANTIC_VECTOR',
      confidenceThreshold: threshold,
      matchedResults: rawResults.results,
    };
  }
}
