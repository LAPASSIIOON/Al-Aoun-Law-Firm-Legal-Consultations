import Image from 'next/image';
import { getLocale } from 'next-intl/server';

/**
 * الشعار الأفقي الكامل لمجموعة العون (المونوجرام + الاسم + التخصص).
 * يختار النسخة العربية أو الإنجليزية تلقائيًا حسب اللغة،
 * والنسخة البيضاء الكريمية على الأسطح الداكنة (الافتراضي).
 *
 * @param {{ height?: number, variant?: 'white'|'color', className?: string, priority?: boolean }} props
 */
export async function AlAounLogo({ height = 48, variant = 'white', className, priority = false }) {
  const locale = await getLocale();
  const lang = locale === 'en' ? 'en' : 'ar';
  const src = `/brand/logo-full-${lang}-${variant}.png`;
  // نسب الأبعاد التقريبية للنسخة الكاملة (عربي ~2.97:1، إنجليزي ~2.82:1)
  const ratio = lang === 'en' ? 2.82 : 2.97;
  const width = Math.round(height * ratio);
  return (
    <Image
      src={src}
      alt="مجموعة العون للمحاماة والاستشارات القانونية"
      width={width}
      height={height}
      className={className}
      priority={priority}
      unoptimized
    />
  );
}
