'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, Link } from '@/i18n/navigation.js';
import ContactForm from './ContactForm.js';
import styles from './ContactIntentRouter.module.css';

/**
 * عقد السلوك الثابت لكل نية — مستقل عن الترجمة، لا يُعاد بناؤه كل رندر.
 * "form": تعرض نموذج التواصل الحالي مباشرة (بلا أي تعديل عليه).
 * "redirect": توجّه لصفحة مخصَّصة أنسب لهذه الفئة.
 * ملاحظة تصميمية حرجة: kuwaitCounsel وinternationalMatter كانا "redirect" لصفحة /international
 * في نسخة سابقة — غُيِّرا إلى "form" لأن صفحة /international نفسها (المسارين أ/ب) توجّه لـ/contact
 * بنفس هاتين القيمتين؛ إبقاؤهما "redirect" كان سيخلق ارتدادًا منطقيًا (دولي → تواصل → دولي).
 * القيم الثلاث المتبقية (foreignFirm/professionalCoop/career) تقود لصفحات/نماذج مختلفة فعليًا
 * عن نموذج التواصل العام، فتوجيهها منطقي وآمن (لا ترتد لأي صفحة تُنشئ هذا الرابط).
 */
const INTENT_CONFIG = {
  legalConsultation: { action: 'form' },
  corporate: { action: 'form' },
  kuwaitCounsel: { action: 'form' },
  internationalMatter: { action: 'form' },
  foreignFirm: { action: 'redirect', href: '/international/for-law-firms' },
  professionalCoop: { action: 'redirect', href: '/international/partner-with-us' },
  career: { action: 'redirect', href: '/careers' },
  general: { action: 'form' },
};
const OPTION_ORDER = ['legalConsultation', 'corporate', 'kuwaitCounsel', 'internationalMatter', 'foreignFirm', 'professionalCoop', 'career', 'general'];

/** خطوة ٠: "ما طبيعة تواصلك؟" — تحافظ على نية الزائر عبر ?intent= صريحة في الرابط،
 *  وتقرأها بأمان (قيمة غير معروفة = تجاهل صامت، رجوع للحالة الافتراضية غير المُحدَّدة). */
export default function ContactIntentRouter() {
  const t = useTranslations('contactPage');
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selected, setSelected] = useState(null);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    const raw = searchParams.get('intent');
    const config = raw ? INTENT_CONFIG[raw] : null;
    if (!config) return; // قيمة غائبة أو غير معروفة — نتجاهلها بصمت، الحالة الافتراضية تبقى كما هي
    if (config.action === 'redirect') {
      setRedirecting(true);
      router.replace(config.href); // replace لا push — لا نضيف خطوة "رجوع" تعيد إطلاق نفس التوجيه
    } else {
      setSelected(raw);
    }
  }, [searchParams, router]);

  // from= مسار داخلي فقط (مرآة العميل لنفس صيغة الخادم — الخادم هو المرجع النهائي دائمًا)
  const rawFrom = searchParams.get('from');
  const sourceRoute = rawFrom && /^\/(ar|en)(\/[a-z0-9-]+){0,4}$/.test(rawFrom)
    ? rawFrom
    : `/${locale}/contact`; // احتياط معروف يقينًا — لا NULL، لا sessionStorage، لا referrer

  const label = (key) => t(`intent${key.charAt(0).toUpperCase()}${key.slice(1)}`);
  const options = OPTION_ORDER.map((key) => ({ key, label: label(key), ...INTENT_CONFIG[key] }));

  if (redirecting) return null; // تفادي وميض القائمة القديمة أثناء التوجيه اللحظي

  /* بعد الاختيار: يبقى النوع المختار مرئيًا أعلى النموذج، مع "رجوع" يعيد فتح القائمة —
     قبل هذا التعديل كان الاختيار نهائيًا بلا أي طريق للعودة أو لمعرفة ما اختير. */
  if (selected) {
    return (
      <div>
        <div className={styles.chosen}>
          <span className={styles.chosenLabel}>{label(selected)}</span>
          {/* الاسم المتاح يبدأ بنص الزر المرئي (WCAG 2.5.3) ثم يضيف الوجهة، تمييزًا له عن
              زرّ "رجوع" داخل النموذج الذي يعود خطوةً واحدة لا إلى قائمة الأنواع. */}
          <button type="button" className="btn-line" aria-label={`${t('back')} — ${t('intentPrompt')}`} onClick={() => setSelected(null)}>{t('back')}</button>
        </div>
        <ContactForm intent={selected} sourceRoute={sourceRoute} />
      </div>
    );
  }

  return (
    <div>
      <p className={styles.prompt}>{t('intentPrompt')}</p>
      <div className={styles.list}>
        {options.map((opt, i) => {
          const idx = <span className={styles.rowIdx}>{String(i + 1).padStart(2, '0')}</span>;
          const text = <span className={styles.rowLabel}>{opt.label}</span>;
          const arrow = <span className={styles.rowArrow} aria-hidden="true">→</span>;
          /* وجهة خارج هذه الصفحة ⇒ رابط حقيقي: يحمل الدلالة للقارئ الآلي، ويسمح بفتحه
             في تبويب جديد — بدل زرّ يُحاكي الانتقال برمجيًا. */
          return opt.action === 'redirect' ? (
            <Link key={opt.key} href={opt.href} className={`${styles.row} ${styles.rowLink}`}>{idx}{text}{arrow}</Link>
          ) : (
            <button key={opt.key} type="button" className={styles.row} onClick={() => setSelected(opt.key)}>{idx}{text}{arrow}</button>
          );
        })}
      </div>
    </div>
  );
}
