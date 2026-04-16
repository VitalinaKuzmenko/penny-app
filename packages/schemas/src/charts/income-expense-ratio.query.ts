import z from 'zod';

export const IncomeExpenseRatioQuerySchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
});

export type IncomeExpenseRatioQuery = z.infer<
  typeof IncomeExpenseRatioQuerySchema
>;
