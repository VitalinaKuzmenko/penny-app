import { z } from 'zod';

export const MonthlyCategoryResponseSchema = z.object({
  labels: z.array(z.string()), // months
  datasets: z.array(
    z.object({
      categoryId: z.string(),
      categoryName: z.string(),
      data: z.array(z.number()), // 12 values
    }),
  ),
});

export type MonthlyCategoryResponse = z.infer<
  typeof MonthlyCategoryResponseSchema
>;
