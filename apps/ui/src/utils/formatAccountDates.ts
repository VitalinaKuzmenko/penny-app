import { LanguageType } from './interfaces';

const INTL_LOCALES: Record<LanguageType, string> = {
  en: 'en-GB',
  ru: 'ru-RU',
  ua: 'uk-UA',
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const toIntlLocale = (lang: string) =>
  INTL_LOCALES[lang as LanguageType] ?? INTL_LOCALES.en;

// Transaction dates are stored as UTC midnight, so format in UTC to keep the calendar day
export const formatDay = (iso: string, lang: string) =>
  new Date(iso).toLocaleDateString(toIntlLocale(lang), {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });

export const formatDaysAgo = (iso: string, lang: string, now = new Date()) => {
  const todayUtc = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  );
  const days = Math.round((todayUtc - new Date(iso).getTime()) / MS_PER_DAY);

  return new Intl.RelativeTimeFormat(toIntlLocale(lang), {
    numeric: 'auto',
  }).format(-days, 'day');
};
