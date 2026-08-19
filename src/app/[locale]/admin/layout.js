import { redirect } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getCurrentMember } from '@/lib/supabase-auth-server.js';
import { signOutAction } from '@/app/actions/auth.js';
import { listConsultations, listReferrals, listPartnerships } from '@/app/actions/admin.js';
import AdminNav from '@/components/AdminNav.js';

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
      ],
    },
    { label: t('navGroupPeople'), links: [{ href: '/admin/members', label: t('navMembers') }] },
    { label: t('navGroupSystem'), links: [{ href: '/admin/audit', label: t('navAudit') }] },
  ];

  return (
    <div style={{ minHeight: '80vh', background: 'var(--surface)' }}>
      <nav style={{ borderBlockEnd: '1px solid var(--hair-light-strong)', background: 'var(--ground)' }}>
        <div className="wrap" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', columnGap: '1.25rem', rowGap: '.6rem', paddingBlock: '1.1rem' }}>
          <strong style={{ fontFamily: 'var(--f-display)', color: 'var(--platinum)', whiteSpace: 'nowrap', flexShrink: 0 }}>{t('title')}</strong>
          <AdminNav groups={navGroups} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '.9rem', marginInlineStart: 'auto', flexShrink: 0 }}>
            <span className="body" style={{ fontSize: '.82rem', color: 'var(--platinum-3)', whiteSpace: 'nowrap' }}>{member.display_name}</span>
            <form action={async () => { 'use server'; await signOutAction(locale); }}>
              <button type="submit" className="btn-line" style={{ fontSize: '.85rem', color: 'var(--clay-bright)', whiteSpace: 'nowrap' }}>{t('signOut')}</button>
            </form>
          </div>
        </div>
      </nav>
      <div className="wrap" style={{ paddingBlock: '2.5rem' }}>
        {children}
      </div>
    </div>
  );
}
