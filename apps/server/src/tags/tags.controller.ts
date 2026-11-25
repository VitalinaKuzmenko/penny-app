import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreateTagDto, TagWithCountDto, UpdateTagDto } from 'schemas-nest';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { TagsService } from './tags.service';

@ApiTags('Tags')
@Controller('tags')
@UseGuards(JwtAuthGuard)
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all tags for current user, sorted by name' })
  @ApiOkResponse({ type: TagWithCountDto, isArray: true })
  async getTags(@Req() req): Promise<TagWithCountDto[]> {
    return this.tagsService.getUserTags(req.user.userId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a tag' })
  @ApiBody({ type: CreateTagDto })
  @ApiOkResponse({ type: TagWithCountDto })
  async createTag(
    @Req() req,
    @Body() dto: CreateTagDto,
  ): Promise<TagWithCountDto> {
    return this.tagsService.createTag(req.user.userId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Rename or recolour a tag' })
  @ApiBody({ type: UpdateTagDto })
  @ApiOkResponse({ type: TagWithCountDto })
  async updateTag(
    @Req() req,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTagDto,
  ): Promise<TagWithCountDto> {
    return this.tagsService.updateTag(req.user.userId, id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Delete a tag; its transactions stay, only the links go',
  })
  @ApiNoContentResponse()
  async deleteTag(
    @Req() req,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.tagsService.deleteTag(req.user.userId, id);
  }
}
