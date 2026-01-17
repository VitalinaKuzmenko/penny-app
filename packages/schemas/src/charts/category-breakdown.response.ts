import { z } from 'zod';

export const CategoryBreakdownResponseSchema = z.object({
  total: z.number(),

  categories: z.array(
    z.object({
      categoryId: z.string(),
      categoryName: z.string(),
      amount: z.number(),
      percentage: z.number(),
    }),
  ),
});

export type CategoryBreakdownResponse = z.infer<
  typeof CategoryBreakdownResponseSchema
>;
