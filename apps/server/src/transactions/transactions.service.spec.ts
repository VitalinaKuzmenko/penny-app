import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ListTransactionsQuerySchema, UpdateTransactionsSchema } from 'schemas';

import { PrismaService } from '../prisma/prisma.service';
import { TagsService } from '../tags/tags.service';
import { WinstonLogger } from '../utils/logger/logger';

import { TransactionsService } from './transactions.service';

const USER_ID = '11111111-1111-4111-8111-111111111111';
const ACCOUNT_ID = '33333333-3333-4333-8333-333333333333';
const CLOTHES_ID = '44444444-4444-4444-8444-444444444444';
const TRANSFER_ID = '66666666-6666-4666-8666-666666666666';
const FOREIGN_CATEGORY_ID = '77777777-7777-4777-8777-777777777777';
const SPAIN_TAG_ID = '88888888-8888-4888-8888-888888888881';
const WORK_TAG_ID = '88888888-8888-4888-8888-888888888882';
const FOREIGN_TAG_ID = '88888888-8888-4888-8888-888888888889';
const T1 = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1';
const T2 = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2';
const T3 = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3';

const userCategories = [
  { id: CLOTHES_ID, name: 'Clothes, cosmetics' },
  { id: TRANSFER_ID, name: 'Internal Transfer' },
];

const query = (input: Record<string, string> = {}) =>
  ListTransactionsQuerySchema.parse(input);

const listRow = (id: string, overrides: Record<string, unknown> = {}) => ({
  id,
  date: new Date('2026-11-03T00:00:00Z'),
  description: 'TESCO',
  amount: '34.20',
  type: 'EXPENSE',
  currency: 'GBP',
  deletedAt: null,
  category: { id: CLOTHES_ID, name: 'Clothes, cosmetics' },
  account: { id: ACCOUNT_ID, name: 'HSBC' },
  tags: [],
  ...overrides,
});

// A stored row as update() reads it back; amount is stored absolute
const stored = (
  id: string,
  type: 'INCOME' | 'EXPENSE' | 'REFUND',
  overrides: Record<string, unknown> = {},
) => ({
  id,
  type,
  amount: 55,
  description: 'ZARA',
  deletedAt: null,
  ...overrides,
});

function createPrismaMock() {
  const tx = {
    transaction: { updateMany: jest.fn().mockResolvedValue({ count: 1 }) },
    categoryMapping: { upsert: jest.fn().mockResolvedValue({}) },
    tag: {
      findMany: jest.fn().mockResolvedValue([
        { id: SPAIN_TAG_ID, name: 'Spain trip 2026' },
        { id: WORK_TAG_ID, name: 'Work' },
      ]),
      createManyAndReturn: jest.fn(
        async ({ data }: { data: { name: string }[] }) =>
          data.map((d, i) => ({ id: `new-tag-${i}`, name: d.name })),
      ),
    },
    transactionTag: {
      deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
      createMany: jest.fn().mockResolvedValue({ count: 0 }),
    },
  };
  return {
    tx,
    transaction: {
      count: jest.fn().mockResolvedValue(0),
      groupBy: jest.fn().mockResolvedValue([]),
      findMany: jest.fn().mockResolvedValue([]),
    },
    category: {
      findMany: jest.fn(
        async ({ where }: { where: { id: { in: string[] } } }) =>
          userCategories.filter((c) => where.id.in.includes(c.id)),
      ),
    },
    $transaction: jest.fn(async (fn: (t: typeof tx) => Promise<void>) =>
      fn(tx),
    ),
  };
}

