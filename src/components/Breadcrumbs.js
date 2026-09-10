import { Link } from '@/i18n/navigation.js';
import { jsonLdScript } from '@/lib/json-ld.js';
import styles from './Breadcrumbs.module.css';

const BASE_URL = 'https://al-aoun-law-firm-legal-consultation.vercel.app';

/** Lightweight breadcrumb trail — server component, no CSS module dependency.
 *  Emits a matching BreadcrumbList JSON-LD schema built from the exact same items array
 *  rendered visually, so structured data can never drift from what the visitor sees.
 *  @param {{ items: {label:string, href?:string}[], locale: string }} props */
export default function Breadcrumbs({ items, locale }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.label,
      ...(it.href ? { item: `${BASE_URL}/${locale}${it.href === '/' ? '' : it.href}` } : {}),
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }} />
      <nav aria-label="breadcrumb" className={styles.nav}>
        <ol className={styles.list}>
          {items.map((it, i) => (
            <li key={i} className={styles.item}>
              {it.href
                ? <Link href={it.href} className={`${styles.link} muted`}>{it.label}</Link>
                : <span className={`${styles.current} muted`}>{it.label}</span>}
              {i < items.length - 1 && <span aria-hidden="true" className={`${styles.separator} muted`}>/</span>}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
