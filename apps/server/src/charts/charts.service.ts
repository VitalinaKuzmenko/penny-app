import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChartsService {
  constructor(private readonly prisma: PrismaService) {}

  async getIncomeExpenseByYear(
    userId: string,
    {
      year,
      accountIds,
    }: {
      year: number;
      accountIds?: string[];
    },
  ) {
    const start = new Date(year, 0, 1);
    const end = new Date(year + 1, 0, 1);

    const rows = await this.prisma.transaction.groupBy({
      by: ['type'],
      where: {
        userId,
        date: {
          gte: start,
          lt: end,
        },
        ...(accountIds && {
          accountId: { in: accountIds },
        }),
      },
      _sum: {
        amount: true,
      },
    });

    const income = rows.find((r) => r.type === 'INCOME')?._sum.amount ?? 0;

    const expense = rows.find((r) => r.type === 'EXPENSE')?._sum.amount ?? 0;

    return {
      year,
      income: Number(income),
      expense: Number(expense),
      savings: Number(income) - Number(expense),
    };
  }
}
