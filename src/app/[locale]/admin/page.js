import { getTranslations, getLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation.js';
import {
  listConsultations, listReferrals, listPartnerships, listMembers, listAuditLog,
} from '@/app/actions/admin.js';
import { listPracticeAreas, listArticles } from '@/app/actions/content.js';

const ACTION_KEYS = {
  stage_updated: 'actionLabelStageUpdated',
  notes_updated: 'actionLabelNotesUpdated',
  'member.role_updated': 'actionLabelMemberRoleUpdated',
  'member.type_updated': 'actionLabelMemberTypeUpdated',
  'consultation.submitted': 'actionLabelSubmitted',
  'referral.submitted': 'actionLabelSubmitted',
  'partnership_application.submitted': 'actionLabelSubmitted',
};
const ENTITY_KEYS = {
  consultation: 'entityLabelConsultation',
  consultation_requests: 'entityLabelConsultation',
  referral: 'entityLabelReferral',
  referrals: 'entityLabelReferral',
  partnership: 'entityLabelPartnership',
  partnership_applications: 'entityLabelPartnership',
  portal_members: 'entityLabelMember',
};

/** صف واحد في نطاق "يحتاج انتباهك" — عنصر عملي قابل للنقر مباشرةً لمكان التنفيذ، لا رقم زخرفي. */
function AttentionRow({ href, count, label }) {
  return (
    <Link href={href} style={{
      display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.1rem',
      borderRadius: 'var(--r)', boxShadow: 'inset 0 0 0 1px var(--hair-light-strong)',
      borderInlineStart: '3px solid #A0630D', transition: 'background .2s ease',
    }}>
      <span style={{ fontFamily: 'var(--f-display)', fontSize: '1.6rem', color: '#A0630D', flexShrink: 0, minWidth: '2ch' }}>{count}</span>
      <span className="body" style={{ color: 'var(--ink)', fontSize: '.95rem', flex: 1 }}>{label}</span>
      <span style={{ color: 'var(--clay-bright)', fontSize: '.85rem', whiteSpace: 'nowrap' }}>→</span>
    </Link>
  );
}

/** بطاقة مؤشر إجمالي — سياق حجم التشغيل، منفصلة عمدًا عن "يحتاج انتباهك" (العاجل) كي لا يتكرر نفس الرقم بإطارين مختلفين. */
function KpiCard({ href, n, label }) {
  return (
    <Link href={href} style={{
      display: 'block', padding: '1.5rem', borderRadius: 'var(--r-lg)',
      boxShadow: 'inset 0 0 0 1px var(--hair-light-strong)', transition: 'box-shadow .2s ease',
    }}>
      <div style={{ fontFamily: 'var(--f-display)', fontSize: '2.2rem', color: 'var(--ink)' }}>{n}</div>
      <div className="body" style={{ color: 'var(--muted)', fontSize: '.9rem' }}>{label}</div>
    </Link>
  );
}

export default async function AdminOverview() {
  const t = await getTranslations('admin');
  const locale = await getLocale();
  const [consultations, referrals, partnerships, members, activity, practiceAreas, articles] = await Promise.all([
    listConsultations(), listReferrals(), listPartnerships(), listMembers(), listAuditLog(6),
    listPracticeAreas(), listArticles(),
  ]);

  const newConsultations = consultations.filter((r) => r.stage === 'new').length;
  const newReferrals = referrals.filter((r) => r.stage === 'new').length;
  const newPartnerships = partnerships.filter((r) => r.stage === 'new').length;
  const totalAttention = newConsultations + newReferrals + newPartnerships;

  const paReview = practiceAreas.filter((a) => a.practice_area_translations.some((tr) => tr.status === 'legal_review')).length;
  const insightsReview = articles.filter((a) => a.article_translations.some((tr) => tr.status === 'legal_review')).length;
  const totalContentAttention = paReview + insightsReview;

  const fmtDateTime = (v) => (v ? new Date(v).toLocaleString(locale === 'ar' ? 'ar-KW' : 'en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—');

  return (
    <>
      <h1 className="display d-2" style={{ marginBlockEnd: '.4rem' }}>{t('welcomeBack')}</h1>
      <p className="body" style={{ color: 'var(--muted)', marginBlockEnd: '2.25rem' }}>{t('overviewSubhead')}</p>

      {/* يحتاج انتباهك — إجراءات فعلية بس، من بيانات حقيقية، لا زخرفة */}
      <h2 style={{ fontFamily: 'var(--f-en)', fontSize: '.75rem', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--platinum-3)', marginBlockEnd: '.9rem' }}>
        {t('needsAttentionHeading')}
      </h2>
      {(totalAttention + totalContentAttention) === 0 ? (
        <p className="body" style={{ color: 'var(--muted)', padding: '1rem 1.1rem', borderRadius: 'var(--r)', boxShadow: 'inset 0 0 0 1px var(--hair-light-strong)' }}>
          {t('needsAttentionEmpty')}
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
          {newConsultations > 0 && (
            <AttentionRow href="/admin/consultations" count={newConsultations} label={t('needsAttentionConsultations', { count: newConsultations })} />
          )}
          {newReferrals > 0 && (
            <AttentionRow href="/admin/referrals" count={newReferrals} label={t('needsAttentionReferrals', { count: newReferrals })} />
          )}
          {newPartnerships > 0 && (
            <AttentionRow href="/admin/partnerships" count={newPartnerships} label={t('needsAttentionPartnerships', { count: newPartnerships })} />
          )}
          {paReview > 0 && (
            <AttentionRow href="/admin/practice-areas" count={paReview} label={t('needsAttentionPracticeAreasReview', { count: paReview })} />
          )}
          {insightsReview > 0 && (
            <AttentionRow href="/admin/insights" count={insightsReview} label={t('needsAttentionInsightsReview', { count: insightsReview })} />
          )}
        </div>
      )}

      {/* مؤشرات الحجم الإجمالي — سياق، مش عاجل */}
      <div className="grid cols-4" style={{ gap: '1.25rem', marginBlockStart: '2.5rem' }}>
        <KpiCard href="/admin/consultations" n={consultations.length} label={t('kpiTotalConsultations')} />
        <KpiCard href="/admin/referrals" n={referrals.length} label={t('kpiTotalReferrals')} />
        <KpiCard href="/admin/partnerships" n={partnerships.length} label={t('kpiTotalPartnerships')} />
        <KpiCard href="/admin/members" n={members.length} label={t('kpiTotalMembers')} />
      </div>

      {/* آخر النشاطات — من سجل التدقيق الحقيقي (ops.audit_log)، لا بيانات وهمية */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBlock: '2.75rem 1rem', flexWrap: 'wrap', gap: '.75rem' }}>
        <h2 className="display d-3" style={{ margin: 0 }}>{t('recentActivityHeading')}</h2>
        <Link href="/admin/audit" className="body" style={{ fontSize: '.88rem', color: 'var(--clay)' }}>{t('viewFullAuditLog')}</Link>
      </div>
      {activity.length === 0 ? (
        <p className="body" style={{ color: 'var(--muted)' }}>{t('recentActivityEmpty')}</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
          {activity.map((r) => (
            <div key={r.id} style={{
              display: 'flex', flexWrap: 'wrap', gap: '.5rem 1rem', alignItems: 'baseline',
              padding: '.75rem 1rem', borderRadius: 'var(--r)', boxShadow: 'inset 0 0 0 1px var(--hair-light-strong)', fontSize: '.88rem',
            }}>
              <span style={{ fontWeight: 700, color: 'var(--ink)' }}>{t(ACTION_KEYS[r.action]) || r.action}</span>
              <span style={{ color: 'var(--muted)' }}>{t(ENTITY_KEYS[r.entity]) || r.entity}</span>
              {r.detail?.from && r.detail?.to && (
                <span style={{ color: 'var(--muted)' }} dir="ltr">{r.detail.from} → {r.detail.to}</span>
              )}
              <span style={{ marginInlineStart: 'auto', color: 'var(--clay)' }}>{r.actor_name}</span>
              <span style={{ color: 'var(--muted)', fontSize: '.8rem' }}>{fmtDateTime(r.at)}</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
