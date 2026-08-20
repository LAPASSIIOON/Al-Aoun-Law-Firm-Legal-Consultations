import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation.js';
import { getMyContentRole } from '@/app/actions/content.js';
import NewArticleForm from '@/components/NewArticleForm.js';

export default async function AdminNewInsight() {
  const t = await getTranslations('admin');
  const myRole = await getMyContentRole();

  return (
    <>
      <Link href="/admin/insights" className="body" style={{ fontSize: '.85rem', color: 'var(--clay)', display: 'inline-block', marginBlockEnd: '1rem' }}>
        {t('contentBackToList')}
      </Link>
      <h1 className="display d-2" style={{ marginBlockEnd: '1.5rem' }}>{t('contentNewInsight')}</h1>
      {!myRole ? (
        <p className="body" style={{ color: '#B42722' }}>{t('contentNoAccess')}</p>
      ) : (
        <NewArticleForm />
      )}
    </>
  );
}
