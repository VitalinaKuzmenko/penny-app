import z from 'zod';

export const IncomeExpenseRatioQuerySchema = z.object({
  from: z.string().datetime(),
  to: z.string().datetime(),
});

export type IncomeExpenseRatioQuery = z.infer<
  typeof IncomeExpenseRatioQuerySchema
>;
