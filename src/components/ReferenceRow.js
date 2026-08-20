import { Link } from '@/i18n/navigation.js';
import styles from './ReferenceRow.module.css';

/** الصف المرجعي — لغة السجل المرجعي الأساسية: رقم + عنوان + ملخّص اختياري + سهم.
 *  تعميم لنمط صفوف مجالات الممارسة الناجح، ليُعاد استخدامه عبر الموقع (رؤى، قائمة جوّالة، دولي).
 *  @param {{ index: number, title: string, href: string, summary?: string, meta?: string }} props */
export default function ReferenceRow({ index, title, href, summary, meta }) {
  return (
    <Link href={href} className={styles.row} data-reveal="file">
      <span className={styles.idx}>{String(index).padStart(2, '0')}</span>
      <span className={styles.body}>
        <span className={styles.title}>{title}</span>
        {summary && <span className={styles.sum}>{summary}</span>}
        {meta && <span className={styles.meta}>{meta}</span>}
      </span>
      <span className={styles.arrow} aria-hidden="true">→</span>
    </Link>
  );
}
