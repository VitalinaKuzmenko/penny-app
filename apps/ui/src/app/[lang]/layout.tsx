import type { Metadata } from 'next';
import './globals.css';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { ThemeProvider } from '@/providers/ThemeProvider';
import Header from '@/components/Header/Header';
import { availableLanguages, LanguageType } from '@/utils/interfaces';
import { Footer } from '@/components/Footer/Footer';
import { AuthProvider } from '@/providers/AuthProvider';
import { fetchUserInfoServer } from '@/requests/fetchUserInfoServer';

export async function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'ru' }, { lang: 'ua' }];
}

export const metadata: Metadata = {
  title: 'Penny App',
  description:
    'Penny App is a personal finance tracker. Upload your bank CSV exports, categorise transactions, and get clear insights into your spending and savings — no bank integration required.',
};

const normalizeLocale = (lang: string): LanguageType => {
  return availableLanguages.includes(lang as LanguageType)
    ? (lang as LanguageType)
    : 'en';
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  const { lang: rawLang } = await params;
  const lang = normalizeLocale(rawLang);
  const user = await fetchUserInfoServer();

  return (
    <html lang={lang}>
      <body>
        <AppRouterCacheProvider>
          <ThemeProvider>
            <AuthProvider initialUser={user}>
              <Header lang={lang} />
              <main className="app-main">{children}</main>
              <Footer />
            </AuthProvider>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
