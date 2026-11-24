import { clientApiFetch } from '@/utils/clientApiFetch';
import { TagSpendQuery, TagSpendResponse } from 'schemas';

export const getTagSpend = async (
  params: TagSpendQuery,
): Promise<TagSpendResponse> => {
  const query = new URLSearchParams();

  if (params.startDate) query.set('startDate', params.startDate);
  if (params.endDate) query.set('endDate', params.endDate);

  return clientApiFetch<TagSpendResponse>(
    `/charts/tag-spend?${query.toString()}`,
  );
};
