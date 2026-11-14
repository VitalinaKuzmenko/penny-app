import { z } from 'zod';

// Match DB enum exactly
export const TransactionTypeSchema = z.enum(['INCOME', 'EXPENSE', 'REFUND']);
export const CurrencySchema = z.enum(['USD', 'EUR', 'UAH', 'GBP', 'PLN']);
