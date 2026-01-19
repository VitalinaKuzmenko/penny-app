import z from 'zod';

export const IncomeExpenseRatioResponseSchema = z.object({
  income: z.number(),
  expense: z.number(),
  ratio: z.number(), // percentage (0–∞)
});

export type IncomeExpenseRatioResponse = z.infer<
  typeof IncomeExpenseRatioResponseSchema
>;
