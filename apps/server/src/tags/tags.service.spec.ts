import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TAG_PALETTE } from 'schemas';

import { PrismaService } from '../prisma/prisma.service';

import { TagsService } from './tags.service';

const USER_ID = '11111111-1111-4111-8111-111111111111';
const SPAIN_ID = '88888888-8888-4888-8888-888888888881';
const FOREIGN_TAG_ID = '88888888-8888-4888-8888-888888888889';

function createTxMock(existing: { id: string; name: string }[]) {
  let created = 0;
  return {
    tag: {
      findMany: jest.fn().mockResolvedValue(existing),
      createManyAndReturn: jest.fn(
        async ({ data }: { data: { name: string }[] }) =>
          data.map((d) => ({ id: `new-${++created}`, name: d.name })),
      ),
    },
  };
}

describe('TagsService', () => {
  let service: TagsService;
  const prisma = {
    tag: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    prisma.$transaction.mockImplementation(
      async (fn: (tx: typeof prisma) => unknown) => fn(prisma),
    );
    const module = await Test.createTestingModule({
      providers: [TagsService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = module.get(TagsService);
  });

  it('lists the user’s tags sorted by name ignoring case, with counts', async () => {
    prisma.tag.findMany.mockResolvedValue([
      { id: '1', name: 'work', color: null, _count: { transactions: 0 } },
      {
        id: '2',
        name: 'Spain trip',
        color: '#1E88E5',
        _count: { transactions: 4 },
      },
      { id: '3', name: 'birthday', color: null, _count: { transactions: 1 } },
    ]);

    const tags = await service.getUserTags(USER_ID);

    expect(tags.map((t) => [t.name, t.transactionCount])).toEqual([
      ['birthday', 1],
      ['Spain trip', 4],
      ['work', 0],
    ]);
    expect(prisma.tag.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: USER_ID } }),
    );
  });

  describe('resolveRefs', () => {
    it('reuses a tag whose name matches ignoring case instead of creating it', async () => {
      const tx = createTxMock([{ id: SPAIN_ID, name: 'Spain trip 2026' }]);

      const resolve = await service.resolveRefs(
        tx as never,
        USER_ID,
        [{ name: '  spain TRIP 2026 ' }, { id: SPAIN_ID }],
        'x.invalid_tag',
      );

      expect(resolve({ name: 'spain trip 2026' })).toBe(SPAIN_ID);
      expect(resolve({ id: SPAIN_ID })).toBe(SPAIN_ID);
      expect(tx.tag.createManyAndReturn).not.toHaveBeenCalled();
    });

    it('creates each new name once, keeping the first spelling, with the next palette colours', async () => {
      const tx = createTxMock([{ id: SPAIN_ID, name: 'Spain trip 2026' }]);

      const resolve = await service.resolveRefs(
        tx as never,
        USER_ID,
        [{ name: 'Work ' }, { name: 'work' }, { name: 'Birthday' }],
        'x.invalid_tag',
      );

      expect(tx.tag.createManyAndReturn).toHaveBeenCalledTimes(1);
      expect(tx.tag.createManyAndReturn.mock.calls[0][0].data).toEqual([
        { userId: USER_ID, name: 'Work', color: TAG_PALETTE[1] },
        { userId: USER_ID, name: 'Birthday', color: TAG_PALETTE[2] },
      ]);
      expect(resolve({ name: 'WORK' })).toBe(resolve({ name: 'Work ' }));
      expect(resolve({ name: 'birthday' })).toBe('new-2');
    });

    it('rejects tag IDs that are not the user’s and creates nothing', async () => {
      const tx = createTxMock([{ id: SPAIN_ID, name: 'Spain trip 2026' }]);

      const call = service.resolveRefs(
        tx as never,
        USER_ID,
        [{ name: 'New' }, { id: FOREIGN_TAG_ID }],
        'transactions.invalid_tag',
      );

      await expect(call).rejects.toBeInstanceOf(BadRequestException);
      await expect(call).rejects.toMatchObject({
        response: {
          code: 'transactions.invalid_tag',
          meta: { tagIds: [FOREIGN_TAG_ID] },
        },
      });
      expect(tx.tag.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: USER_ID } }),
      );
      expect(tx.tag.createManyAndReturn).not.toHaveBeenCalled();
    });
  });

  describe('managing tags', () => {
    const SPAIN = { id: SPAIN_ID, name: 'Spain' };

    it('rejects creating a name that exists ignoring case', async () => {
      prisma.tag.findMany.mockResolvedValue([SPAIN]);

      await expect(
        service.createTag(USER_ID, { name: 'SPAIN', color: TAG_PALETTE[0] }),
      ).rejects.toMatchObject({
        response: { code: 'tag.already_exists', meta: { name: 'Spain' } },
      });
      expect(prisma.tag.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: USER_ID } }),
      );
      expect(prisma.tag.create).not.toHaveBeenCalled();
    });

    it('treats _ and % as plain characters, not wildcards', async () => {
      prisma.tag.findMany.mockResolvedValue([{ id: 'x', name: 'trip 2026' }]);
      prisma.tag.create.mockResolvedValue({
        id: 'new',
        name: 'trip_2026',
        color: TAG_PALETTE[0],
        _count: { transactions: 0 },
      });

      await service.createTag(USER_ID, {
        name: 'trip_2026',
        color: TAG_PALETTE[0],
      });

      expect(prisma.tag.create).toHaveBeenCalled();
    });

    it('renames a tag, checking clashes against the other tags only', async () => {
      prisma.tag.findFirst.mockResolvedValue(SPAIN); // owned
      // only the tag itself has the name, ignoring case
      prisma.tag.findMany.mockResolvedValue([{ ...SPAIN, name: 'spain 2026' }]);
      prisma.tag.update.mockResolvedValue({
        ...SPAIN,
        name: 'Spain 2026',
        color: null,
        _count: { transactions: 3 },
      });

      const tag = await service.updateTag(USER_ID, SPAIN_ID, {
        name: 'Spain 2026',
      });

      expect(tag).toEqual({
        id: SPAIN_ID,
        name: 'Spain 2026',
        color: null,
        transactionCount: 3,
      });
      expect(prisma.tag.update).toHaveBeenCalled();
    });

    it('deletes only the user’s own tag', async () => {
      prisma.tag.findFirst.mockResolvedValue(null);

      await expect(
        service.deleteTag(USER_ID, FOREIGN_TAG_ID),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(prisma.tag.delete).not.toHaveBeenCalled();

      prisma.tag.findFirst.mockResolvedValue(SPAIN);
      await service.deleteTag(USER_ID, SPAIN_ID);
      // TransactionTag links cascade in the DB; transactions are untouched
      expect(prisma.tag.delete).toHaveBeenCalledWith({
        where: { id: SPAIN_ID },
      });
    });
  });
});
