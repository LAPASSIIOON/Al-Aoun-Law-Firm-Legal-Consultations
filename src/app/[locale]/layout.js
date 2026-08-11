import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing.js';
import '@fontsource-variable/ibm-plex-sans';
import '@fontsource/ibm-plex-sans-arabic/400.css';
import '@fontsource/ibm-plex-sans-arabic/600.css';
import '@fontsource/ibm-plex-sans-arabic/700.css';
import '../globals.css';
import { SiteHeader } from '@/components/SiteHeader.js';
import { SiteFooter } from '@/components/SiteFooter.js';

/** @type {Record<'ar'|'en', 'rtl'|'ltr'>} */
const DIR_BY_LOCALE = { ar: 'rtl', en: 'ltr' };

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/**
 * @param {{ params: Promise<{ locale: string }> }} props
 */
export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return {
    title: t('title'),
    description: t('description'),
  };
}

/**
 * @param {{ children: import('react').ReactNode, params: Promise<{ locale: string }> }} props
 */
export default async function LocaleLayout({ children, params }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <html lang={locale} dir={DIR_BY_LOCALE[locale]}>
      <body>
        <NextIntlClientProvider locale={locale}>
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
