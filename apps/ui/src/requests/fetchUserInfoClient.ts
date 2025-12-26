import { UserInfo } from 'schemas';

export const fetchUserInfoClient = async (): Promise<UserInfo | null> => {
  try {
    const res = await fetch('/api/auth/profile', {
      credentials: 'include',
    });

    if (res.status === 401) {
      return null; // not logged in
    }

    if (!res.ok) {
      throw new Error(`Failed with status ${res.status}`);
    }

    return (await res.json()) as UserInfo;
  } catch (err) {
    console.error('Failed to fetch profile:', err);
    return null;
  }
};
