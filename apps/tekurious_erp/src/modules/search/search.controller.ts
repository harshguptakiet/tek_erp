import { Controller, Get, Post, Put, Delete, Body, Query, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SearchService } from './search.service';

@ApiTags('Search')
@Controller('search')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SearchController {
  constructor(private readonly service: SearchService) {}

  @Get()
  @ApiOperation({ summary: 'Global search across all entities (FR-SEARCH-001)' })
  globalSearch(
    @Request() req,
    @Query('q') q: string,
    @Query('types') types?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.globalSearch(req.user.userId, {
      q, entityTypes: types ? types.split(',') : undefined,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    });
  }

  @Get('content')
  @ApiOperation({ summary: 'Search content (FR-SEARCH-002)' })
  searchContent(
    @Request() req,
    @Query('q') q: string,
    @Query('contentType') contentType?: string,
    @Query('grade') grade?: string,
    @Query('board') board?: string,
    @Query('subjectId') subjectId?: string,
    @Query('isFree') isFree?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.searchContent(req.user.userId, {
      q, contentType,
      grade: grade ? parseInt(grade) : undefined,
      board, subjectId,
      isFree: isFree !== undefined ? isFree === 'true' : undefined,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    });
  }

  @Get('users')
  @ApiOperation({ summary: 'Search users (FR-SEARCH-003)' })
  searchUsers(
    @Query('q') q: string,
    @Query('organizationId') organizationId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.searchUsers(q, organizationId, page ? parseInt(page) : 1, limit ? parseInt(limit) : 20);
  }

  @Get('questions')
  @ApiOperation({ summary: 'Search question bank (FR-SEARCH-004)' })
  searchQuestions(
    @Query('q') q?: string,
    @Query('grade') grade?: string,
    @Query('board') board?: string,
    @Query('subjectId') subjectId?: string,
    @Query('topicId') topicId?: string,
    @Query('difficultyLevel') difficultyLevel?: string,
    @Query('questionType') questionType?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.searchQuestions({
      q, grade: grade ? parseInt(grade) : undefined, board,
      subjectId, topicId, difficultyLevel, questionType,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    });
  }

  @Get('suggestions')
  @ApiOperation({ summary: 'Get search suggestions / autocomplete (FR-DISC-001)' })
  getSuggestions(@Query('q') q: string) {
    return this.service.getSuggestions(q);
  }

  @Get('trending')
  @ApiOperation({ summary: 'Get trending searches (FR-FILTER-001)' })
  getTrending(@Query('limit') limit?: string) {
    return this.service.getTrendingSearches(limit ? parseInt(limit) : 10);
  }

  @Post('index')
  @ApiOperation({ summary: 'Index entity for search (FR-DISC-002)' })
  indexEntity(@Body() dto: any) {
    return this.service.indexEntity(dto);
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Search analytics (FR-ANALYTICS-001)' })
  analytics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.service.getSearchAnalytics({ startDate, endDate });
  }

  // ── Advanced Faceted Search (FR-FILTER-002–005) ──────────────────────────

  @Get('facets/content')
  @ApiOperation({ summary: 'Get content search facets (FR-FILTER-002)' })
  contentFacets(
    @Query('q') q?: string,
    @Query('grade') grade?: string,
    @Query('board') board?: string,
    @Query('subjectId') subjectId?: string,
    @Query('contentType') contentType?: string,
  ) {
    return this.service.getContentFacets({
      q,
      grade: grade ? parseInt(grade) : undefined,
      board, subjectId, contentType,
    });
  }

  @Get('faceted/content')
  @ApiOperation({ summary: 'Faceted content search with multi-filter (FR-FILTER-003)' })
  facetedContentSearch(
    @Query('q') q?: string,
    @Query('contentTypes') contentTypes?: string,
    @Query('grades') grades?: string,
    @Query('boards') boards?: string,
    @Query('subjectIds') subjectIds?: string,
    @Query('isFree') isFree?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('sortBy') sortBy?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.facetedContentSearch({
      q,
      contentTypes: contentTypes ? contentTypes.split(',') : undefined,
      grades: grades ? grades.split(',').map(Number) : undefined,
      boards: boards ? boards.split(',') : undefined,
      subjectIds: subjectIds ? subjectIds.split(',') : undefined,
      isFree: isFree !== undefined ? isFree === 'true' : undefined,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      sortBy: sortBy as any,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    });
  }

  @Get('faceted/users')
  @ApiOperation({ summary: 'Faceted user search with role filters (FR-FILTER-004)' })
  facetedUserSearch(
    @Query('q') q?: string,
    @Query('roles') roles?: string,
    @Query('organizationId') organizationId?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.facetedUserSearch({
      q,
      roles: roles ? roles.split(',') : undefined,
      organizationId, status,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    });
  }

  @Get('synonyms')
  @ApiOperation({ summary: 'List search synonyms (FR-FILTER-005)' })
  listSynonyms(
    @Query('category') category?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.manageSynonyms({
      action: 'list', category,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    });
  }

  @Post('synonyms')
  @ApiOperation({ summary: 'Create search synonym (FR-FILTER-005)' })
  createSynonym(@Body() dto: { term: string; synonyms: string[]; category?: string }) {
    return this.service.manageSynonyms({ action: 'create', ...dto });
  }

  @Put('synonyms/:id')
  @ApiOperation({ summary: 'Update search synonym (FR-FILTER-005)' })
  updateSynonym(
    @Param('id') id: string,
    @Body() dto: { synonyms?: string[]; category?: string },
  ) {
    return this.service.manageSynonyms({ action: 'update', id, ...dto });
  }

  @Delete('synonyms/:id')
  @ApiOperation({ summary: 'Delete search synonym (FR-FILTER-005)' })
  deleteSynonym(@Param('id') id: string) {
    return this.service.manageSynonyms({ action: 'delete', id });
  }

  // ==================== EXTENDED SEARCH (FR-SEARCH-006, 008) ====================

  @Post('federated')
  @ApiOperation({ summary: 'Federated search across data sources (FR-SEARCH-006)' })
  federatedSearch(@Request() req, @Body('query') query: string, @Body('sources') sources: string[]) {
    return this.service.federatedSearch(req.user.userId, query, sources || []);
  }

  @Post('semantic')
  @ApiOperation({ summary: 'Semantic vector search (FR-SEARCH-008)' })
  semanticSearch(@Request() req, @Body('query') query: string, @Body('threshold') threshold?: number) {
    return this.service.semanticSearch(req.user.userId, query, threshold);
  }
}
