import { Injectable } from '@nestjs/common';
import {
  CategoryBreakdownResponseSchema,
  MonthlyCategoryResponseSchema,
} from 'schemas';
import {
  CategoryBreakdownQueryDto,
  MonthlyCategoryQueryDto,
} from 'schemas-nest';

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

  async getMonthlyCategoryChart(
    userId: string,
    { year, accountIds, categoryIds, type }: MonthlyCategoryQueryDto,
  ) {
    const start = new Date(year, 0, 1);
    const end = new Date(year + 1, 0, 1);

    const rows = await this.prisma.transaction.findMany({
      where: {
        userId,
        type,
        date: {
          gte: start,
          lt: end,
        },
        ...(accountIds && {
          accountId: { in: accountIds },
        }),
        ...(categoryIds && {
          categoryId: { in: categoryIds },
        }),
      },
      select: {
        amount: true,
        date: true,
        categoryId: true,
        category: {
          select: {
            name: true,
          },
        },
      },
    });

    // month labels
    const labels = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    // group by category
    const map = new Map<string, { categoryName: string; data: number[] }>();

    for (const row of rows) {
      const monthIndex = row.date.getMonth();

      if (!map.has(row.categoryId)) {
        map.set(row.categoryId, {
          categoryName: row.category.name,
          data: Array(12).fill(0),
        });
      }

      map.get(row.categoryId)!.data[monthIndex] += Number(row.amount);
    }

    const datasets = Array.from(map.entries()).map(([categoryId, value]) => ({
      categoryId,
      categoryName: value.categoryName,
      data: value.data,
    }));

    const result = {
      labels,
      datasets,
    };

    return MonthlyCategoryResponseSchema.parse(result);
  }

  async getCategoryBreakdown(
    userId: string,
    { startDate, endDate, accountIds, type }: CategoryBreakdownQueryDto,
  ) {
    const gte = startDate ? new Date(startDate) : undefined;
    const lte = endDate ? new Date(endDate) : undefined;

    const rows = await this.prisma.transaction.groupBy({
      by: ['categoryId'],
      where: {
        userId,
        type,
        ...(gte && { date: { gte } }),
        ...(lte && { date: { lte } }),
        ...(accountIds && { accountId: { in: accountIds } }),
      },
      _sum: {
        amount: true,
      },
    });

    const categoryIds = rows.map((r) => r.categoryId);

    const categories = await this.prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true },
    });

    const total = rows.reduce((sum, r) => sum + Number(r._sum.amount ?? 0), 0);

    const result = {
      total,
      categories: rows.map((r) => {
        const category = categories.find((c) => c.id === r.categoryId);

        const amount = Number(r._sum.amount ?? 0);

        return {
          categoryId: r.categoryId,
          categoryName: category?.name ?? 'Unknown',
          amount,
          percentage:
            total === 0 ? 0 : Number(((amount / total) * 100).toFixed(2)),
        };
      }),
    };

    return CategoryBreakdownResponseSchema.parse(result);
  }
}
