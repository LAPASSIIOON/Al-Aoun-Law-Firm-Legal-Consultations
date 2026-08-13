import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing.js';
import '@fontsource-variable/ibm-plex-sans';
import '@fontsource/ibm-plex-sans-arabic/400.css';
import '@fontsource/ibm-plex-sans-arabic/600.css';
import '@fontsource/ibm-plex-sans-arabic/700.css';
import '@fontsource-variable/archivo';
import '@fontsource-variable/newsreader';
import '@fontsource/amiri/400.css';
import '@fontsource/amiri/700.css';
import '@fontsource/cormorant/400.css';
import '@fontsource/cormorant/500.css';
import '../globals.css';
import RevealController from '@/components/RevealController.js';
import SiteHeader from '@/components/SiteHeader.js';
import { SiteFooter } from '@/components/SiteFooter.js';

/** @type {Record<'ar'|'en', 'rtl'|'ltr'>} */
const DIR_BY_LOCALE = { ar: 'rtl', en: 'ltr' };

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/** @param {{ params: Promise<{ locale: string }> }} props */
export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  const otherLocale = locale === 'ar' ? 'en' : 'ar';
  return {
    title: {
      default: t('title'),
      template: t('titleTemplate'),
    },
    description: t('description'),
    keywords: t('keywords'),
    icons: {
      icon: [
        { url: '/icons/favicon-32.png', sizes: '32x32', type: 'image/png' },
        { url: '/icons/favicon-48.png', sizes: '48x48', type: 'image/png' },
      ],
      apple: '/icons/apple-touch-icon.png',
    },
    alternates: {
      languages: { ar: '/ar', en: '/en' },
    },
    openGraph: {
      type: 'website',
      locale: locale === 'ar' ? 'ar_KW' : 'en_US',
      alternateLocale: otherLocale === 'ar' ? 'ar_KW' : 'en_US',
      title: t('title'),
      description: t('description'),
      siteName: t('title'),
    },
    robots: { index: true, follow: true },
  };
}

/** @param {{ children: import('react').ReactNode, params: Promise<{ locale: string }> }} props */
export default async function LocaleLayout({ children, params }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  return (
    <html lang={locale} dir={DIR_BY_LOCALE[locale]}>
      <body>
        <NextIntlClientProvider locale={locale}>
          <a href="#main" className="skip">تخطَّ إلى المحتوى</a>
          <SiteHeader />
          <main id="main" className="main">{children}</main>
          <SiteFooter />
          <RevealController />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
