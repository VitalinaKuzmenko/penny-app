import { clientApiFetch } from '@/utils/clientApiFetch';
import type { RegisterInput } from 'schemas';

export function registerUser(input: RegisterInput) {
  return clientApiFetch<{ success: true }, RegisterInput>('/auth/register', {
    method: 'POST',
    body: input,
  });
}
