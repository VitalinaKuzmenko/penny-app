import { cookies } from 'next/headers';
import { UserInfo } from 'schemas';

export const fetchUserInfoServer = async (): Promise<UserInfo | null> => {
  let user: UserInfo | null = null;
  try {
    const cookieStore = cookies();
    const accessToken = (await cookieStore).get('access_token')?.value;

    console.log('accessToken', accessToken);

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/auth/profile`,
      {
        cache: 'no-store',
        headers: {
          Cookie: `access_token=${accessToken}`,
        },
      },
    );

    if (res.ok) {
      user = await res.json();
    }
  } catch (err) {
    console.error('Failed to fetch profile', err);
  }

  return user;
};
