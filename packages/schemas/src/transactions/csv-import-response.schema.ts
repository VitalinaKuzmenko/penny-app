import { z } from 'zod';

export const DuplicateMatchSchema = z.object({
  date: z.string(),
  description: z.string(),
  amount: z.number(),
});

export const CsvImportResponseSchema = z.object({
  id: z.string().uuid(),
  date: z.string(),
  description: z.string().trim().min(1),
  amount: z.number(),
  suggestedCategoryId: z.string().uuid().nullable(),
  autoAssigned: z.boolean(),
  // true when a transaction with the same fingerprint already exists on the chosen account
  duplicate: z.boolean().default(false),
  // the existing transaction this row matched, so the user can judge whether it's a real re-import
  duplicateOf: DuplicateMatchSchema.nullable().default(null),
});

export type DuplicateMatch = z.infer<typeof DuplicateMatchSchema>;
export type CsvImportResponse = z.infer<typeof CsvImportResponseSchema>;
