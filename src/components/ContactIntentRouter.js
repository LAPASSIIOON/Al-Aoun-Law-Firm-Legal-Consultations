'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@/i18n/navigation.js';
import ContactForm from './ContactForm.js';

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

  const options = OPTION_ORDER.map((key) => ({
    key,
    label: t(`intent${key.charAt(0).toUpperCase()}${key.slice(1)}`),
    ...INTENT_CONFIG[key],
  }));

  function choose(opt) {
    if (opt.action === 'redirect') {
      router.push(opt.href);
      return;
    }
    setSelected(opt.key);
  }

  if (redirecting) return null; // تفادي وميض القائمة القديمة أثناء التوجيه اللحظي
  if (selected) return <ContactForm />;

  return (
    <div>
      <p className="body" style={{ marginBlockEnd: '1.25rem' }}>{t('intentPrompt')}</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '.75rem' }}>
        {options.map((opt) => (
          <button
            key={opt.key}
            type="button"
            onClick={() => choose(opt)}
            style={{
              textAlign: locale === 'ar' ? 'right' : 'left',
              padding: '.9rem 1.1rem',
              borderRadius: 'var(--r)',
              boxShadow: 'inset 0 0 0 1px var(--light-hair)',
              background: 'var(--light-raised)',
              color: 'var(--light-ink)',
              fontFamily: 'var(--f-ui)',
              fontSize: '.92rem',
              cursor: 'pointer',
              transition: 'box-shadow .2s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = 'inset 0 0 0 1px var(--clay-bright)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'inset 0 0 0 1px var(--light-hair)'; }}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
