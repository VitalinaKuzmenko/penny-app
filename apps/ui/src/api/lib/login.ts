import { apiFetch } from './client';
import type { LoginInput } from 'schemas';

export interface RegisterResponse {
  accessToken: string;
}

export function loginUser(input: LoginInput) {
  return apiFetch<{ success: true }, LoginInput>('/auth/login', {
    method: 'POST',
    body: input,
  });
}
