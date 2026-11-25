import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateTagInput,
  TAG_PALETTE,
  TagRef,
  TagWithCount,
  UpdateTagInput,
} from 'schemas';

import { Prisma } from '../prisma/generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { findNameClash } from '../utils/find-name-clash';
import { isUniqueConstraintError } from '../utils/isPrismaUniqueError';

export const byTagName = (a: { name: string }, b: { name: string }) =>
  a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });

const nameKey = (name: string) => name.trim().toLowerCase();

const tagSelect = {
  id: true,
  name: true,
  color: true,
  // soft-deleted transactions included, like the category and account counts
  _count: { select: { transactions: true } },
} as const;

const withCount = ({
  _count,
  ...tag
}: {
  id: string;
  name: string;
  color: string | null;
  _count: { transactions: number };
}): TagWithCount => ({ ...tag, transactionCount: _count.transactions });

@Injectable()
export class TagsService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserTags(userId: string): Promise<TagWithCount[]> {
    const tags = await this.prisma.tag.findMany({
      where: { userId },
      select: tagSelect,
    });
    return tags.map(withCount).sort(byTagName);
  }

  async createTag(
    userId: string,
    input: CreateTagInput,
  ): Promise<TagWithCount> {
    return this.withNameClashAsError(input.name, () =>
      this.prisma.$transaction(async (tx) => {
        await this.assertNameFree(tx, userId, input.name);
        const tag = await tx.tag.create({
          data: { userId, ...input },
          select: tagSelect,
        });
        return withCount(tag);
      }),
    );
  }

  async updateTag(
    userId: string,
    id: string,
    input: UpdateTagInput,
  ): Promise<TagWithCount> {
    return this.withNameClashAsError(input.name, () =>
      this.prisma.$transaction(async (tx) => {
        await this.findOwned(tx, userId, id);
        if (input.name !== undefined) {
          await this.assertNameFree(tx, userId, input.name, id);
        }
        const tag = await tx.tag.update({
          where: { id },
          data: input,
          select: tagSelect,
        });
        return withCount(tag);
      }),
    );
  }

  // The transactions stay; only their links to the tag are removed (cascade)
  async deleteTag(userId: string, id: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await this.findOwned(tx, userId, id);
      await tx.tag.delete({ where: { id } });
    });
  }

  /**
   * Turns tag refs into tag IDs inside the caller's DB transaction: `{ id }`
   * must be one of the user's tags (otherwise 400 with `errorCode`), `{ name }`
   * reuses the tag with that name ignoring case or creates it. Names are
   * deduplicated across all refs, so the first spelling wins.
   */
  async resolveRefs(
    tx: Prisma.TransactionClient,
    userId: string,
    refs: TagRef[],
    errorCode: string,
  ): Promise<(ref: TagRef) => string> {
    const existing = await tx.tag.findMany({
      where: { userId },
      select: { id: true, name: true },
    });
    const ownedIds = new Set(existing.map((t) => t.id));
    const idByName = new Map(existing.map((t) => [nameKey(t.name), t.id]));

    const unknownIds = [
      ...new Set(
        refs.flatMap((r) => ('id' in r && !ownedIds.has(r.id) ? [r.id] : [])),
      ),
    ];
    if (unknownIds.length) {
      throw new BadRequestException({
        code: errorCode,
        meta: { tagIds: unknownIds },
      });
    }

    const newNames = new Map<string, string>();
    for (const ref of refs) {
      if (!('name' in ref)) continue;
      const key = nameKey(ref.name);
      if (!idByName.has(key) && !newNames.has(key)) {
        newNames.set(key, ref.name.trim());
      }
    }

    if (newNames.size) {
      const created = await tx.tag.createManyAndReturn({
        data: [...newNames.values()].map((name, i) => ({
          userId,
          name,
          color: TAG_PALETTE[(existing.length + i) % TAG_PALETTE.length],
        })),
        select: { id: true, name: true },
      });
      created.forEach((t) => idByName.set(nameKey(t.name), t.id));
    }

    return (ref) => ('id' in ref ? ref.id : idByName.get(nameKey(ref.name))!);
  }

  private async findOwned(
    tx: Prisma.TransactionClient,
    userId: string,
    id: string,
  ) {
    const tag = await tx.tag.findFirst({
      where: { id, userId },
      select: { id: true },
    });
    if (!tag) {
      throw new NotFoundException({ code: 'tag.not_found' });
    }
  }

  private async assertNameFree(
    tx: Prisma.TransactionClient,
    userId: string,
    name: string,
    exceptId?: string,
  ) {
    const rows = await tx.tag.findMany({
      where: { userId },
      select: { id: true, name: true },
    });
    const clash = findNameClash(rows, name, exceptId);
    if (clash) {
      throw new BadRequestException({
        code: 'tag.already_exists',
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
          code: 'tag.already_exists',
          meta: { name },
        });
      }
      throw err;
    }
  }
}
