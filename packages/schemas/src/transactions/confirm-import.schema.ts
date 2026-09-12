import { z } from 'zod';
import { CurrencySchema } from '../types';

export const ConfirmImportRowSchema = z.object({
  id: z.string().uuid(),
  categoryId: z.string().uuid().optional(),
  description: z.string().trim().min(1),
  // user explicitly chose to import this row even though it was flagged as a duplicate
  forceImport: z.boolean().optional(),
});

export const ConfirmImportSchema = z.object({
  accountId: z.string().uuid(),
  currency: CurrencySchema,
  rows: z.array(ConfirmImportRowSchema).min(1),
});

export type ConfirmImportInput = z.infer<typeof ConfirmImportSchema>;
