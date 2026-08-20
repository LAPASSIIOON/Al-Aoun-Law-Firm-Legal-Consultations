import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation.js';
import NewMatterForm from '@/components/NewMatterForm.js';

export default async function AdminNewMatter() {
  const t = await getTranslations('admin');
  return (
    <>
      <Link href="/admin/matters" className="body" style={{ fontSize: '.85rem', color: 'var(--clay)', display: 'inline-block', marginBlockEnd: '1rem' }}>
        {t('matterBackToList')}
      </Link>
      <h1 className="display d-2" style={{ marginBlockEnd: '1.5rem' }}>{t('matterNew')}</h1>
      <NewMatterForm />
    </>
  );
}
