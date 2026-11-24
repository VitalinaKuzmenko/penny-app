import { BadRequestException, Injectable } from '@nestjs/common';
import { Tag, TagRef } from 'schemas';

import { Prisma } from '../prisma/generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

// New tags get the next colour in turn; editing colours comes with the Manage page
export const TAG_PALETTE = [
  '#1E88E5',
  '#43A047',
  '#FB8C00',
  '#8E24AA',
  '#E53935',
  '#00897B',
  '#6D4C41',
  '#D81B60',
  '#3949AB',
  '#7CB342',
] as const;

export const byTagName = (a: { name: string }, b: { name: string }) =>
  a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });

const nameKey = (name: string) => name.trim().toLowerCase();

@Injectable()
export class TagsService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserTags(userId: string): Promise<Tag[]> {
    const tags = await this.prisma.tag.findMany({
      where: { userId },
      select: { id: true, name: true, color: true },
    });
    return tags.sort(byTagName);
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
}
