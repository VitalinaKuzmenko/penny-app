import { Injectable } from '@nestjs/common';
import { AccountWithActivity } from 'schemas';

import { PrismaService } from '../prisma/prisma.service';

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
        where: { userId },
        _max: { date: true, createdAt: true },
      }),
    ]);

    const maxByAccount = new Map(
      activity.map((row) => [row.accountId, row._max]),
    );

    return accounts.map((account) => {
      const max = maxByAccount.get(account.id);

      return {
        ...account,
        lastTransactionDate: max?.date?.toISOString() ?? null,
        lastImportedAt: max?.createdAt?.toISOString() ?? null,
      };
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
