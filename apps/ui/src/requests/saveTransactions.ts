import { clientApiFetch } from '@/utils/clientApiFetch';
import type { ConfirmImportInput } from 'schemas';

export const saveTransactions = (
  importId: string,
  payload: ConfirmImportInput,
) => {
  return clientApiFetch<{ success: true }, ConfirmImportInput>(
    `/import/${importId}/confirm`,
    {
      method: 'POST',
      body: payload,
    },
  );
};
