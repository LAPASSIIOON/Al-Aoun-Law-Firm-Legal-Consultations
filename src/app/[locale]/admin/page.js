import Link from 'next/link';
import { getTranslations, getLocale } from 'next-intl/server';
import { listConsultations, listReferrals, listPartnerships, listMembers } from '@/app/actions/admin.js';
import { MEMBER_TYPE_LABELS } from '@/lib/member-types.js';
import tableStyles from '@/components/AdminTable.module.css';

export default async function AdminOverview() {
  const t = await getTranslations('admin');
  const locale = await getLocale();
  const [consultations, referrals, partnerships, members] = await Promise.all([
    listConsultations(), listReferrals(), listPartnerships(), listMembers(),
  ]);
  const stats = [
    { label: t('navConsultations'), n: consultations.length },
    { label: t('navReferrals'), n: referrals.length },
    { label: t('navPartnerships'), n: partnerships.length },
    { label: t('navMembers'), n: members.length },
  ];
  const recentMembers = members.slice(0, 8);
  const fmtDate = (v) => (v ? new Date(v).toLocaleDateString(locale === 'ar' ? 'ar-KW' : 'en-GB', { year: 'numeric', month: 'short', day: 'numeric' }) : '—');

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

      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBlock: '2.5rem 1rem', flexWrap: 'wrap', gap: '.75rem' }}>
        <h2 className="display d-3" style={{ margin: 0 }}>{t('recentMembersHeading')}</h2>
        <Link href="/admin/members" className="body" style={{ fontSize: '.88rem', color: 'var(--clay)' }}>{t('viewAllMembers')}</Link>
      </div>

      {recentMembers.length === 0 ? (
        <p className="body" style={{ color: 'var(--muted)' }}>{t('emptyList')}</p>
      ) : (
        <div className={tableStyles.wrap}>
          <table className={tableStyles.table}>
            <thead>
              <tr>
                <th>{t('colName')}</th>
                <th>{t('colType')}</th>
                <th>{t('colEmail')}</th>
                <th>{t('colPhone')}</th>
                <th>{t('colDate')}</th>
              </tr>
            </thead>
            <tbody>
              {recentMembers.map((m) => (
                <tr key={m.id}>
                  <td>
                    {m.display_name}
                    {m.role === 'admin' && (
                      <span style={{ marginInlineStart: '.5rem', fontSize: '.72rem', fontWeight: 700, color: '#8D4A07', background: '#FCF1DE', padding: '.1rem .5rem', borderRadius: '999px' }}>Admin</span>
                    )}
                    {!m.is_active && (
                      <span style={{ marginInlineStart: '.5rem', fontSize: '.72rem', fontWeight: 700, color: '#A7201B', background: '#FBEAE9', padding: '.1rem .5rem', borderRadius: '999px' }}>معطَّل</span>
                    )}
                  </td>
                  <td>{MEMBER_TYPE_LABELS[m.member_type] || m.member_type}</td>
                  <td dir="ltr">{m.email}</td>
                  <td dir="ltr">{m.phone || '—'}</td>
                  <td>{fmtDate(m.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
