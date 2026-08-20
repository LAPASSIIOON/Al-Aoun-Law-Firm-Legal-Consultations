import { getTranslations, getLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/navigation.js';
import { getMatterAdmin, getCurrentUserId } from '@/app/actions/matters.js';
import MatterFilesPanel from '@/components/MatterFilesPanel.js';

export default async function AdminMatterDetail({ params }) {
  const { id } = await params;
  const t = await getTranslations('admin');
  const locale = await getLocale();
  const [matter, userId] = await Promise.all([getMatterAdmin(id), getCurrentUserId()]);
  if (!matter) notFound();
  const fmtDate = (v) => new Date(v).toLocaleDateString(locale === 'ar' ? 'ar-KW' : 'en-GB');

  return (
    <>
      <Link href="/admin/matters" className="body" style={{ fontSize: '.85rem', color: 'var(--clay)', display: 'inline-block', marginBlockEnd: '1rem' }}>
        {t('matterBackToList')}
      </Link>
      <h1 className="display d-2" style={{ marginBlockEnd: '.4rem' }}>{matter.title}</h1>
      <p className="body" style={{ color: 'var(--muted)', marginBlockEnd: '2rem' }}>
        {matter.client_name} · {matter.client_email}
        {matter.reference && <> · {matter.reference}</>}
        {' · '}{t(`matterStatus_${matter.status}`)}
        {' · '}{fmtDate(matter.created_at)}
      </p>
      <MatterFilesPanel matterId={matter.id} files={matter.files} currentUserId={userId} clientId={matter.client_id} />
    </>
  );
}
