import { z } from 'zod';

export const TransactionChangeSchema = z
  .object({
    id: z.string().uuid(),
    description: z.string().trim().min(1).optional(),
    // null clears the category
    categoryId: z.string().uuid().nullable().optional(),
    // true = soft delete, false = restore
    deleted: z.boolean().optional(),
  })
  .refine(
    (c) =>
      c.description !== undefined ||
      c.categoryId !== undefined ||
      c.deleted !== undefined,
    { message: 'Nothing to change' },
  );

// Saved all-or-nothing
export const UpdateTransactionsSchema = z.object({
  changes: z
    .array(TransactionChangeSchema)
    .min(1)
    .refine(
      (changes) => new Set(changes.map((c) => c.id)).size === changes.length,
      {
        message: 'Each transaction may appear only once',
      },
    ),
});

export const UpdateTransactionsResponseSchema = z.object({
  updated: z.number().int(),
});

export type TransactionChange = z.infer<typeof TransactionChangeSchema>;
export type UpdateTransactionsInput = z.infer<typeof UpdateTransactionsSchema>;
export type UpdateTransactionsResponse = z.infer<
  typeof UpdateTransactionsResponseSchema
>;
