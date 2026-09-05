import { Link } from '@/i18n/navigation.js';
import styles from './ReferenceRow.module.css';

/** الصف المرجعي — لغة السجل المرجعي الأساسية: رقم + عنوان + ملخّص اختياري + سهم.
 *  تعميم لنمط صفوف مجالات الممارسة الناجح، ليُعاد استخدامه عبر الموقع (رؤى، قائمة جوّالة، دولي).
 *
 *  variant="annotated" (الموجة D1 — «الفهرس المشروح»، الصفحة الرئيسية فقط):
 *  فهرسٌ ذو عمودين على سطح المكتب (عمود عناوين ثابت + شرحٌ ظاهرٌ دائمًا بسطرين كحدّ
 *  أقصى، بلا كشفٍ بالتحويم)، وفهرسٌ صِرف على الهاتف (رقم + عنوان + سهم). السلوك
 *  الافتراضي — المستهلَك في /services و/insights — لم يُمَسّ: التنويعة اختيارية بحتة.
 *  @param {{ index: number, title: string, href: string, summary?: string, meta?: string, variant?: 'annotated' }} props */
export default function ReferenceRow({ index, title, href, summary, meta, variant }) {
  const cls = variant === 'annotated' ? `${styles.row} ${styles.annotated}` : styles.row;
  return (
    <Link href={href} className={cls} data-reveal="file">
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
