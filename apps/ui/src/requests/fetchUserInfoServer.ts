import { cookies } from 'next/headers';
import { UserInfo } from 'schemas';

export const fetchUserInfoServer = async (): Promise<UserInfo | null> => {
  const cookieStore = cookies();
  const accessToken = (await cookieStore).get('access_token')?.value;

  console.log('fetchUserInfoServer: accessToken =', accessToken);

  if (!accessToken) return null;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/auth/profile`,
    {
      headers: { Cookie: `access_token=${accessToken}` },
      cache: 'no-store',
    },
  );

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
