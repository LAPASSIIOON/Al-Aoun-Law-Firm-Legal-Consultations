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
          { key: 'reference', label: 'Ref' }, { key: 'referring_firm_name', label: 'Firm' },
          { key: 'referring_contact_name', label: 'Contact' }, { key: 'referring_contact_email', label: 'Email' },
          { key: 'urgency', label: 'Urgency' }, { key: 'created_at', label: 'Date' },
        ]}
      />
    </>
  );
}
