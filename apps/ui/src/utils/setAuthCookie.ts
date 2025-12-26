import { cookies } from 'next/headers';

export const setAuthCookies = async (response: Response) => {
  const cookiesFromHeader = response.headers.get('set-cookie');
  if (cookiesFromHeader) {
    const accessToken = cookiesFromHeader.split(';')[0].split('=')[1];

    (await cookies()).set({
      name: 'Authentication',
      value: accessToken,
      secure: true,
      httpOnly: true,
      expires: 1000 * 60 * 60 * 24, // 1 day
    });
  }
};
