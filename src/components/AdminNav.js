'use client';
import { usePathname } from '@/i18n/navigation.js';
import { Link } from '@/i18n/navigation.js';

/**
 * تنقّل لوحة الإدارة — مجموعات منطقية (Operations / People / System) بدل صف أزرار مسطّح.
 * سجل تشغيل مؤسسي: زوايا صغيرة، تسميات مجموعات بأحرف صغيرة مباعدة، بلا أشكال حبّة (pill) عامة.
 * @param {{ groups: {label: string, links: {href:string,label:string,badge?:number}[]}[] }} props
 */
export default function AdminNav({ groups }) {
  const pathname = usePathname();
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', columnGap: '1.75rem', rowGap: '.6rem', flex: '1 1 auto', minWidth: 0 }}>
      {groups.map((g) => (
        <div key={g.label} style={{ display: 'flex', alignItems: 'center', gap: '.55rem', flexWrap: 'wrap' }}>
          {g.label && (
            <span style={{
              fontFamily: 'var(--f-en)', fontSize: '.68rem', letterSpacing: '.1em', textTransform: 'uppercase',
              color: 'var(--platinum-3)', flexShrink: 0,
            }}>
              {g.label}
            </span>
          )}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.25rem' }}>
            {g.links.map((l) => {
              const active = pathname === l.href;
              return (
                <Link key={l.href} href={l.href} className="body"
                  style={{
                    fontSize: '.86rem', padding: '.42rem .75rem', borderRadius: 'var(--r)',
                    color: active ? '#fff' : 'var(--platinum-2)',
                    background: active ? 'var(--clay)' : 'transparent',
                    boxShadow: active ? 'none' : 'inset 0 0 0 1px transparent',
                    transition: 'background .2s ease, color .2s ease',
                    display: 'inline-flex', alignItems: 'center', gap: '.4rem', whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'var(--surface-3)'; }}
                  onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                >
                  {l.label}
                  {!!l.badge && (
                    <span style={{
                      fontSize: '.7rem', fontWeight: 700, minWidth: '1.1rem', height: '1.1rem',
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      borderRadius: '999px', padding: '0 .3rem',
                      background: active ? 'rgba(255,255,255,.25)' : 'var(--clay-bright)', color: '#fff',
                    }}>{l.badge}</span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
