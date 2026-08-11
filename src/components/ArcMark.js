/**
 * ArcMark — تمثيل هندسي مبسّط لعنصر «القوس» الموصوف في وثيقة الهوية (§١):
 * قوس مفتوح يحتضن نقطة من الأسفل = الاحتواء والإسناد.
 *
 * ⚠️ هذا ليس شعار العميل الفعلي. الملف المتجهي الحقيقي لم يُستلم بعد
 * (البند الحاجب §٦.١) — هذا مجرد بديل مؤقت لإثبات موضع ودور العنصر
 * في التركيبة، ويجب استبداله فور توفر SVG حقيقي بمسارات قابلة للتحرير.
 *
 * @param {{ size?: number, className?: string }} props
 */
export function ArcMark({ size = 40, className }) {
  return (
    <svg
      width={size}
      height={size * 0.82}
      viewBox="0 0 140 115"
      fill="none"
      className={className}
      role="img"
      aria-label="مجموعة العون"
    >
      <circle cx="70" cy="42" r="30" fill="var(--color-primary-900)" />
      <path
        d="M18 96C18 65 40 44 70 44C100 44 122 65 122 96"
        stroke="var(--color-accent-600)"
        strokeWidth="8"
        strokeLinecap="round"
      />
    </svg>
  );
}
