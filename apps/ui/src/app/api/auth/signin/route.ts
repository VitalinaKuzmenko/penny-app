import { setAuthCookies } from '@/utils/setAuthCookie';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const res = await fetch(`${process.env.SERVER_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    credentials: 'include', // optional for backend
  });

  await setAuthCookies(res);

  const data = await res.json();
  console.log('data', data);

  return NextResponse.json(data, { status: res.status });
}
