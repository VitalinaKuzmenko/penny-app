import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Category, CreateCategoryInput, UpdateCategoryInput } from 'schemas';

import { Prisma } from '../prisma/generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { findNameClash } from '../utils/find-name-clash';
import { isUniqueConstraintError } from '../utils/isPrismaUniqueError';

const categorySelect = {
  id: true,
  name: true,
  icon: true,
  color: true,
  isDefault: true,
  isTransfer: true,
} as const;

// By name ignoring case, the transfer category last
export const byCategoryOrder = (
  a: { name: string; isTransfer: boolean },
  b: { name: string; isTransfer: boolean },
) =>
  Number(a.isTransfer) - Number(b.isTransfer) ||
  a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserCategories(userId: string): Promise<Category[]> {
    const [categories, counts] = await Promise.all([
      this.prisma.category.findMany({
        where: { userId },
        select: categorySelect,
      }),
      // soft-deleted rows included: they still reference the category
      this.prisma.transaction.groupBy({
        by: ['categoryId'],
        where: { userId, categoryId: { not: null } },
        _count: { _all: true },
      }),
    ]);

    const countByCategory = new Map(
      counts.map((row) => [row.categoryId, row._count._all]),
    );

    return categories
      .map((category) => ({
        ...category,
        transactionCount: countByCategory.get(category.id) ?? 0,
      }))
      .sort(byCategoryOrder);
  }

  async createCategory(
    userId: string,
    input: CreateCategoryInput,
  ): Promise<Category> {
    return this.withNameClashAsError(input.name, () =>
      this.prisma.$transaction(async (tx) => {
        await this.assertNameFree(tx, userId, input.name);
        const category = await tx.category.create({
          data: { userId, ...input },
          select: categorySelect,
        });
        return { ...category, transactionCount: 0 };
      }),
    );
  }

  async updateCategory(
    userId: string,
    id: string,
    input: UpdateCategoryInput,
  ): Promise<Category> {
    return this.withNameClashAsError(input.name, () =>
      this.prisma.$transaction(async (tx) => {
        await this.findOwned(tx, userId, id);
        if (input.name !== undefined) {
          await this.assertNameFree(tx, userId, input.name, id);
        }
        const category = await tx.category.update({
          where: { id },
          data: input,
          select: categorySelect,
        });
        const transactionCount = await tx.transaction.count({
          where: { categoryId: id },
        });
        return { ...category, transactionCount };
      }),
    );
  }

  /**
   * Deletes a category. If any transaction uses it (soft-deleted included),
   * they and the category's import suggestions move to the replacement first.
   */
  async deleteCategory(
    userId: string,
    id: string,
    replacementCategoryId?: string,
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const category = await this.findOwned(tx, userId, id);
      if (category.isTransfer) {
        throw new BadRequestException({
          code: 'category.cannot_delete_transfer',
        });
      }

      const transactionCount = await tx.transaction.count({
        where: { categoryId: id },
      });

      if (transactionCount > 0) {
        if (!replacementCategoryId) {
          throw new BadRequestException({
            code: 'category.replacement_required',
            meta: { transactionCount },
          });
        }
        const replacement = await tx.category.findFirst({
          where: { id: replacementCategoryId, userId },
          select: { id: true, isTransfer: true },
        });
        // a transfer replacement would turn refunds into income and hide spend from the charts
        if (!replacement || replacement.id === id || replacement.isTransfer) {
          throw new BadRequestException({
            code: 'category.invalid_replacement',
          });
        }

        await tx.transaction.updateMany({
          where: { categoryId: id },
          data: { categoryId: replacement.id },
        });
        await tx.categoryMapping.updateMany({
          where: { categoryId: id },
          data: { categoryId: replacement.id },
        });
      } else {
        await tx.categoryMapping.deleteMany({ where: { categoryId: id } });
      }

      await tx.category.delete({ where: { id } });
    });
  }

  private async findOwned(
    tx: Prisma.TransactionClient,
    userId: string,
    id: string,
  ) {
    const category = await tx.category.findFirst({
      where: { id, userId },
      select: { id: true, isTransfer: true },
    });
    if (!category) {
      throw new NotFoundException({ code: 'category.not_found' });
    }
    return category;
  }

  // Names are unique ignoring case; the DB index only blocks exact duplicates
  private async assertNameFree(
    tx: Prisma.TransactionClient,
    userId: string,
    name: string,
    exceptId?: string,
  ) {
    const rows = await tx.category.findMany({
      where: { userId },
      select: { id: true, name: true },
    });
    const clash = findNameClash(rows, name, exceptId);
    if (clash) {
      throw new BadRequestException({
        code: 'category.already_exists',
        meta: { name: clash.name },
      });
    }
  }

  // Two requests racing past the check still hit the unique index
  private async withNameClashAsError<T>(
    name: string | undefined,
    run: () => Promise<T>,
  ): Promise<T> {
    try {
      return await run();
    } catch (err) {
      if (isUniqueConstraintError(err)) {
        throw new BadRequestException({
          code: 'category.already_exists',
          meta: { name },
        });
      }
      throw err;
    }
  }
}
