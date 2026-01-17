import { z } from 'zod';

export const GetIncomeExpenseQuerySchema = z.object({
  year: z.coerce.number().int().min(2000),

  accountIds: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((value) => {
      if (!value) return undefined;
      if (Array.isArray(value)) return value;
      return value.split(',');
    }),
});

export type GetIncomeExpenseQuery = z.infer<typeof GetIncomeExpenseQuerySchema>;
