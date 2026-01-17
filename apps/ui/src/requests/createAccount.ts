import { clientApiFetch } from '@/utils/clientApiFetch';
import { Account, CreateAccountInput } from 'schemas';

export const createAccount = (payload: CreateAccountInput) => {
  return clientApiFetch<Account, CreateAccountInput>('/accounts', {
    method: 'POST',
    body: payload,
  });
};
