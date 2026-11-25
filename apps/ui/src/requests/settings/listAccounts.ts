import { clientApiFetch } from '@/utils/clientApiFetch';
import type { AccountWithActivity } from 'schemas';

export const listAccounts = () =>
  clientApiFetch<AccountWithActivity[]>('/accounts');
