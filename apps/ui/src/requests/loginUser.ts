import { apiFetch } from '../utils/apiFetch';
import type { LoginInput } from 'schemas';

export const loginUser = (input: LoginInput) => {
  return apiFetch<{ success: true }, LoginInput>('/auth/login', {
    method: 'POST',
    body: input,
  });
};
