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
          { key: 'reference', label: t('colRef') }, { key: 'firm_name', label: t('colFirm') },
          { key: 'contact_name', label: t('colContact') }, { key: 'applicant_type', label: t('colType') },
          { key: 'email', label: t('colEmail') }, { key: 'created_at', label: t('colSubmitted') },
        ]}
      />
    </>
  );
}
