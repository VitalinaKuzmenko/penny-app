'use server';

import { cookies } from 'next/headers';
import { UserInfo } from 'schemas';

export const fetchUserInfoServer = async (): Promise<UserInfo | null> => {
  const cookieStore = cookies();

  // console.log('fetchUserInfoServer: cookieStore =', cookieStore);
  const accessToken = (await cookieStore).get('access_token')?.value;

  console.log('fetchUserInfoServer: accessToken =', accessToken);

  if (!accessToken) return null;

  const res = await fetch(`${process.env.SERVER_URL}/auth/profile`, {
    headers: { Cookie: `access_token=${accessToken}` },
    cache: 'no-store',
  });

  if (!res.ok) {
    console.log(
      'fetchUserInfoServer: failed to fetch profile',
      await res.text(),
    );
    return null;
  }

  const user = await res.json();
  console.log('fetchUserInfoServer: user =', user);
  return user;
};

// import { UserInfo } from 'schemas';

// export const fetchUserInfoServer = async (): Promise<UserInfo | null> => {
//   try {
//     const res = await fetch(
//       `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/profile`,
//       {
//         cache: 'no-store',
//         // No need to manually attach cookies; Next.js passes them from incoming request
//       },
//     );

//     console.log('fetchUserInfoServer: res =1111: ', res);

//     if (!res.ok) return null;

//     const user = await res.json();
//     return user;
//   } catch (err) {
//     console.error('fetchUserInfoServer failed', err);
//     return null;
//   }
// };
