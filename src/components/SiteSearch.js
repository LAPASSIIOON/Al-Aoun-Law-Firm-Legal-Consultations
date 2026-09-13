'use client';
import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation.js';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser.js';
import styles from './SiteSearch.module.css';

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
    <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

function normalizeSearchText(value) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f\u064B-\u065F\u0670\u0640]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .toLocaleLowerCase();
}

/** بحث في المحتوى العام المنشور، مع فهرس صغير يُحمَّل مرة واحدة عند أول استخدام. */
export default function SiteSearch({ locale }) {
  const t = useTranslations('search');
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);
  const indexRef = useRef(null);

  useEffect(() => {
    if (open) { document.body.style.overflow = 'hidden'; setTimeout(() => inputRef.current?.focus(), 50); }
    else { document.body.style.overflow = ''; setQ(''); setResults([]); }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (q.trim().length < 2) { setResults([]); return; }
    setLoading(true);
    let cancelled = false;
    debounceRef.current = setTimeout(async () => {
      const needle = normalizeSearchText(q.trim());
      if (!indexRef.current) {
        const supabase = createSupabaseBrowserClient();
        indexRef.current = Promise.all([
          supabase.from('practice_area_translations')
            .select('slug,title,summary')
            .eq('locale', locale).eq('status', 'published').eq('legal_approved', true),
          supabase.from('article_translations')
            .select('slug,title,excerpt,articles!inner(is_active,published_at)')
            .eq('locale', locale).eq('status', 'published').eq('legal_approved', true)
            .eq('articles.is_active', true).not('articles.published_at', 'is', null)
            .lte('articles.published_at', new Date().toISOString()),
        ]).then(([areasResult, articlesResult]) => [
          ...(areasResult.data || []).map((item) => ({
            kind: 'practice_area', slug: item.slug, title: item.title, snippet: item.summary,
          })),
          ...(articlesResult.data || []).map((item) => ({
            kind: 'article', slug: item.slug, title: item.title, snippet: item.excerpt,
          })),
        ]);
      }
      const index = await indexRef.current;
      if (cancelled) return;
      const matches = index
        .filter((item) => normalizeSearchText(`${item.title} ${item.snippet || ''} ${item.slug}`).includes(needle))
        .slice(0, 8)
      setResults(matches);
      setLoading(false);
    }, 280);
    return () => { cancelled = true; clearTimeout(debounceRef.current); };
  }, [q, locale]);

  return (
    <>
      <button className={styles.trigger} aria-label={t('open')} onClick={() => setOpen(true)}>
        <SearchIcon />
      </button>
      {open && (
        <div className={styles.overlay} role="dialog" aria-modal="true" aria-label={t('title')}>
          <button className={styles.scrim} aria-label={t('close')} onClick={() => setOpen(false)} />
          <div className={styles.panel}>
            <div className={styles.inputRow}>
              <SearchIcon />
              <input
                ref={inputRef}
                className={styles.input}
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t('placeholder')}
                aria-label={t('title')}
              />
              <button className={styles.close} aria-label={t('close')} onClick={() => setOpen(false)}>×</button>
            </div>

            <div className={styles.results}>
              {loading && <p className={styles.hint}>{t('searching')}</p>}
              {!loading && q.trim().length >= 2 && results.length === 0 && (
                <p className={styles.hint}>{t('noResults')}</p>
              )}
              {!loading && q.trim().length < 2 && (
                <p className={styles.hint}>{t('hint')}</p>
              )}
              {results.map((r) => (
                <Link
                  key={`${r.kind}-${r.slug}`}
                  href={r.kind === 'practice_area' ? `/services/${r.slug}` : `/insights/${r.slug}`}
                  className={styles.result}
                  onClick={() => setOpen(false)}
                >
                  <span className={styles.resultKind}>
                    {r.kind === 'practice_area' ? t('kindPracticeArea') : t('kindInsight')}
                  </span>
                  <span className={styles.resultTitle}>{r.title}</span>
                  {r.snippet && <span className={styles.resultSnippet}>{r.snippet}</span>}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
