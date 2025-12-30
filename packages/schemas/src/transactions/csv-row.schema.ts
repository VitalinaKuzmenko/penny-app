// src/import/schemas/csv-row.schema.ts
import { z } from 'zod';

export const CsvRowSchema = z.object({
  date: z.date(),
  description: z.string().trim().min(1),
  amount: z.number(),
});

export type CsvRow = z.infer<typeof CsvRowSchema>;
