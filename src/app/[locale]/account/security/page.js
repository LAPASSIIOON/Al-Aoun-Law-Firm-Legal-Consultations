import { redirect } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getCurrentMember } from '@/lib/supabase-auth-server.js';
import { altLangs } from '@/lib/i18n-meta.js';
import AdminMfaSecurity from '@/components/AdminMfaSecurity.js';
import s from '../../shared.module.css';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'mfa' });
  return { title: t('heading'), robots: { index: false }, alternates: altLangs(locale, '/account/security') };
}

/** @param {{ params: Promise<{ locale: string }>, searchParams: Promise<{ next?: string }> }} props */
export default async function AccountSecurity({ params, searchParams }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const member = await getCurrentMember();
  if (!member) redirect(`/${locale}/account/sign-in`);
  if (member.role !== 'admin' || !member.is_active) redirect(`/${locale}/account/my-requests`);

  const { next } = await searchParams;
  const nextPath = typeof next === 'string' && /^\/(?!\/)/.test(next) ? next : '/admin';
  const t = await getTranslations('mfa');
  const copy = Object.fromEntries([
    'loading', 'setupHeading', 'setupBody', 'setupCta', 'secretLabel', 'codeLabel', 'codeHint',
    'enableCta', 'challengeHeading', 'challengeBody', 'verifyCta', 'activeHeading', 'activeBody',
    'continueCta', 'codeInvalid', 'errorGeneric', 'cancelCta',
  ].map((key) => [key, t(key)]));

  return (
    <>
      <section className={`on-navy ${s.pageHead} section-tight`}>
        <div className="wrap">
          <h1 className="display d-1" style={{ marginBlock: '1.2rem 1.5rem' }}>{t('heading')}</h1>
        </div>
      </section>
      <section className="on-ivory section">
        <div className="wrap" style={{ maxWidth: '38rem' }}>
          <p className="body" style={{ marginBlockEnd: '1.5rem' }}>{t('lead')}</p>
          <AdminMfaSecurity locale={locale} nextPath={nextPath} copy={copy} />
        </div>
      </section>
    </>
  );
}
