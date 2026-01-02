import { NextRequest, NextResponse } from 'next/server';
import { match } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';
import { availableLanguages } from './utils/interfaces';

const defaultLocale = 'en';
const protectedPaths = ['/profile', '/upload-csv', '/pennys-view'];

export const getLocale = (request: Request) => {
  const headers = Object.fromEntries(request.headers.entries());
  const languages = new Negotiator({ headers }).languages();
  return match(languages, availableLanguages, defaultLocale);
};

export const proxy = (request: NextRequest) => {
  const { pathname } = request.nextUrl;

  const pathnameWithoutLocale = availableLanguages.some((locale) =>
    pathname.startsWith(`/${locale}/`),
  )
    ? pathname.replace(/^\/[a-zA-Z-]+\//, '/')
    : pathname;

  // 1️⃣ Auth protection
  if (protectedPaths.some((path) => pathnameWithoutLocale.startsWith(path))) {
    const token = request.cookies.get('access_token')?.value;

    if (!token) {
      const url = request.nextUrl.clone();
      url.pathname = '/signin';
      return NextResponse.redirect(url);
    }
  }

  // 2️⃣ Locale redirection
  const pathnameHasLocale = availableLanguages.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
  );

  if (!pathnameHasLocale) {
    const locale = getLocale(request);
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}${pathname}`;
    return NextResponse.redirect(url);
  }

  // Default: continue
  return NextResponse.next();
};

export const config = {
  matcher: ['/((?!_next).*)'], // applies to all paths except _next
};
