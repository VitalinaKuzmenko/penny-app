'use client';

import { usePathname, useRouter, useParams } from 'next/navigation';

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();

  const currentLang = params.lang; // "en" | "ru" | "ua"

  const switchLanguage = (newLang: string) => {
    if (!pathname) return;

    const segments = pathname.split('/');

    // Replace the language segment
    segments[1] = newLang;

    const newPath = segments.join('/');

    router.push(newPath);
  };

  return (
    <select
      value={currentLang}
      onChange={(e) => switchLanguage(e.target.value)}
    >
      <option value="en">EN</option>
      <option value="ru">RU</option>
      <option value="ua">UA</option>
    </select>
  );
}
