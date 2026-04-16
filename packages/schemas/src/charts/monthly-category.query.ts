import { z } from 'zod';

const stringArray = z
  .union([z.string(), z.array(z.string())])
  .optional()
  .transform((v) => (!v ? undefined : Array.isArray(v) ? v : v.split(',')));

export const MonthlyCategoryQuerySchema = z.object({
  year: z.coerce.number().int().min(2000),
  accountIds: stringArray,
  categoryIds: stringArray,
});

export type MonthlyCategoryQuery = z.infer<typeof MonthlyCategoryQuerySchema>;
