import { getTranslations } from 'next-intl/server';
import { listConsultations } from '@/app/actions/admin.js';
import AdminTable from '@/components/AdminTable.js';

const STAGES = ['new', 'triage', 'conflict_check', 'cleared', 'conflict_found', 'contacted', 'closed'];

export default async function AdminConsultations() {
  const t = await getTranslations('admin');
  const rows = await listConsultations();
  return (
    <>
      <h1 className="display d-2" style={{ marginBlockEnd: '1.5rem' }}>{t('navConsultations')}</h1>
      <AdminTable
        rows={rows} tableType="consultation" stageOptions={STAGES} emptyLabel={t('emptyList')}
        columns={[
          { key: 'reference', label: 'Ref' }, { key: 'full_name', label: 'Name' },
          { key: 'client_type', label: 'Type' }, { key: 'phone', label: 'Phone' },
          { key: 'email', label: 'Email' }, { key: 'created_at', label: 'Date' },
        ]}
      />
    </>
  );
}
