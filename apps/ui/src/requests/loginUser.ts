import type { LoginInput } from 'schemas';

export const loginUser = async (input: LoginInput) => {
  console.log('input', input);
  await fetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(input),
    headers: { 'Content-Type': 'application/json' },
  });
};
