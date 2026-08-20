import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/navigation.js';
import { getPracticeArea, getMyContentRole } from '@/app/actions/content.js';
import { createAnonClient } from '@/lib/supabase-server.js';
import PracticeAreaEditor from '@/components/PracticeAreaEditor.js';

export default async function AdminPracticeAreaEdit({ params }) {
  const { id } = await params;
  const t = await getTranslations('admin');
  const [area, myRole] = await Promise.all([getPracticeArea(id), getMyContentRole()]);
  if (!area) notFound();

  // أسماء المعتمِدين (profiles) لعرضها بشرية بدل UUID خام
  const approverIds = [...new Set(area.practice_area_translations.map((tr) => tr.legal_approved_by).filter(Boolean))];
  let approverNames = {};
  if (approverIds.length) {
    const supabase = createAnonClient();
    const { data } = await supabase.from('profiles').select('id, full_name').in('id', approverIds);
    approverNames = Object.fromEntries((data || []).map((p) => [p.id, p.full_name]));
  }

  const translations = area.practice_area_translations.map((tr) => ({
    ...tr, approverName: tr.legal_approved_by ? approverNames[tr.legal_approved_by] : null,
  }));

  return (
    <>
      <Link href="/admin/practice-areas" className="body" style={{ fontSize: '.85rem', color: 'var(--clay)', display: 'inline-block', marginBlockEnd: '1rem' }}>
        {t('contentBackToList')}
      </Link>
      {!myRole && <p className="body" style={{ color: '#B42722' }}>{t('contentNoAccess')}</p>}
      <PracticeAreaEditor practiceAreaId={id} translations={translations} myRole={myRole} isActive={area.is_active} />
    </>
  );
}
