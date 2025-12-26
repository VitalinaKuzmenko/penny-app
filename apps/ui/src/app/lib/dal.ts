// app/lib/dal.ts
import 'server-only';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import { fetchUserInfoServer } from '@/requests/fetchUserInfoServer';

export const verifySession = cache(async () => {
  const cookieStore = cookies();
  const accessToken = (await cookieStore).get('access_token')?.value;

  console.log('DAL: accessToken =', accessToken); // 🔹 add this

  if (!accessToken) {
    console.log('DAL: no access token, redirecting');
    redirect('/signin');
  }

  const user = await fetchUserInfoServer();

  console.log('DAL: user =', user); // 🔹 add this

  if (!user) {
    console.log('DAL: user not found, redirecting');
    redirect('/signin');
  }

  return {
    isAuth: true,
    user,
  };
});
