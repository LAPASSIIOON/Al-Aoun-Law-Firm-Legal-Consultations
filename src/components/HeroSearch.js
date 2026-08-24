'use client';
import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation.js';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser.js';
import styles from './HeroSearch.module.css';

const SearchIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
    <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

/** شريط بحث بارز في قلب الهيرو — نفس دالة search_site، بشكل مؤسسي كبير على غرار المكاتب الدولية. */
export default function HeroSearch({ locale }) {
  const t = useTranslations('search');
  const router = useRouter();
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const debounceRef = useRef(null);
  const boxRef = useRef(null);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (q.trim().length < 2) { setResults([]); return; }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase.rpc('search_site', { p_query: q.trim(), p_locale: locale });
      setResults(error ? [] : (data || []));
      setLoading(false);
    }, 280);
    return () => clearTimeout(debounceRef.current);
  }, [q, locale]);

  useEffect(() => {
    const onClick = (e) => { if (boxRef.current && !boxRef.current.contains(e.target)) setFocused(false); };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const showDrop = focused && q.trim().length >= 2;

  return (
    <div className={styles.wrap} ref={boxRef}>
      <div className={styles.field}>
        <span className={styles.icon}><SearchIcon /></span>
        <input
          className={styles.input}
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setFocused(true)}
          placeholder={t('heroPlaceholder')}
          aria-label={t('title')}
        />
      </div>
      {showDrop && (
        <div className={styles.drop}>
          {loading && <p className={styles.hint}>{t('searching')}</p>}
          {!loading && results.length === 0 && <p className={styles.hint}>{t('noResults')}</p>}
          {results.map((r) => (
            <button
              key={`${r.kind}-${r.slug}`}
              className={styles.result}
              onClick={() => router.push(`/services/${r.slug}`)}
            >
              <span className={styles.resultTitle}>{r.title}</span>
              {r.snippet && <span className={styles.resultSnippet}>{r.snippet}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
