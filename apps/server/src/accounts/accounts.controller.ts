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
} from '@nestjs/swagger';
import {
  AccountDto,
  AccountWithActivityDto,
  CreateAccountDto,
  UpdateAccountDto,
} from 'schemas-nest';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { AccountsService } from './accounts.service';

@Controller('accounts')
@UseGuards(JwtAuthGuard)
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all user accounts' })
  @ApiOkResponse({ type: AccountWithActivityDto, isArray: true })
  async getAccounts(@Req() req): Promise<AccountWithActivityDto[]> {
    return this.accountsService.getUserAccounts(req.user.userId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new account' })
  @ApiBody({ type: CreateAccountDto })
  @ApiOkResponse({ type: AccountDto })
  async createAccount(
    @Req() req,
    @Body() dto: CreateAccountDto,
  ): Promise<AccountDto> {
    return this.accountsService.createAccount(req.user.userId, dto.name);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Rename an account' })
  @ApiBody({ type: UpdateAccountDto })
  @ApiOkResponse({ type: AccountDto })
  async renameAccount(
    @Req() req,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAccountDto,
  ): Promise<AccountDto> {
    return this.accountsService.renameAccount(req.user.userId, id, dto.name);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete an account that has no transactions' })
  @ApiNoContentResponse()
  async deleteAccount(
    @Req() req,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.accountsService.deleteAccount(req.user.userId, id);
  }
}
