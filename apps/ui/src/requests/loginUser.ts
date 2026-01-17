import { clientApiFetch } from '@/utils/clientApiFetch';
import type { LoginInput } from 'schemas';

export const loginUser = (input: LoginInput) => {
  return clientApiFetch<{ success: true }, LoginInput>('/auth/login', {
    method: 'POST',
    body: input,
  });
};
