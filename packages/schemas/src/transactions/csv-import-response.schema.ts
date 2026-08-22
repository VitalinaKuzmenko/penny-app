import { z } from 'zod';

export const CsvImportResponseSchema = z.object({
  id: z.string().uuid(),
  date: z.string(),
  description: z.string().trim().min(1),
  amount: z.number(),
  suggestedCategoryId: z.string().uuid().nullable(),
  autoAssigned: z.boolean(),
});

export type CsvImportResponse = z.infer<typeof CsvImportResponseSchema>;
