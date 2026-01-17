import { Controller, Get, Query, Req, UseGuards, Logger } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  CategoryBreakdownQueryDto,
  CategoryBreakdownResponseDto,
  GetIncomeExpenseQueryDto,
  GetIncomeExpenseResponseDto,
  MonthlyCategoryQueryDto,
  MonthlyCategoryResponseDto,
} from 'schemas-nest';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { ChartsService } from './charts.service';

@ApiTags('Charts')
@Controller('charts')
export class ChartsController {
  private readonly logger = new Logger(ChartsController.name);

  constructor(private readonly chartsService: ChartsService) {}

  @Get('income-expense')
  @ApiOperation({ summary: 'Get income vs expense summary for a year' })
  @ApiOkResponse({ type: GetIncomeExpenseResponseDto })
  @UseGuards(JwtAuthGuard)
  async getIncomeExpense(
    @Query() dto: GetIncomeExpenseQueryDto,
    @Req() req,
  ): Promise<GetIncomeExpenseResponseDto> {
    const userId = req.user?.userId;

    return this.chartsService.getIncomeExpenseByYear(userId, dto);
  }

  @Get('monthly-category')
  @ApiOperation({
    summary: 'Get monthly spending per category for a selected year',
  })
  @ApiOkResponse({ type: MonthlyCategoryResponseDto })
  @UseGuards(JwtAuthGuard)
  async getMonthlyCategory(@Query() dto: MonthlyCategoryQueryDto, @Req() req) {
    const userId = req.user.userId;

    return this.chartsService.getMonthlyCategoryChart(userId, dto);
  }

  @Get('category-breakdown')
  @ApiOperation({
    summary: 'Share by category or account',
  })
  @ApiOkResponse({ type: CategoryBreakdownResponseDto })
  @UseGuards(JwtAuthGuard)
  async getCategoryBreakdown(
    @Query() dto: CategoryBreakdownQueryDto,
    @Req() req,
  ) {
    const userId = req.user.userId;

    return this.chartsService.getCategoryBreakdown(userId, dto);
  }
}
