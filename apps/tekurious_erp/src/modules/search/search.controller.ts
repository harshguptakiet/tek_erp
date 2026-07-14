import { Controller, Get, Post, Body, Query, UseGuards, Request } from '@nestjs/common';
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
}
