'use client';
import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation.js';
import { createArticle } from '@/app/actions/content.js';

export default function NewArticleForm() {
  const t = useTranslations('admin');
  const router = useRouter();
  const [locale, setLocale] = useState('ar');
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [body, setBody] = useState('');
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState('');

  function create() {
    if (!title.trim()) return;
    setError('');
    startTransition(async () => {
      const res = await createArticle({ locale, title, excerpt, body });
      if (res?.error) { setError(res.error); return; }
      router.push(`/admin/insights/${res.id}`);
    });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '640px' }}>
      <p className="body" style={{ color: 'var(--muted)', fontSize: '.85rem' }}>{t('contentCreateHint')}</p>
      <div style={{ display: 'flex', gap: '.4rem' }}>
        {['ar', 'en'].map((loc) => (
          <button key={loc} type="button" onClick={() => setLocale(loc)} style={{
            font: 'inherit', fontSize: '.88rem', padding: '.5rem 1.1rem', borderRadius: 'var(--r)',
            background: locale === loc ? 'var(--clay)' : 'transparent', color: locale === loc ? '#fff' : 'var(--platinum-2)',
            boxShadow: locale === loc ? 'none' : 'inset 0 0 0 1px var(--hair-light-strong)', cursor: 'pointer',
          }}>{loc === 'ar' ? t('contentLocaleAr') : t('contentLocaleEn')}</button>
        ))}
      </div>
      <label className="body" style={{ fontSize: '.85rem', color: 'var(--platinum-3)' }}>
        {t('contentTitle')}
        <input value={title} onChange={(e) => setTitle(e.target.value)}
          style={{ display: 'block', width: '100%', marginBlockStart: '.35rem', font: 'inherit', fontSize: '.95rem', background: 'var(--surface-2)', color: 'var(--ink)', border: '1px solid var(--hair-light-strong)', borderRadius: 'var(--r)', padding: '.6rem .75rem' }} />
      </label>
      <label className="body" style={{ fontSize: '.85rem', color: 'var(--platinum-3)' }}>
        {t('contentExcerpt')}
        <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={2}
          style={{ display: 'block', width: '100%', marginBlockStart: '.35rem', font: 'inherit', fontSize: '.9rem', background: 'var(--surface-2)', color: 'var(--ink)', border: '1px solid var(--hair-light-strong)', borderRadius: 'var(--r)', padding: '.6rem .75rem', resize: 'vertical' }} />
      </label>
      <label className="body" style={{ fontSize: '.85rem', color: 'var(--platinum-3)' }}>
        {t('contentBody')}
        <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={8}
          style={{ display: 'block', width: '100%', marginBlockStart: '.35rem', font: 'inherit', fontSize: '.9rem', lineHeight: 1.7, background: 'var(--surface-2)', color: 'var(--ink)', border: '1px solid var(--hair-light-strong)', borderRadius: 'var(--r)', padding: '.75rem', resize: 'vertical' }} />
      </label>
      {error && <p style={{ color: '#B42722', fontSize: '.85rem' }}>{error}</p>}
      <div>
        <button type="button" className="btn btn-solid" disabled={pending || !title.trim()} onClick={create}>{t('contentCreate')}</button>
      </div>
    </div>
  );
}
