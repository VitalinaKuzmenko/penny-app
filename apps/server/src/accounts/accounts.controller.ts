import {
  Controller,
  Get,
  Req,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { AccountDto } from 'schemas-nest';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';

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
}
