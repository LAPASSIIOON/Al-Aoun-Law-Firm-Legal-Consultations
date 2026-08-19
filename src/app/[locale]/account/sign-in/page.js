import { getTranslations, setRequestLocale } from 'next-intl/server';
import SignInForm from '@/components/SignInForm.js';
import { altLangs } from '@/lib/i18n-meta.js';
import s from '../../shared.module.css';

export function generateStaticParams() { return [{ locale: 'ar' }, { locale: 'en' }]; }
export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'account' });
  return { title: t('signInHeading'), robots: { index: false }, alternates: altLangs(locale, '/account/sign-in') };
}

/** @param {{ params: Promise<{ locale: string }> }} props */
export default async function SignIn({ params }) {
  const { locale } = await params; setRequestLocale(locale);
  const t = await getTranslations('account');
  return (
    <>
      <section className={`on-navy ${s.pageHead} section-tight`}>
        <div className="wrap">
          <h1 className="display d-1" data-reveal style={{ marginBlock: '1.2rem 1.5rem' }}>{t('signInHeading')}</h1>
        </div>
      </section>
      <section className="on-ivory section">
        <div className="wrap" style={{ maxWidth: '36rem' }}>
          <SignInForm />
          <p className="body" style={{ marginBlockStart: '1.25rem' }}>
            <a href={`/${locale}/account/forgot-password`} className="text-link">{t('forgotCta')}</a>
          </p>
          <p className="body" style={{ marginBlockStart: '0.5rem' }}>
            {t('noAccount')} <a href={`/${locale}/account/sign-up`} className="text-link">{t('signUpCta')}</a>
          </p>
        </div>
      </section>
    </>
  );
}
