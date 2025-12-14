import { getDictionary } from 'ui/src/utils/getDictionary';
import { Navbar } from '../Navbar';

interface HeaderProps {
  lang: 'en' | 'ru' | 'ua';
}

// Server component can be async
export default async function Header({ lang }: HeaderProps) {
  const dict = await getDictionary(lang);
  const pages = [dict.HOMEPAGE.PAGES.HOME, dict.HOMEPAGE.PAGES.UPLOAD_CSV, dict.HOMEPAGE.PAGES.PENNYS_VIEW];

  return <Navbar pages={pages} />;
}
