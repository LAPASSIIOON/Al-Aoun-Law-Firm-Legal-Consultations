import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation.js';
import s from '../shared.module.css';
import h from '../home.module.css';

const FOUNDER = {
  ar: { name: 'الدكتور هيثم أحمد العون', role: 'المؤسِّس ورئيس مجلس الإدارة', title: 'محامٍ بالتمييز والدستورية',
    bio: 'حاصل على دكتوراه القانون الدستوري من جامعة القاهرة بتقدير امتياز، ومقيّد للمرافعة أمام محكمتَي التمييز والدستورية. أسّس مجموعة العون، ويرأس المجلس العلمي الاستشاري بجمعية المحامين الكويتية.' },
  en: { name: 'Dr. Haitham Ahmed Al Oun', role: 'Founder & Chairman', title: 'Cassation & Constitutional Lawyer',
    bio: 'Holds a PhD in Constitutional Law from Cairo University (Excellent), admitted before the Cassation and Constitutional courts. Founder of Al Oun, and Chair of the Scientific Advisory Council at the Kuwait Lawyers Association.' },
};
export function generateStaticParams() { return [{ locale: 'ar' }, { locale: 'en' }]; }
export async function generateMetadata({ params }) { const { locale } = await params; const t = await getTranslations({ locale, namespace: 'people' }); return { title: t('heading') }; }

export default async function Team({ params }) {
  const { locale } = await params; setRequestLocale(locale);
  const t = await getTranslations('people');
  const tt = await getTranslations('teamPage');
  const f = FOUNDER[locale] || FOUNDER.ar;
  return (
    <>
      <section className={`on-espresso ${s.pageHead} section-tight`}>
        <div className="wrap">
          <span className="eyebrow" data-reveal>{t('eyebrow')}</span>
          <h1 className="display d-1" data-reveal style={{ marginBlock: '1.2rem 1.5rem' }}>{t('heading')}</h1>
          <p className="lead" data-reveal style={{ maxWidth: '52ch' }}>{tt('lead')}</p>
        </div>
      </section>
      <section className="on-ivory section">
        <div className="wrap">
          <span className="eyebrow" data-reveal>{tt('founderHeading')}</span>
          <div className={h.founder} data-reveal>
            <div className={h.founderMedia}><img src="/media/founder-haitham.jpg" alt={f.name} /></div>
            <div>
              <h2 className="display d-2">{f.name}</h2>
              <p className={h.founderRole}>{f.role} · {f.title}</p>
              <p className="body" style={{ marginBlockStart: '1.25rem' }}>{f.bio}</p>
              <Link href="/team/haitham-al-aoun" className="btn-line" style={{ marginBlockStart: '1.75rem' }}>{locale==='ar'?'الملف الكامل':'Full profile'}<span className="arrow">→</span></Link>
            </div>
          </div>
        </div>
      </section>
      <section className="on-graphite section-tight section">
        <div className="wrap-narrow wrap">
          <div className={s.emptyBox} data-reveal>
            <span className="tag">{t('forthcoming')}</span>
            <p className="body">{tt('memberForthcoming')}</p>
          </div>
        </div>
      </section>
    </>
  );
}
