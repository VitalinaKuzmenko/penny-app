import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Account, AccountWithActivity } from 'schemas';

import { Prisma } from '../prisma/generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { findNameClash } from '../utils/find-name-clash';
import { isUniqueConstraintError } from '../utils/isPrismaUniqueError';
import { notDeleted } from '../utils/not-deleted';

@Injectable()
export class AccountsService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserAccounts(userId: string): Promise<AccountWithActivity[]> {
    const [accounts, activity] = await Promise.all([
      this.prisma.account.findMany({
        where: { userId },
        select: {
          id: true,
          name: true,
          // soft-deleted included: they still block deleting the account
          _count: { select: { transactions: true } },
        },
        orderBy: {
          createdAt: 'asc',
        },
      }),
      this.prisma.transaction.groupBy({
        by: ['accountId'],
        where: { userId, ...notDeleted },
        _min: { date: true },
        _max: { date: true },
      }),
    ]);

    const activityByAccount = new Map(
      activity.map((row) => [row.accountId, row]),
    );

    return accounts.map(({ _count, ...account }) => ({
      ...account,
      lastTransactionDate:
        activityByAccount.get(account.id)?._max.date?.toISOString() ?? null,
      firstTransactionDate:
        activityByAccount.get(account.id)?._min.date?.toISOString() ?? null,
      transactionCount: _count.transactions,
    }));
  }

  async createAccount(userId: string, name: string): Promise<Account> {
    return this.withNameClashAsError(() =>
      this.prisma.$transaction(async (tx) => {
        await this.assertNameFree(tx, userId, name);
        return tx.account.create({
          data: { userId, name },
          select: { id: true, name: true },
        });
      }),
    );
  }

  async renameAccount(
    userId: string,
    id: string,
    name: string,
  ): Promise<Account> {
    return this.withNameClashAsError(() =>
      this.prisma.$transaction(async (tx) => {
        await this.findOwned(tx, userId, id);
        await this.assertNameFree(tx, userId, name, id);
        return tx.account.update({
          where: { id },
          data: { name },
          select: { id: true, name: true },
        });
      }),
    );
  }

  /**
   * Only an account without any transaction can be deleted. Soft-deleted rows
   * count too: they're kept so re-imports into the account skip them.
   */
  async deleteAccount(userId: string, id: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await this.findOwned(tx, userId, id);
      const transactionCount = await tx.transaction.count({
        where: { accountId: id },
      });
      if (transactionCount > 0) {
        throw new BadRequestException({
          code: 'account.has_transactions',
          meta: { transactionCount },
        });
      }
      await tx.account.delete({ where: { id } });
    });
  }

  private async findOwned(
    tx: Prisma.TransactionClient,
    userId: string,
    id: string,
  ) {
    const account = await tx.account.findFirst({
      where: { id, userId },
      select: { id: true },
    });
    if (!account) {
      throw new NotFoundException({ code: 'account.not_found' });
    }
  }

  // Names are unique ignoring case; the DB index only blocks exact duplicates
  private async assertNameFree(
    tx: Prisma.TransactionClient,
    userId: string,
    name: string,
    exceptId?: string,
  ) {
    const rows = await tx.account.findMany({
      where: { userId },
      select: { id: true, name: true },
    });
    const clash = findNameClash(rows, name, exceptId);
    if (clash) {
      throw new BadRequestException({
        code: 'account.already_exists',
        meta: { name: clash.name },
      });
    }
  }

  // Two requests racing past the check still hit the unique index
  private async withNameClashAsError<T>(run: () => Promise<T>): Promise<T> {
    try {
      return await run();
    } catch (err) {
      if (isUniqueConstraintError(err)) {
        throw new BadRequestException({ code: 'account.already_exists' });
      }
      throw err;
    }
  }
}
