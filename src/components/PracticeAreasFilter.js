'use client';
import { useMemo, useState } from 'react';
import { Link } from '@/i18n/navigation.js';
import styles from '../app/[locale]/home.module.css';
import { GROUPS, SLUG_TO_GROUP } from '@/lib/practice-area-groups.js';

/** فلتر فوري لقائمة مجالات الممارسة — بحث نصّي + رقائق تصنيف (تصنيف عرضي، لا قاعدة بيانات)، يتضافران (AND). */
export default function PracticeAreasFilter({ items, locale, placeholder, noResults, notSureText, consultLabel }) {
  const [q, setQ] = useState('');
  const [group, setGroup] = useState('all');

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return items.filter((r) => {
      const matchesQuery = !query || r.title?.toLowerCase().includes(query) || r.summary?.toLowerCase().includes(query);
      const matchesGroup = group === 'all' || SLUG_TO_GROUP[r.slug] === group;
      return matchesQuery && matchesGroup;
    });
  }, [items, q, group]);

  const clearFilters = () => { setQ(''); setGroup('all'); };
  const hasActiveFilters = q.trim() !== '' || group !== 'all';

  return (
    <>
      <div className={styles.paFilterRow} data-reveal>
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={placeholder}
          className={styles.paFilterInput}
          aria-label={placeholder}
        />
      </div>

      <div className={styles.paChipRow} data-reveal role="group" aria-label={locale === 'ar' ? 'تصنيف مجالات الممارسة' : 'Practice area categories'}>
        <button
          type="button"
          className={`${styles.paChip} ${group === 'all' ? styles.paChipActive : ''}`}
          onClick={() => setGroup('all')}
          aria-pressed={group === 'all'}
        >
          {locale === 'ar' ? 'الكل' : 'All'}
        </button>
        {GROUPS.map((g) => (
          <button
            key={g.key}
            type="button"
            className={`${styles.paChip} ${group === g.key ? styles.paChipActive : ''}`}
            onClick={() => setGroup(g.key)}
            aria-pressed={group === g.key}
          >
            {locale === 'ar' ? g.ar : g.en}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ padding: '2.5rem 0', textAlign: 'center' }}>
          <p className="muted" style={{ marginBlockEnd: '1rem' }}>{noResults}</p>
          {hasActiveFilters && (
            <button type="button" onClick={clearFilters} className="btn-line" style={{ marginInlineEnd: '.75rem' }}>
              {locale === 'ar' ? 'مسح الفلاتر' : 'Clear filters'}
            </button>
          )}
          <Link href="/contact" className="btn-line">
            {locale === 'ar' ? 'لم تجد ما تبحث عنه؟ تواصل معنا مباشرة' : "Didn't find what you need? Contact us directly"} <span className="arrow">→</span>
          </Link>
        </div>
      ) : (
        <div className={styles.paList}>
          {filtered.map((r, i) => (
            <Link key={r.slug} href={`/services/${r.slug}`} className={styles.paRow} data-reveal="file">
              <span className={styles.paIdx}>{String(i + 1).padStart(2, '0')}</span>
              <span className={styles.paBody}>
                <span className={styles.paTitle} style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}>
                  {r.hasIcon && (
                    <img src={`/practice-areas/icons/${r.slug}.png`} alt="" width={30} height={30} style={{ flex: '0 0 auto', opacity: .92 }} />
                  )}
                  {r.title}
                </span>
                {r.summary && <span className={styles.paSum}>{r.summary}</span>}
              </span>
              <span className={styles.paArrow} aria-hidden="true">→</span>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
