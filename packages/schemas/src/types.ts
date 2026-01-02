import { z } from 'zod';

// Match DB enum exactly
export const TransactionTypeSchema = z.enum(['INCOME', 'EXPENSE']);
export const CurrencySchema = z.enum(['USD', 'EUR', 'UAH', 'GBP', 'PLN']);
