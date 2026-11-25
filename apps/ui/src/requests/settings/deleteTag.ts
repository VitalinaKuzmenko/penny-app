import { clientApiFetch } from '@/utils/clientApiFetch';

// The transactions stay; only the tag is removed from them
export const deleteTag = (id: string) =>
  clientApiFetch<null>(`/tags/${id}`, { method: 'DELETE' });
