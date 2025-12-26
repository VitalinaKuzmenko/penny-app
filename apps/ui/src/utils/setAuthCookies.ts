import { cookies } from 'next/headers';

export const setAuthCookies = async (response: Response) => {
  const cookiesFromHeader = response.headers.get('set-cookie');
  if (cookiesFromHeader) {
    const accessToken = cookiesFromHeader.split(';')[0].split('=')[1];

    console.log('accessToken', accessToken);

    console.log('node env', process.env.NODE_ENV);

    (await cookies()).set({
      name: 'access_token',
      value: accessToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
      maxAge: 60 * 60 * 24,
    });
  }
};
