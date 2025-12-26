import type { LoginInput } from 'schemas';

export const loginUser = async (input: LoginInput) => {
  await fetch('/api/auth/signin', {
    method: 'POST',
    body: JSON.stringify(input),
    headers: { 'Content-Type': 'application/json' },
  });
};
