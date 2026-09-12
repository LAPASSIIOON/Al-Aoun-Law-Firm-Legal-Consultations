'use client';
import { usePathname } from '@/i18n/navigation.js';
import { Link } from '@/i18n/navigation.js';
import styles from './AdminNav.module.css';

/**
 * تنقّل لوحة الإدارة — مجموعات منطقية (Operations / People / System) بدل صف أزرار مسطّح.
 * سجل تشغيل مؤسسي: زوايا صغيرة، تسميات مجموعات بأحرف صغيرة مباعدة، بلا أشكال حبّة (pill) عامة.
 * @param {{ groups: {label: string, links: {href:string,label:string,badge?:number}[]}[] }} props
 */
export default function AdminNav({ groups }) {
  const pathname = usePathname();
  return (
    <nav className={styles.nav} aria-label="Admin">
      {groups.map((g) => (
        <div key={g.label} className={styles.group}>
          {g.label && (
            <span className={styles.groupLabel}>{g.label}</span>
          )}
          <div className={styles.links}>
            {g.links.map((l) => {
              const active = pathname === l.href;
              return (
                <Link key={l.href} href={l.href} className={`${styles.link} ${active ? styles.active : ''}`} aria-current={active ? 'page' : undefined}>
                  {l.label}
                  {!!l.badge && (
                    <span className={styles.badge}>{l.badge}</span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
