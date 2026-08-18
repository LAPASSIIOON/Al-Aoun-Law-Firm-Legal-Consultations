'use client';
import { usePathname } from '@/i18n/navigation.js';
import { Link } from '@/i18n/navigation.js';

/** @param {{ links: {href:string,label:string,badge?:number}[] }} props */
export default function AdminNav({ links }) {
  const pathname = usePathname();
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.3rem', flex: '0 1 auto', minWidth: 0 }}>
      {links.map((l) => {
        const active = pathname === l.href;
        return (
          <Link key={l.href} href={l.href} className="body"
            style={{
              fontSize: '.88rem', padding: '.5rem .9rem', borderRadius: '999px',
              color: active ? '#fff' : 'var(--platinum-2)',
              background: active ? 'var(--clay)' : 'transparent',
              transition: 'background .2s ease, color .2s ease',
              display: 'inline-flex', alignItems: 'center', gap: '.4rem',
            }}>
            {l.label}
            {!!l.badge && (
              <span style={{
                fontSize: '.72rem', fontWeight: 700, minWidth: '1.15rem', height: '1.15rem',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: '999px', padding: '0 .3rem',
                background: active ? 'rgba(255,255,255,.25)' : 'var(--clay-bright)', color: '#fff',
              }}>{l.badge}</span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
