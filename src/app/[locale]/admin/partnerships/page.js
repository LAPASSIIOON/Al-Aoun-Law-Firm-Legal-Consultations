import { getTranslations } from 'next-intl/server';
import { listPartnerships } from '@/app/actions/admin.js';
import AdminTable from '@/components/AdminTable.js';

const STAGES = ['new','under_review','contacted','declined','active'];

export default async function AdminPartnerships() {
  const t = await getTranslations('admin');
  const rows = await listPartnerships();
  return (
    <>
      <h1 className="display d-2" style={{ marginBlockEnd: '1.5rem' }}>{t('navPartnerships')}</h1>
      <AdminTable
        rows={rows} tableType="partnership" stageOptions={STAGES} emptyLabel={t('emptyList')}
        columns={[
          { key: 'reference', label: 'Ref' }, { key: 'firm_name', label: 'Firm' },
          { key: 'contact_name', label: 'Contact' }, { key: 'applicant_type', label: 'Type' },
          { key: 'email', label: 'Email' }, { key: 'created_at', label: 'Date' },
        ]}
      />
    </>
  );
}
