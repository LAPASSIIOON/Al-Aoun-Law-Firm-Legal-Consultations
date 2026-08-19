import { getTranslations, getLocale } from 'next-intl/server';
import { listAuditLog } from '@/app/actions/admin.js';

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

export default async function AdminAudit() {
  const t = await getTranslations('admin');
  const locale = await getLocale();
  const rows = await listAuditLog();
  const fmtDateTime = (v) => new Date(v).toLocaleString(locale === 'ar' ? 'ar-KW' : 'en-GB');
  return (
    <>
      <h1 className="display d-2" style={{ marginBlockEnd: '.5rem' }}>{t('navAudit')}</h1>
      <p className="body" style={{ color: 'var(--muted)', marginBlockEnd: '1.5rem', fontSize: '.9rem' }}>
        {t('auditIntro')}
      </p>
      {rows.length === 0 ? (
        <p className="body" style={{ color: 'var(--muted)' }}>{t('emptyList')}</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
          {rows.map((r) => (
            <div key={r.id} style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem 1rem', alignItems: 'baseline', padding: '.75rem 1rem', borderRadius: 'var(--r)', boxShadow: 'inset 0 0 0 1px var(--hair-light-strong)', fontSize: '.88rem' }}>
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
