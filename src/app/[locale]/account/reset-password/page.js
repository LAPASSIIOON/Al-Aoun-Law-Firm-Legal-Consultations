import { getTranslations, setRequestLocale } from 'next-intl/server';
import { createSupabaseServerClient } from '@/lib/supabase-auth-server.js';
import ResetPasswordForm from '@/components/ResetPasswordForm.js';
import { altLangs } from '@/lib/i18n-meta.js';
import s from '../../shared.module.css';

// ديناميكية دائمًا: تعتمد على جلسة الاستعادة (كوكيز)، لا تُولَّد ثابتة.
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'account' });
  return { title: t('resetHeading'), robots: { index: false }, alternates: altLangs(locale, '/account/reset-password') };
}

/** @param {{ params: Promise<{ locale: string }> }} props */
export default async function ResetPassword({ params }) {
  const { locale } = await params; setRequestLocale(locale);
  const t = await getTranslations('account');
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  return (
    <>
      <section className={`on-navy ${s.pageHead} section-tight`}>
        <div className="wrap">
          <h1 className="display d-1" data-reveal style={{ marginBlock: '1.2rem 1.5rem' }}>{t('resetHeading')}</h1>
        </div>
      </section>
      <section className="on-ivory section">
        <div className="wrap" style={{ maxWidth: '36rem' }}>
          {user ? (
            <>
              <p className="body" style={{ marginBlockEnd: '1.5rem' }}>{t('resetLead')}</p>
              <ResetPasswordForm />
            </>
          ) : (
            <p className="body">
              {t('resetInvalid')}{' '}
              <a href={`/${locale}/account/forgot-password`} className="text-link">{t('forgotCta')}</a>
            </p>
          )}
        </div>
      </section>
    </>
  );
}
