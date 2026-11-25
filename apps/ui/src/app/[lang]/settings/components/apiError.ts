import { ApiError } from '@/utils/clientApiFetch';
import { hasCode } from '@/utils/hasCode';

// The server's error code and meta (e.g. the clashing name), if the request failed with one
export const apiErrorDetails = (
  err: unknown,
): { code: string; meta?: { name?: string } } | null =>
  err instanceof ApiError && hasCode(err.data)
    ? (err.data as { code: string; meta?: { name?: string } })
    : null;
