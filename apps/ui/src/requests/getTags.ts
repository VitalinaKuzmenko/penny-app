import { clientApiFetch } from '@/utils/clientApiFetch';
import { Tag } from 'schemas';

export const getTags = async (): Promise<Tag[]> =>
  clientApiFetch<Tag[]>('/tags');
