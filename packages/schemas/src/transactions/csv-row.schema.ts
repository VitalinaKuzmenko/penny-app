import { z } from 'zod';

export const CsvRowSchema = z.object({
  date: z.string(),
  description: z.string().trim().min(1),
  amount: z.number(),
});

export type CsvRow = z.infer<typeof CsvRowSchema>;
