'use client';
import { useMemo, useState } from 'react';
import { Link } from '@/i18n/navigation.js';
import styles from '../app/[locale]/home.module.css';

/** فلتر فوري لقائمة مجالات الممارسة — بيانات محمَّلة بالفعل، بلا استدعاء خادم إضافي. */
export default function PracticeAreasFilter({ items, locale, placeholder, noResults, notSureText, consultLabel }) {
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return items;
    return items.filter((r) =>
      r.title?.toLowerCase().includes(query) || r.summary?.toLowerCase().includes(query)
    );
  }, [items, q]);

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

      {filtered.length === 0 ? (
        <p className="muted" style={{ padding: '2rem 0' }}>{noResults}</p>
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
