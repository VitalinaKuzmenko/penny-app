import { z } from 'zod';

import { TAG_PALETTE } from '../settings/palettes';

export const TAG_NAME_MAX_LENGTH = 100;

export const TagNameSchema = z.string().trim().min(1).max(TAG_NAME_MAX_LENGTH);

export const TagSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  color: z.string().nullable(),
});

// An existing tag, or a new one that is created when the change is saved.
// A name that matches an existing tag ignoring case reuses that tag.
export const TagRefSchema = z.union([
  z.object({ id: z.string().uuid() }).strict(),
  z.object({ name: TagNameSchema }).strict(),
]);

// A row's full desired set of tags; the same tag may not appear twice
export const TagRefsSchema = z.array(TagRefSchema).refine(
  (refs) => {
    const keys = refs.map((r) =>
      'id' in r ? `id:${r.id}` : `name:${r.name.toLowerCase()}`,
    );
    return new Set(keys).size === keys.length;
  },
  { message: 'Each tag may appear only once' },
);

// GET /tags: each tag with the number of transactions using it (soft-deleted included)
export const TagWithCountSchema = TagSchema.extend({
  transactionCount: z.number().int(),
});

export const CreateTagSchema = z.object({
  name: TagNameSchema,
  color: z.enum(TAG_PALETTE),
});

export const UpdateTagSchema = CreateTagSchema.partial().refine(
  (body) => Object.keys(body).length > 0,
  { message: 'Nothing to update' },
);

export type Tag = z.infer<typeof TagSchema>;
export type TagWithCount = z.infer<typeof TagWithCountSchema>;
export type CreateTagInput = z.infer<typeof CreateTagSchema>;
export type UpdateTagInput = z.infer<typeof UpdateTagSchema>;
export type TagRef = z.infer<typeof TagRefSchema>;
