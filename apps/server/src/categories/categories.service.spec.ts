import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { PrismaService } from '../prisma/prisma.service';

import { CategoriesService } from './categories.service';

const USER_ID = '11111111-1111-4111-8111-111111111111';
const BILLS_ID = '22222222-2222-4222-8222-222222222221';
const FOOD_ID = '22222222-2222-4222-8222-222222222222';
const TRANSFER_ID = '22222222-2222-4222-8222-222222222223';
const FOREIGN_ID = '22222222-2222-4222-8222-222222222229';

type StoredCategory = { id: string; name: string; isTransfer: boolean };

const stored: StoredCategory[] = [
  { id: BILLS_ID, name: 'Bills', isTransfer: false },
  { id: FOOD_ID, name: 'Home Food', isTransfer: false },
  // renamed by the user; still the transfer category
  { id: TRANSFER_ID, name: 'Переказ', isTransfer: true },
];

// Answers findFirst like the DB would for the user's own categories
const findFirstLike = async ({
  where,
}: {
  where: { id: string; userId: string };
}) => stored.find((c) => where.userId === USER_ID && c.id === where.id) ?? null;

const errorCode = async (promise: Promise<unknown>) => {
  try {
    await promise;
  } catch (err) {
    return (
      (err as BadRequestException).getResponse() as {
        code: string;
      }
    ).code;
  }
  throw new Error('expected an error');
};

