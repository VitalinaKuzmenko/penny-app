import z from 'zod';

export const IncomeExpenseRatioQuerySchema = z.object({
  from: z.string().date(),
  to: z.string().date(),
});
