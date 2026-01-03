import {
  Controller,
  Get,
  Req,
  UseGuards,
  UnauthorizedException,
  Post,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { AccountDto, CreateAccountDto } from 'schemas-nest';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { isUniqueConstraintError } from '../utils/isPrismaUniqueError';

import { AccountsService } from './accounts.service';

@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all user accounts' })
  @ApiOkResponse({ type: AccountDto, isArray: true })
  @UseGuards(JwtAuthGuard)
  async getAccounts(@Req() req): Promise<AccountDto[]> {
    const userId = req.user?.userId;

    if (!userId) {
      throw new UnauthorizedException({
        code: 'auth.unauthorized',
      });
    }

    return this.accountsService.getUserAccounts(userId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new account' })
  @ApiBody({ type: CreateAccountDto })
  @ApiOkResponse({ type: AccountDto })
  @UseGuards(JwtAuthGuard)
  async createAccount(
    @Req() req,
    @Body() dto: CreateAccountDto,
  ): Promise<AccountDto> {
    const userId = req.user?.userId;

    if (!userId) {
      throw new UnauthorizedException({
        code: 'auth.unauthorized',
      });
    }

    try {
      return await this.accountsService.createAccount(userId, dto.name);
    } catch (err) {
      if (isUniqueConstraintError(err)) {
        throw new BadRequestException({
          code: 'account.already_exists',
        });
      }

      throw err;
    }
  }
}
