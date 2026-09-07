import { getTranslations, setRequestLocale } from 'next-intl/server';
import { altLangs } from '@/lib/i18n-meta.js';
import { Link } from '@/i18n/navigation.js';
import { createAnonClient } from '@/lib/supabase-server.js';
import ReferenceRow from '@/components/ReferenceRow.js';
import s from '../shared.module.css';
import ins from '../insights.module.css';

export const revalidate = 300;
export function generateStaticParams() { return [{ locale: 'ar' }, { locale: 'en' }]; }
export async function generateMetadata({ params }) { const { locale } = await params; const t = await getTranslations({ locale, namespace: 'insights' }); return { title: t('heading'), description: t('subhead'), alternates: altLangs(locale, '/insights') }; }

export default async function Insights({ params }) {
  const { locale } = await params; setRequestLocale(locale);
  const t = await getTranslations('insights');
  const tp = await getTranslations('insightsPage');
  const n = await getTranslations('nav');
  /* عقد النشر ببوابتيه معًا: بوابة الترجمة (منشورة ومعتمَدة قانونيًا) + بوابة المقال الأب
     (مفعَّل، وله تاريخ نشر فعلي في الماضي) — الربط الداخلي يُسقط أي ترجمة أبوها غير منشور. */
  /* D4-A: تمييز صريح بين «أرشيف فارغ فعلًا» و«تعذّر تحميل البيانات». خطأ الاستعلام
     أو انقطاع الاتصال يرفع loadFailed ولا يُعرض أبدًا كأرشيف فارغ — الزائر يُخبَر
     بصدق أن العطل مؤقّت. لا تفاصيل داخلية للخطأ تُعرض ولا تُسجَّل هنا. */
  let rows = [];
  let loadFailed = false;
  try {
    const supabase = createAnonClient();
    const nowIso = new Date().toISOString();
    const { data, error } = await supabase.from('article_translations')
      .select('slug, title, excerpt, created_at, articles!inner(id)').eq('locale', locale).eq('status', 'published').eq('legal_approved', true)
      .eq('articles.is_active', true).not('articles.published_at', 'is', null).lte('articles.published_at', nowIso)
      .order('created_at', { ascending: false });
    if (error) loadFailed = true; else rows = data || [];
  } catch (e) { loadFailed = true; }
  const fmtDate = (v) => new Date(v).toLocaleDateString(locale === 'ar' ? 'ar-KW' : 'en-GB', { year: 'numeric', month: 'short' });
  return (
    <>
      <section className={`on-espresso ${s.pageHead} section-tight`}>
        <div className="wrap">
          <span className="eyebrow" data-reveal>{t('eyebrow')}</span>
          <h1 className="display d-1" data-reveal style={{ marginBlock: '1.2rem 1.5rem' }}>{t('heading')}</h1>
          <p className="lead" data-reveal style={{ maxWidth: '52ch' }}>{tp('lead')}</p>
        </div>
      </section>
      <section className="on-ivory section">
        <div className="wrap">
          {rows.length > 0 ? (
            <div>
              {rows.map((r, i) => (
                <ReferenceRow key={r.slug} index={i + 1} title={r.title} href={`/insights/${r.slug}`}
                  summary={r.excerpt} meta={fmtDate(r.created_at)} />
              ))}
            </div>
          ) : loadFailed ? (
            /* تعذّر التحميل: بيان مؤقّت صريح + مخرج واحد للتواصل بشأن مسألة محددة */
            <div className={ins.notice} data-reveal>
              <h2 className={ins.noticeHead}>{t('errorHeading')}</h2>
              <p className={ins.noticeBody}>{t('errorBody')}</p>
              <div className={ins.actions}>
                <Link href="/contact" className={ins.action}>
                  {n('contact')} <span className={ins.arrow} aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          ) : (
            /* أرشيف فارغ فعلًا: بيان مؤسسي بلا وعد زمني، ومخرجان إلى ما هو قائم */
            <div className={ins.notice} data-reveal>
              <span className="eyebrow">{t('emptyEyebrow')}</span>
              <p className={ins.noticeBody}>{t('emptyBody')}</p>
              <div className={ins.actions}>
                <Link href="/services" className={ins.action}>
                  {n('services')} <span className={ins.arrow} aria-hidden="true">→</span>
                </Link>
                <Link href="/contact" className={ins.action}>
                  {n('contact')} <span className={ins.arrow} aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
