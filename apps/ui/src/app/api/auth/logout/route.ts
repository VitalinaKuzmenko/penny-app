import { clearCookie } from '@/utils/clearCookies';
import { NextResponse } from 'next/server';

export async function POST() {
  const res = await fetch(`${process.env.SERVER_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include', // optional for backend
  });

  clearCookie('access_token');

  const data = await res.json();
  console.log('data', data);

  return NextResponse.json(data, { status: res.status });
}
