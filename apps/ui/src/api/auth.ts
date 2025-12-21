import { apiFetch } from './client';
import type { RegisterInput } from 'schemas';

export interface RegisterResponse {
  accessToken: string;
}

export function registerUser(input: RegisterInput) {
  return apiFetch<RegisterResponse, RegisterInput>('/auth/register', {
    method: 'POST',
    body: input,
  });
}
