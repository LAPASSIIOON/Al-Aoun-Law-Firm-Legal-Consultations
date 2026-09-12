import { redirect } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getCurrentMember } from '@/lib/supabase-auth-server.js';
import { signOutAction } from '@/app/actions/auth.js';
import { listConsultations, listReferrals, listPartnerships } from '@/app/actions/admin.js';
import AdminNav from '@/components/AdminNav.js';
import { Link } from '@/i18n/navigation.js';
import styles from './AdminLayout.module.css';

// إجباري: كل صفحات لوحة الإدارة تتحقّق من الجلسة في كل طلب — أبدًا لا تُخزَّن ثابتة (SSG).
export const dynamic = 'force-dynamic';

/** @param {{ children: React.ReactNode, params: Promise<{ locale: string }> }} props */
export default async function AdminLayout({ children, params }) {
  const { locale } = await params; setRequestLocale(locale);
  const t = await getTranslations('admin');
  const member = await getCurrentMember();

  if (!member) redirect(`/${locale}/account/sign-in`);
  if (member.role !== 'admin' || !member.is_active) redirect(`/${locale}/account/my-requests`);

  const [consultations, referrals, partnerships] = await Promise.all([
    listConsultations(), listReferrals(), listPartnerships(),
  ]);
  const newCount = (rows) => rows.filter((r) => r.stage === 'new').length;

  // مجموعات منطقية — لا تضاف مجموعة "المحتوى" هنا إلا لما تُبنى صفحاتها فعليًا (المرحلة D)،
  // تجنّبًا لعنصر تنقّل يشير لمكان غير موجود (بالضبط الشكوى اللي بدأت منها إعادة البناء دي).
  const navGroups = [
    { label: '', links: [{ href: '/admin', label: t('navOverview') }] },
    {
      label: t('navGroupOperations'),
      links: [
        { href: '/admin/consultations', label: t('navConsultations'), badge: newCount(consultations) },
        { href: '/admin/referrals', label: t('navReferrals'), badge: newCount(referrals) },
        { href: '/admin/partnerships', label: t('navPartnerships'), badge: newCount(partnerships) },
        { href: '/admin/partner-firms', label: t('navPartnerFirms') },
      ],
    },
    { label: t('navGroupPeople'), links: [{ href: '/admin/members', label: t('navMembers') }] },
    { label: t('navGroupContent'), links: [
        { href: '/admin/practice-areas', label: t('navPracticeAreas') },
        { href: '/admin/insights', label: t('navInsights') },
    ] },
    { label: t('navGroupClientPortal'), links: [{ href: '/admin/matters', label: t('navMatters') }] },
    { label: t('navGroupSystem'), links: [{ href: '/admin/audit', label: t('navAudit') }] },
  ];

  return (
    <div data-admin-shell className={styles.shell}>
      <div className={styles.frame}>
        <aside className={styles.sidebar}>
          <Link href="/" className={styles.brand} aria-label={locale === 'ar' ? 'العودة إلى الموقع' : 'Back to website'}>
            <img src="/brand/al-aoun-mark.svg" alt="" aria-hidden="true" className={styles.mark} />
            <span>
              <strong>{t('title')}</strong>
              <small>{locale === 'ar' ? 'إدارة الموقع' : 'Site administration'}</small>
            </span>
          </Link>

          <AdminNav groups={navGroups} />

          <div className={styles.account}>
            <span className={styles.avatar}>
              {(member.display_name || '?').trim().charAt(0).toUpperCase()}
            </span>
            <span className={styles.accountName}>{member.display_name}</span>
            <form action={async () => { 'use server'; await signOutAction(locale); }}>
              <button type="submit" className={styles.signOut}>{t('signOut')}</button>
            </form>
          </div>

        </aside>
        <section className={styles.workspace}>
          <div className={styles.content}>{children}</div>
        </section>
      </div>
    </div>
  );
}
