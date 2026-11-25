import { clientApiFetch } from '@/utils/clientApiFetch';
import type { TagWithCount } from 'schemas';

export const listTagsWithCounts = () => clientApiFetch<TagWithCount[]>('/tags');
