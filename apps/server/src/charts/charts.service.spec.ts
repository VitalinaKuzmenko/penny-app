import { Test } from '@nestjs/testing';

import { PrismaService } from '../prisma/prisma.service';

import { ChartsService } from './charts.service';

const USER_ID = '11111111-1111-4111-8111-111111111111';
const CLOTHES = 'clothes-id';
const OTHERS = 'others-id';
const GAMES = 'games-id';

const sum = (amount: number) => ({ _sum: { amount } });

describe('ChartsService — refunds', () => {
  let service: ChartsService;
  const prisma = {
    transaction: { groupBy: jest.fn(), findMany: jest.fn() },
    category: { findMany: jest.fn() },
    transactionTag: { findMany: jest.fn() },
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    const module = await Test.createTestingModule({
      providers: [ChartsService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = module.get(ChartsService);
  });

  describe('getIncomeExpenseByYear', () => {
    it('takes refunds off expense and leaves them out of income', async () => {
      prisma.transaction.groupBy.mockResolvedValue([
        { type: 'INCOME', ...sum(1000) },
        { type: 'EXPENSE', ...sum(100) },
        { type: 'REFUND', ...sum(55) },
      ]);

      await expect(
        service.getIncomeExpenseByYear(USER_ID, { year: 2026 }),
      ).resolves.toEqual({
        year: 2026,
        income: 1000,
        expense: 45,
        savings: 955,
      });
    });

    it('never shows a negative expense', async () => {
      prisma.transaction.groupBy.mockResolvedValue([
        { type: 'EXPENSE', ...sum(10) },
        { type: 'REFUND', ...sum(30) },
      ]);

      await expect(
        service.getIncomeExpenseByYear(USER_ID, { year: 2026 }),
      ).resolves.toMatchObject({ income: 0, expense: 0, savings: 0 });
    });
  });

  describe('getIncomeExpenseRatio', () => {
    it('compares net expense with income excluding refunds', async () => {
      prisma.transaction.groupBy.mockResolvedValue([
        { type: 'INCOME', ...sum(1000) },
        { type: 'EXPENSE', ...sum(100) },
        { type: 'REFUND', ...sum(55) },
      ]);

      await expect(
        service.getIncomeExpenseRatio(USER_ID, {
          startDate: '2026-01-01',
          endDate: '2026-12-31',
        }),
      ).resolves.toEqual({ income: 1000, expense: 45, ratio: 4.5 });
    });
  });

  describe('getIncomeExpenseStacked', () => {
    it('nets refunds per month, in the month the refund arrives', async () => {
      prisma.transaction.groupBy.mockResolvedValue([
        {
          type: 'EXPENSE',
          date: new Date('2026-10-05T00:00:00Z'),
          ...sum(100),
        },
        {
          type: 'INCOME',
          date: new Date('2026-11-01T00:00:00Z'),
          ...sum(2000),
        },
        { type: 'EXPENSE', date: new Date('2026-11-03T00:00:00Z'), ...sum(20) },
        { type: 'REFUND', date: new Date('2026-11-10T00:00:00Z'), ...sum(55) },
      ]);

      await expect(
        service.getIncomeExpenseStacked(USER_ID, {
          startDate: '2026-10-01',
          endDate: '2026-11-30',
        }),
      ).resolves.toEqual([
        { month: '2026-10', income: 0, expense: 100 },
        // 20 spent − 55 refunded → clamped to 0
        { month: '2026-11', income: 2000, expense: 0 },
      ]);
    });
  });

  describe('getMonthlyCategoryChart', () => {
    const tx = (
      categoryId: string,
      name: string,
      type: 'EXPENSE' | 'REFUND',
      date: string,
      amount: number,
    ) => ({
      categoryId,
      category: { name },
      type,
      date: new Date(`${date}T00:00:00Z`),
      amount,
    });

    it('subtracts refunds per category per month and drops fully refunded categories', async () => {
      prisma.transaction.findMany.mockResolvedValue([
        tx(CLOTHES, 'Clothes', 'EXPENSE', '2026-10-01', 100),
        tx(CLOTHES, 'Clothes', 'REFUND', '2026-10-20', 55),
        tx(CLOTHES, 'Clothes', 'REFUND', '2026-11-02', 20),
        tx(GAMES, 'Games', 'EXPENSE', '2026-03-01', 30),
        tx(GAMES, 'Games', 'REFUND', '2026-03-05', 30),
      ]);

      const result = await service.getMonthlyCategoryChart(USER_ID, {
        year: 2026,
      });

      expect(prisma.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            type: { in: ['EXPENSE', 'REFUND'] },
          }),
        }),
      );
      expect(result.datasets).toEqual([
        {
          categoryId: CLOTHES,
          categoryName: 'Clothes',
          // Oct: 100 − 55; Nov: refund with no spend → 0, not −20
          data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 45, 0, 0],
        },
      ]);
    });

    it('groups expenses without a category into an Uncategorised series', async () => {
      prisma.transaction.findMany.mockResolvedValue([
        {
          categoryId: null,
          category: null,
          type: 'EXPENSE',
          date: new Date('2026-02-10T00:00:00Z'),
          amount: 12,
        },
      ]);

      const result = await service.getMonthlyCategoryChart(USER_ID, {
        year: 2026,
      });

      expect(result.datasets).toEqual([
        {
          categoryId: 'uncategorised',
          categoryName: 'Uncategorised',
          data: [0, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        },
      ]);
    });
  });

  describe('getCategoryBreakdown', () => {
    it('nets refunds per category and builds percentages from the shown slices', async () => {
      prisma.transaction.groupBy.mockResolvedValue([
        { categoryId: CLOTHES, type: 'EXPENSE', ...sum(100) },
        { categoryId: CLOTHES, type: 'REFUND', ...sum(55) },
        { categoryId: OTHERS, type: 'EXPENSE', ...sum(45) },
        { categoryId: GAMES, type: 'EXPENSE', ...sum(10) },
        { categoryId: GAMES, type: 'REFUND', ...sum(25) },
      ]);
      prisma.category.findMany.mockResolvedValue([
        { id: CLOTHES, name: 'Clothes' },
        { id: OTHERS, name: 'Others' },
      ]);

      const result = await service.getCategoryBreakdown(USER_ID, {
        startDate: '2026-10-01',
        endDate: '2026-10-31',
        type: 'EXPENSE',
      });

      expect(prisma.transaction.groupBy).toHaveBeenCalledWith(
        expect.objectContaining({
          by: ['categoryId', 'type'],
          where: expect.objectContaining({
            type: { in: ['EXPENSE', 'REFUND'] },
          }),
        }),
      );
      expect(prisma.category.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: { in: [CLOTHES, OTHERS] } } }),
      );
      expect(result).toEqual({
        total: 90,
        categories: [
          {
            categoryId: CLOTHES,
            categoryName: 'Clothes',
            amount: 45,
            percentage: 50,
          },
          {
            categoryId: OTHERS,
            categoryName: 'Others',
            amount: 45,
            percentage: 50,
          },
        ],
      });
    });

    it('shows expenses without a category as an Uncategorised slice', async () => {
      prisma.transaction.groupBy.mockResolvedValue([
        { categoryId: CLOTHES, type: 'EXPENSE', ...sum(30) },
        { categoryId: null, type: 'EXPENSE', ...sum(10) },
      ]);
      prisma.category.findMany.mockResolvedValue([
        { id: CLOTHES, name: 'Clothes' },
      ]);

      const result = await service.getCategoryBreakdown(USER_ID, {
        type: 'EXPENSE',
      });

      // null must not reach the category lookup
      expect(prisma.category.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: { in: [CLOTHES] } } }),
      );
      expect(result.categories).toEqual([
        expect.objectContaining({ categoryName: 'Clothes', percentage: 75 }),
        {
          categoryId: 'uncategorised',
          categoryName: 'Uncategorised',
          amount: 10,
          percentage: 25,
        },
      ]);
    });

    it('queries only INCOME rows for the income breakdown', async () => {
      prisma.transaction.groupBy.mockResolvedValue([]);
      prisma.category.findMany.mockResolvedValue([]);

      await service.getCategoryBreakdown(USER_ID, { type: 'INCOME' });

      expect(prisma.transaction.groupBy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ type: 'INCOME' }),
        }),
      );
    });
  });

  it('leaves soft-deleted transactions out of every chart', async () => {
    prisma.transaction.groupBy.mockResolvedValue([]);
    prisma.transaction.findMany.mockResolvedValue([]);
    prisma.category.findMany.mockResolvedValue([]);

    await service.getIncomeExpenseByYear(USER_ID, { year: 2026 });
    await service.getIncomeExpenseRatio(USER_ID, {
      startDate: '2026-01-01',
      endDate: '2026-12-31',
    });
    await service.getIncomeExpenseStacked(USER_ID, {});
    await service.getMonthlyCategoryChart(USER_ID, { year: 2026 });
    await service.getCategoryBreakdown(USER_ID, { type: 'EXPENSE' });

    const calls = [
      ...prisma.transaction.groupBy.mock.calls,
      ...prisma.transaction.findMany.mock.calls,
    ];
    expect(calls).toHaveLength(5);
    for (const [args] of calls) {
      expect(args.where).toMatchObject({ userId: USER_ID, deletedAt: null });
    }
  });

  describe('getTagSpend', () => {
    const link = (
      tag: { id: string; name: string },
      type: 'EXPENSE' | 'REFUND',
      amount: number,
    ) => ({
      tag: { ...tag, color: '#1E88E5' },
      transaction: { type, amount: String(amount) },
    });
    const SPAIN = { id: 'spain-id', name: 'Spain trip' };
    const WORK = { id: 'work-id', name: 'Work' };
    const BIRTHDAY = { id: 'birthday-id', name: 'Birthday' };

    it('nets refunds per tag, counts multi-tag rows under each tag, hides 0 and sorts by spend', async () => {
      prisma.transactionTag.findMany.mockResolvedValue([
        link(SPAIN, 'EXPENSE', 300),
        link(WORK, 'EXPENSE', 300), // same hotel, tagged with both
        link(SPAIN, 'EXPENSE', 100.1),
        link(SPAIN, 'REFUND', 50),
        link(WORK, 'EXPENSE', 500),
        link(BIRTHDAY, 'EXPENSE', 20),
        link(BIRTHDAY, 'REFUND', 30), // more refunded than spent
      ]);

      await expect(
        service.getTagSpend(USER_ID, {
          startDate: '2026-01-01',
          endDate: '2026-12-31',
        }),
      ).resolves.toEqual([
        {
          tagId: WORK.id,
          name: 'Work',
          color: '#1E88E5',
          spent: 800,
        },
        {
          tagId: SPAIN.id,
          name: 'Spain trip',
          color: '#1E88E5',
          spent: 350.1,
        },
      ]);
    });

    it('only counts the user’s non-deleted, non-transfer spend in the date range', async () => {
      prisma.transactionTag.findMany.mockResolvedValue([]);

      await service.getTagSpend(USER_ID, {
        startDate: '2026-03-01',
        endDate: '2026-03-31',
      });

      const { where } = prisma.transactionTag.findMany.mock.calls[0][0];
      expect(where).toEqual({
        tag: { userId: USER_ID },
        transaction: expect.objectContaining({
          userId: USER_ID,
          deletedAt: null,
          type: { in: ['EXPENSE', 'REFUND'] },
          date: {
            gte: new Date('2026-03-01T00:00:00.000Z'),
            lte: new Date('2026-03-31T23:59:59.999Z'),
          },
        }),
      });
      expect(JSON.stringify(where)).toContain('"isTransfer":false');
    });
  });
});
