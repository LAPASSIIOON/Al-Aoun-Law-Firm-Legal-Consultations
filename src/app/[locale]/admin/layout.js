import { redirect } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getCurrentMember } from '@/lib/supabase-auth-server.js';
import { signOutAction } from '@/app/actions/auth.js';

// إجباري: كل صفحات لوحة الإدارة تتحقّق من الجلسة في كل طلب — أبدًا لا تُخزَّن ثابتة (SSG).
export const dynamic = 'force-dynamic';

/** @param {{ children: React.ReactNode, params: Promise<{ locale: string }> }} props */
export default async function AdminLayout({ children, params }) {
  const { locale } = await params; setRequestLocale(locale);
  const t = await getTranslations('admin');
  const member = await getCurrentMember();

  if (!member) redirect(`/${locale}/account/sign-in`);

  if (member.role !== 'admin' || !member.is_active) {
    return (
      <section className="on-white section" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center' }}>
        <div className="wrap" style={{ maxWidth: '40rem' }}>
          <h1 className="display d-2" style={{ marginBlockEnd: '1rem' }}>{t('pendingHeading')}</h1>
          <p className="body">{t('pendingBody')}</p>
        </div>
      </section>
    );
  }

  const links = [
    { href: '/admin', label: t('navOverview') },
    { href: '/admin/consultations', label: t('navConsultations') },
    { href: '/admin/referrals', label: t('navReferrals') },
    { href: '/admin/partnerships', label: t('navPartnerships') },
    { href: '/admin/members', label: t('navMembers') },
  ];

  return (
    <div style={{ minHeight: '80vh' }}>
      <nav style={{ borderBlockEnd: '1px solid var(--hair-light-strong)', background: 'var(--surface)' }}>
        <div className="wrap" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1.5rem', paddingBlock: '1rem' }}>
          <strong style={{ fontFamily: 'var(--f-display)' }}>{t('title')}</strong>
          {links.map((l) => (
            <a key={l.href} href={`/${locale}${l.href}`} className="body" style={{ fontSize: '.9rem' }}>{l.label}</a>
          ))}
          <form action={async () => { 'use server'; await signOutAction(locale); }} style={{ marginInlineStart: 'auto' }}>
            <button type="submit" className="btn-line" style={{ fontSize: '.85rem' }}>{t('signOut')}</button>
          </form>
        </div>
      </nav>
      <div className="wrap" style={{ paddingBlock: '2.5rem' }}>
        {children}
      </div>
    </div>
  );
}
