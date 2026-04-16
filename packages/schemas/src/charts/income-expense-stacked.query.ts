import { z } from 'zod';

const stringArray = z
  .union([z.string(), z.array(z.string())])
  .optional()
  .transform((v) => (!v ? undefined : Array.isArray(v) ? v : v.split(',')));

export const IncomeExpenseStackedQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  accountIds: stringArray,
});

export type IncomeExpenseStackedQuery = z.infer<
  typeof IncomeExpenseStackedQuerySchema
>;
