import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import HeroMonument from '@/components/HeroMonument.js';
import { Link } from '@/i18n/navigation.js';
import { createAnonClient } from '@/lib/supabase-server.js';
import HeroDatum from '@/components/HeroDatum.js';
import SignatureUnderline from '@/components/SignatureUnderline.js';
import ReferenceRow from '@/components/ReferenceRow.js';
import { getTeamMember } from '@/lib/team-data.js';
import { INTERNATIONAL_ANCHOR, RELATIONSHIP_COUNTRIES } from '@/lib/international-relations.js';
import CoordinationField from '@/components/CoordinationField.js';
import styles from './home.module.css';

export const revalidate = 60;
export function generateStaticParams() { return [{ locale: 'ar' }, { locale: 'en' }]; }

const T = {
  ar: {
    eyebrow: 'مكتب محاماة كويتي منذ ٢٠٠٠',
    head: 'قوة قانونية كويتية\nبمعايير عالمية',
    sub: 'نرافق الأفراد والشركات والمستثمرين في الكويت وخارجها بمشورة دقيقة وسرّية تامة — من أول سؤالٍ إلى القرار.',
    heroCta1: 'أحتاج مساعدة قانونية', heroCta2: 'ابحث عن مجال',
    regLine: 'مجموعة العون في الكويت منذ ٢٠٠٠',
    counters: [
      { v: 2000, l: 'بداية ممارسة المؤسِّس' }, { v: 25, s: '+', l: 'سنة خبرة' },
      { v: 48, l: 'مجال ممارسة' }, { v: 4, l: 'مراكز تحكيم معتمدة' },
    ],
    legacyEye: 'الإرث المؤسسي', legacyHead: 'عمقٌ مؤسسي، بُني على سنوات من الممارسة الدقيقة.',
    legacyItems: [
      { n: '01', t: 'محاماة بالتمييز والدستورية', d: 'خبرةٌ أكاديمية وعملية في القانون الدستوري، بقيادة دكتوراه من جامعة القاهرة بتقدير امتياز.' },
      { n: '02', t: 'محكّم معتمد لدى ٤ مراكز', d: 'تسجيلٌ معتمَد لدى مراكز التحكيم الرائدة في الكويت والخليج.' },
      { n: '03', t: 'رئاسة المجلس العلمي بجمعية المحامين', d: 'قيادة أكاديمية داخل الهيئة المهنية للمحامين في الكويت.' },
      { n: '04', t: '+٢٥ عامًا من الممارسة', d: 'خبرةٌ تمتد لأكثر من عقدين في القضايا الدستورية والطعون بالتمييز والتحكيم التجاري الدولي.' },
    ],
    posEye: 'لماذا مجموعة العون', posHead: 'خبرة قانونية لقرار أوضح',
    posBody: 'نقدّم خدمات المحاماة والاستشارات والتحكيم للأفراد والشركات والمستثمرين في الكويت وخارجها. مشورة واضحة وسرّية تراعي طبيعة كل مسألة.',
    posLink: 'المزيد عن المكتب',
    paEye: 'مجالات الممارسة', paHead: 'خبرةٌ تُغطّي ما يهمّك', paAll: 'استعراض كل المجالات', paMore: 'استعراض',
    fEye: 'المؤسِّس', fName: 'الدكتور هيثم أحمد العون',
    fRole: 'المؤسِّس ورئيس مجلس الإدارة',
    fBio: 'يقود المجموعة في تقديم مشورة قانونية واضحة للأفراد والشركات.',
    fLink: 'الملف الكامل',
    inEye: 'رؤى قانونية', inHead: 'رؤى ومقالات', inAll: 'كل الرؤى', inEmpty: 'نُثري هذا القسم بتحليلاتٍ قانونية تباعًا.',
    bandHead: 'جاهزٌ لخطوةٍ أولى واضحة؟', bandBody: 'ابدأ بخطوةٍ سهلة — اسمك ورقمك فقط، والباقي نتولّاه بسرّيةٍ تامة.', bandPhone: 'أو اتصل بنا',
  },
  en: {
    eyebrow: 'Kuwaiti Law Firm Since 2000',
    head: 'Kuwaiti legal strength\nto a global standard',
    sub: 'We stand with individuals, companies and investors in Kuwait and beyond — precise, fully confidential counsel from the first question to the decision.',
    heroCta1: 'I need legal help', heroCta2: 'Find a practice area',
    regLine: 'AL OUN IN KUWAIT SINCE 2000',
    counters: [
      { v: 2000, l: 'Founder practising since' }, { v: 25, s: '+', l: 'Years of experience' },
      { v: 48, l: 'Practice areas' }, { v: 4, l: 'Arbitration centres' },
    ],
    legacyEye: 'Institutional Legacy', legacyHead: 'Institutional depth, built on years of precise practice.',
    legacyItems: [
      { n: '01', t: 'Cassation & constitutional advocacy', d: 'Academic and practical grounding in constitutional law, led by a PhD from Cairo University (Excellent).' },
      { n: '02', t: 'Registered arbitrator — 4 centres', d: 'Registered as arbitrator across four certified arbitration centres in Kuwait and the Gulf.' },
      { n: '03', t: 'Chair, Scientific Advisory Council', d: "Academic leadership within Kuwait's professional lawyers' association." },
      { n: '04', t: '25+ years in practice', d: 'Over two decades across constitutional matters, cassation appeals and international commercial arbitration.' },
    ],
    posEye: 'Why AL OUN', posHead: 'Legal insight for clearer decisions',
    posBody: 'We provide legal representation, consultation and arbitration for individuals, companies and investors in Kuwait and beyond. Our counsel is clear, confidential and attentive to the matter at hand.',
    posLink: 'More about the firm',
    paEye: 'Practice Areas', paHead: 'Expertise across what matters to you', paAll: 'View all practice areas', paMore: 'Explore',
    fEye: 'The Founder', fName: 'Dr. Haitham Ahmed Al Oun',
    fRole: 'Founder & Chairman',
    fBio: 'He leads the firm in providing clear legal counsel to individuals and businesses.',
    fLink: 'Full profile',
    inEye: 'Insights', inHead: 'Insights & articles', inAll: 'All insights', inEmpty: 'We’re adding legal analysis to this section shortly.',
    bandHead: 'Ready for a clear first step?', bandBody: 'Start with one easy step — just your name and number. We’ll handle the rest, in full confidence.', bandPhone: 'Or call us',
  },
};

