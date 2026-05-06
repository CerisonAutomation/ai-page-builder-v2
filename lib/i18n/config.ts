/**
 * i18n Configuration
 * Supports English and Spanish with URL prefix strategy
 */

export const locales = ['en', 'es'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const localePrefix = 'always' as const;

export const pathnames = {
  '/': '/',
  '/login': '/login',
  '/register': '/register',
  '/forgot-password': '/forgot-password',
  '/admin': '/admin',
  '/admin/dashboard': '/admin/dashboard',
  '/admin/pages': '/admin/pages',
  '/admin/media': '/admin/media',
  '/admin/plugins': '/admin/plugins',
  '/admin/settings': '/admin/settings',
  '/owner/dashboard': '/owner/dashboard',
  '/guest/dashboard': '/guest/dashboard',
  '/edit/[slug]': '/edit/[slug]',
  '/[slug]': '/[slug]',
} as const;

export function getLocaleFromPathname(pathname: string): Locale {
  const segments = pathname.split('/');
  const maybeLocale = segments[1];
  return locales.includes(maybeLocale as Locale)
    ? (maybeLocale as Locale)
    : defaultLocale;
}
