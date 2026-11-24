import { Injectable } from '@nestjs/common';
import { AccountWithActivity } from 'schemas';

import { PrismaService } from '../prisma/prisma.service';
import { notDeleted } from '../utils/not-deleted';

@Injectable()
export class AccountsService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserAccounts(userId: string): Promise<AccountWithActivity[]> {
    const [accounts, activity] = await Promise.all([
      this.prisma.account.findMany({
        where: { userId },
        select: {
          id: true,
          name: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      }),
      this.prisma.transaction.groupBy({
        by: ['accountId'],
        where: { userId, ...notDeleted },
        _max: { date: true },
      }),
    ]);

    const lastDateByAccount = new Map(
      activity.map((row) => [row.accountId, row._max.date]),
    );

    return accounts.map((account) => ({
      ...account,
      lastTransactionDate:
        lastDateByAccount.get(account.id)?.toISOString() ?? null,
    }));
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
