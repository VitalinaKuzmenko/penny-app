import { clientApiFetch } from '@/utils/clientApiFetch';
import { ListTransactionsParams, ListTransactionsResponse } from 'schemas';

export const getTransactions = async (
  params: ListTransactionsParams,
): Promise<ListTransactionsResponse> => {
  const query = new URLSearchParams();

  if (params.from) query.set('from', params.from);
  if (params.to) query.set('to', params.to);
  if (params.accountIds?.length) {
    query.set('accountIds', params.accountIds.join(','));
  }
  if (params.categoryIds?.length) {
    query.set('categoryIds', params.categoryIds.join(','));
  }
  if (params.includeUncategorised) query.set('includeUncategorised', 'true');
  if (params.type) query.set('type', params.type);
  if (params.search) query.set('search', params.search);
  if (params.includeDeleted) query.set('includeDeleted', 'true');
  if (params.page !== undefined) query.set('page', String(params.page));
  if (params.pageSize) query.set('pageSize', String(params.pageSize));
  if (params.sortField) query.set('sortField', params.sortField);
  if (params.sortOrder) query.set('sortOrder', params.sortOrder);

  return clientApiFetch<ListTransactionsResponse>(
    `/transactions?${query.toString()}`,
  );
};
