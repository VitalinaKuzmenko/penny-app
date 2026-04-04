// api/charts/getIncomeExpenseStacked.ts
import { clientApiFetch } from '@/utils/clientApiFetch';
import { IncomeExpenseRatioQuery, IncomeExpenseRatioResponse } from 'schemas';

export const getIncomeExpenseRatio = async (
  params: IncomeExpenseRatioQuery,
): Promise<IncomeExpenseRatioResponse> => {
  const query = new URLSearchParams();

  if (params.from) query.set('from', params.from);
  if (params.to) query.set('to', params.to);

  return clientApiFetch<IncomeExpenseRatioResponse>(
    `/charts/income-expense-ratio?${query.toString()}`,
  );
};
