import { Link } from '@/i18n/navigation.js';
import { jsonLdScript } from '@/lib/json-ld.js';

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
      <nav aria-label="breadcrumb" style={{ marginBlockEnd: '1.75rem' }}>
        <ol style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '.5rem', listStyle: 'none', padding: 0, margin: 0 }}>
          {items.map((it, i) => (
            <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
              {it.href
                ? <Link href={it.href} className="muted" style={{ fontSize: '.85rem' }}>{it.label}</Link>
                : <span className="muted" style={{ fontSize: '.85rem', color: 'var(--clay-bright)' }}>{it.label}</span>}
              {i < items.length - 1 && <span aria-hidden="true" className="muted" style={{ fontSize: '.8rem' }}>/</span>}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
