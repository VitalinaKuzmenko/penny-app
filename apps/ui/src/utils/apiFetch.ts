//TODO: review if we want to remove this file

import { cookies } from 'next/headers';

export class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

const getHeaders = async () => ({
  Cookie: (await cookies()).toString(),
});

export async function apiFetch<TResponse, TBody = unknown>(
  path: string,
  options?: {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    body?: TBody;
    headers?: HeadersInit;
  },
): Promise<TResponse> {
  const res = await fetch(`${process.env.SERVER_URL}${path}`, {
    method: options?.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(await getHeaders()),
      ...(options?.headers ?? {}),
    },
    credentials: 'include',
    body: options?.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError(data?.message ?? 'Request failed', res.status, data);
  }

  return data as TResponse;
}
