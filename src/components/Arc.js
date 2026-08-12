/**
 * قوس «العون» — احتضان/إسناد من أسفل. مجرّد تمامًا (ليس اللوجو).
 * يُرسَم تدريجيًا عبر data-draw. اللون currentColor.
 * @param {{ className?: string, ring?: boolean, strokeWidth?: number, draw?: boolean }} props
 */
export function Arc({ className, ring = false, strokeWidth = 1.5, draw = true }) {
  return (
    <svg viewBox="0 0 400 400" fill="none" aria-hidden="true" className={className}
         preserveAspectRatio="xMidYMid meet">
      <g stroke="currentColor" strokeWidth={strokeWidth} vectorEffect="non-scaling-stroke" strokeLinecap="round">
        {ring && <circle cx="200" cy="188" r="150" opacity="0.28" />}
        {/* القوس الحاضن المفتوح من أسفل — يبدأ يسار ويلفّ لأسفل */}
        <path d="M44 200 A156 156 0 0 0 356 200" {...(draw ? { 'data-draw': true, style: { '--dash': 900 } } : {})} />
        {/* محور رأسي دقيق يمرّ بالمركز */}
        <line x1="200" y1="20" x2="200" y2="372" opacity="0.5" {...(draw ? { 'data-draw': true, style: { '--dash': 360 } } : {})} />
      </g>
    </svg>
  );
}
