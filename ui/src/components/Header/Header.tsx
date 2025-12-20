import { getDictionary } from 'ui/src/utils/getDictionary';
import { Navbar } from '../Navbar/Navbar';
import { LanguageType } from 'ui/src/utils/interfaces';

interface HeaderProps {
  lang: LanguageType;
}

// Server component can be async
export default async function Header({ lang }: HeaderProps) {
  const dict = await getDictionary(lang);
  const pages = [dict.HEADER.PAGES.HOME, dict.HEADER.PAGES.UPLOAD_CSV, dict.HEADER.PAGES.PENNYS_VIEW];

  return (
    <Navbar
      pages={pages}
      signInPageName={dict.HEADER.PAGES.SIGN_IN}
    />
  );
}
