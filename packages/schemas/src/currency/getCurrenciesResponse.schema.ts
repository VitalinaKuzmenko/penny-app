import z from 'zod';
import { CurrencySchema } from '../types';

export const GetCurrenciesResponseSchema = z.object({
  currencies: z.array(
    z.object({
      code: CurrencySchema,
    }),
  ),
});

export type GetCurrenciesResponse = z.infer<typeof GetCurrenciesResponseSchema>;
