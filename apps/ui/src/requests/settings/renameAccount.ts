import { clientApiFetch } from '@/utils/clientApiFetch';
import type { Account, UpdateAccountInput } from 'schemas';

export const renameAccount = (id: string, body: UpdateAccountInput) =>
  clientApiFetch<Account, UpdateAccountInput>(`/accounts/${id}`, {
    method: 'PATCH',
    body,
  });
