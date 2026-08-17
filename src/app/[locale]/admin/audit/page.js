import { getTranslations } from 'next-intl/server';
import { listAuditLog } from '@/app/actions/admin.js';

const ACTION_LABELS = {
  stage_updated: 'تحديث حالة', notes_updated: 'تحديث ملاحظة', 'member.role_updated': 'تحديث صلاحية عضو',
};
const ENTITY_LABELS = {
  consultation: 'طلب استشارة', referral: 'إحالة', partnership: 'طلب تعاون', portal_members: 'عضو',
};

export default async function AdminAudit() {
  const t = await getTranslations('admin');
  const rows = await listAuditLog();
  return (
    <>
      <h1 className="display d-2" style={{ marginBlockEnd: '.5rem' }}>{t('navAudit')}</h1>
      <p className="body" style={{ color: 'var(--muted)', marginBlockEnd: '1.5rem', fontSize: '.9rem' }}>
        سجلّ كل تغيير جرى على الطلبات والصلاحيات — من غيّر وماذا ومتى.
      </p>
      {rows.length === 0 ? (
        <p className="body" style={{ color: 'var(--muted)' }}>{t('emptyList')}</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
          {rows.map((r) => (
            <div key={r.id} style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem 1rem', alignItems: 'baseline', padding: '.75rem 1rem', borderRadius: 'var(--r)', boxShadow: 'inset 0 0 0 1px var(--hair-light-strong)', fontSize: '.88rem' }}>
              <span style={{ fontWeight: 700, color: 'var(--ink)' }}>{ACTION_LABELS[r.action] || r.action}</span>
              <span style={{ color: 'var(--muted)' }}>{ENTITY_LABELS[r.entity] || r.entity}</span>
              {r.detail?.from && r.detail?.to && (
                <span style={{ color: 'var(--muted)' }} dir="ltr">{r.detail.from} → {r.detail.to}</span>
              )}
              <span style={{ marginInlineStart: 'auto', color: 'var(--clay)' }}>{r.actor_name}</span>
              <span style={{ color: 'var(--muted)', fontSize: '.8rem' }}>{new Date(r.at).toLocaleString('ar-KW')}</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
