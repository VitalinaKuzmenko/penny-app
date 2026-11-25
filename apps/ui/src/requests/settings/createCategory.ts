import { clientApiFetch } from '@/utils/clientApiFetch';
import type { Category, CreateCategoryInput } from 'schemas';

export const createCategory = (body: CreateCategoryInput) =>
  clientApiFetch<Category, CreateCategoryInput>('/categories', {
    method: 'POST',
    body,
  });
