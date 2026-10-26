'use server';

import { serverApiFetch } from '@/utils/serverApiFetch';
import { AccountWithActivity } from 'schemas';

export const getAccounts = async (): Promise<AccountWithActivity[]> => {
  return serverApiFetch<AccountWithActivity[]>('/accounts');
};
