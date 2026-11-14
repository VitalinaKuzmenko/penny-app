import { Injectable } from '@nestjs/common';
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

import { TRANSFER_CATEGORY_NAME } from '../categories/default-categories';
import { PrismaService } from '../prisma/prisma.service';

const utcYearRange = (year: number) => ({
  start: new Date(Date.UTC(year, 0, 1)),
  end: new Date(Date.UTC(year + 1, 0, 1)),
});

// Missing bounds fall back to "today", matching the previous dayjs(undefined) behaviour
const utcDayRange = (startDate?: string, endDate?: string) => {
  const s = startDate ? new Date(startDate) : new Date();
  const e = endDate ? new Date(endDate) : new Date();

  return {
    start: new Date(
      Date.UTC(s.getUTCFullYear(), s.getUTCMonth(), s.getUTCDate()),
    ),
    end: new Date(
      Date.UTC(
        e.getUTCFullYear(),
        e.getUTCMonth(),
        e.getUTCDate(),
        23,
        59,
        59,
        999,
      ),
    ),
  };
};

const excludeInternalTransfers = {
  OR: [
    {
      category: null, // include rows without category
    },
    {
      category: {
        name: {
          not: TRANSFER_CATEGORY_NAME,
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
    const { start, end } = utcYearRange(year);

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
    const { start, end } = utcYearRange(year);

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
      const monthIndex = row.date.getUTCMonth();

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
    const { start, end } = utcDayRange(startDate, endDate);

    const rows = await this.prisma.transaction.groupBy({
      by: ['categoryId'],
      where: {
        userId,
        type,
        date: {
          gte: start,
          lte: end,
        },
        ...excludeInternalTransfers,
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

    const { start, end } = utcDayRange(startDate, endDate);

    const rows = await this.prisma.transaction.groupBy({
      by: ['type', 'date'],
      where: {
        userId,
        date: {
          gte: start,
          lte: end,
        },
        ...excludeInternalTransfers,
        ...(accountIds && { accountId: { in: accountIds } }),
      },
      _sum: { amount: true },
    });

    // 1. Aggregate into months
    const grouped: Record<string, { INCOME: number; EXPENSE: number }> = {};

    rows.forEach((r) => {
      const year = r.date.getUTCFullYear();
      const month = String(r.date.getUTCMonth() + 1).padStart(2, '0');
      const key = `${year}-${month}`;

      if (!grouped[key]) {
        grouped[key] = { INCOME: 0, EXPENSE: 0 };
      }

      grouped[key][r.type] += Number(r._sum.amount ?? 0);
    });

    // 2. Generate full month range (fill missing months)
    if (!start || !end) {
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

    const current = new Date(
      Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1),
    );
    const endYear = new Date(
      Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), 1),
    );

    while (current <= endYear) {
      const year = current.getUTCFullYear();
      const month = String(current.getUTCMonth() + 1).padStart(2, '0');
      const key = `${year}-${month}`;

      const data = grouped[key] || { INCOME: 0, EXPENSE: 0 };

      result.push({
        month: key,
        income: data.INCOME,
        expense: data.EXPENSE,
      });

      // move to next month
      current.setUTCMonth(current.getUTCMonth() + 1);
    }

    return result;
  }

  async getIncomeExpenseRatio(
    userId: string,
    { startDate, endDate }: IncomeExpenseRatioQueryDto,
  ) {
    const { start, end } = utcDayRange(startDate, endDate);

    const rows = await this.prisma.transaction.groupBy({
      by: ['type'],
      where: {
        userId,
        date: {
          gte: start,
          lte: end,
        },
        ...excludeInternalTransfers,
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
