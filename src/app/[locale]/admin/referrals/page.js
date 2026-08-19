import { getTranslations } from 'next-intl/server';
import { listReferrals } from '@/app/actions/admin.js';
import AdminTable from '@/components/AdminTable.js';

const STAGES = ['new','triaged','conflict_check','cleared','conflict_found','partner_matching','partner_contacted','client_introduced','handled_internally','no_coverage','active','completed','closed'];

export default async function AdminReferrals() {
  const t = await getTranslations('admin');
  const rows = await listReferrals();
  return (
    <>
      <h1 className="display d-2" style={{ marginBlockEnd: '1.5rem' }}>{t('navReferrals')}</h1>
      <AdminTable
        rows={rows} tableType="referral" stageOptions={STAGES} emptyLabel={t('emptyList')}
        columns={[
          { key: 'reference', label: t('colRef') }, { key: 'referring_firm_name', label: t('colFirm') },
          { key: 'referring_contact_name', label: t('colContact') }, { key: 'referring_contact_email', label: t('colEmail') },
          { key: 'urgency', label: t('colUrgency') }, { key: 'created_at', label: t('colSubmitted') },
        ]}
      />
    </>
  );
}
