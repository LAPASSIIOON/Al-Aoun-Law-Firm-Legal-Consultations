import { getTranslations, setRequestLocale } from 'next-intl/server';
import ForgotPasswordForm from '@/components/ForgotPasswordForm.js';
import { altLangs } from '@/lib/i18n-meta.js';
import s from '../../shared.module.css';

export function generateStaticParams() { return [{ locale: 'ar' }, { locale: 'en' }]; }
export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'account' });
  return { title: t('forgotHeading'), robots: { index: false }, alternates: altLangs(locale, '/account/forgot-password') };
}

/** @param {{ params: Promise<{ locale: string }> }} props */
export default async function ForgotPassword({ params }) {
  const { locale } = await params; setRequestLocale(locale);
  const t = await getTranslations('account');
  return (
    <>
      <section className={`on-navy ${s.pageHead} section-tight`}>
        <div className="wrap">
          <h1 className="display d-1" data-reveal style={{ marginBlock: '1.2rem 1.5rem' }}>{t('forgotHeading')}</h1>
        </div>
      </section>
      <section className="on-ivory section">
        <div className="wrap" style={{ maxWidth: '36rem' }}>
          <p className="body" style={{ marginBlockEnd: '1.5rem' }}>{t('forgotLead')}</p>
          <ForgotPasswordForm />
          <p className="body" style={{ marginBlockStart: '1.5rem' }}>
            <a href={`/${locale}/account/sign-in`} className="text-link">{t('backToSignIn')}</a>
          </p>
        </div>
      </section>
    </>
  );
}
