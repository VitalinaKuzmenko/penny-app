'use server';

import { serverApiFetch } from '@/utils/serverApiFetch';
import { GetCurrenciesResponse } from 'schemas';

export const getCurrencies = async (): Promise<GetCurrenciesResponse> => {
  return serverApiFetch<GetCurrenciesResponse>('/currencies');
};
