import { Link } from '@/i18n/navigation.js';

/** Lightweight breadcrumb trail — server component, no CSS module dependency.
 *  @param {{ items: {label:string, href?:string}[] }} props */
export default function Breadcrumbs({ items }) {
  return (
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
  );
}