async function fetchData(locale) {
  let areas = [], articles = [], fieldCountries = [];
  try {
    const supabase = createAnonClient();
    const { data: a } = await supabase.from('practice_area_translations')
      .select('slug, title, summary, practice_areas(sort_order)')
      .eq('locale', locale).eq('status', 'published').eq('legal_approved', true);
    areas = (a || []).sort((x, y) => (x.practice_areas?.sort_order || 0) - (y.practice_areas?.sort_order || 0));
    /* عقد النشر ببوابتيه معًا: بوابة الترجمة + بوابة المقال الأب (مفعَّل ومنشور فعليًا في الماضي) */
    const nowIso = new Date().toISOString();
    const { data: ar } = await supabase.from('article_translations')
      .select('slug, title, excerpt, created_at, articles!inner(id)')
      .eq('locale', locale).eq('status', 'published').eq('legal_approved', true)
      .eq('articles.is_active', true).not('articles.published_at', 'is', null).lte('articles.published_at', nowIso)
      .order('created_at', { ascending: false }).limit(3);
    articles = ar || [];
    /* D3.1: قائمة حقل التنسيق — تغطية قاعدة البيانات + دول العلاقات الموثَّقة، بلا تكرار،
       باستبعاد الكويت (المرتكز)، وبترتيب قانوني حتمي واحد (أبجدي إنجليزي) في الاتجاهين.
       أمان وقائعي عند تعذّر التغطية: تبقى القائمة فارغة — لا شريط «الصين وحدها» أبدًا
       ولا دول مُختلَقة؛ العبارة ورابط /international يبقيان صالحين للاستخدام. */
    const { data: j } = await supabase.from('v_active_jurisdictions').select('id, name_ar, name_en').order('name_en');
    const coverage = (j || []).filter((x) => x.name_en !== INTERNATIONAL_ANCHOR.en);
    if (coverage.length > 0) {
      const merged = new Map();
      coverage.forEach((x) => merged.set(x.name_en, { en: x.name_en, ar: x.name_ar }));
      RELATIONSHIP_COUNTRIES.forEach((rc) => merged.set(rc.en, { en: rc.en, ar: rc.ar }));
      fieldCountries = [...merged.values()].sort((x, y) => x.en.localeCompare(y.en));
    }
  } catch (e) { /* graceful */ }
  return { areas, articles, fieldCountries };
}

