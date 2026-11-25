import { clientApiFetch } from '@/utils/clientApiFetch';

// Required when transactions use the category: they move to the replacement
export const deleteCategory = (id: string, replacementCategoryId?: string) => {
  const query = replacementCategoryId
    ? `?${new URLSearchParams({ replacementCategoryId })}`
    : '';
  return clientApiFetch<null>(`/categories/${id}${query}`, {
    method: 'DELETE',
  });
};
