'use server';

import { getDictionary } from '@/utils/getDictionary';
import { Navbar } from '@/components/Navbar/Navbar';
import { LanguageType } from '@/utils/interfaces';
import { cookies } from 'next/headers';
import { UserInfo } from 'schemas';

interface HeaderProps {
  lang: LanguageType;
}

// Server component can be async
export default async function Header({ lang }: HeaderProps) {
  const dict = await getDictionary(lang);
  const headerText = dict.HEADER;

  let user: UserInfo | null = null;

  try {
    const cookieStore = cookies();
    const accessToken = (await cookieStore).get('access_token')?.value;

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/auth/profile`,
      {
        headers: {
          Cookie: `access_token=${accessToken}`,
        },
      },
    );

    if (res.ok) {
      user = await res.json();
    }
  } catch (err) {
    console.error('Failed to fetch profile', err);
  }

  return <Navbar headerText={headerText} userData={user} />;
}
