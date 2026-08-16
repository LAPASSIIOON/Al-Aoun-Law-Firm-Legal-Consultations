import { getTranslations } from 'next-intl/server';
import { listMembers } from '@/app/actions/admin.js';
import MembersTable from '@/components/MembersTable.js';

export default async function AdminMembers() {
  const t = await getTranslations('admin');
  const rows = await listMembers();
  return (
    <>
      <h1 className="display d-2" style={{ marginBlockEnd: '.5rem' }}>{t('navMembers')}</h1>
      <p className="body" style={{ color: 'var(--muted)', marginBlockEnd: '1.5rem' }}>{t('membersHint')}</p>
      <MembersTable rows={rows} emptyLabel={t('emptyList')} />
    </>
  );
}
