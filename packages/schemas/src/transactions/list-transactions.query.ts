import { z } from 'zod';

import { TransactionTypeSchema } from '../types';

const stringArray = z
  .union([z.string(), z.array(z.string())])
  .optional()
  .transform((v) =>
    !v ? undefined : (Array.isArray(v) ? v : v.split(',')).filter(Boolean),
  );

const booleanString = z
  .enum(['true', 'false'])
  .optional()
  .transform((v) => v === 'true');

// YYYY-MM-DD, interpreted as whole UTC days (same as the charts)
const isoDay = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const TRANSACTIONS_PAGE_SIZES = [25, 50, 100] as const;

export const TransactionSortFieldSchema = z.enum([
  'date',
  'category',
  'account',
]);

export const ListTransactionsQuerySchema = z.object({
  from: isoDay.optional(),
  to: isoDay.optional(),
  accountIds: stringArray,
  // categoryIds and includeUncategorised together form the category filter;
  // when neither is given, rows are not filtered by category
  categoryIds: stringArray,
  includeUncategorised: booleanString,
  type: TransactionTypeSchema.optional(),
  search: z.string().trim().max(200).optional(),
  // deleted rows are listed (greyed out) but never counted in the totals
  includeDeleted: booleanString,
  page: z.coerce.number().int().min(0).default(0),
  pageSize: z.coerce
    .number()
    .int()
    .refine((n) => (TRANSACTIONS_PAGE_SIZES as readonly number[]).includes(n))
    .default(25),
  sortField: TransactionSortFieldSchema.default('date'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type TransactionSortField = z.infer<typeof TransactionSortFieldSchema>;
export type ListTransactionsQuery = z.infer<typeof ListTransactionsQuerySchema>;
// what the UI sends: everything optional, arrays not yet joined
export type ListTransactionsParams = {
  from?: string;
  to?: string;
  accountIds?: string[];
  categoryIds?: string[];
  includeUncategorised?: boolean;
  type?: z.infer<typeof TransactionTypeSchema>;
  search?: string;
  includeDeleted?: boolean;
  page?: number;
  pageSize?: number;
  sortField?: TransactionSortField;
  sortOrder?: 'asc' | 'desc';
};
