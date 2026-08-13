import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation.js';
import { createAnonClient } from '@/lib/supabase-server.js';
import HeroMotion from '@/components/HeroMotion.js';
import CounterStat from '@/components/CounterStat.js';
import styles from './home.module.css';

export const revalidate = 60;
export function generateStaticParams() { return [{ locale: 'ar' }, { locale: 'en' }]; }

const T = {
  ar: {
    eyebrow: 'مكتب محاماة كويتي · منذ ٢٠٠٠',
    head: 'قوّةٌ قانونية كويتية،\nبمعايير عالمية.',
    sub: 'نرافق الأفراد والشركات والمستثمرين في الكويت وخارجها بمشورة دقيقة وسرّية تامة — من أول سؤالٍ إلى القرار.',
    ctaAbout: 'تعرّف على المكتب',
    counters: [
      { v: 2000, l: 'سنة التأسيس' }, { v: 25, s: '+', l: 'سنة خبرة' },
      { v: 12, l: 'مجال ممارسة' }, { v: 4, l: 'مراكز تحكيم معتمدة' },
    ],
    authority: ['محاماة بالتمييز والدستورية', 'محكّم معتمد لدى ٤ مراكز', 'رئاسة المجلس العلمي بجمعية المحامين', 'سرّية تامة'],
    posEye: 'من نحن', posHead: 'خبرةٌ قانونية عميقة، في خدمة قرارٍ واضح.',
    posBody: 'مجموعة العون مكتب محاماةٍ واستشاراتٍ وتحكيمٍ كويتي تأسّس عام ٢٠٠٠، يقوده الدكتور هيثم العون بخلفيةٍ أكاديمية وعملية في القانون الدستوري والتمييز والتحكيم التجاري الدولي. نجمع بين العمق النظري والممارسة الدقيقة لنقدّم مشورةً يُعتمد عليها.',
    posLink: 'المزيد عن المكتب',
    paEye: 'مجالات الممارسة', paHead: 'خبرةٌ تُغطّي ما يهمّك', paAll: 'استعراض كل المجالات', paMore: 'استعراض',
    whyEye: 'لماذا العون', whyHead: 'لماذا يختارنا موكّلونا',
    values: [
      { t: 'عمقٌ أكاديمي', d: 'دكتوراه في القانون الدستوري وأبحاث منشورة تسند كل رأيٍ قانوني.' },
      { t: 'خبرة تحكيم معتمدة', d: 'محكّم مقيّد لدى مراكز الخليج والكويت وهيئة أسواق المال ووزارة العدل.' },
      { t: 'سرّية تامة', d: 'نموذج عملٍ يحمي خصوصيتك من أول تواصل، ببروتوكولٍ واضح.' },
      { t: 'وضوحٌ من البداية', d: 'نوضّح المسار والخيارات بلغةٍ مفهومة، بلا مفاجآت.' },
    ],
    fEye: 'المؤسِّس', fName: 'الدكتور هيثم أحمد العون',
    fRole: 'المؤسِّس ورئيس مجلس الإدارة · محامٍ بالتمييز والدستورية',
    fBio: 'دكتوراه في القانون الدستوري من جامعة القاهرة بتقدير امتياز، ورئيس المجلس العلمي الاستشاري بجمعية المحامين الكويتية، ومحكّم معتمد لدى أبرز مراكز التحكيم في المنطقة. خبرةٌ تمتد لأكثر من عقدين في القضايا الدستورية والطعون بالتمييز والتحكيم التجاري الدولي.',
    fLink: 'الملف الكامل',
    inEye: 'رؤى قانونية', inHead: 'رؤى ومقالات', inAll: 'كل الرؤى', inEmpty: 'نُثري هذا القسم بتحليلاتٍ قانونية تباعًا.',
    bandHead: 'جاهزٌ لخطوةٍ أولى واضحة؟', bandBody: 'اطلب استشارة، وسنوجّهك للمسار المناسب — بسرّيةٍ تامة.', bandPhone: 'أو اتصل بنا',
  },
  en: {
    eyebrow: 'Kuwaiti Law Firm · Since 2000',
    head: 'Kuwaiti legal strength,\nto a global standard.',
    sub: 'We stand with individuals, companies and investors in Kuwait and beyond — precise, fully confidential counsel from the first question to the decision.',
    ctaAbout: 'About the firm',
    counters: [
      { v: 2000, l: 'Established' }, { v: 25, s: '+', l: 'Years of experience' },
      { v: 12, l: 'Practice areas' }, { v: 4, l: 'Arbitration centres' },
    ],
    authority: ['Cassation & constitutional advocacy', 'Registered arbitrator · 4 centres', 'Chair, Scientific Advisory Council', 'Full confidentiality'],
    posEye: 'Who we are', posHead: 'Deep legal expertise, in service of a clear decision.',
    posBody: 'Al Oun is a Kuwaiti law, consultancy and arbitration firm established in 2000, led by Dr. Haitham Al Oun with academic and practical grounding in constitutional law, cassation and international commercial arbitration. We pair theoretical depth with precise practice to deliver counsel you can rely on.',
    posLink: 'More about the firm',
    paEye: 'Practice Areas', paHead: 'Expertise across what matters to you', paAll: 'View all practice areas', paMore: 'Explore',
    whyEye: 'Why Al Oun', whyHead: 'Why clients choose us',
    values: [
      { t: 'Academic depth', d: 'A doctorate in constitutional law and published research behind every legal opinion.' },
      { t: 'Certified arbitration', d: 'Registered arbitrator across the GCC, Kuwait, the Capital Markets Authority and the Ministry of Justice.' },
      { t: 'Full confidentiality', d: 'A model that protects your privacy from first contact, by clear protocol.' },
      { t: 'Clarity from the start', d: 'We make the path and options clear, in plain language, with no surprises.' },
    ],
    fEye: 'The Founder', fName: 'Dr. Haitham Ahmed Al Oun',
    fRole: 'Founder & Chairman · Cassation & Constitutional Lawyer',
    fBio: 'PhD in constitutional law from Cairo University (Excellent), Chair of the Scientific Advisory Council at the Kuwait Lawyers Association, and a registered arbitrator at the region’s leading arbitration centres. Over two decades across constitutional matters, cassation appeals and international commercial arbitration.',
    fLink: 'Full profile',
    inEye: 'Insights', inHead: 'Insights & articles', inAll: 'All insights', inEmpty: 'We’re adding legal analysis to this section shortly.',
    bandHead: 'Ready for a clear first step?', bandBody: 'Request a consultation and we’ll guide you to the right path — in full confidence.', bandPhone: 'Or call us',
  },
};

