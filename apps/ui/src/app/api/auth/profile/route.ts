import { get } from '@/utils/fetch';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await get('auth/profile');

    if (!res.ok) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: res.status },
      );
    }

    const user = await res.json();
    return NextResponse.json(user, { status: 200 });
  } catch (err) {
    console.error('Profile API error:', err);

    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 },
    );
  }
}
