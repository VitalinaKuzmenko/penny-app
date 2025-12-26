import { clearCookie } from '@/utils/clearCookies';
import { NextResponse } from 'next/server';

export async function POST() {
  clearCookie('access_token');

  return NextResponse.json({ success: true }, { status: 200 });
}
