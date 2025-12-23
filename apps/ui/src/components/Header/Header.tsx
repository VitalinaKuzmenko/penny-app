'use server';

import { getDictionary } from '@/utils/getDictionary';
import { Navbar } from '@/components/Navbar/Navbar';
import { LanguageType } from '@/utils/interfaces';

interface HeaderProps {
  lang: LanguageType;
}

// Server component can be async
export default async function Header({ lang }: HeaderProps) {
  const dict = await getDictionary(lang);
  const headerText = dict.HEADER;

  return <Navbar headerText={headerText} />;
}
