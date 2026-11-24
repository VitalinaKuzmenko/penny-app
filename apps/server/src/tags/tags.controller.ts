import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TagDto } from 'schemas-nest';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { TagsService } from './tags.service';

@ApiTags('Tags')
@Controller('tags')
@UseGuards(JwtAuthGuard)
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all tags for current user, sorted by name' })
  @ApiOkResponse({ type: TagDto, isArray: true })
  async getTags(@Req() req): Promise<TagDto[]> {
    return this.tagsService.getUserTags(req.user.userId);
  }
}
