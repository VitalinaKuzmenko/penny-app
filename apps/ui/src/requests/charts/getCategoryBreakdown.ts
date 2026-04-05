// api/charts/getCategoryBreakdown.ts
import { clientApiFetch } from '@/utils/clientApiFetch';
import { CategoryBreakdownQuery, CategoryBreakdownResponse } from 'schemas';

export const getCategoryBreakdown = async (
  params: CategoryBreakdownQuery,
): Promise<CategoryBreakdownResponse> => {
  const query = new URLSearchParams();

  if (params.startDate) query.set('startDate', params.startDate);
  if (params.endDate) query.set('endDate', params.endDate);
  if (params.accountIds?.length) {
    query.set('accountIds', params.accountIds.join(','));
  }
  if (params.type) query.set('type', params.type);

  return clientApiFetch<CategoryBreakdownResponse>(
    `/charts/category-breakdown?${query.toString()}`,
  );
};
