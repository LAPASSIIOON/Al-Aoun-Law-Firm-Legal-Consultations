import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing.js';
import '@fontsource-variable/readex-pro';
import '@fontsource-variable/archivo';
import '@fontsource/ibm-plex-sans-arabic/400.css';
import '@fontsource/ibm-plex-sans-arabic/600.css';
import '../globals.css';
import RevealController from '@/components/RevealController.js';
import SiteHeader from '@/components/SiteHeader.js';
import WhatsAppButton from '@/components/WhatsAppButton.js';
import { SiteFooter } from '@/components/SiteFooter.js';
import { createAnonClient } from '@/lib/supabase-server.js';

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
    title: { default: t('title'), template: t('titleTemplate') },
    description: t('description'),
    keywords: t('keywords'),
    icons: {
      icon: [
        { url: '/icons/favicon-32.png', sizes: '32x32', type: 'image/png' },
        { url: '/icons/favicon-48.png', sizes: '48x48', type: 'image/png' },
      ],
      apple: '/icons/apple-touch-icon.png',
    },
    alternates: { languages: { ar: '/ar', en: '/en' } }, // ⚠️ صحيح للرئيسية فقط — كل صفحة أخرى تُلزَم بتحديد alternates خاص بها (انظر src/lib/i18n-meta.js)
    openGraph: {
      type: 'website',
      locale: locale === 'ar' ? 'ar_KW' : 'en_US',
      alternateLocale: otherLocale === 'ar' ? 'ar_KW' : 'en_US',
      title: t('title'), description: t('description'), siteName: t('title'),
    },
    robots: { index: true, follow: true },
  };
}

async function fetchAreas(locale) {
  try {
    const supabase = createAnonClient();
    const { data } = await supabase
      .from('practice_area_translations')
      .select('slug, title, practice_areas(sort_order)')
      .eq('locale', locale).eq('status', 'published').eq('legal_approved', true);
    return (data || []).sort((a, b) => (a.practice_areas?.sort_order || 0) - (b.practice_areas?.sort_order || 0));
  } catch (e) { return []; }
}

/** @param {{ children: import('react').ReactNode, params: Promise<{ locale: string }> }} props */
export default async function LocaleLayout({ children, params }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const areas = await fetchAreas(locale);

  return (
    <html lang={locale} dir={DIR_BY_LOCALE[locale]}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'LegalService',
              name: locale === 'ar' ? 'مجموعة العون للمحاماة والاستشارات القانونية' : 'AL OUN — Legal Consultations & Advocacy',
              url: `https://al-aoun-law-firm-legal-consultation.vercel.app/${locale}`,
              telephone: '+96599010470',
              email: 'Aloun.Law@gmail.com',
              foundingDate: '2000',
              areaServed: { '@type': 'Country', name: 'Kuwait' },
              address: {
                '@type': 'PostalAddress',
                streetAddress: locale === 'ar' ? 'مجمع الأندلس' : 'Al-Andalus Complex',
                addressCountry: 'KW',
              },
              geo: { '@type': 'GeoCoordinates', latitude: 29.3415005, longitude: 48.0259086 },
              founder: {
                '@type': 'Person',
                name: locale === 'ar' ? 'الدكتور هيثم أحمد العون' : 'Dr. Haitham Ahmed Al Oun',
                jobTitle: locale === 'ar' ? 'المؤسّس ورئيس مجلس الإدارة' : 'Founder & Chairman',
              },
            }),
          }}
        />
        <NextIntlClientProvider locale={locale}>
          <a href="#main" className="skip">{locale === 'ar' ? 'تخطَّ إلى المحتوى' : 'Skip to content'}</a>
          <SiteHeader locale={locale} areas={areas} />
          <main id="main" className="main">{children}</main>
          <SiteFooter locale={locale} areas={areas} />
          <WhatsAppButton locale={locale} />
          <RevealController />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
