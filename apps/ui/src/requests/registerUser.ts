import { apiFetch } from '../utils/apiFetch';
import type { RegisterInput } from 'schemas';

export function registerUser(input: RegisterInput) {
  return apiFetch<{ success: true }, RegisterInput>('/auth/register', {
    method: 'POST',
    body: input,
  });
}
