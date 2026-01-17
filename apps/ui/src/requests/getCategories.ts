'use server';

import { serverApiFetch } from '@/utils/serverApiFetch';
import { Category } from 'schemas';

export const getCategories = async (): Promise<Category[]> => {
  return serverApiFetch<Category[]>('/categories');
};
