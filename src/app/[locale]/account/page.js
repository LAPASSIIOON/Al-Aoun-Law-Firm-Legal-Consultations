import { redirect } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation.js';
import { getCurrentMember } from '@/lib/supabase-auth-server.js';
import { altLangs } from '@/lib/i18n-meta.js';
import styles from './AccountLanding.module.css';

// يعتمد المدخل على جلسة المستخدم في كل طلب، فلا يُخزَّن كصفحة ثابتة.
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const title = locale === 'ar' ? 'بوابة الأعضاء' : 'Member Portal';
  const description = locale === 'ar'
    ? 'الوصول إلى طلباتك وملفك وقضاياك المتاحة لدى مجموعة العون.'
    : 'Access your requests, profile, and available matters with Al Oun.';
  return { title, description, robots: { index: false }, alternates: altLangs(locale, '/account') };
}

/** @param {{ params: Promise<{ locale: string }> }} props */
export default async function AccountGateway({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const member = await getCurrentMember();

  if (member?.role === 'admin' && member.is_active) redirect(`/${locale}/admin`);
  if (member) redirect(`/${locale}/account/my-requests`);

  const ar = locale === 'ar';
  const features = ar ? [
    ['01', 'طلباتك في مكان واحد', 'راجع طلبات الاستشارة والإحالة والتعاون المرتبطة بحسابك وحالتها الحالية.'],
    ['02', 'قضاياك وملفاتك', 'افتح القضايا والملفات التي أتاحها المكتب لحسابك عندما تصبح متوفرة.'],
    ['03', 'ملف عضويتك', 'راجع بياناتك الأساسية وحدّثها من داخل حسابك.'],
  ] : [
    ['01', 'Your requests, together', 'Review the consultation, referral, and collaboration requests linked to your account and their current status.'],
    ['02', 'Matters and files', 'Open the matters and files made available to your account when they become available.'],
    ['03', 'Your member profile', 'Review and update your core profile details from your account.'],
  ];

  return (
    <>
      <section className={`on-navy ${styles.hero}`}>
        <div className={`wrap ${styles.heroGrid}`}>
          <div className={styles.copy}>
            <span className="eyebrow">{ar ? 'بوابة الأعضاء' : 'Member Portal'}</span>
            <h1 className={`display d-hero ${styles.title}`}>
              {ar ? 'مساحتك القانونية، منظّمة وواضحة.' : 'Your legal workspace, organised and clear.'}
            </h1>
            <p className={`lead ${styles.lead}`}>
              {ar
                ? 'ادخل لمتابعة طلباتك وبيانات عضويتك والقضايا التي يتيحها المكتب لحسابك.'
                : 'Sign in to follow your requests, membership details, and matters made available to your account.'}
            </p>
            <div className={styles.actions}>
              <Link href="/account/sign-in" className="btn btn-solid">
                {ar ? 'تسجيل الدخول' : 'Sign In'} <span className="arrow">→</span>
              </Link>
              <Link href="/account/sign-up" className="btn btn-ghost">
                {ar ? 'إنشاء حساب' : 'Create Account'}
              </Link>
            </div>
            <p className={styles.accessNote}>
              {ar ? 'الوصول إلى الطلبات والملفات يتطلب تسجيل الدخول.' : 'Requests and files require an authenticated account.'}
            </p>
          </div>

          <div className={styles.ledger} aria-hidden="true">
            <img src="/brand/al-aoun-mark.svg" alt="" className={styles.mark} />
            <span className={styles.ledgerLabel}>{ar ? 'مساحة الأعضاء' : 'MEMBER ACCESS'}</span>
            <span className={styles.ledgerRule} />
            <span className={styles.ledgerRef}>AL OUN / 01</span>
          </div>
        </div>
      </section>

      <section className={`on-ivory ${styles.features}`}>
        <div className="wrap">
          <div className={styles.sectionHead}>
            <span className="eyebrow">{ar ? 'ما الذي تجده داخل البوابة؟' : 'Inside the portal'}</span>
            <h2 className="display d-2">{ar ? 'متابعة عملية من نقطة واحدة.' : 'A practical view from one place.'}</h2>
          </div>
          <div className={styles.featureGrid}>
            {features.map(([n, title, body]) => (
              <article key={n} className={styles.feature}>
                <span className="ref-num">{n}</span>
                <h3 className="display d-3">{title}</h3>
                <p className="body">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={`on-navy-raised ${styles.closing}`}>
        <div className={`wrap ${styles.closingInner}`}>
          <div>
            <span className="eyebrow">{ar ? 'ابدأ الآن' : 'Get started'}</span>
            <h2 className="display d-2">{ar ? 'لديك حساب بالفعل؟' : 'Already have an account?'}</h2>
          </div>
          <div className={styles.actions}>
            <Link href="/account/sign-in" className="btn btn-solid">{ar ? 'الدخول إلى البوابة' : 'Enter the Portal'}</Link>
            <Link href="/account/sign-up" className="btn btn-ghost">{ar ? 'تسجيل عضوية جديدة' : 'Register a New Account'}</Link>
          </div>
        </div>
      </section>
    </>
  );
}
