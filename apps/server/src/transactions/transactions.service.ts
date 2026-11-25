import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ListTransactionsQuery,
  ListTransactionsResponse,
  TransactionListItem,
  UpdateTransactionsInput,
  UpdateTransactionsResponse,
} from 'schemas';

import { emptyTypeTotals } from '../charts/refund-netting';
import { Prisma, TransactionType } from '../prisma/generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { byTagName, TagsService } from '../tags/tags.service';
import { WinstonLogger } from '../utils/logger/logger';
import { notDeleted } from '../utils/not-deleted';
import { resolveTransactionType } from '../utils/transaction-type';

const listSelect = {
  id: true,
  date: true,
  description: true,
  amount: true,
  type: true,
  currency: true,
  deletedAt: true,
  category: { select: { id: true, name: true } },
  account: { select: { id: true, name: true } },
  tags: { select: { tag: { select: { id: true, name: true, color: true } } } },
} satisfies Prisma.TransactionSelect;

type ListRow = Prisma.TransactionGetPayload<{ select: typeof listSelect }>;

const round2 = (n: number) => Math.round(n * 100) / 100;

// Newest first, then a stable order so paging never repeats or skips rows
const tieBreak: Prisma.TransactionOrderByWithRelationInput[] = [
  { date: 'desc' },
  { id: 'asc' },
];

const toListItem = (row: ListRow): TransactionListItem => ({
  id: row.id,
  date: row.date.toISOString(),
  description: row.description,
  amount: Number(row.amount),
  type: row.type,
  currency: row.currency,
  category: row.category,
  account: row.account,
  tags: row.tags.map((t) => t.tag).sort(byTagName),
  deleted: row.deletedAt !== null,
});

