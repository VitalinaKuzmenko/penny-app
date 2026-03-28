// api/charts.ts
import { clientApiFetch } from '@/utils/clientApiFetch';
import { GetIncomeExpenseQuery, GetIncomeExpenseResponse } from 'schemas';

export const getIncomeExpense = async (
  params: GetIncomeExpenseQuery,
): Promise<GetIncomeExpenseResponse> => {
  const query = new URLSearchParams({
    year: String(params.year),
  });

  if (params.accountIds?.length) {
    query.set('accountIds', params.accountIds.join(','));
  }

  return clientApiFetch<GetIncomeExpenseResponse>(
    `/charts/income-expense?${query.toString()}`,
  );
};
