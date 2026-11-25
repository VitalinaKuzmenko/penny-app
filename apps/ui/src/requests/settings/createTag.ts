import { clientApiFetch } from '@/utils/clientApiFetch';
import type { CreateTagInput, TagWithCount } from 'schemas';

export const createTag = (body: CreateTagInput) =>
  clientApiFetch<TagWithCount, CreateTagInput>('/tags', {
    method: 'POST',
    body,
  });
