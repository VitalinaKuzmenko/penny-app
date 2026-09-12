'use server';

import { serverApiFetch } from '@/utils/serverApiFetch';
import { CsvImportResponse } from 'schemas';

export const getImportRows = async (
  importId: string,
  accountId?: string,
): Promise<CsvImportResponse[]> => {
  if (!importId) throw new Error('importId is required');

  const query = accountId
    ? `?accountId=${encodeURIComponent(accountId)}`
    : '';

  return await serverApiFetch<CsvImportResponse[]>(
    `/import/${importId}/rows${query}`,
  );
};
