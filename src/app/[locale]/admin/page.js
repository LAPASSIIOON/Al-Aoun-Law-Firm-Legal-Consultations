import { getTranslations } from 'next-intl/server';
import { listConsultations, listReferrals, listPartnerships, listMembers } from '@/app/actions/admin.js';

export default async function AdminOverview() {
  const t = await getTranslations('admin');
  const [consultations, referrals, partnerships, members] = await Promise.all([
    listConsultations(), listReferrals(), listPartnerships(), listMembers(),
  ]);
  const stats = [
    { label: t('navConsultations'), n: consultations.length },
    { label: t('navReferrals'), n: referrals.length },
    { label: t('navPartnerships'), n: partnerships.length },
    { label: t('navMembers'), n: members.length },
  ];
  return (
    <>
      <h1 className="display d-2" style={{ marginBlockEnd: '1.5rem' }}>{t('navOverview')}</h1>
      <div className="grid cols-4" style={{ gap: '1.5rem' }}>
        {stats.map((s) => (
          <div key={s.label} style={{ padding: '1.5rem', borderRadius: 'var(--r-lg)', boxShadow: 'inset 0 0 0 1px var(--hair-light-strong)' }}>
            <div style={{ fontFamily: 'var(--f-display)', fontSize: '2.2rem', color: 'var(--ink)' }}>{s.n}</div>
            <div className="body" style={{ color: 'var(--muted)', fontSize: '.9rem' }}>{s.label}</div>
          </div>
        ))}
      </div>
    </>
  );
}
