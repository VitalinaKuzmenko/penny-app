import { clientApiFetch } from '@/utils/clientApiFetch';
import type { Category } from 'schemas';

// Loaded on the client so the Settings list can be reloaded after each change
export const listCategories = () => clientApiFetch<Category[]>('/categories');
