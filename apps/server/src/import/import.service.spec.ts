import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { PrismaService } from '../prisma/prisma.service';
import { WinstonLogger } from '../utils/logger/logger';
import { buildTransactionFingerprint } from '../utils/transaction-fingerprint';

import { ImportService } from './import.service';

const USER_ID = '11111111-1111-4111-8111-111111111111';
const IMPORT_ID = '22222222-2222-4222-8222-222222222222';
const ACCOUNT_ID = '33333333-3333-4333-8333-333333333333';
const CATEGORY_ID = '44444444-4444-4444-8444-444444444444';
const OVERRIDE_CATEGORY_ID = '55555555-5555-4555-8555-555555555555';
const TRANSFER_CATEGORY_ID = '66666666-6666-4666-8666-666666666666';

// The user's own categories; anything else is "not owned"
const userCategories = [
  { id: CATEGORY_ID, name: 'Clothes, cosmetics' },
  { id: OVERRIDE_CATEGORY_ID, name: 'Others' },
  { id: TRANSFER_CATEGORY_ID, name: 'Internal Transfer' },
];

type Row = {
  id: string;
  importId: string;
  date: Date;
  description: string;
  amount: number;
  categoryId: string | null;
};

const row = (
  id: string,
  date: string,
  amount: number,
  description: string,
): Row => ({
  id,
  importId: IMPORT_ID,
  date: new Date(`${date}T00:00:00Z`),
  description,
  amount,
  categoryId: null,
});

// An existing Transaction as the service reads it back; amount is stored absolute
const existing = (
  date: string,
  amount: number,
  description: string,
  type: 'INCOME' | 'EXPENSE' | 'REFUND' = amount < 0 ? 'EXPENSE' : 'INCOME',
) => ({
  fingerprint: buildTransactionFingerprint(
    new Date(`${date}T00:00:00Z`),
    amount,
    description,
  ),
  date: new Date(`${date}T00:00:00Z`),
  description,
  amount: Math.abs(amount),
  type,
});

