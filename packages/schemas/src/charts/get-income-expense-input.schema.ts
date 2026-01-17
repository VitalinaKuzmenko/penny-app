import { z } from 'zod';

export const GetIncomeExpenseInputSchema = z.object({
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

export type GetIncomeExpenseInput = z.infer<typeof GetIncomeExpenseInputSchema>;
