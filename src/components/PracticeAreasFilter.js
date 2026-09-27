'use client';
import { useMemo, useState } from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/navigation.js';
import styles from '../app/[locale]/home.module.css';
import { GROUPS, SLUG_TO_GROUP } from '@/lib/practice-area-groups.js';

/** فهرس مجالات الممارسة: مجموعات قابلة للفتح وبحث يفتح النتائج المطابقة. */
export default function PracticeAreasFilter({ items, locale, placeholder, noResults }) {
  const [query, setQuery] = useState('');
  const [openGroups, setOpenGroups] = useState([]);
  const isArabic = locale === 'ar';

  const categories = useMemo(() => [...GROUPS, { key: 'other', ar: 'مجالات أخرى', en: 'Other Practice Areas' }], []);
  const groups = useMemo(() => {
    const text = query.trim().toLocaleLowerCase(locale);
    return categories.map((category) => {
      const members = items.filter((item) => (SLUG_TO_GROUP[item.slug] || 'other') === category.key);
      const categoryMatches = category[locale].toLocaleLowerCase(locale).includes(text);
      return {
        ...category,
        members: text && !categoryMatches
          ? members.filter((item) => `${item.title || ''} ${item.summary || ''}`.toLocaleLowerCase(locale).includes(text))
          : members,
      };
    }).filter((category) => category.members.length > 0);
  }, [categories, items, locale, query]);

  function search(value) {
    setQuery(value);
    const text = value.trim().toLocaleLowerCase(locale);
    if (!text) { setOpenGroups([]); return; }
    setOpenGroups(categories.filter((category) => {
      const members = items.filter((item) => (SLUG_TO_GROUP[item.slug] || 'other') === category.key);
      return members.length && (category[locale].toLocaleLowerCase(locale).includes(text)
        || members.some((item) => `${item.title || ''} ${item.summary || ''}`.toLocaleLowerCase(locale).includes(text)));
    }).map((category) => category.key));
  }

  function toggle(key) {
    setOpenGroups((current) => current.includes(key)
      ? current.filter((item) => item !== key)
      : [...current, key]);
  }

  return (
    <>
      <div className={styles.paFilterRow}>
        <input type="search" value={query} onChange={(event) => search(event.target.value)}
          placeholder={placeholder} className={styles.paFilterInput} aria-label={placeholder} />
      </div>

      {groups.length === 0 ? (
        <div className={styles.paNoResults} role="status">
          <p className="muted">{noResults}</p>
          <button type="button" onClick={() => search('')} className="btn-line">
            {isArabic ? 'مسح البحث' : 'Clear search'}
          </button>
        </div>
      ) : (
        <div className={styles.paGroups}>
          {groups.map((category, index) => {
            const isOpen = openGroups.includes(category.key);
            const panelId = `practice-group-${category.key}`;
            return (
              <section key={category.key} className={styles.paGroup}>
                <h2 className={styles.paGroupHeading}>
                  <button type="button" className={styles.paGroupButton} aria-expanded={isOpen}
                    aria-controls={panelId} onClick={() => toggle(category.key)}>
                    <span className={styles.paGroupNumber}>{String(index + 1).padStart(2, '0')}</span>
                    <span className={styles.paGroupTitle}>{category[locale]}</span>
                    <span className={styles.paGroupCount}>{category.members.length}</span>
                    <span className={styles.paGroupChevron} aria-hidden="true">⌄</span>
                  </button>
                </h2>
                <div id={panelId} className={styles.paGroupPanel} hidden={!isOpen}>
                    {category.members.map((item) => (
                      <Link key={item.slug} href={`/services/${item.slug}`} className={styles.paGroupLink}>
                        <span className={styles.paGroupItemTitle}>
                          {item.hasIcon && <Image src={`/practice-areas/icons/${item.slug}.png`} alt="" width={30} height={30} />}
                          {item.title}
                        </span>
                        {item.summary && <span className={styles.paGroupItemSummary}>{item.summary}</span>}
                        <span className={styles.paGroupArrow} aria-hidden="true">→</span>
                      </Link>
                    ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </>
  );
}
