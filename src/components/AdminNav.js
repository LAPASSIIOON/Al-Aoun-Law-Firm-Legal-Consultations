'use client';
import { usePathname } from '@/i18n/navigation.js';
import { Link } from '@/i18n/navigation.js';

/** @param {{ links: {href:string,label:string}[] }} props */
export default function AdminNav({ links }) {
  const pathname = usePathname();
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.3rem', flex: '1 1 auto' }}>
      {links.map((l) => {
        const active = pathname === l.href;
        return (
          <Link key={l.href} href={l.href} className="body"
            style={{
              fontSize: '.88rem', padding: '.5rem .9rem', borderRadius: '999px',
              color: active ? '#fff' : 'var(--platinum-2)',
              background: active ? 'var(--clay)' : 'transparent',
              transition: 'background .2s ease, color .2s ease',
            }}>
            {l.label}
          </Link>
        );
      })}
    </div>
  );
}
