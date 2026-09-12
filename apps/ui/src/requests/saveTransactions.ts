import { clientApiFetch } from '@/utils/clientApiFetch';
import type { ConfirmImportInput, ConfirmImportResponse } from 'schemas';

export const saveTransactions = (
  importId: string,
  payload: ConfirmImportInput,
) => {
  return clientApiFetch<ConfirmImportResponse, ConfirmImportInput>(
    `/import/${importId}/confirm`,
    {
      method: 'POST',
      body: payload,
    },
  );
};
