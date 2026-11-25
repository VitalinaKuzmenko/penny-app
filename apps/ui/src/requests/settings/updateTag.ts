import { clientApiFetch } from '@/utils/clientApiFetch';
import type { TagWithCount, UpdateTagInput } from 'schemas';

export const updateTag = (id: string, body: UpdateTagInput) =>
  clientApiFetch<TagWithCount, UpdateTagInput>(`/tags/${id}`, {
    method: 'PATCH',
    body,
  });
