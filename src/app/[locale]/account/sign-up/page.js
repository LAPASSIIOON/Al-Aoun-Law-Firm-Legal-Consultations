import { getTranslations, setRequestLocale } from 'next-intl/server';
import SignUpForm from '@/components/SignUpForm.js';
import { altLangs } from '@/lib/i18n-meta.js';
import s from '../../shared.module.css';

export function generateStaticParams() { return [{ locale: 'ar' }, { locale: 'en' }]; }
export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'account' });
  return { title: t('signUpHeading'), robots: { index: false }, alternates: altLangs(locale, '/account/sign-up') };
}

/** @param {{ params: Promise<{ locale: string }> }} props */
export default async function SignUp({ params }) {
  const { locale } = await params; setRequestLocale(locale);
  const t = await getTranslations('account');
  return (
    <>
      <section className={`on-navy ${s.pageHead} section-tight`}>
        <div className="wrap">
          <h1 className="display d-1" data-reveal style={{ marginBlock: '1.2rem 1.5rem' }}>{t('signUpHeading')}</h1>
          <p className="lead" data-reveal style={{ maxWidth: '48ch' }}>{t('signUpLead')}</p>
        </div>
      </section>
      <section className="on-ivory section">
        <div className="wrap" style={{ maxWidth: '36rem' }}>
          <SignUpForm />
          <p className="body" style={{ marginBlockStart: '1.5rem' }}>
            {t('haveAccount')} <a href={`/${locale}/account/sign-in`} className="text-link">{t('signInCta')}</a>
          </p>
        </div>
      </section>
    </>
  );
}
