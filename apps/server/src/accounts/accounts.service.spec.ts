import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { PrismaService } from '../prisma/prisma.service';

import { AccountsService } from './accounts.service';

const USER_ID = '11111111-1111-4111-8111-111111111111';
const HSBC_ID = '33333333-3333-4333-8333-333333333333';
const STARLING_ID = '44444444-4444-4444-8444-444444444444';

describe('AccountsService', () => {
  let service: AccountsService;
  const prisma = {
    account: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    transaction: { groupBy: jest.fn(), count: jest.fn() },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    prisma.$transaction.mockImplementation(
      async (fn: (tx: typeof prisma) => unknown) => fn(prisma),
    );
    const moduleRef = await Test.createTestingModule({
      providers: [
        AccountsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = moduleRef.get(AccountsService);
  });

  describe('getUserAccounts', () => {
    it('adds the first and last transaction dates and transaction count per account', async () => {
      prisma.account.findMany.mockResolvedValue([
        { id: HSBC_ID, name: 'HSBC', _count: { transactions: 7 } },
        { id: STARLING_ID, name: 'Starling', _count: { transactions: 0 } },
      ]);
      prisma.transaction.groupBy.mockResolvedValue([
        {
          accountId: HSBC_ID,
          _min: { date: new Date('2023-02-01T00:00:00Z') },
          _max: { date: new Date('2026-09-12T00:00:00Z') },
        },
      ]);

      const result = await service.getUserAccounts(USER_ID);

      expect(result).toEqual([
        {
          id: HSBC_ID,
          name: 'HSBC',
          lastTransactionDate: '2026-09-12T00:00:00.000Z',
          firstTransactionDate: '2023-02-01T00:00:00.000Z',
          transactionCount: 7,
        },
        {
          id: STARLING_ID,
          name: 'Starling',
          lastTransactionDate: null,
          firstTransactionDate: null,
          transactionCount: 0,
        },
      ]);
    });

    it('scopes both queries to the user and skips deleted transactions', async () => {
      prisma.account.findMany.mockResolvedValue([]);
      prisma.transaction.groupBy.mockResolvedValue([]);

      await service.getUserAccounts(USER_ID);

      expect(prisma.account.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: USER_ID } }),
      );
      expect(prisma.transaction.groupBy).toHaveBeenCalledWith(
        expect.objectContaining({
          by: ['accountId'],
          where: { userId: USER_ID, deletedAt: null },
        }),
      );
    });
  });

  describe('managing accounts', () => {
    it('rejects creating a name that exists ignoring case', async () => {
      prisma.account.findMany.mockResolvedValue([
        { id: HSBC_ID, name: 'HSBC' },
      ]);

      await expect(
        service.createAccount(USER_ID, 'hsbc'),
      ).rejects.toMatchObject({
        response: { code: 'account.already_exists', meta: { name: 'HSBC' } },
      });

      expect(prisma.account.create).not.toHaveBeenCalled();
    });

    it('renames an account, checking clashes against the other accounts only', async () => {
      prisma.account.findFirst.mockResolvedValue({ id: HSBC_ID }); // owned
      // only the account itself has the name, ignoring case
      prisma.account.findMany.mockResolvedValue([
        { id: HSBC_ID, name: 'hsbc uk' },
      ]);
      prisma.account.update.mockResolvedValue({ id: HSBC_ID, name: 'HSBC UK' });

      await service.renameAccount(USER_ID, HSBC_ID, 'HSBC UK');

      expect(prisma.account.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: HSBC_ID },
          data: { name: 'HSBC UK' },
        }),
      );
    });

    it('blocks deleting an account that has any transaction, soft-deleted included', async () => {
      prisma.account.findFirst.mockResolvedValue({ id: HSBC_ID });
      prisma.transaction.count.mockResolvedValue(1);

      await expect(
        service.deleteAccount(USER_ID, HSBC_ID),
      ).rejects.toMatchObject({
        response: { code: 'account.has_transactions' },
      });
      // no deletedAt filter, so soft-deleted rows count
      expect(prisma.transaction.count).toHaveBeenCalledWith({
        where: { accountId: HSBC_ID },
      });
      expect(prisma.account.delete).not.toHaveBeenCalled();
    });

    it('deletes an account without transactions', async () => {
      prisma.account.findFirst.mockResolvedValue({ id: STARLING_ID });
      prisma.transaction.count.mockResolvedValue(0);

      await service.deleteAccount(USER_ID, STARLING_ID);

      expect(prisma.account.delete).toHaveBeenCalledWith({
        where: { id: STARLING_ID },
      });
    });

    it('returns 404 for another user’s account', async () => {
      prisma.account.findFirst.mockResolvedValue(null);

      await expect(
        service.deleteAccount(USER_ID, HSBC_ID),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
