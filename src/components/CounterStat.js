/** Static, confident institutional stat — never animates from zero (no possible broken/0 state).
 *  Server component: correct value is present in the very first byte of HTML.
 *  @param {{value:number, label:string, suffix?:string, locale:string}} p */
export default function CounterStat({ value, label, suffix = '', locale }) {
  const fmt = new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-US', { useGrouping: false }).format(value);
  return (
    <div className="counter">
      <div className="counter-n">{fmt}{suffix}</div>
      <div className="counter-l">{label}</div>
    </div>
  );
}
