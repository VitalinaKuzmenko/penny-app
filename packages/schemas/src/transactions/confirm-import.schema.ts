import { z } from 'zod';
import { CurrencySchema, TransactionTypeSchema } from '../types';

export const ConfirmImportRowSchema = z.object({
  id: z.string().uuid(),
  categoryId: z.string().uuid().optional(),
  type: TransactionTypeSchema,
});

export const ConfirmImportSchema = z.object({
  accountId: z.string().uuid(),
  currency: CurrencySchema,
  rows: z.array(ConfirmImportRowSchema).min(1),
});

export type ConfirmImportInput = z.infer<typeof ConfirmImportSchema>;