async function fetchData(locale) {
  let areas = [], articles = [];
  try {
    const supabase = createAnonClient();
    const { data: a } = await supabase.from('practice_area_translations')
      .select('slug, title, summary, practice_areas(sort_order)')
      .eq('locale', locale).eq('status', 'published').eq('legal_approved', true);
    areas = (a || []).sort((x, y) => (x.practice_areas?.sort_order || 0) - (y.practice_areas?.sort_order || 0));
    const { data: ar } = await supabase.from('article_translations')
      .select('slug, title, summary, created_at')
      .eq('locale', locale).eq('status', 'published').eq('legal_approved', true)
      .order('created_at', { ascending: false }).limit(3);
    articles = ar || [];
  } catch (e) { /* graceful */ }
  return { areas, articles };
}

/** @param {{ params: Promise<{ locale: string }> }} props */
export default async function Home({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const n = await getTranslations({ locale, namespace: 'nav' });
  const c = T[locale] || T.ar;
  const { areas, articles } = await fetchData(locale);
  const veilDir = locale === 'ar' ? 'to left' : 'to right';

  return (
    <>
      {/* HERO */}
      <section className={styles.hero} style={{ '--veilDir': veilDir }}>
        <HeroMotion />
        <div className={styles.heroVeil} />
        <div className={`wrap ${styles.heroInner}`}>
          <div className={styles.heroContent}>
            <span className="eyebrow">{c.eyebrow}</span>
            <h1 className={styles.heroHead}>{c.head.split('\n').map((l, i) => <span key={i} style={{ display: 'block' }}>{l}</span>)}</h1>
            <p className={styles.heroSub}>{c.sub}</p>
            <div className={styles.heroCtas}>
              <Link href="/contact" className="btn btn-solid">{n('consult')} <span className="arrow">→</span></Link>
              <Link href="/about" className="btn btn-ghost">{c.ctaAbout}</Link>
            </div>
            <div className={styles.counters}>
              {c.counters.map((s, i) => (<CounterStat key={i} value={s.v} suffix={s.s || ''} label={s.l} locale={locale} />))}
            </div>
          </div>
        </div>
      </section>

      {/* AUTHORITY STRIP */}
      <section className="on-white section-tight">
        <div className="wrap">
          <div className={styles.authority} data-reveal>
            {c.authority.map((a, i) => (<span key={i} className={styles.authItem}>{a}</span>))}
          </div>
        </div>
      </section>

      {/* POSITIONING */}
      <section className="on-white section">
        <div className="wrap">
          <div className={styles.head}>
            <span className="eyebrow" data-reveal>{c.posEye}</span>
            <h2 className="display d-1" data-reveal>{c.posHead}</h2>
          </div>
          <p className="lead" data-reveal style={{ maxWidth: '52rem' }}>{c.posBody}</p>
          <p data-reveal style={{ marginBlockStart: '1.75rem' }}><Link href="/about" className="btn-line">{c.posLink} <span className="arrow">→</span></Link></p>
        </div>
      </section>

      {/* PRACTICE AREAS */}
      <section className="on-paper section">
        <div className="wrap">
          <div className={styles.headRow}>
            <div>
              <span className="eyebrow" data-reveal>{c.paEye}</span>
              <h2 className="display d-1" data-reveal style={{ marginBlockStart: '1rem' }}>{c.paHead}</h2>
            </div>
            <Link href="/services" className="btn-line" data-reveal>{c.paAll} <span className="arrow">→</span></Link>
          </div>
          <div className="grid cols-3">
            {(areas.length ? areas : Array.from({ length: 6 })).map((a, i) => (
              <Link key={a?.slug || i} href={a ? `/services/${a.slug}` : '/services'} className={`card ${styles.areaCard}`} data-reveal>
                <span className="idx">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="card-title">{a ? a.title : (locale === 'ar' ? 'مجال ممارسة' : 'Practice area')}</h3>
                {a?.summary && <p className="body" style={{ fontSize: '0.98rem' }}>{a.summary}</p>}
                <span className={`btn-line ${styles.moreLink}`}>{c.paMore} <span className="arrow">→</span></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* WHY / VALUES */}
      <section className="on-navy section">
        <div className="wrap">
          <div className={styles.head}>
            <span className="eyebrow" data-reveal>{c.whyEye}</span>
            <h2 className="display d-1" data-reveal style={{ color: '#fff' }}>{c.whyHead}</h2>
          </div>
          <div className="grid cols-2" style={{ rowGap: 'clamp(2rem,4vh,3rem)' }}>
            {c.values.map((v, i) => (
              <div key={i} className={styles.value} data-reveal>
                <span className={styles.valueNum}>{String(i + 1).padStart(2, '0')}</span>
                <h3 className={styles.valueT}>{v.t}</h3>
                <p className={styles.valueD}>{v.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOUNDER */}
      <section className="on-white section">
        <div className="wrap">
          <div className={styles.founder}>
            <div className={styles.founderMedia} data-reveal>
              <img src="/media/founder-haitham.jpg" alt={c.fName} />
            </div>
            <div data-reveal>
              <span className="eyebrow">{c.fEye}</span>
              <h2 className={styles.founderName}>{c.fName}</h2>
              <p className={styles.founderRole}>{c.fRole}</p>
              <p className="body" style={{ fontSize: '1.08rem', maxWidth: '46rem' }}>{c.fBio}</p>
              <p style={{ marginBlockStart: '1.75rem' }}><Link href="/team" className="btn-line">{c.fLink} <span className="arrow">→</span></Link></p>
            </div>
          </div>
        </div>
      </section>

      {/* INSIGHTS */}
      <section className="on-paper section">
        <div className="wrap">
          <div className={styles.headRow}>
            <div>
              <span className="eyebrow" data-reveal>{c.inEye}</span>
              <h2 className="display d-1" data-reveal style={{ marginBlockStart: '1rem' }}>{c.inHead}</h2>
            </div>
            {articles.length > 0 && <Link href="/insights" className="btn-line" data-reveal>{c.inAll} <span className="arrow">→</span></Link>}
          </div>
          {articles.length > 0 ? (
            <div className="grid cols-3">
              {articles.map((a) => (
                <Link key={a.slug} href={`/insights/${a.slug}`} className="card" data-reveal>
                  <span className="tag">{c.inEye}</span>
                  <h3 className="card-title">{a.title}</h3>
                  {a.summary && <p className="body" style={{ fontSize: '0.98rem' }}>{a.summary}</p>}
                  <span className="btn-line">{locale === 'ar' ? 'اقرأ' : 'Read'} <span className="arrow">→</span></span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="lead" data-reveal>{c.inEmpty}</p>
          )}
        </div>
      </section>

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