describe('TransactionsService', () => {
  let service: TransactionsService;
  let prisma: ReturnType<typeof createPrismaMock>;

  beforeEach(async () => {
    prisma = createPrismaMock();
    const logger = { info: jest.fn(), warn: jest.fn() };
    const module = await Test.createTestingModule({
      providers: [
        TransactionsService,
        TagsService,
        { provide: PrismaService, useValue: prisma },
        { provide: WinstonLogger, useValue: logger },
      ],
    }).compile();
    service = module.get(TransactionsService);
  });

  describe('list', () => {
    it('applies every filter, scoped to the user, and hides deleted rows', async () => {
      await service.list(
        USER_ID,
        query({
          from: '2026-11-01',
          to: '2026-11-30',
          accountIds: ACCOUNT_ID,
          categoryIds: `${CLOTHES_ID},${TRANSFER_ID}`,
          includeUncategorised: 'true',
          type: 'REFUND',
          search: ' zara ',
        }),
      );

      const filters = {
        userId: USER_ID,
        date: {
          gte: new Date('2026-11-01T00:00:00.000Z'),
          lte: new Date('2026-11-30T23:59:59.999Z'),
        },
        accountId: { in: [ACCOUNT_ID] },
        OR: [
          { categoryId: { in: [CLOTHES_ID, TRANSFER_ID] } },
          { categoryId: null },
        ],
        type: 'REFUND',
        description: { contains: 'zara', mode: 'insensitive' },
      };
      const listWhere = { AND: [filters, { deletedAt: null }] };
      expect(prisma.transaction.count).toHaveBeenCalledWith({
        where: listWhere,
      });
      expect(prisma.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: listWhere }),
      );
      expect(prisma.transaction.groupBy).toHaveBeenCalledWith(
        expect.objectContaining({ where: listWhere }),
      );
    });

    it('filters to uncategorised rows only when no category is picked', async () => {
      await service.list(USER_ID, query({ includeUncategorised: 'true' }));

      const { where } = prisma.transaction.findMany.mock.calls[0][0];
      expect(where.AND[0].OR).toEqual([{ categoryId: null }]);
    });

    it('does not filter by category when none is given', async () => {
      await service.list(USER_ID, query());

      const { where } = prisma.transaction.findMany.mock.calls[0][0];
      expect(where.AND[0]).toEqual({ userId: USER_ID });
    });

    it('filters by any of the picked tags or untagged, alongside the category filter', async () => {
      await service.list(
        USER_ID,
        query({
          categoryIds: CLOTHES_ID,
          tagIds: `${SPAIN_TAG_ID},${WORK_TAG_ID}`,
          includeUntagged: 'true',
        }),
      );

      const { where } = prisma.transaction.findMany.mock.calls[0][0];
      expect(where.AND[0]).toEqual({
        userId: USER_ID,
        OR: [{ categoryId: { in: [CLOTHES_ID] } }],
        AND: [
          {
            OR: [
              {
                tags: { some: { tagId: { in: [SPAIN_TAG_ID, WORK_TAG_ID] } } },
              },
              { tags: { none: {} } },
            ],
          },
        ],
      });
      // the totals follow the tag filter too, so they give the event total
      expect(prisma.transaction.groupBy.mock.calls[0][0].where).toEqual(where);
    });

    it('returns each row’s tags sorted by name', async () => {
      prisma.transaction.findMany.mockResolvedValue([
        listRow(T1, {
          tags: [
            { tag: { id: WORK_TAG_ID, name: 'work', color: null } },
            { tag: { id: SPAIN_TAG_ID, name: 'Spain', color: '#1E88E5' } },
          ],
        }),
      ]);

      const { rows } = await service.list(USER_ID, query());

      expect(rows[0].tags).toEqual([
        { id: SPAIN_TAG_ID, name: 'Spain', color: '#1E88E5' },
        { id: WORK_TAG_ID, name: 'work', color: null },
      ]);
    });

    it('lists deleted rows when asked, but still leaves them out of the totals', async () => {
      await service.list(USER_ID, query({ includeDeleted: 'true' }));

      const { where: listWhere } = prisma.transaction.findMany.mock.calls[0][0];
      expect(listWhere).toEqual({ userId: USER_ID });
      expect(prisma.transaction.groupBy.mock.calls[0][0].where).toEqual({
        AND: [{ userId: USER_ID }, { deletedAt: null }],
      });
    });

    it('totals the whole filtered set: refunds come off spent, transfers count, spent can go negative', async () => {
      prisma.transaction.groupBy.mockResolvedValue([
        { type: 'INCOME', _sum: { amount: '1000' }, _count: { _all: 3 } },
        { type: 'EXPENSE', _sum: { amount: '30.10' }, _count: { _all: 2 } },
        { type: 'REFUND', _sum: { amount: '50.20' }, _count: { _all: 1 } },
      ]);
      prisma.transaction.count.mockResolvedValue(6);

      const result = await service.list(USER_ID, query());

      expect(result.rowCount).toBe(6);
      expect(result.totals).toEqual({
        count: 6,
        spent: -20.1,
        income: 1000,
        net: 1020.1,
      });
      // no "Internal Transfer" exclusion, unlike the charts
      expect(
        JSON.stringify(prisma.transaction.groupBy.mock.calls[0][0].where),
      ).not.toContain('Internal Transfer');
    });

    it('returns rows with numeric amounts, ISO dates and a deleted flag', async () => {
      prisma.transaction.findMany.mockResolvedValue([
        listRow(T1),
        listRow(T2, { deletedAt: new Date(), category: null }),
      ]);

      const { rows } = await service.list(USER_ID, query());

      expect(rows).toEqual([
        expect.objectContaining({
          id: T1,
          amount: 34.2,
          date: '2026-11-03T00:00:00.000Z',
          deleted: false,
        }),
        expect.objectContaining({ id: T2, category: null, deleted: true }),
      ]);
    });

    it('pages by date newest first by default', async () => {
      await service.list(USER_ID, query({ page: '2', pageSize: '50' }));

      expect(prisma.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: [{ date: 'desc' }, { id: 'asc' }],
          skip: 100,
          take: 50,
        }),
      );
    });

    it('rejects page sizes other than 25, 50 and 100', () => {
      expect(
        ListTransactionsQuerySchema.safeParse({ pageSize: '10' }).success,
      ).toBe(false);
    });

    describe('sorting by category puts uncategorised rows last', () => {
      it('fills the rest of a page with uncategorised rows', async () => {
        // 30 categorised rows; page 1 of 25 shows 5 categorised + 20 uncategorised
        prisma.transaction.count.mockResolvedValue(30);
        prisma.transaction.findMany
          .mockResolvedValueOnce(
            Array.from({ length: 5 }, (_, i) => listRow(`c${i}`)),
          )
          .mockResolvedValueOnce(
            Array.from({ length: 20 }, (_, i) =>
              listRow(`u${i}`, { category: null }),
            ),
          );

        const { rows } = await service.list(
          USER_ID,
          query({ sortField: 'category', sortOrder: 'desc', page: '1' }),
        );

        const [categorisedCall, uncategorisedCall] =
          prisma.transaction.findMany.mock.calls.map(([args]) => args);
        expect(categorisedCall).toMatchObject({
          orderBy: [
            { category: { name: 'desc' } },
            { date: 'desc' },
            { id: 'asc' },
          ],
          skip: 25,
          take: 25,
        });
        expect(categorisedCall.where.AND[1]).toEqual({
          categoryId: { not: null },
        });
        expect(uncategorisedCall).toMatchObject({ skip: 0, take: 20 });
        expect(uncategorisedCall.where.AND[1]).toEqual({ categoryId: null });
        expect(rows).toHaveLength(25);
        expect(rows[4].category).not.toBeNull();
        expect(rows[5].category).toBeNull();
      });

      it('skips straight to uncategorised rows once past the categorised ones', async () => {
        prisma.transaction.count.mockResolvedValue(30);

        await service.list(
          USER_ID,
          query({ sortField: 'category', sortOrder: 'asc', page: '2' }),
        );

        // only the uncategorised query runs: 50 − 30 categorised already shown
        expect(prisma.transaction.findMany).toHaveBeenCalledTimes(1);
        expect(prisma.transaction.findMany).toHaveBeenCalledWith(
          expect.objectContaining({ skip: 20, take: 25 }),
        );
      });
    });
  });

  describe('update', () => {
    const update = (changes: Record<string, unknown>[]) =>
      service.update(USER_ID, { changes } as never);

    it.each([
      ['a blank description', [{ id: T1, description: '   ' }]],
      [
        'the same row twice',
        [
          { id: T1, deleted: true },
          { id: T1, deleted: false },
        ],
      ],
      ['a change with nothing to change', [{ id: T1 }]],
    ])('the request schema rejects %s', (_, changes) => {
      expect(UpdateTransactionsSchema.safeParse({ changes }).success).toBe(
        false,
      );
    });

    it('rejects the whole request when a transaction is not the user’s', async () => {
      prisma.transaction.findMany.mockResolvedValue([stored(T1, 'EXPENSE')]);

      await expect(
        update([
          { id: T1, description: 'A' },
          { id: T2, description: 'B' },
        ]),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(prisma.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: USER_ID, id: { in: [T1, T2] } },
        }),
      );
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('rejects categories the user does not own and saves nothing', async () => {
      prisma.transaction.findMany.mockResolvedValue([stored(T1, 'EXPENSE')]);

      await expect(
        update([{ id: T1, categoryId: FOREIGN_CATEGORY_ID }]),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it.each([
      ['INCOME', CLOTHES_ID, 'REFUND'],
      ['REFUND', null, 'INCOME'],
      ['REFUND', TRANSFER_ID, 'INCOME'],
      ['INCOME', TRANSFER_ID, 'INCOME'],
    ] as const)(
      'a %s row given category %s becomes %s',
      async (type, categoryId, expected) => {
        prisma.transaction.findMany.mockResolvedValue([stored(T1, type)]);

        await update([{ id: T1, categoryId }]);

        expect(prisma.tx.transaction.updateMany).toHaveBeenCalledWith({
          where: { userId: USER_ID, id: { in: [T1] } },
          data: { categoryId, type: expected },
        });
      },
    );

    it('never changes the type of an expense', async () => {
      prisma.transaction.findMany.mockResolvedValue([stored(T1, 'EXPENSE')]);

      await update([{ id: T1, categoryId: CLOTHES_ID }]);

      expect(prisma.tx.transaction.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({ data: { categoryId: CLOTHES_ID } }),
      );
    });

    it('edits the description only, leaving the dedupe fingerprint alone', async () => {
      prisma.transaction.findMany.mockResolvedValue([stored(T1, 'EXPENSE')]);

      await update([{ id: T1, description: 'Zara jeans' }]);

      expect(prisma.tx.transaction.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({ data: { description: 'Zara jeans' } }),
      );
      expect(prisma.tx.categoryMapping.upsert).not.toHaveBeenCalled();
    });

    it('updates rows with the same outcome together (bulk category change)', async () => {
      prisma.transaction.findMany.mockResolvedValue([
        stored(T1, 'EXPENSE'),
        stored(T2, 'EXPENSE', { description: 'H&M' }),
        stored(T3, 'INCOME', { description: 'ZARA REFUND' }),
      ]);

      const result = await update([
        { id: T1, categoryId: CLOTHES_ID },
        { id: T2, categoryId: CLOTHES_ID },
        { id: T3, categoryId: CLOTHES_ID },
      ]);

      expect(result).toEqual({ updated: 3 });
      expect(prisma.tx.transaction.updateMany.mock.calls).toEqual([
        [
          {
            where: { userId: USER_ID, id: { in: [T1, T2] } },
            data: { categoryId: CLOTHES_ID },
          },
        ],
        [
          {
            where: { userId: USER_ID, id: { in: [T3] } },
            data: { categoryId: CLOTHES_ID, type: 'REFUND' },
          },
        ],
      ]);
    });

    it('learns the category for future imports, using the new description', async () => {
      prisma.transaction.findMany.mockResolvedValue([
        stored(T1, 'EXPENSE', { description: 'ZARA' }),
        stored(T2, 'EXPENSE', { description: 'OLD NAME' }),
        stored(T3, 'EXPENSE', { description: 'NOBODY' }),
      ]);

      await update([
        { id: T1, categoryId: CLOTHES_ID },
        { id: T2, categoryId: CLOTHES_ID, description: '  New Name ' },
        { id: T3, categoryId: null },
      ]);

      expect(prisma.tx.categoryMapping.upsert.mock.calls).toEqual([
        [
          {
            where: {
              userId_description: { userId: USER_ID, description: 'zara' },
            },
            create: {
              userId: USER_ID,
              description: 'zara',
              categoryId: CLOTHES_ID,
            },
            update: { categoryId: CLOTHES_ID },
          },
        ],
        [
          expect.objectContaining({
            where: {
              userId_description: { userId: USER_ID, description: 'new name' },
            },
          }),
        ],
      ]);
    });

    it('soft-deletes and restores rows', async () => {
      prisma.transaction.findMany.mockResolvedValue([
        stored(T1, 'EXPENSE'),
        stored(T2, 'EXPENSE', { deletedAt: new Date('2026-11-01') }),
      ]);

      await update([
        { id: T1, deleted: true },
        { id: T2, deleted: false },
      ]);

      const datas = prisma.tx.transaction.updateMany.mock.calls.map(
        ([args]) => args.data,
      );
      expect(datas).toEqual([
        { deletedAt: expect.any(Date) },
        { deletedAt: null },
      ]);
    });

    it('does not learn a category from a row that is being deleted', async () => {
      prisma.transaction.findMany.mockResolvedValue([stored(T1, 'EXPENSE')]);

      await update([{ id: T1, categoryId: CLOTHES_ID, deleted: true }]);

      expect(prisma.tx.categoryMapping.upsert).not.toHaveBeenCalled();
    });

    it('refuses to edit a deleted row unless it is restored in the same change', async () => {
      prisma.transaction.findMany.mockResolvedValue([
        stored(T1, 'EXPENSE', { deletedAt: new Date() }),
      ]);

      await expect(
        update([{ id: T1, description: 'X' }]),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(prisma.$transaction).not.toHaveBeenCalled();

      await update([{ id: T1, description: 'X', deleted: false }]);
      expect(prisma.tx.transaction.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { description: 'X', deletedAt: null },
        }),
      );
    });

    describe('tags', () => {
      it('replaces a row’s tags with the given set, creating new names', async () => {
        prisma.transaction.findMany.mockResolvedValue([stored(T1, 'EXPENSE')]);

        const result = await update([
          { id: T1, tags: [{ id: SPAIN_TAG_ID }, { name: 'Hotels' }] },
        ]);

        expect(result).toEqual({ updated: 1 });
        // a tags-only change doesn't touch the transaction row itself
        expect(prisma.tx.transaction.updateMany).not.toHaveBeenCalled();
        expect(prisma.tx.tag.createManyAndReturn).toHaveBeenCalledWith(
          expect.objectContaining({
            data: [expect.objectContaining({ name: 'Hotels' })],
          }),
        );
        expect(prisma.tx.transactionTag.deleteMany).toHaveBeenCalledWith({
          where: {
            transactionId: T1,
            tagId: { notIn: [SPAIN_TAG_ID, 'new-tag-0'] },
          },
        });
        expect(prisma.tx.transactionTag.createMany).toHaveBeenCalledWith({
          data: [
            { transactionId: T1, tagId: SPAIN_TAG_ID },
            { transactionId: T1, tagId: 'new-tag-0' },
          ],
          skipDuplicates: true,
        });
      });

      it('an existing name in another case reuses that tag once', async () => {
        prisma.transaction.findMany.mockResolvedValue([stored(T1, 'EXPENSE')]);

        await update([
          { id: T1, tags: [{ name: 'spain trip 2026' }, { id: SPAIN_TAG_ID }] },
        ]);

        expect(prisma.tx.tag.createManyAndReturn).not.toHaveBeenCalled();
        expect(prisma.tx.transactionTag.createMany).toHaveBeenCalledWith(
          expect.objectContaining({
            data: [{ transactionId: T1, tagId: SPAIN_TAG_ID }],
          }),
        );
      });

      it('an empty set removes every tag', async () => {
        prisma.transaction.findMany.mockResolvedValue([stored(T1, 'EXPENSE')]);

        await update([{ id: T1, tags: [] }]);

        expect(prisma.tx.transactionTag.deleteMany).toHaveBeenCalledWith({
          where: { transactionId: T1, tagId: { notIn: [] } },
        });
        expect(prisma.tx.transactionTag.createMany).not.toHaveBeenCalled();
      });

      it('rejects tags that are not the user’s', async () => {
        prisma.transaction.findMany.mockResolvedValue([stored(T1, 'EXPENSE')]);

        await expect(
          update([{ id: T1, tags: [{ id: FOREIGN_TAG_ID }] }]),
        ).rejects.toMatchObject({
          response: { code: 'transactions.invalid_tag' },
        });
        expect(prisma.tx.transactionTag.createMany).not.toHaveBeenCalled();
      });

      it('refuses to change the tags of a deleted row', async () => {
        prisma.transaction.findMany.mockResolvedValue([
          stored(T1, 'EXPENSE', { deletedAt: new Date() }),
        ]);

        await expect(
          update([{ id: T1, tags: [{ id: SPAIN_TAG_ID }] }]),
        ).rejects.toMatchObject({
          response: { code: 'transactions.deleted_not_editable' },
        });
        expect(prisma.$transaction).not.toHaveBeenCalled();
      });

      it('the request schema rejects the same tag twice and over-long names', () => {
        const parse = (tags: unknown) =>
          UpdateTransactionsSchema.safeParse({ changes: [{ id: T1, tags }] })
            .success;

        expect(parse([{ name: 'Spain' }, { name: 'SPAIN ' }])).toBe(false);
        expect(parse([{ name: 'x'.repeat(101) }])).toBe(false);
        expect(parse([{ name: '   ' }])).toBe(false);
        expect(parse([{ name: 'x'.repeat(100) }])).toBe(true);
      });
    });
  });
});
