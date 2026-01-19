import { z } from 'zod';

export const GetIncomeExpenseResponseSchema = z.object({
  year: z.number().int(),
  income: z.number(),
  expense: z.number(),
  savings: z.number(),
});

export type GetIncomeExpenseResponse = z.infer<
  typeof GetIncomeExpenseResponseSchema
>;
