import { Test } from '@nestjs/testing';

import { PrismaService } from '../prisma/prisma.service';

import { AccountsService } from './accounts.service';

const USER_ID = '11111111-1111-4111-8111-111111111111';
const HSBC_ID = '33333333-3333-4333-8333-333333333333';
const STARLING_ID = '44444444-4444-4444-8444-444444444444';

describe('AccountsService', () => {
  let service: AccountsService;
  const prisma = {
    account: { findMany: jest.fn() },
    transaction: { groupBy: jest.fn() },
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        AccountsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = moduleRef.get(AccountsService);
  });

  describe('getUserAccounts', () => {
    it('adds last transaction date and last import time per account', async () => {
      prisma.account.findMany.mockResolvedValue([
        { id: HSBC_ID, name: 'HSBC' },
        { id: STARLING_ID, name: 'Starling' },
      ]);
      prisma.transaction.groupBy.mockResolvedValue([
        {
          accountId: HSBC_ID,
          _max: {
            date: new Date('2026-09-12T00:00:00Z'),
            createdAt: new Date('2026-09-14T18:30:00Z'),
          },
        },
      ]);

      const result = await service.getUserAccounts(USER_ID);

      expect(result).toEqual([
        {
          id: HSBC_ID,
          name: 'HSBC',
          lastTransactionDate: '2026-09-12T00:00:00.000Z',
          lastImportedAt: '2026-09-14T18:30:00.000Z',
        },
        {
          id: STARLING_ID,
          name: 'Starling',
          lastTransactionDate: null,
          lastImportedAt: null,
        },
      ]);
    });

    it('scopes both queries to the user', async () => {
      prisma.account.findMany.mockResolvedValue([]);
      prisma.transaction.groupBy.mockResolvedValue([]);

      await service.getUserAccounts(USER_ID);

      expect(prisma.account.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: USER_ID } }),
      );
      expect(prisma.transaction.groupBy).toHaveBeenCalledWith(
        expect.objectContaining({
          by: ['accountId'],
          where: { userId: USER_ID },
        }),
      );
    });
  });
});
