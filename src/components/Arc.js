/**
 * Arc — عنصر التوقيع البصري: القوس المفتوح المأخوذ من الشعار
 * (العون = الاحتواء والإسناد من الأسفل). يُستخدم كعنصر بنيوي يحتضن
 * الأقسام، لا كزخرفة. سماكة القوس محدودة تماشيًا مع قاعدة التدرج 2–4px
 * حين يُستخدم كخط فاصل؛ وهنا يُستخدم كقوس بنيوي بلون مصمت هادئ.
 *
 * @param {{ className?: string, tone?: 'ink'|'accent'|'faint' }} props
 */
export function Arc({ className, tone = 'faint' }) {
  const stroke =
    tone === 'ink'
      ? 'var(--color-primary-900)'
      : tone === 'accent'
        ? 'var(--color-accent-600)'
        : 'var(--color-primary-200)';
  return (
    <svg
      viewBox="0 0 400 210"
      fill="none"
      aria-hidden="true"
      className={className}
      preserveAspectRatio="xMidYMid meet"
    >
      <path
        d="M8 8C8 118 98 202 200 202C302 202 392 118 392 8"
        stroke={stroke}
        strokeWidth="10"
        strokeLinecap="round"
      />
    </svg>
  );
}
