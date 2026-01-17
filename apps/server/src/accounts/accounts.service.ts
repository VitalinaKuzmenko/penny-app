import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AccountsService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserAccounts(userId: string) {
    return this.prisma.account.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async createAccount(userId: string, name: string) {
    return this.prisma.account.create({
      data: {
        userId,
        name,
      },
      select: {
        id: true,
        name: true,
      },
    });
  }
}
