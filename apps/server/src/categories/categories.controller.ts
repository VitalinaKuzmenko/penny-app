import {
  Controller,
  Get,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetCategoriesResponseDto } from 'schemas-nest';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { CategoriesService } from './categories.service';

@ApiTags('Categories')
@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all categories for current user' })
  @ApiOkResponse({ type: GetCategoriesResponseDto })
  async getCategories(@Req() req): Promise<GetCategoriesResponseDto> {
    const userId = req.user?.userId;

    if (!userId) {
      throw new UnauthorizedException({
        code: 'auth.unauthorized',
      });
    }

    const categories = await this.categoriesService.getUserCategories(userId);

    return { categories };
  }
}