/** @param {{ params: Promise<{ locale: string }> }} props */
export default async function Home({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const n = await getTranslations({ locale, namespace: 'nav' });
  const ti = await getTranslations({ locale, namespace: 'international' });
  const c = T[locale] || T.ar;
  const { areas, articles, fieldCountries } = await fetchData(locale);
  /* D2 «سجلّ المستشارين»: هوية الشريك من مصدر بيانات الفريق المعتمد حصرًا — لا إعادة كتابة */
  const partner = getTeamMember('bader-saif-al-rashidi');
  const pf = partner ? (partner[locale] || partner.ar) : null;

  return (
    <>
      {/* HERO */}
      {/* HERO — تايبوغرافيا أولًا (الموجة C1): حقل كحلي، هندسة تسجيل ثابتة، بلا صورة ولا حركة.
          C2.5: «حقل النصب» — ذراع المهد الرسمية كطبقة معمارية ثابتة أسفل خطوط الأساس */}
      <section className={styles.hero}>
        {/* D6: «حقل الصورة» — الرندر ثلاثي الأبعاد للعلامة الرسمية يحلّ محلّ النصب على
            سطح المكتب وحده (z:0، الحقل المقابل للنص نفسه)، بتلاشٍ نحو عمود القراءة فلا
            يمرّ خلف النصّ بكسل صورة ولا يتغيّر تباينه. ثابت بلا حركة، كما كان النصب.
            الهاتف يحتفظ بالنصب المسطّح: تكوين الصورة أفقي ويحتاج عرضًا لا يوفّره الهاتف،
            وإقحامه هناك يصطدم بصفّ الأزرار الإنجليزي (قياس مرصود). */}
        <HeroMonument className={styles.heroMonument} dir={locale === 'ar' ? 'rtl' : 'ltr'} />
        <div className={styles.heroPhoto} aria-hidden="true" />
        <HeroDatum className={styles.heroDatum} markClassName={styles.heroMark} />
        <div className={`wrap ${styles.heroInner}`}>
          <div className={styles.heroContent}>
            <span className="eyebrow">{c.eyebrow}</span>
            <h1 className={styles.heroHead}>{c.head.split('\n').map((l, i) => <span key={i} style={{ display: 'block' }}>{l}</span>)}</h1>
            <p className={styles.heroSub}>{c.sub}</p>
            <div className={styles.heroCtas}>
              <Link href={`/contact?intent=legalConsultation&from=/${locale}`} className="btn btn-solid">{c.heroCta1} <span className="arrow">→</span></Link>
              <Link href="/services" className="btn-line">{c.heroCta2} <span className="arrow">→</span></Link>
            </div>
          </div>
        </div>
        {/* سطر التسجيل الوقائعي — هاتف فقط (يُخفى على سطح المكتب عبر CSS)؛ زخرفي بحت:
            حقائقه مكررة من الآيبرو، فلا يُقرأ على قارئات الشاشة */}
        <span className={styles.heroRegLine} aria-hidden="true">{c.regLine}</span>
      </section>

      {/* DUAL TRACK — عميل / مكتب دولي، مباشرة بعد الهيرو */}
      <section className={`on-white section-tight ${styles.heroHandoff}`}>
        <div className="wrap">
          <div className={styles.dualBar}>
            <Link href="/contact" className={styles.dualItem}>
              <span className={styles.dualEye}>{ti('forkClientEye')}</span>
              <span className={styles.dualT}>{ti('forkClientHead')}</span>
              <span className="arrow">→</span>
            </Link>
            <Link href="/international/for-law-firms" className={styles.dualItem}>
              <span className={styles.dualEye}>{ti('forkFirmEye')}</span>
              <span className={styles.dualT}>{ti('forkFirmHead')}</span>
              <span className="arrow">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* PRACTICE AREAS — moved to lead position (discovery-first, per approved restructuring) */}
      <section className="on-paper section">
        <div className="wrap">
          {/* D1 «الفهرس المشروح»: العنوان بلا CTA علوي — المخرج الوحيد صفٌّ ختامي أسفل الفهرس */}
          <div className={styles.headRow}>
            <div>
              <span className="eyebrow" data-reveal>{c.paEye}</span>
              <h2 className="display d-1" data-reveal style={{ marginBlockStart: '1rem' }}>{c.paHead}</h2>
            </div>
          </div>
          <div className={`${styles.paList} ${styles.paIndex}`}>
            {/* أمان وقائعي: لا صفوف مُختلَقة عند غياب البيانات — العنوان والصفّ الختامي فقط */}
            {areas.slice(0, 8).map((a, i) => (
              <ReferenceRow key={a.slug} index={i + 1} variant="annotated"
                title={a.title} href={`/services/${a.slug}`} summary={a.summary} />
            ))}
            <Link href="/services" className={styles.paAllRow} data-reveal="file">
              <span className={styles.paAllT}>{c.paAll}</span>
              <span className="arrow" aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* WHY AL OUN — consolidated: intro (was "Positioning") + credentials (was "Legacy") + founder close,
          replacing three previously-separate, overlapping trust sections with one confident telling. */}
      <section className="on-white section">
        <div className="wrap">
          <div className={styles.head}>
            <span className="eyebrow" data-reveal>{c.posEye}</span>
            <div data-reveal>
              <h2 className="display d-1">{c.posHead}</h2>
              <SignatureUnderline width={96} />
            </div>
          </div>
          <p className="lead" data-reveal style={{ maxWidth: '52rem' }}>{c.posBody}</p>

          <div className={styles.leaderCards} style={{ marginBlockStart: 'clamp(2.5rem,5vh,4rem)' }}>
            <Link href="/team/haitham-al-aoun" className={styles.leaderCard} data-reveal="slow">
              <span className={styles.leaderPortrait}>
                <img src="/media/founder-haitham.jpg" alt="" width="1000" height="1042" loading="lazy" decoding="async" />
              </span>
              <span className={styles.leaderCopy}>
                <span className={styles.leaderEyebrow}>{c.fEye}</span>
                <span className={styles.leaderName}>{c.fName}</span>
                <span className={styles.leaderRole}>{c.fRole}</span>
                <span className={styles.leaderBio}>{c.fBio}</span>
                <span className={styles.leaderLink}>{c.fLink}<span className="arrow" aria-hidden="true">→</span></span>
              </span>
            </Link>
            {pf && (
              <Link href={`/team/${partner.slug}`} className={styles.leaderCard} data-reveal="slow">
                <span className={styles.leaderPortrait}>
                  <img src={partner.photoFull} alt="" width="1000" height="1042" loading="lazy" decoding="async" />
                </span>
                <span className={styles.leaderCopy}>
                  <span className={styles.leaderEyebrow}>{locale === 'ar' ? 'الشريك' : 'The Partner'}</span>
                  <span className={styles.leaderName}>{pf.name}</span>
                  <span className={styles.leaderRole}>{pf.role} · {pf.title}</span>
                  <span className={styles.leaderBio}>{pf.bio}</span>
                  <span className={styles.leaderLink}>{c.fLink}<span className="arrow" aria-hidden="true">→</span></span>
                </span>
              </Link>
            )}
          </div>
          <p className={styles.leaderAll}>
            <Link href="/team" className="btn-line">{n('professionals')} <span className="arrow">→</span></Link>
          </p>
        </div>
      </section>

      {/* D3.1 «حقل التنسيق» — معاينة موجزة للحقل الدولي: كل الدول بوزن بصري واحد
          (تقاعد صفّ الصين المنفرد)، ورابط واضح منفصل إلى /international —
          لا رابط عملاقًا على مجموعة الدول كلها، ولا روابط لدول مفردة. */}
      <section className="on-paper section-tight">
        <div className="wrap">
          <span className="eyebrow" data-reveal>{ti('eyebrow')}</span>
          <h2 className="display d-2" data-reveal style={{ marginBlockStart: '1rem', maxWidth: '24ch' }}>{ti('homeStatement')}</h2>
          {/* الشريط مشروط ببيانات تغطية حقيقية — لا شريط أحادي الدولة عند تعذّرها */}
          {fieldCountries.length > 0 && (
            <div style={{ marginBlockStart: 'clamp(1.75rem,3.5vh,2.5rem)' }}>
              <CoordinationField
                variant="strip"
                dir={locale === 'ar' ? 'rtl' : 'ltr'}
                countries={fieldCountries.map((c2) => (locale === 'ar' ? c2.ar : c2.en))}
              />
            </div>
          )}
          <p data-reveal style={{ marginBlockStart: '1.75rem' }}>
            <Link href="/international" className="btn-line">{c.paMore} <span className="arrow">→</span></Link>
          </p>
        </div>
      </section>

      {/* INSIGHTS — سجلّ تحريري بلغة السجلّ المرجعي نفسها (D1/D2): صفوف مرقّمة، لا شبكة بطاقات.
          العتبة: القسم لا يُعرض إطلاقًا دون ثلاث مواد مؤهَّلة للّغة النشطة. الاستعلام محدود
          بثلاثة أصلًا، فطول المصفوفة = 3 يعني توفّر ثلاث مواد فعليًا (بلا مساس بالاستعلام).
          العنوان والملخّص القائمان فقط — بلا صور ولا شارات ولا تواريخ ولا تصنيفات ولا نصّ عام جديد.
          المخرج الوحيد صفٌّ ختامي إلى الأرشيف بنصّ الترجمة القائم نفسه. */}
      {articles.length >= 3 && (
        <section className="on-paper section">
          <div className="wrap">
            <div className={styles.headRow}>
              <div>
                <span className="eyebrow" data-reveal>{c.inEye}</span>
                <h2 className="display d-1" data-reveal style={{ marginBlockStart: '1rem' }}>{c.inHead}</h2>
              </div>
            </div>
            <div className={styles.inList}>
              {articles.map((a, i) => (
                <Link key={a.slug} href={`/insights/${a.slug}`} className={styles.inRow} data-reveal="file">
                  <span className={styles.inIdx}>{String(i + 1).padStart(2, '0')}</span>
                  <span className={styles.inBody}>
                    <span className={styles.inTitle}>{a.title}</span>
                    {a.excerpt && <span className={styles.inSum}>{a.excerpt}</span>}
                  </span>
                  <span className="arrow" aria-hidden="true">→</span>
                </Link>
              ))}
              <Link href="/insights" className={styles.inAllRow} data-reveal="file">
                <span className={styles.inAllT}>{c.inAll}</span>
                <span className="arrow" aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA BAND */}
      <section className="on-navy section-tight">
        <div className="wrap">
          <div className={styles.band}>
            <div className={styles.bandText} data-reveal>
              <h2 className="display d-2" style={{ color: '#fff' }}>{c.bandHead}</h2>
              <p className="lead" style={{ marginBlockStart: '.75rem' }}>{c.bandBody}</p>
            </div>
            <div className={styles.bandActions} data-reveal>
              <Link href="/contact" className="btn btn-solid">{n('consult')} <span className="arrow">→</span></Link>
              <span className={styles.bandPhone}>{c.bandPhone} <a href="tel:+96599010470" dir="ltr">+965 99010470</a></span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
