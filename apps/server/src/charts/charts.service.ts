import { Injectable } from '@nestjs/common';
import dayjs from 'dayjs';
import {
  CategoryBreakdownResponseSchema,
  MonthlyCategoryResponseSchema,
} from 'schemas';
import {
  CategoryBreakdownQueryDto,
  IncomeExpenseRatioQueryDto,
  IncomeExpenseStackedQueryDto,
  MonthlyCategoryQueryDto,
} from 'schemas-nest';

import { PrismaService } from '../prisma/prisma.service';

const EXCLUDED_CATEGORY_NAME = 'Internal Transfer';

const excludeInternalTransfers = {
  OR: [
    {
      category: null, // include rows without category
    },
    {
      category: {
        name: {
          not: EXCLUDED_CATEGORY_NAME,
        },
      },
    },
  ],
};

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
        ...excludeInternalTransfers,
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
    const savings = Number(income) - Number(expense);

    return {
      year,
      income: Number(income),
      expense: Number(expense),
      savings: savings < 0 ? 0 : savings,
    };
  }

  async getMonthlyCategoryChart(
    userId: string,
    { year, accountIds, categoryIds }: MonthlyCategoryQueryDto,
  ) {
    const start = new Date(year, 0, 1);
    const end = new Date(year + 1, 0, 1);

    const rows = await this.prisma.transaction.findMany({
      where: {
        userId,
        type: 'EXPENSE',
        date: {
          gte: start,
          lt: end,
        },
        ...excludeInternalTransfers,
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
    const gte = startDate
      ? (() => {
          const d = new Date(startDate);
          d.setHours(0, 0, 0, 0);
          return d;
        })()
      : undefined;

    const lte = endDate
      ? (() => {
          const d = new Date(endDate);
          d.setHours(0, 0, 0, 0);
          return d;
        })()
      : undefined;

    const rows = await this.prisma.transaction.groupBy({
      by: ['categoryId'],
      where: {
        userId,
        type,
        ...excludeInternalTransfers,
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

  async getIncomeExpenseStacked(
    userId: string,
    query: IncomeExpenseStackedQueryDto,
  ) {
    const { startDate, endDate, accountIds } = query;

    const gte = startDate
      ? dayjs(startDate).startOf('day').toDate()
      : undefined;

    const lt = endDate
      ? dayjs(endDate).add(1, 'day').startOf('day').toDate()
      : undefined;

    const rows = await this.prisma.transaction.groupBy({
      by: ['type', 'date'],
      where: {
        userId,
        ...excludeInternalTransfers,
        ...(accountIds && { accountId: { in: accountIds } }),
        date: {
          ...(gte && { gte }),
          ...(lt && { lt }),
        },
      },
      _sum: { amount: true },
    });

    // 1. Aggregate into months
    const grouped: Record<string, { INCOME: number; EXPENSE: number }> = {};

    rows.forEach((r) => {
      const year = r.date.getFullYear();
      const month = String(r.date.getMonth() + 1).padStart(2, '0');
      const key = `${year}-${month}`;

      if (!grouped[key]) {
        grouped[key] = { INCOME: 0, EXPENSE: 0 };
      }

      grouped[key][r.type] += Number(r._sum.amount ?? 0);
    });

    // 2. Generate full month range (fill missing months)
    if (!gte || !lt) {
      // fallback: just return sorted existing data
      return Object.entries(grouped)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, data]) => ({
          month,
          income: data.INCOME,
          expense: data.EXPENSE,
        }));
    }

    const result: {
      month: string;
      income: number;
      expense: number;
    }[] = [];

    const current = new Date(gte.getFullYear(), gte.getMonth(), 1);
    const end = new Date(lt.getFullYear(), lt.getMonth(), 1);

    while (current <= end) {
      const year = current.getFullYear();
      const month = String(current.getMonth() + 1).padStart(2, '0');
      const key = `${year}-${month}`;

      const data = grouped[key] || { INCOME: 0, EXPENSE: 0 };

      result.push({
        month: key,
        income: data.INCOME,
        expense: data.EXPENSE,
      });

      // move to next month
      current.setMonth(current.getMonth() + 1);
    }

    return result;
  }

  async getIncomeExpenseRatio(
    userId: string,
    { from, to }: IncomeExpenseRatioQueryDto,
  ) {
    const gte = from
      ? (() => {
          const d = new Date(from);
          d.setHours(0, 0, 0, 0);
          return d;
        })()
      : undefined;

    const lte = to
      ? (() => {
          const d = new Date(to);
          d.setHours(0, 0, 0, 0);
          return d;
        })()
      : undefined;

    const rows = await this.prisma.transaction.groupBy({
      by: ['type'],
      where: {
        userId,
        ...excludeInternalTransfers,
        ...(gte && { date: { gte } }),
        ...(lte && { date: { lte } }),
      },
      _sum: {
        amount: true,
      },
    });

    const income = Number(
      rows.find((r) => r.type === 'INCOME')?._sum.amount ?? 0,
    );

    const expense = Number(
      rows.find((r) => r.type === 'EXPENSE')?._sum.amount ?? 0,
    );
    const ratio =
      income === 0 ? 0 : Number(((expense / income) * 100).toFixed(2));

    return {
      income,
      expense,
      ratio,
    };
  }
}
