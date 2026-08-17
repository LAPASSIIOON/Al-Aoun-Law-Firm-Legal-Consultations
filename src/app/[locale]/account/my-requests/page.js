import { redirect } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getCurrentMember, createSupabaseServerClient } from '@/lib/supabase-auth-server.js';
import { signOutAction } from '@/app/actions/auth.js';

export const dynamic = 'force-dynamic';

const STAGE_LABELS_AR = { new: 'جديد', triaged: 'قيد الفرز', conflict_check: 'فحص تعارض', assigned: 'مُسنَد', in_progress: 'قيد المتابعة', closed: 'مُغلَق', declined: 'مرفوض' };
const STAGE_LABELS_EN = { new: 'New', triaged: 'Triaged', conflict_check: 'Conflict Check', assigned: 'Assigned', in_progress: 'In Progress', closed: 'Closed', declined: 'Declined' };

async function fetchAll() {
  const supabase = await createSupabaseServerClient();
  const [c, r, p] = await Promise.all([
    supabase.rpc('my_consultations'), supabase.rpc('my_referrals'), supabase.rpc('my_partnerships'),
  ]);
  return { consultations: c.data || [], referrals: r.data || [], partnerships: p.data || [] };
}

/** @param {{ params: Promise<{ locale: string }> }} props */
export default async function MyRequests({ params }) {
  const { locale } = await params; setRequestLocale(locale);
  const t = await getTranslations('myRequests');
  const member = await getCurrentMember();
  if (!member) redirect(`/${locale}/account/sign-in`);

  const { consultations, referrals, partnerships } = await fetchAll();
  const STAGE = locale === 'ar' ? STAGE_LABELS_AR : STAGE_LABELS_EN;
  const total = consultations.length + referrals.length + partnerships.length;

  const Row = ({ title, sub, stage, date }) => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.75rem', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 0', borderBlockEnd: '1px solid var(--hair-light-strong)' }}>
      <div>
        <div style={{ fontFamily: 'var(--f-display)', fontSize: '1.05rem' }}>{title}</div>
        {sub && <div className="body" style={{ fontSize: '.85rem', color: 'var(--muted)' }}>{sub}</div>}
        <div className="body" style={{ fontSize: '.78rem', color: 'var(--muted)' }}>{new Date(date).toLocaleDateString(locale === 'ar' ? 'ar-KW' : 'en-GB')}</div>
      </div>
      <span style={{ fontSize: '.8rem', fontWeight: 700, padding: '.3rem .75rem', borderRadius: '999px', background: 'var(--surface-2)', color: 'var(--clay-bright)', whiteSpace: 'nowrap' }}>
        {STAGE[stage] || stage}
      </span>
    </div>
  );

  return (
    <section className="on-white section">
      <div className="wrap-narrow wrap">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-start', justifyContent: 'space-between', marginBlockEnd: '.5rem' }}>
          <h1 className="display d-2" style={{ margin: 0 }}>{t('heading')}</h1>
          <form action={async () => { 'use server'; await signOutAction(locale); }}>
            <button type="submit" className="btn-line" style={{ fontSize: '.85rem' }}>{locale === 'ar' ? 'تسجيل الخروج' : 'Sign Out'}</button>
          </form>
        </div>
        <p className="lead" style={{ marginBlockEnd: '2.5rem', maxWidth: '52ch' }}>{t('lead')}</p>

        {total === 0 ? (
          <p className="body" style={{ color: 'var(--muted)' }}>{t('empty')}</p>
        ) : (
          <>
            {consultations.length > 0 && (
              <div style={{ marginBlockEnd: '2.5rem' }}>
                <h2 className="display d-3" style={{ marginBlockEnd: '.5rem', fontSize: '1.3rem' }}>{t('consultationsHeading')}</h2>
                {consultations.map((c) => <Row key={c.id} title={t('consultationLabel')} sub={c.email} stage={c.stage} date={c.created_at} />)}
              </div>
            )}
            {referrals.length > 0 && (
              <div style={{ marginBlockEnd: '2.5rem' }}>
                <h2 className="display d-3" style={{ marginBlockEnd: '.5rem', fontSize: '1.3rem' }}>{t('referralsHeading')}</h2>
                {referrals.map((r) => <Row key={r.id} title={r.reference || t('referralLabel')} sub={r.referring_firm_name} stage={r.stage} date={r.created_at} />)}
              </div>
            )}
            {partnerships.length > 0 && (
              <div>
                <h2 className="display d-3" style={{ marginBlockEnd: '.5rem', fontSize: '1.3rem' }}>{t('partnershipsHeading')}</h2>
                {partnerships.map((p) => <Row key={p.id} title={t('partnershipLabel')} sub={p.email} stage={p.stage} date={p.created_at} />)}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
