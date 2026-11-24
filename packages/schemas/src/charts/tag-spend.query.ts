import { z } from 'zod';

export const TagSpendQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

// Spend per tag = max(0, expenses − refunds). A transaction with several tags
// counts in full under each of them, so the bars don't add up to a total.
export const TagSpendResponseSchema = z.array(
  z.object({
    tagId: z.string().uuid(),
    name: z.string(),
    color: z.string().nullable(),
    spent: z.number(),
    // transactions (expenses and refunds) behind the amount
    count: z.number().int(),
  }),
);

export type TagSpendQuery = z.infer<typeof TagSpendQuerySchema>;
export type TagSpendResponse = z.infer<typeof TagSpendResponseSchema>;
