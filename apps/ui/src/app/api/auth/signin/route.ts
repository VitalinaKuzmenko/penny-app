import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const res = await fetch(`${process.env.SERVER_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    credentials: 'include', // optional for backend
  });

  const data = await res.json();
  console.log('data', data);

  const cookiesFromHeader = res.headers.get('set-cookie');

  if (cookiesFromHeader) {
    const accessToken = cookiesFromHeader.split(';')[0].split('=')[1];

    (await cookies()).set({
      name: 'access_token',
      value: accessToken,
      secure: false,
      httpOnly: true,
    });
  }

  return NextResponse.json(data, { status: res.status });
}
