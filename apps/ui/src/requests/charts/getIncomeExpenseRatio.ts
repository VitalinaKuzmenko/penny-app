// api/charts/getIncomeExpenseStacked.ts
import { clientApiFetch } from '@/utils/clientApiFetch';
import { IncomeExpenseRatioQuery, IncomeExpenseRatioResponse } from 'schemas';

export const getIncomeExpenseRatio = async (
  params: IncomeExpenseRatioQuery,
): Promise<IncomeExpenseRatioResponse> => {
  const query = new URLSearchParams();

  if (params.startDate) query.set('startDate', params.startDate);
  if (params.endDate) query.set('endDate', params.endDate);

  return clientApiFetch<IncomeExpenseRatioResponse>(
    `/charts/income-expense-ratio?${query.toString()}`,
  );
};
