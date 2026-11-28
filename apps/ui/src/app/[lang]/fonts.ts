import { Fraunces, Nunito_Sans } from 'next/font/google';

// Headings: Fraunces ExtraBold. Fraunces has no Cyrillic glyphs, so ru/ua
// headings fall back to the serif fallback in the theme.
export const fraunces = Fraunces({
  subsets: ['latin', 'latin-ext'],
  weight: '800',
  display: 'swap',
  variable: '--font-fraunces',
});

// Body: Nunito Sans (variable weight)
export const nunitoSans = Nunito_Sans({
  subsets: ['latin', 'latin-ext', 'cyrillic', 'cyrillic-ext'],
  display: 'swap',
  variable: '--font-nunito-sans',
});
