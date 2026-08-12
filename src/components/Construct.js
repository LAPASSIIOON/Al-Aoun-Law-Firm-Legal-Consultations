import styles from './Construct.module.css';

/**
 * حقل إنشائي: خطوط رأسية دقيقة + علامات محاور. لغة «الدقة» المشتقّة من محور المونوجرام.
 * @param {{ lines?: number[], dark?: boolean, ticks?: boolean, className?: string }} props
 */
export function Construct({ lines = [0, 50, 100], dark = false, ticks = true, className = '' }) {
  return (
    <div className={`${styles.field} ${dark ? styles.dark : ''} ${className}`} aria-hidden="true">
      {lines.map((p, i) => (
        <span key={i} className={styles.vline} style={{ insetInlineStart: `${p}%` }} />
      ))}
      {ticks && (
        <>
          <span className={`${styles.tick} ${styles.tl}`} />
          <span className={`${styles.tick} ${styles.tr}`} />
          <span className={`${styles.tick} ${styles.bl}`} />
          <span className={`${styles.tick} ${styles.br}`} />
        </>
      )}
    </div>
  );
}
