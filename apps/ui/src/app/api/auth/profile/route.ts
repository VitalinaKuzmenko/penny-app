import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  console.log('call here');
  const cookie = req.headers.get('cookie') || '';

  console.log('COOKIES', cookie);
  const res = await fetch(`${process.env.SERVER_URL}/auth/profile`, {
    headers: { cookie },
  });

  const data = await res.json();

  console.log('data', data);
  return NextResponse.json(data, { status: res.status });
}
