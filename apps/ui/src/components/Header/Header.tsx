'use server';

import { getDictionary } from '@/utils/getDictionary';
import { Navbar } from '@/components/Navbar/Navbar';
import { LanguageType } from '@/utils/interfaces';
import { UserInfo } from 'schemas';
import { fetchUserInfo } from '@/requests/fetchUserInfo';

interface HeaderProps {
  lang: LanguageType;
}

// Server component can be async
export default async function Header({ lang }: HeaderProps) {
  const dict = await getDictionary(lang);
  const headerText = dict.HEADER;

  const user: UserInfo | null = await fetchUserInfo();

  return <Navbar headerText={headerText} userData={user} />;
}
