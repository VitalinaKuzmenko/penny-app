import { z } from 'zod';

export const IncomeExpenseStackedResponseSchema = z.array(
  z.object({
    month: z.string(), // "2026-01" format
    income: z.number(), // total income for this month
    expense: z.number(), // total expense for this month
  }),
);

export type IncomeExpenseStackedResponse = z.infer<
  typeof IncomeExpenseStackedResponseSchema
>;
