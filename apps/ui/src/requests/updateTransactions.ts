import { clientApiFetch } from '@/utils/clientApiFetch';
import type {
  UpdateTransactionsInput,
  UpdateTransactionsResponse,
} from 'schemas';

export const updateTransactions = (payload: UpdateTransactionsInput) =>
  clientApiFetch<UpdateTransactionsResponse, UpdateTransactionsInput>(
    '/transactions',
    {
      method: 'PATCH',
      body: payload,
    },
  );
