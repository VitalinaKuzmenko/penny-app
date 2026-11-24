import {
  Body,
  Controller,
  Get,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ListTransactionsQueryDto,
  ListTransactionsResponseDto,
  UpdateTransactionsDto,
  UpdateTransactionsResponseDto,
} from 'schemas-nest';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { TransactionsService } from './transactions.service';

@ApiTags('Transactions')
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  @ApiOperation({
    summary: 'List transactions with filters, paging and totals',
  })
  @ApiOkResponse({ type: ListTransactionsResponseDto })
  @UseGuards(JwtAuthGuard)
  async list(
    @Query() dto: ListTransactionsQueryDto,
    @Req() req,
  ): Promise<ListTransactionsResponseDto> {
    return this.transactionsService.list(req.user.userId, dto);
  }

  @Patch()
  @ApiOperation({
    summary:
      'Edit descriptions/categories and delete or restore transactions, all-or-nothing',
  })
  @ApiBody({ type: UpdateTransactionsDto })
  @ApiOkResponse({ type: UpdateTransactionsResponseDto })
  @UseGuards(JwtAuthGuard)
  async update(
    @Body() dto: UpdateTransactionsDto,
    @Req() req,
  ): Promise<UpdateTransactionsResponseDto> {
    return this.transactionsService.update(req.user.userId, dto);
  }
}
