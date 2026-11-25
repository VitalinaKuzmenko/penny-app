import { clientApiFetch } from '@/utils/clientApiFetch';
import type { Category, UpdateCategoryInput } from 'schemas';

export const updateCategory = (id: string, body: UpdateCategoryInput) =>
  clientApiFetch<Category, UpdateCategoryInput>(`/categories/${id}`, {
    method: 'PATCH',
    body,
  });