@Injectable()
export class TransactionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: WinstonLogger,
    private readonly tagsService: TagsService,
  ) {}

  async list(
    userId: string,
    query: ListTransactionsQuery,
  ): Promise<ListTransactionsResponse> {
    const where = this.buildWhere(userId, query);
    const listWhere: Prisma.TransactionWhereInput = query.includeDeleted
      ? where
      : { AND: [where, notDeleted] };

    const [rowCount, totals, rows] = await Promise.all([
      this.prisma.transaction.count({ where: listWhere }),
      this.getTotals({ AND: [where, notDeleted] }),
      this.findPage(listWhere, query),
    ]);

    return { rows: rows.map(toListItem), rowCount, totals };
  }

  async update(
    userId: string,
    { changes }: UpdateTransactionsInput,
  ): Promise<UpdateTransactionsResponse> {
    const ids = changes.map((c) => c.id);
    const existing = await this.prisma.transaction.findMany({
      where: { userId, id: { in: ids } },
      select: {
        id: true,
        type: true,
        amount: true,
        description: true,
        deletedAt: true,
      },
    });
    const rowById = new Map(existing.map((r) => [r.id, r]));

    const missingIds = ids.filter((id) => !rowById.has(id));
    if (missingIds.length) {
      this.logger.warn('Unknown transactions in update', {
        userId,
        missingIds,
      });
      throw new NotFoundException({
        code: 'transactions.not_found',
        meta: { ids: missingIds },
      });
    }

    const categoryIds = [
      ...new Set(
        changes
          .map((c) => c.categoryId)
          .filter((id): id is string => Boolean(id)),
      ),
    ];
    const categories = categoryIds.length
      ? await this.prisma.category.findMany({
          where: { userId, id: { in: categoryIds } },
          select: { id: true, isTransfer: true },
        })
      : [];
    const categoryById = new Map(categories.map((c) => [c.id, c]));
    const unknownCategoryIds = categoryIds.filter(
      (id) => !categoryById.has(id),
    );
    if (unknownCategoryIds.length) {
      this.logger.warn('Unknown categories in update', {
        userId,
        unknownCategoryIds,
      });
      throw new BadRequestException({
        code: 'transactions.invalid_category',
        meta: { categoryIds: unknownCategoryIds },
      });
    }

    // A deleted row has to be restored before it can be edited
    const lockedIds = changes
      .filter((c) => {
        const isEdit =
          c.description !== undefined ||
          c.categoryId !== undefined ||
          c.tags !== undefined;
        const staysDeleted =
          rowById.get(c.id)!.deletedAt !== null && c.deleted !== false;
        return isEdit && staysDeleted;
      })
      .map((c) => c.id);
    if (lockedIds.length) {
      throw new BadRequestException({
        code: 'transactions.deleted_not_editable',
        meta: { ids: lockedIds },
      });
    }

    const now = new Date();
    // Rows that end up with identical data share one updateMany (e.g. a bulk category change)
    const groups = new Map<
      string,
      { data: Prisma.TransactionUncheckedUpdateManyInput; ids: string[] }
    >();
    // normalised description → category, same as import; last change wins
    const mappings = new Map<string, string>();

    for (const change of changes) {
      const row = rowById.get(change.id)!;
      const data: Prisma.TransactionUncheckedUpdateManyInput = {};

      if (change.description !== undefined) {
        data.description = change.description;
      }
      if (change.categoryId !== undefined) {
        data.categoryId = change.categoryId;
        // Money in can switch between income and refund; money out stays an expense
        if (row.type !== TransactionType.EXPENSE) {
          data.type = resolveTransactionType(
            Number(row.amount),
            change.categoryId ? categoryById.get(change.categoryId)! : null,
          );
        }
      }
      if (change.deleted === true && row.deletedAt === null) {
        data.deletedAt = now;
      }
      if (change.deleted === false) {
        data.deletedAt = null;
      }

      if (!Object.keys(data).length) continue;

      const key = JSON.stringify(data);
      const group = groups.get(key) ?? { data, ids: [] };
      group.ids.push(change.id);
      groups.set(key, group);

      const description = (change.description ?? row.description)
        ?.trim()
        .toLowerCase();
      if (change.categoryId && change.deleted !== true && description) {
        mappings.set(description, change.categoryId);
      }
    }

    const tagChanges = changes.filter((c) => c.tags !== undefined);

    await this.prisma.$transaction(
      async (tx) => {
        for (const { data, ids: groupIds } of groups.values()) {
          await tx.transaction.updateMany({
            where: { userId, id: { in: groupIds } },
            data,
          });
        }

        for (const [description, categoryId] of mappings) {
          await tx.categoryMapping.upsert({
            where: { userId_description: { userId, description } },
            create: { userId, description, categoryId },
            update: { categoryId },
          });
        }

        if (tagChanges.length) {
          await this.replaceTags(tx, userId, tagChanges);
        }
      },
      { timeout: 30_000 },
    );

    const updated = new Set([
      ...[...groups.values()].flatMap((g) => g.ids),
      ...tagChanges.map((c) => c.id),
    ]).size;
    this.logger.info('Transactions updated', { userId, updated });

    return { updated };
  }

  // Each change carries the row's full set of tags; links not in it are removed
  private async replaceTags(
    tx: Prisma.TransactionClient,
    userId: string,
    changes: UpdateTransactionsInput['changes'],
  ) {
    const resolve = await this.tagsService.resolveRefs(
      tx,
      userId,
      changes.flatMap((c) => c.tags ?? []),
      'transactions.invalid_tag',
    );

    for (const change of changes) {
      const tagIds = [...new Set((change.tags ?? []).map(resolve))];

      await tx.transactionTag.deleteMany({
        where: { transactionId: change.id, tagId: { notIn: tagIds } },
      });
      if (tagIds.length) {
        await tx.transactionTag.createMany({
          data: tagIds.map((tagId) => ({ transactionId: change.id, tagId })),
          skipDuplicates: true,
        });
      }
    }
  }

  private buildWhere(
    userId: string,
    query: ListTransactionsQuery,
  ): Prisma.TransactionWhereInput {
    const where: Prisma.TransactionWhereInput = { userId };

    if (query.from || query.to) {
      where.date = {
        ...(query.from && { gte: new Date(`${query.from}T00:00:00.000Z`) }),
        ...(query.to && { lte: new Date(`${query.to}T23:59:59.999Z`) }),
      };
    }
    if (query.accountIds?.length) {
      where.accountId = { in: query.accountIds };
    }

    const categoryIds = query.categoryIds ?? [];
    if (categoryIds.length || query.includeUncategorised) {
      where.OR = [
        ...(categoryIds.length ? [{ categoryId: { in: categoryIds } }] : []),
        ...(query.includeUncategorised ? [{ categoryId: null }] : []),
      ];
    }

    if (query.type) {
      where.type = query.type;
    }
    if (query.search) {
      where.description = { contains: query.search, mode: 'insensitive' };
    }

    // any of the picked tags; kept under AND so it doesn't clash with the category OR
    const tagIds = query.tagIds ?? [];
    if (tagIds.length || query.includeUntagged) {
      where.AND = [
        {
          OR: [
            ...(tagIds.length
              ? [{ tags: { some: { tagId: { in: tagIds } } } }]
              : []),
            ...(query.includeUntagged ? [{ tags: { none: {} } }] : []),
          ],
        },
      ];
    }

    return where;
  }

  private async getTotals(where: Prisma.TransactionWhereInput) {
    const grouped = await this.prisma.transaction.groupBy({
      by: ['type'],
      where,
      _sum: { amount: true },
      _count: { _all: true },
    });

    const sums = emptyTypeTotals();
    let count = 0;
    for (const g of grouped) {
      sums[g.type] += Number(g._sum.amount ?? 0);
      count += g._count._all;
    }

    // Unlike the charts, refunds beyond spend are not clamped here
    const spent = round2(sums.EXPENSE - sums.REFUND);
    const income = round2(sums.INCOME);

    return { count, spent, income, net: round2(income - spent) };
  }

  private async findPage(
    where: Prisma.TransactionWhereInput,
    { page, pageSize, sortField, sortOrder }: ListTransactionsQuery,
  ): Promise<ListRow[]> {
    const skip = page * pageSize;

    if (sortField === 'date') {
      return this.prisma.transaction.findMany({
        where,
        select: listSelect,
        orderBy: [{ date: sortOrder }, { id: 'asc' }],
        skip,
        take: pageSize,
      });
    }

    if (sortField === 'account') {
      return this.prisma.transaction.findMany({
        where,
        select: listSelect,
        orderBy: [{ account: { name: sortOrder } }, ...tieBreak],
        skip,
        take: pageSize,
      });
    }

    // Prisma can't place nulls when ordering by a relation field, so
    // categorised rows are paged first and uncategorised ones fill in after
    const categorisedWhere = { AND: [where, { categoryId: { not: null } }] };
    const categorisedCount = await this.prisma.transaction.count({
      where: categorisedWhere,
    });

    const categorised =
      skip < categorisedCount
        ? await this.prisma.transaction.findMany({
            where: categorisedWhere,
            select: listSelect,
            orderBy: [{ category: { name: sortOrder } }, ...tieBreak],
            skip,
            take: pageSize,
          })
        : [];

    const remaining = pageSize - categorised.length;
    if (remaining <= 0) return categorised;

    const uncategorised = await this.prisma.transaction.findMany({
      where: { AND: [where, { categoryId: null }] },
      select: listSelect,
      orderBy: tieBreak,
      skip: Math.max(0, skip - categorisedCount),
      take: remaining,
    });

    return [...categorised, ...uncategorised];
  }
}
