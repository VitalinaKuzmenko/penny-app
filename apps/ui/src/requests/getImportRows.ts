'use server';

import { serverApiFetch } from '@/utils/serverApiFetch';
import { CsvImportResponse } from 'schemas';

export const getImportRows = async (
  importId: string,
): Promise<CsvImportResponse[]> => {
  if (!importId) throw new Error('importId is required');

  return await serverApiFetch<CsvImportResponse[]>(`/import/${importId}/rows`);
};
