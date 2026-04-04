import { MonthlyCategoryQuery, MonthlyCategoryResponse } from 'schemas';
import { clientApiFetch } from '@/utils/clientApiFetch';

export const getMonthlyCategory = async (
  params: MonthlyCategoryQuery,
): Promise<MonthlyCategoryResponse> => {
  console.log('params', params);

  const query = new URLSearchParams({
    year: String(params.year),
  });

  if (params.accountIds?.length) {
    query.set('accountIds', params.accountIds.join(','));
  }

  if (params.categoryIds?.length) {
    query.set('categoryIds', params.categoryIds.join(','));
  }

  console.log('query', query);
  return clientApiFetch<MonthlyCategoryResponse>(
    `/charts/monthly-category?${query.toString()}`,
  );
};
