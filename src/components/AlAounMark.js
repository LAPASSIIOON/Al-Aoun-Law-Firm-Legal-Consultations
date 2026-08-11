import Image from 'next/image';

/**
 * علامة مجموعة العون — الصورة الحقيقية عالية الجودة (بخلفية شفافة)،
 * مطابقة لملف الشعار الأصلي بكامل تفاصيله (وليست نسخة متتبّعة مبسّطة).
 *
 * على الأسطح الداكنة (الزمرّد) نستخدم النسخة البيضاء افتراضيًا.
 *
 * @param {{ size?: number, variant?: 'white'|'navy', title?: string, className?: string, priority?: boolean }} props
 */
export function AlAounMark({
  size = 40,
  variant = 'white',
  title = 'مجموعة العون للمحاماة والاستشارات القانونية',
  className,
  priority = false,
}) {
  const src =
    variant === 'navy'
      ? '/brand/al-aoun-logo-navy.png'
      : '/brand/al-aoun-logo-white.png';
  // نسبة الأبعاد الأصلية 2898×2600
  const height = Math.round(size * (2600 / 2898));
  return (
    <Image
      src={src}
      alt={title}
      width={size}
      height={height}
      className={className}
      priority={priority}
      unoptimized
    />
  );
}
