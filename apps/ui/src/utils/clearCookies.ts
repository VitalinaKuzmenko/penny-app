import { cookies } from 'next/headers';

export const clearCookie = async (name: string) => {
  (await cookies()).delete(name);
};
