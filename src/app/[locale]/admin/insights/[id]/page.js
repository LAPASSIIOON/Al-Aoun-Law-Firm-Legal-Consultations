import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/navigation.js';
import { getArticle, getMyContentRole } from '@/app/actions/content.js';
import { createAnonClient } from '@/lib/supabase-server.js';
import ArticleEditor from '@/components/ArticleEditor.js';

export default async function AdminInsightEdit({ params }) {
  const { id } = await params;
  const t = await getTranslations('admin');
  const [article, myRole] = await Promise.all([getArticle(id), getMyContentRole()]);
  if (!article) notFound();

  const approverIds = [...new Set(article.article_translations.map((tr) => tr.legal_approved_by).filter(Boolean))];
  let approverNames = {};
  if (approverIds.length) {
    const supabase = createAnonClient();
    const { data } = await supabase.from('profiles').select('id, full_name').in('id', approverIds);
    approverNames = Object.fromEntries((data || []).map((p) => [p.id, p.full_name]));
  }

  const translations = article.article_translations.map((tr) => ({
    ...tr, approverName: tr.legal_approved_by ? approverNames[tr.legal_approved_by] : null,
  }));

  return (
    <>
      <Link href="/admin/insights" className="body" style={{ fontSize: '.85rem', color: 'var(--clay)', display: 'inline-block', marginBlockEnd: '1rem' }}>
        {t('contentBackToList')}
      </Link>
      {!myRole && <p className="body" style={{ color: '#B42722' }}>{t('contentNoAccess')}</p>}
      <ArticleEditor articleId={id} translations={translations} myRole={myRole} isActive={article.is_active} />
    </>
  );
}
