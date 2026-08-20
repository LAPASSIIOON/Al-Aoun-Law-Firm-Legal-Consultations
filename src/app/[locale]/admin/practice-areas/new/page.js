import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation.js';
import { getMyContentRole } from '@/app/actions/content.js';
import NewPracticeAreaForm from '@/components/NewPracticeAreaForm.js';

export default async function AdminNewPracticeArea() {
  const t = await getTranslations('admin');
  const roleResult = await getMyContentRole();
  const myRole = roleResult.role;

  return (
    <>
      <Link href="/admin/practice-areas" className="body" style={{ fontSize: '.85rem', color: 'var(--clay)', display: 'inline-block', marginBlockEnd: '1rem' }}>
        {t('contentBackToList')}
      </Link>
      <h1 className="display d-2" style={{ marginBlockEnd: '1.5rem' }}>{t('contentNewPracticeArea')}</h1>
      {!myRole ? (
        <p className="body" style={{ color: '#B42722' }}>{t('contentNoAccess')} [DEBUG: {roleResult.debug}]</p>
      ) : (
        <NewPracticeAreaForm />
      )}
    </>
  );
}
