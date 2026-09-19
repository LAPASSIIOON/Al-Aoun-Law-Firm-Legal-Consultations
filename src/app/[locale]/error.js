'use client';
import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation.js';
import s from './shared.module.css';

/**
 * حدّ خطأ الصفحات العامة.
 * يُصيَّر داخل [locale]/layout.js فيرث الاتجاه والهوية وسياق الترجمة، فيرى الزائر
 * صفحة بلغته وهويّة المكتب بدل شاشة Next الافتراضية الإنجليزية غير المنسّقة.
 * error.digest معرّف يولّده Next ويقابل الخطأ في سجلّات الخادم — نعرضه ليقتبسه
 * الزائر عند التواصل، ولا نعرض رسالة الخطأ نفسها (قد تكشف تفاصيل داخلية).
 */
export default function LocaleError({ error, reset }) {
  const t = useTranslations('errorPage');

  useEffect(() => {
    // لا توجد مراقبة أخطاء إنتاجية بعد؛ هذا يُبقي الأثر متاحًا في أدوات المطوّر على الأقل.
    console.error(error);
  }, [error]);

  return (
    <section
      role="alert"
      className={`on-espresso ${s.pageHead} section`}
      style={{ minBlockSize: '70vh', display: 'flex', alignItems: 'center' }}
    >
      <div className="wrap-narrow wrap">
        <span className="idx">!</span>
        <h1 className="display d-hero" style={{ marginBlock: '1rem 1.2rem' }}>{t('heading')}</h1>
        <p className="lead" style={{ marginBlockEnd: '2rem' }}>{t('body')}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
          <button type="button" className="btn btn-solid" onClick={reset}>
            {t('retry')}<span className="arrow">→</span>
          </button>
          <Link href="/" className="btn-line">{t('back')}</Link>
        </div>
        {error?.digest && (
          <p className="body" style={{ marginBlockStart: '2rem', fontSize: '.8rem', opacity: .6 }}>
            {t('reference')} <span dir="ltr" style={{ fontFamily: 'var(--f-en)' }}>{error.digest}</span>
          </p>
        )}
      </div>
    </section>
  );
}
