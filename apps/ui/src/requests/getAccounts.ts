'use server';

import { serverApiFetch } from '@/utils/serverApiFetch';
import { Account } from 'schemas';

export const getAccounts = async (): Promise<Account[]> => {
  return serverApiFetch<Account[]>('/accounts');
};
