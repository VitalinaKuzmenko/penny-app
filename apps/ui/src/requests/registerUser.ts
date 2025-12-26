import type { RegisterInput } from 'schemas';

export const registerUser = async (input: RegisterInput) => {
  await fetch('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(input),
    headers: { 'Content-Type': 'application/json' },
  });
};