function createPrismaMock() {
  const tx = {
    transaction: { createMany: jest.fn().mockResolvedValue({ count: 0 }) },
    categoryMapping: { upsert: jest.fn().mockResolvedValue({}) },
    transactionImport: { update: jest.fn().mockResolvedValue({}) },
  };
  return {
    tx,
    transactionImport: { findFirst: jest.fn() },
    transaction: { findMany: jest.fn().mockResolvedValue([]) },
    categoryMapping: { findMany: jest.fn().mockResolvedValue([]) },
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

describe('ImportService', () => {
  let service: ImportService;
  let prisma: ReturnType<typeof createPrismaMock>;

  beforeEach(async () => {
    prisma = createPrismaMock();
    const logger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [
        ImportService,
        { provide: PrismaService, useValue: prisma },
        { provide: WinstonLogger, useValue: logger },
      ],
    }).compile();

    service = module.get(ImportService);
  });

  describe('getImportRows', () => {
    it('returns null when the import does not belong to the user', async () => {
      prisma.transactionImport.findFirst.mockResolvedValue(null);
      await expect(
        service.getImportRows(USER_ID, IMPORT_ID),
      ).resolves.toBeNull();
    });

    it('does not flag duplicates when no account is provided', async () => {
      prisma.transactionImport.findFirst.mockResolvedValue({
        id: IMPORT_ID,
        rows: [row('r1', '2026-08-03', -34.2, 'TESCO')],
      });

      const result = await service.getImportRows(USER_ID, IMPORT_ID);

      expect(prisma.transaction.findMany).not.toHaveBeenCalled();
      expect(result).toEqual([
        expect.objectContaining({
          id: 'r1',
          duplicate: false,
          duplicateOf: null,
        }),
      ]);
    });

    it('flags a row as duplicate and returns the matched transaction', async () => {
      prisma.transactionImport.findFirst.mockResolvedValue({
        id: IMPORT_ID,
        rows: [
          row('r1', '2026-08-03', -34.2, 'TESCO STORES 3201'),
          row('r2', '2026-08-04', -12.55, 'COSTA COFFEE'),
        ],
      });
      prisma.transaction.findMany.mockResolvedValue([
        existing('2026-08-03', -34.2, 'TESCO STORES 3201'),
      ]);

      const result = await service.getImportRows(
        USER_ID,
        IMPORT_ID,
        ACCOUNT_ID,
      );

      expect(prisma.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            accountId: ACCOUNT_ID,
            userId: USER_ID,
          }),
        }),
      );
      expect(result?.[0]).toMatchObject({
        id: 'r1',
        duplicate: true,
        duplicateOf: {
          date: '03/08/2026',
          amount: -34.2,
          description: 'TESCO STORES 3201',
        },
      });
      expect(result?.[1]).toMatchObject({
        id: 'r2',
        duplicate: false,
        duplicateOf: null,
      });
    });

    it('matches case- and whitespace-insensitively on description', async () => {
      prisma.transactionImport.findFirst.mockResolvedValue({
        id: IMPORT_ID,
        rows: [row('r1', '2026-08-03', -34.2, '  tesco stores 3201 ')],
      });
      prisma.transaction.findMany.mockResolvedValue([
        existing('2026-08-03', -34.2, 'TESCO STORES 3201'),
      ]);

      const result = await service.getImportRows(
        USER_ID,
        IMPORT_ID,
        ACCOUNT_ID,
      );
      expect(result?.[0].duplicate).toBe(true);
    });

    it('only flags as many rows as there are existing matches (count-based)', async () => {
      // 1 identical coffee already saved; 3 identical coffees in the new file.
      // Only the first should be treated as a re-import — the other two are new.
      prisma.transactionImport.findFirst.mockResolvedValue({
        id: IMPORT_ID,
        rows: [
          row('r1', '2026-08-03', -3.5, 'COSTA'),
          row('r2', '2026-08-03', -3.5, 'COSTA'),
          row('r3', '2026-08-03', -3.5, 'COSTA'),
        ],
      });
      prisma.transaction.findMany.mockResolvedValue([
        existing('2026-08-03', -3.5, 'COSTA'),
      ]);

      const result = await service.getImportRows(
        USER_ID,
        IMPORT_ID,
        ACCOUNT_ID,
      );

      expect(result?.map((r) => r.duplicate)).toEqual([true, false, false]);
    });

    it('attaches the learned category suggestion by normalised description', async () => {
      prisma.transactionImport.findFirst.mockResolvedValue({
        id: IMPORT_ID,
        rows: [row('r1', '2026-08-03', -34.2, 'TESCO STORES')],
      });
      prisma.categoryMapping.findMany.mockResolvedValue([
        { description: 'tesco stores', categoryId: CATEGORY_ID },
      ]);

      const result = await service.getImportRows(USER_ID, IMPORT_ID);

      expect(result?.[0]).toMatchObject({
        suggestedCategoryId: CATEGORY_ID,
        autoAssigned: true,
      });
    });
  });

  describe('confirmImport', () => {
    // Payload rows echo the stored description unless a test overrides it,
    // mirroring what the UI sends when the user hasn't edited the field.
    let storedRows: Row[] = [];
    const stubImport = (status: 'PENDING' | 'CONFIRMED', rows: Row[]) => {
      storedRows = rows;
      prisma.transactionImport.findFirst.mockResolvedValue({
        id: IMPORT_ID,
        status,
        rows,
      });
    };
    const dto = (
      rows: {
        id: string;
        forceImport?: boolean;
        categoryId?: string;
        description?: string;
      }[],
    ) => ({
      accountId: ACCOUNT_ID,
      currency: 'GBP' as const,
      rows: rows.map((r) => ({
        description: storedRows.find((s) => s.id === r.id)?.description ?? 'x',
        ...r,
      })),
    });

    it('throws NotFound when the import does not belong to the user', async () => {
      prisma.transactionImport.findFirst.mockResolvedValue(null);
      await expect(
        service.confirmImport(USER_ID, IMPORT_ID, dto([{ id: 'r1' }])),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws BadRequest when the import is already confirmed', async () => {
      stubImport('CONFIRMED', []);
      await expect(
        service.confirmImport(USER_ID, IMPORT_ID, dto([{ id: 'r1' }])),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('throws BadRequest when a stored row is missing from the payload', async () => {
      stubImport('PENDING', [
        row('r1', '2026-08-03', -1, 'A'),
        row('r2', '2026-08-03', -1, 'B'),
      ]);
      await expect(
        service.confirmImport(USER_ID, IMPORT_ID, dto([{ id: 'r1' }])),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('inserts all rows with fingerprints when nothing already exists', async () => {
      stubImport('PENDING', [
        row('r1', '2026-08-03', -34.2, 'TESCO'),
        row('r2', '2026-08-04', 2500, 'SALARY'),
      ]);

      const result = await service.confirmImport(
        USER_ID,
        IMPORT_ID,
        dto([{ id: 'r1', categoryId: CATEGORY_ID }, { id: 'r2' }]),
      );

      expect(result).toEqual({ skippedDuplicates: 0 });
      const { data } = prisma.tx.transaction.createMany.mock.calls[0][0];
      expect(data).toHaveLength(2);
      expect(data[0]).toMatchObject({
        userId: USER_ID,
        accountId: ACCOUNT_ID,
        currency: 'GBP',
        amount: 34.2,
        type: 'EXPENSE',
        categoryId: CATEGORY_ID,
        fingerprint: expect.stringMatching(/^[a-f0-9]{64}$/),
      });
      expect(data[1]).toMatchObject({
        amount: 2500,
        type: 'INCOME',
        categoryId: null,
      });
      expect(prisma.tx.transactionImport.update).toHaveBeenCalledWith({
        where: { id: IMPORT_ID },
        data: { status: 'CONFIRMED' },
      });
    });

    it('skips rows that already exist on the account by default', async () => {
      stubImport('PENDING', [
        row('r1', '2026-08-03', -34.2, 'TESCO'),
        row('r2', '2026-08-04', -12.55, 'COSTA'),
      ]);
      prisma.transaction.findMany.mockResolvedValue([
        existing('2026-08-03', -34.2, 'TESCO'),
      ]);

      const result = await service.confirmImport(
        USER_ID,
        IMPORT_ID,
        dto([{ id: 'r1' }, { id: 'r2' }]),
      );

      expect(result).toEqual({ skippedDuplicates: 1 });
      const { data } = prisma.tx.transaction.createMany.mock.calls[0][0];
      expect(data).toHaveLength(1);
      expect(data[0]).toMatchObject({ amount: 12.55 });
    });

    it('imports a flagged duplicate when the user sets forceImport', async () => {
      stubImport('PENDING', [row('r1', '2026-08-03', -34.2, 'TESCO')]);
      prisma.transaction.findMany.mockResolvedValue([
        existing('2026-08-03', -34.2, 'TESCO'),
      ]);

      // sanity: without the override this exact setup is skipped
      const skipped = await service.confirmImport(
        USER_ID,
        IMPORT_ID,
        dto([{ id: 'r1' }]),
      );
      expect(skipped).toEqual({ skippedDuplicates: 1 });
      prisma.tx.transaction.createMany.mockClear();

      const result = await service.confirmImport(
        USER_ID,
        IMPORT_ID,
        dto([{ id: 'r1', forceImport: true }]),
      );

      expect(result).toEqual({ skippedDuplicates: 0 });
      expect(
        prisma.tx.transaction.createMany.mock.calls[0][0].data,
      ).toHaveLength(1);
    });

    it('is count-based: 2 existing + 3 identical new rows → skips 2, inserts 1', async () => {
      stubImport('PENDING', [
        row('r1', '2026-08-03', -3.5, 'COSTA'),
        row('r2', '2026-08-03', -3.5, 'COSTA'),
        row('r3', '2026-08-03', -3.5, 'COSTA'),
      ]);
      prisma.transaction.findMany.mockResolvedValue([
        existing('2026-08-03', -3.5, 'COSTA'),
        existing('2026-08-03', -3.5, 'COSTA'),
      ]);

      const result = await service.confirmImport(
        USER_ID,
        IMPORT_ID,
        dto([{ id: 'r1' }, { id: 'r2' }, { id: 'r3' }]),
      );

      expect(result).toEqual({ skippedDuplicates: 2 });
      expect(
        prisma.tx.transaction.createMany.mock.calls[0][0].data,
      ).toHaveLength(1);
    });

    it('does not call createMany when every row is skipped', async () => {
      stubImport('PENDING', [row('r1', '2026-08-03', -34.2, 'TESCO')]);
      prisma.transaction.findMany.mockResolvedValue([
        existing('2026-08-03', -34.2, 'TESCO'),
      ]);

      const result = await service.confirmImport(
        USER_ID,
        IMPORT_ID,
        dto([{ id: 'r1' }]),
      );

      expect(result).toEqual({ skippedDuplicates: 1 });
      expect(prisma.tx.transaction.createMany).not.toHaveBeenCalled();
      // the import is still finalised so it can't be re-confirmed
      expect(prisma.tx.transactionImport.update).toHaveBeenCalled();
    });

    it('uses the user-edited description for both the transaction and the fingerprint', async () => {
      stubImport('PENDING', [
        row('r1', '2026-08-03', -34.2, 'TESCO STORES 3201 LONDON'),
      ]);
      // existing row matches the *edited* description, not the raw one
      prisma.transaction.findMany.mockResolvedValue([
        existing('2026-08-03', -34.2, 'Tesco'),
      ]);

      const result = await service.confirmImport(USER_ID, IMPORT_ID, {
        accountId: ACCOUNT_ID,
        currency: 'GBP',
        rows: [{ id: 'r1', description: 'Tesco' }],
      });

      expect(result).toEqual({ skippedDuplicates: 1 });
    });

    it('learns a category mapping for every categorised row', async () => {
      stubImport('PENDING', [
        row('r1', '2026-08-03', -34.2, 'TESCO STORES'),
        row('r2', '2026-08-04', 2500, 'SALARY'),
      ]);

      await service.confirmImport(USER_ID, IMPORT_ID, {
        accountId: ACCOUNT_ID,
        currency: 'GBP',
        rows: [
          { id: 'r1', description: 'TESCO STORES', categoryId: CATEGORY_ID },
          { id: 'r2', description: 'SALARY' },
        ],
      });

      expect(prisma.tx.categoryMapping.upsert).toHaveBeenCalledTimes(1);
      expect(prisma.tx.categoryMapping.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            userId_description: {
              userId: USER_ID,
              description: 'tesco stores',
            },
          },
          create: {
            userId: USER_ID,
            description: 'tesco stores',
            categoryId: CATEGORY_ID,
          },
          update: { categoryId: CATEGORY_ID },
        }),
      );
    });

    // What the user picks in the review table must always be what is saved —
    // whether they keep the auto-suggestion, replace it, or clear it.
    describe("auto-suggested category vs the user's final choice", () => {
      const SUGGESTED = CATEGORY_ID;
      const OVERRIDE = OVERRIDE_CATEGORY_ID;

      const savedRow = () =>
        prisma.tx.transaction.createMany.mock.calls[0][0].data[0];
      const learnedMappings = () =>
        prisma.tx.categoryMapping.upsert.mock.calls.map((c) => ({
          description: c[0].where.userId_description.description,
          categoryId: c[0].update.categoryId,
        }));

      beforeEach(() => {
        // "salary" was previously categorised, so the review table pre-fills SUGGESTED
        prisma.categoryMapping.findMany.mockResolvedValue([
          { description: 'salary', categoryId: SUGGESTED },
        ]);
        stubImport('PENDING', [row('r1', '2026-08-03', 2500, 'Salary')]);
      });

      it('pre-fills the review row with the learned category', async () => {
        const rows = await service.getImportRows(USER_ID, IMPORT_ID);

        expect(rows?.[0]).toMatchObject({
          suggestedCategoryId: SUGGESTED,
          autoAssigned: true,
        });
      });

      it('keeping the suggestion saves it and reinforces the mapping', async () => {
        await service.confirmImport(
          USER_ID,
          IMPORT_ID,
          dto([{ id: 'r1', categoryId: SUGGESTED }]),
        );

        expect(savedRow()).toMatchObject({ categoryId: SUGGESTED });
        expect(learnedMappings()).toEqual([
          { description: 'salary', categoryId: SUGGESTED },
        ]);
      });

      it('overriding with a different category saves the override and re-learns it', async () => {
        await service.confirmImport(
          USER_ID,
          IMPORT_ID,
          dto([{ id: 'r1', categoryId: OVERRIDE }]),
        );

        expect(savedRow()).toMatchObject({ categoryId: OVERRIDE });
        expect(learnedMappings()).toEqual([
          { description: 'salary', categoryId: OVERRIDE },
        ]);
      });

      it('overriding with "None" saves the row without a category', async () => {
        await service.confirmImport(USER_ID, IMPORT_ID, dto([{ id: 'r1' }]));

        expect(savedRow()).toMatchObject({ categoryId: null });
        // nothing is learned from an uncategorised row (the old mapping is left as-is)
        expect(prisma.tx.categoryMapping.upsert).not.toHaveBeenCalled();
      });

      it('an edited description is what gets saved and learned', async () => {
        await service.confirmImport(USER_ID, IMPORT_ID, {
          accountId: ACCOUNT_ID,
          currency: 'GBP',
          rows: [
            { id: 'r1', description: 'Monthly pay', categoryId: OVERRIDE },
          ],
        });

        expect(savedRow()).toMatchObject({
          description: 'Monthly pay',
          categoryId: OVERRIDE,
        });
        expect(learnedMappings()).toEqual([
          { description: 'monthly pay', categoryId: OVERRIDE },
        ]);
      });

      it("rows imported without an account-level suggestion still learn from the user's choice", async () => {
        prisma.categoryMapping.findMany.mockResolvedValue([]);
        stubImport('PENDING', [
          row('r1', '2026-08-03', -4.5, 'SUMUP *BLUEBIRD'),
        ]);

        const rows = await service.getImportRows(USER_ID, IMPORT_ID);
        expect(rows?.[0]).toMatchObject({
          suggestedCategoryId: null,
          autoAssigned: false,
        });

        await service.confirmImport(
          USER_ID,
          IMPORT_ID,
          dto([{ id: 'r1', categoryId: OVERRIDE }]),
        );

        expect(learnedMappings()).toEqual([
          { description: 'sumup *bluebird', categoryId: OVERRIDE },
        ]);
      });
    });

    describe('refunds', () => {
      const savedTypes = () =>
        prisma.tx.transaction.createMany.mock.calls[0][0].data.map(
          (d: { type: string }) => d.type,
        );

      it('saves a positive row with a spending category as REFUND', async () => {
        stubImport('PENDING', [
          row('r1', '2026-10-01', -100, 'ZARA'),
          row('r2', '2026-10-20', 55, 'ZARA'),
        ]);

        await service.confirmImport(
          USER_ID,
          IMPORT_ID,
          dto([
            { id: 'r1', categoryId: CATEGORY_ID },
            { id: 'r2', categoryId: CATEGORY_ID },
          ]),
        );

        const { data } = prisma.tx.transaction.createMany.mock.calls[0][0];
        expect(data[0]).toMatchObject({ amount: 100, type: 'EXPENSE' });
        expect(data[1]).toMatchObject({
          amount: 55,
          type: 'REFUND',
          categoryId: CATEGORY_ID,
        });
      });

      it('keeps positive rows without a category or in Internal Transfer as INCOME', async () => {
        stubImport('PENDING', [
          row('r1', '2026-10-01', 2500, 'SALARY'),
          row('r2', '2026-10-02', 300, 'FROM SAVINGS'),
        ]);

        await service.confirmImport(
          USER_ID,
          IMPORT_ID,
          dto([{ id: 'r1' }, { id: 'r2', categoryId: TRANSFER_CATEGORY_ID }]),
        );

        expect(savedTypes()).toEqual(['INCOME', 'INCOME']);
      });

      it('rejects category IDs that are not the user’s and saves nothing', async () => {
        const FOREIGN = '77777777-7777-4777-8777-777777777777';
        stubImport('PENDING', [row('r1', '2026-10-01', -10, 'TESCO')]);

        const call = service.confirmImport(
          USER_ID,
          IMPORT_ID,
          dto([{ id: 'r1', categoryId: FOREIGN }]),
        );

        await expect(call).rejects.toBeInstanceOf(BadRequestException);
        await expect(call).rejects.toMatchObject({
          response: {
            code: 'import.invalid_category',
            meta: { categoryIds: [FOREIGN] },
          },
        });
        expect(prisma.category.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { userId: USER_ID, id: { in: [FOREIGN] } },
          }),
        );
        expect(prisma.$transaction).not.toHaveBeenCalled();
      });

      it('flags a re-imported refund as a duplicate of the saved REFUND', async () => {
        prisma.transaction.findMany.mockResolvedValue([
          existing('2026-10-20', 55, 'ZARA', 'REFUND'),
        ]);
        prisma.transactionImport.findFirst.mockResolvedValue({
          id: IMPORT_ID,
          rows: [row('r1', '2026-10-20', 55, 'ZARA')],
        });

        const result = await service.getImportRows(
          USER_ID,
          IMPORT_ID,
          ACCOUNT_ID,
        );

        expect(result?.[0]).toMatchObject({
          duplicate: true,
          duplicateOf: { amount: 55 },
        });
      });
    });
  });
});
