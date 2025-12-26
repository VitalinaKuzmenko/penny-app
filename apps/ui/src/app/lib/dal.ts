// app/lib/dal.ts
import 'server-only';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import { fetchUserInfoServer } from '@/requests/fetchUserInfoServer';

export const verifySession = cache(async () => {
  const cookieStore = cookies();
  const accessToken = (await cookieStore).get('access_token')?.value;

  if (!accessToken) {
    redirect('/signin');
  }

  const user = await fetchUserInfoServer();

  if (!user) {
    redirect('/signin');
  }

  return {
    isAuth: true,
    user,
  };
});
