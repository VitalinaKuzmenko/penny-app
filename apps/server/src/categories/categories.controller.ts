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
  Query,
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
import {
  CategoryDto,
  CreateCategoryDto,
  DeleteCategoryQueryDto,
  UpdateCategoryDto,
} from 'schemas-nest';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { CategoriesService } from './categories.service';

@ApiTags('Categories')
@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all categories for current user, transfer category last',
  })
  @ApiOkResponse({ type: CategoryDto, isArray: true })
  async getCategories(@Req() req): Promise<CategoryDto[]> {
    return this.categoriesService.getUserCategories(req.user.userId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a category' })
  @ApiBody({ type: CreateCategoryDto })
  @ApiOkResponse({ type: CategoryDto })
  async createCategory(
    @Req() req,
    @Body() dto: CreateCategoryDto,
  ): Promise<CategoryDto> {
    return this.categoriesService.createCategory(req.user.userId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Rename, recolour or change the icon' })
  @ApiBody({ type: UpdateCategoryDto })
  @ApiOkResponse({ type: CategoryDto })
  async updateCategory(
    @Req() req,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCategoryDto,
  ): Promise<CategoryDto> {
    return this.categoriesService.updateCategory(req.user.userId, id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({
    summary:
      'Delete a category; its transactions move to replacementCategoryId',
  })
  @ApiNoContentResponse()
  async deleteCategory(
    @Req() req,
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: DeleteCategoryQueryDto,
  ): Promise<void> {
    await this.categoriesService.deleteCategory(
      req.user.userId,
      id,
      query.replacementCategoryId,
    );
  }
}
