import { z } from 'zod';

import { CurrencySchema, TransactionTypeSchema } from '../types';

export const TransactionListItemSchema = z.object({
  id: z.string().uuid(),
  date: z.string(), // ISO
  description: z.string().nullable(),
  // always positive; the sign comes from `type` (EXPENSE = money out)
  amount: z.number(),
  type: TransactionTypeSchema,
  currency: CurrencySchema,
  category: z.object({ id: z.string().uuid(), name: z.string() }).nullable(),
  account: z.object({ id: z.string().uuid(), name: z.string() }),
  deleted: z.boolean(),
});

// For the whole filtered set (not just the page), deleted rows excluded.
// spent = EXPENSE − REFUND (can be negative), income = INCOME, net = income − spent
export const TransactionTotalsSchema = z.object({
  count: z.number().int(),
  spent: z.number(),
  income: z.number(),
  net: z.number(),
});

export const ListTransactionsResponseSchema = z.object({
  rows: z.array(TransactionListItemSchema),
  // rows matching the filter, including deleted ones when they are shown; drives pagination
  rowCount: z.number().int(),
  totals: TransactionTotalsSchema,
});

export type TransactionListItem = z.infer<typeof TransactionListItemSchema>;
export type TransactionTotals = z.infer<typeof TransactionTotalsSchema>;
export type ListTransactionsResponse = z.infer<
  typeof ListTransactionsResponseSchema
>;
