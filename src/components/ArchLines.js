/**
 * علامة معمارية مجرّدة مستوحاة من هندسة المونوجرام:
 * دائرة محيطة + خطوط داخلية متقاطعة دقيقة. تُستخدم كلغة بصرية
 * رفيعة (لا كنسخة من اللوجو). اللون عبر currentColor.
 *
 * @param {{ className?: string, strokeWidth?: number }} props
 */
export function ArchLines({ className, strokeWidth = 1 }) {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      aria-hidden="true"
      className={className}
      preserveAspectRatio="xMidYMid meet"
    >
      <g stroke="currentColor" strokeWidth={strokeWidth} vectorEffect="non-scaling-stroke">
        <circle cx="100" cy="100" r="92" />
        {/* محور رأسي وأفقي — بنية معمارية */}
        <line x1="100" y1="8" x2="100" y2="192" />
        <line x1="8" y1="100" x2="192" y2="100" opacity="0.5" />
        {/* قطر مائل — يعكس مثلث المونوجرام */}
        <path d="M100 8 L182 150" />
        <path d="M100 192 L182 150" opacity="0.7" />
        {/* قوس داخلي — الإسناد من الأسفل (معنى العون) */}
        <path d="M40 118 A62 62 0 0 0 160 118" opacity="0.6" />
      </g>
    </svg>
  );
}
