// api/charts/getIncomeExpenseStacked.ts
import { clientApiFetch } from '@/utils/clientApiFetch';
import {
  IncomeExpenseStackedQuery,
  IncomeExpenseStackedResponse,
} from 'schemas';

export const getIncomeExpenseStacked = async (
  params: IncomeExpenseStackedQuery,
): Promise<IncomeExpenseStackedResponse> => {
  const query = new URLSearchParams();

  if (params.startDate) query.set('startDate', params.startDate);
  if (params.endDate) query.set('endDate', params.endDate);

  if (params.accountIds?.length) {
    query.set('accountIds', params.accountIds.join(','));
  }

  if (params.categoryIds?.length) {
    query.set('categoryIds', params.categoryIds.join(','));
  }

  return clientApiFetch<IncomeExpenseStackedResponse>(
    `/charts/income-expense-stacked?${query.toString()}`,
  );
};
