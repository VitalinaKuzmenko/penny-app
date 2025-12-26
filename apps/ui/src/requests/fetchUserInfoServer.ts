'use server';

import { get } from '@/utils/fetch';
import { UserInfo } from 'schemas';

export const fetchUserInfoServer = async (): Promise<UserInfo | null> => {
  try {
    const res = await get('auth/profile');

    // Not authenticated
    if (res.status === 401) {
      return null;
    }

    // Other backend errors
    if (!res.ok) {
      console.error(
        'fetchUserInfoServer: failed',
        res.status,
        await res.text(),
      );
      return null;
    }

    const user = (await res.json()) as UserInfo;
    return user;
  } catch (err) {
    console.error('fetchUserInfoServer: unexpected error', err);
    return null;
  }
};
