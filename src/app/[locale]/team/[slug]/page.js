import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation.js';
import s from '../../shared.module.css';
import h from '../../home.module.css';

const FOUNDER = {
  ar: { name: 'الدكتور هيثم أحمد العون', role: 'المؤسِّس ورئيس مجلس الإدارة', title: 'محامٍ بالتمييز والدستورية',
    creds: ['دكتوراه في القانون الدستوري — جامعة القاهرة (امتياز)','مقيّد للمرافعة أمام محكمتَي التمييز والدستورية','رئيس المجلس العلمي الاستشاري — جمعية المحامين الكويتية','مؤسِّس مجموعة العون للمحاماة والاستشارات القانونية'] },
  en: { name: 'Dr. Haitham Ahmed Al Oun', role: 'Founder & Chairman', title: 'Cassation & Constitutional Lawyer',
    creds: ['PhD in Constitutional Law — Cairo University (Excellent)','Admitted before the Cassation and Constitutional courts','Chair, Scientific Advisory Council — Kuwait Lawyers Association','Founder of Al Oun Law Firm & Legal Consultations'] },
};
export async function generateMetadata({ params }) { const { slug, locale } = await params; if (slug!=='haitham-al-aoun') return {}; return { title: (FOUNDER[locale]||FOUNDER.ar).name }; }

export default async function TeamMember({ params }) {
  const { slug, locale } = await params; setRequestLocale(locale);
  if (slug !== 'haitham-al-aoun') notFound();
  const f = FOUNDER[locale] || FOUNDER.ar;
  const t = await getTranslations('people');
  return (
    <section className={`on-ivory ${s.pageHead} section`}>
      <div className="wrap">
        <Link href="/team" className="btn-line" style={{ marginBlockEnd: '2.5rem' }}>{t('heading')}</Link>
        <div className={h.founder}>
          <div className={h.founderMedia}><img src="/media/founder-haitham-full.jpg" alt={f.name} /></div>
          <div>
            <h1 className="display d-1">{f.name}</h1>
            <p className={h.founderRole} style={{ fontSize: '1.05rem' }}>{f.role} · {f.title}</p>
            <ul className={s.pointList}>
              {f.creds.map((c, i) => (<li key={i} className={s.point}><span className="body" style={{ color: 'var(--ink)' }}>{c}</span></li>))}
            </ul>
            <a href="mailto:Aloun.Law@gmail.com" className="btn btn-solid" style={{ marginBlockStart: '2rem' }}>{locale==='ar'?'تواصل مع المكتب':'Contact the firm'}<span className="arrow">→</span></a>
          </div>
        </div>
      </div>
    </section>
  );
}
