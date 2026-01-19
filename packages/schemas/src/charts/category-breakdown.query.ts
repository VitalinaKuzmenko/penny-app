import { z } from 'zod';

const stringArray = z
  .union([z.string(), z.array(z.string())])
  .optional()
  .transform((v) => (!v ? undefined : Array.isArray(v) ? v : v.split(',')));

export const CategoryBreakdownQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),

  accountIds: stringArray,

  type: z.enum(['INCOME', 'EXPENSE']).default('EXPENSE'),
});

export type CategoryBreakdownQuery = z.infer<
  typeof CategoryBreakdownQuerySchema
>;
