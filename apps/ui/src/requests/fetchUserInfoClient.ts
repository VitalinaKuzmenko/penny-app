import { UserInfo } from 'schemas';

export const fetchUserInfoClient = async (): Promise<UserInfo | null> => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/auth/profile`,
      {
        method: 'GET',
        credentials: 'include', // 🔥 sends HttpOnly cookies automatically
      },
    );

    if (!res.ok) {
      return null;
    }

    return await res.json();
  } catch (err) {
    console.error('Failed to fetch profile', err);
    return null;
  }
};
