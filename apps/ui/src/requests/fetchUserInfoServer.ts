import { cookies } from 'next/headers';
import { UserInfo } from 'schemas';

export const fetchUserInfoServer = async (): Promise<UserInfo | null> => {
  let user: UserInfo | null = null;
  try {
    const cookieStore = cookies();
    const accessToken = (await cookieStore).get('access_token')?.value;

    const res = await fetch(`${process.env.SERVER_URL}/auth/profile`, {
      cache: 'no-store',
      headers: {
        Cookie: `access_token=${accessToken}`,
      },
    });

    if (res.ok) {
      user = await res.json();
    }
  } catch (err) {
    console.error('Failed to fetch profile', err);
  }

  return user;
};
