import { z } from 'zod';
import { CurrencySchema, TransactionTypeSchema } from '../types';
import { de } from 'zod/v4/locales';

export const ConfirmImportRowSchema = z.object({
  id: z.string().uuid(),
  categoryId: z.string().uuid().optional(),
  description: z.string().trim().min(1),
});

export const ConfirmImportSchema = z.object({
  accountId: z.string().uuid(),
  currency: CurrencySchema,
  rows: z.array(ConfirmImportRowSchema).min(1),
});

export type ConfirmImportInput = z.infer<typeof ConfirmImportSchema>;
