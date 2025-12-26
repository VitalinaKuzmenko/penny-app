import { cookies } from 'next/headers';

export const clearCookie = async (name: string) => {
  (await cookies()).set({
    name,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
    maxAge: 0,
  });
};
