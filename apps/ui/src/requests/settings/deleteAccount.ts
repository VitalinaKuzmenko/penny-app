import { clientApiFetch } from '@/utils/clientApiFetch';

// Only works for an account without any transaction
export const deleteAccount = (id: string) =>
  clientApiFetch<null>(`/accounts/${id}`, { method: 'DELETE' });
