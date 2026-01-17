import { cookies } from 'next/headers';
import { ApiError } from './clientApiFetch';

export async function serverApiFetch<TResponse, TBody = unknown>(
  path: string,
  options?: {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    body?: TBody;
    headers?: HeadersInit;
  },
): Promise<TResponse> {
  const cookieStore = cookies();
  const accessToken = (await cookieStore).get('access_token')?.value;

  const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}${path}`, {
    method: options?.method ?? 'GET',
    headers: {
      Cookie: `access_token=${accessToken}`,
    },

    body: options?.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError(data?.message ?? 'Request failed', res.status, data);
  }

  return data as TResponse;
}
