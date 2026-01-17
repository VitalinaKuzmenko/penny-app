import { Controller, Get, Query, Req, UseGuards, Logger } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetIncomeExpenseInputSchema } from 'schemas';
import {
  GetIncomeExpenseInputDto,
  GetIncomeExpenseResponseDto,
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
    @Query() dto: GetIncomeExpenseInputDto,
    @Req() req,
  ): Promise<GetIncomeExpenseResponseDto> {
    const userId = req.user?.userId;

    const parsed = GetIncomeExpenseInputSchema.parse(dto);

    return this.chartsService.getIncomeExpenseByYear(userId, parsed);
  }
}