describe('CategoriesService', () => {
  let service: CategoriesService;
  const prisma = {
    category: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    transaction: {
      groupBy: jest.fn(),
      count: jest.fn(),
      updateMany: jest.fn(),
    },
    categoryMapping: { updateMany: jest.fn(), deleteMany: jest.fn() },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    prisma.$transaction.mockImplementation(
      async (fn: (tx: typeof prisma) => unknown) => fn(prisma),
    );
    prisma.category.findFirst.mockImplementation(findFirstLike);
    prisma.category.findMany.mockResolvedValue(stored);
    const module = await Test.createTestingModule({
      providers: [
        CategoriesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = module.get(CategoriesService);
  });

  describe('getUserCategories', () => {
    it('adds transaction counts and sorts by name ignoring case, transfer last', async () => {
      prisma.category.findMany.mockResolvedValue([
        { id: TRANSFER_ID, name: 'Internal Transfer', isTransfer: true },
        { id: FOOD_ID, name: 'home food', isTransfer: false },
        { id: BILLS_ID, name: 'Bills', isTransfer: false },
      ]);
      prisma.transaction.groupBy.mockResolvedValue([
        { categoryId: BILLS_ID, _count: { _all: 3 } },
      ]);

      const result = await service.getUserCategories(USER_ID);

      expect(result.map((c) => [c.name, c.transactionCount])).toEqual([
        ['Bills', 3],
        ['home food', 0],
        ['Internal Transfer', 0],
      ]);
      // soft-deleted rows are counted: no deletedAt filter
      expect(prisma.transaction.groupBy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: USER_ID, categoryId: { not: null } },
        }),
      );
    });
  });

  describe('createCategory', () => {
    it('rejects a name that exists ignoring case', async () => {
      await expect(
        errorCode(
          service.createCategory(USER_ID, {
            name: 'BILLS',
            color: '#F44336',
            icon: 'receipt',
          }),
        ),
      ).resolves.toBe('category.already_exists');
      expect(prisma.category.create).not.toHaveBeenCalled();
    });

    it('treats _ and % as plain characters, not wildcards', async () => {
      prisma.category.findMany.mockResolvedValue([
        ...stored,
        { id: 'trip', name: 'Trip 2026', isTransfer: false },
      ]);
      prisma.category.create.mockResolvedValue({});

      await service.createCategory(USER_ID, {
        name: 'Trip_2026',
        color: '#F44336',
        icon: 'flight',
      });

      expect(prisma.category.create).toHaveBeenCalled();
    });

    it('creates a category with no transactions', async () => {
      prisma.category.create.mockResolvedValue({
        id: 'new',
        name: 'Pets',
        isTransfer: false,
      });

      const result = await service.createCategory(USER_ID, {
        name: 'Pets',
        color: '#795548',
        icon: 'pets',
      });

      expect(result.transactionCount).toBe(0);
      expect(prisma.category.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            userId: USER_ID,
            name: 'Pets',
            color: '#795548',
            icon: 'pets',
          },
        }),
      );
    });
  });

  describe('updateCategory', () => {
    it('lets the transfer category be renamed', async () => {
      prisma.category.update.mockResolvedValue({});
      prisma.transaction.count.mockResolvedValue(0);

      await service.updateCategory(USER_ID, TRANSFER_ID, { name: 'Transfers' });

      expect(prisma.category.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: TRANSFER_ID },
          data: { name: 'Transfers' },
        }),
      );
    });

    it('allows changing the case of its own name', async () => {
      prisma.category.update.mockResolvedValue({});
      prisma.transaction.count.mockResolvedValue(0);

      await service.updateCategory(USER_ID, BILLS_ID, { name: 'BILLS' });

      expect(prisma.category.update).toHaveBeenCalled();
    });

    it('rejects a name another category has, ignoring case', async () => {
      await expect(
        errorCode(
          service.updateCategory(USER_ID, BILLS_ID, { name: 'home FOOD' }),
        ),
      ).resolves.toBe('category.already_exists');
    });

    it('returns 404 for another user’s category', async () => {
      await expect(
        service.updateCategory(USER_ID, FOREIGN_ID, { color: '#F44336' }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('deleteCategory', () => {
    it('never deletes the transfer category', async () => {
      await expect(
        errorCode(service.deleteCategory(USER_ID, TRANSFER_ID, BILLS_ID)),
      ).resolves.toBe('category.cannot_delete_transfer');
      expect(prisma.category.delete).not.toHaveBeenCalled();
    });

    it('requires a replacement when transactions use it', async () => {
      prisma.transaction.count.mockResolvedValue(2);

      await expect(
        errorCode(service.deleteCategory(USER_ID, FOOD_ID)),
      ).resolves.toBe('category.replacement_required');
      expect(prisma.category.delete).not.toHaveBeenCalled();
    });

    it.each([
      ['itself', FOOD_ID],
      ['the transfer category', TRANSFER_ID],
      ['another user’s category', FOREIGN_ID],
    ])('rejects %s as the replacement', async (_label, replacementId) => {
      prisma.transaction.count.mockResolvedValue(2);

      await expect(
        errorCode(service.deleteCategory(USER_ID, FOOD_ID, replacementId)),
      ).resolves.toBe('category.invalid_replacement');
      expect(prisma.transaction.updateMany).not.toHaveBeenCalled();
      expect(prisma.category.delete).not.toHaveBeenCalled();
    });

    it('moves every transaction and import suggestion to the replacement, then deletes', async () => {
      prisma.transaction.count.mockResolvedValue(2);

      await service.deleteCategory(USER_ID, FOOD_ID, BILLS_ID);

      // no deletedAt filter, so soft-deleted rows move too
      expect(prisma.transaction.updateMany).toHaveBeenCalledWith({
        where: { categoryId: FOOD_ID },
        data: { categoryId: BILLS_ID },
      });
      expect(prisma.categoryMapping.updateMany).toHaveBeenCalledWith({
        where: { categoryId: FOOD_ID },
        data: { categoryId: BILLS_ID },
      });
      expect(prisma.category.delete).toHaveBeenCalledWith({
        where: { id: FOOD_ID },
      });
    });

    it('deletes an unused category and its import suggestions without a replacement', async () => {
      prisma.transaction.count.mockResolvedValue(0);

      await service.deleteCategory(USER_ID, FOOD_ID);

      expect(prisma.transaction.updateMany).not.toHaveBeenCalled();
      expect(prisma.categoryMapping.deleteMany).toHaveBeenCalledWith({
        where: { categoryId: FOOD_ID },
      });
      expect(prisma.category.delete).toHaveBeenCalledWith({
        where: { id: FOOD_ID },
      });
    });
  });
});
