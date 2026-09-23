import { redirect } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation.js';
import { getCurrentMember, createSupabaseServerClient } from '@/lib/supabase-auth-server.js';
import { signOutAction } from '@/app/actions/auth.js';
import { memberTypeLabel } from '@/lib/member-types.js';
import MemberProfileCard from '@/components/MemberProfileCard.js';
import RequestStatusTimeline from '@/components/RequestStatusTimeline.js';
import { listMyMatters } from '@/app/actions/matters.js';
import { requestPhaseIndex } from '@/lib/request-status.js';
import styles from './my-requests.module.css';

export const dynamic = 'force-dynamic';

// Which audience group each member type belongs to (drives ordering + primary action).
const GROUP_BY_TYPE = {
  individual: 'client', client: 'client', company: 'client', institution: 'client',
  lawyer: 'pro', consultant: 'pro', law_firm: 'pro',
  organization: 'org',
};

// Section order + primary section per group.
const GROUP_CONFIG = {
  client: { order: ['consultations', 'referrals', 'partnerships'], primary: 'consultations' },
  pro: { order: ['referrals', 'partnerships', 'consultations'], primary: 'referrals' },
  org: { order: ['partnerships', 'consultations', 'referrals'], primary: 'partnerships' },
};

async function fetchAll() {
  const supabase = await createSupabaseServerClient();
  const [c, r, p] = await Promise.all([
    supabase.rpc('my_consultations'), supabase.rpc('my_referrals'), supabase.rpc('my_partnerships'),
  ]);
  return { consultations: c.data || [], referrals: r.data || [], partnerships: p.data || [] };
}

/** @param {{ params: Promise<{ locale: string }> }} props */
export default async function MyRequests({ params }) {
  const { locale } = await params; setRequestLocale(locale);
  const t = await getTranslations('myRequests');
  const member = await getCurrentMember();
  if (!member) redirect(`/${locale}/account/sign-in`);

  const { consultations, referrals, partnerships } = await fetchAll();
  const myMatters = await listMyMatters();
  const group = GROUP_BY_TYPE[member.member_type] || 'client';
  const cfg = GROUP_CONFIG[group];
  const typeLabel = memberTypeLabel(locale, member.member_type);

  const sections = {
    consultations: { heading: t('consultationsHeading'), label: t('consultationLabel'), empty: t('emptyConsultations'), items: consultations },
    referrals: { heading: t('referralsHeading'), label: t('referralLabel'), empty: t('emptyReferrals'), items: referrals },
    partnerships: { heading: t('partnershipsHeading'), label: t('partnershipLabel'), empty: t('emptyPartnerships'), items: partnerships },
  };

  const timelineLabels = {
    timelineLabel: t('timelineLabel'),
    nextLabel: t('nextLabel'),
    phases: {
      consultations: [t('phaseReceived'), t('phaseReview'), t('phaseContact'), t('phaseComplete')],
      referrals: [t('phaseReceived'), t('phaseReview'), t('phaseCoordination'), t('phaseComplete')],
      partnerships: [t('phaseReceived'), t('phaseReview'), t('phaseContact'), t('phaseDecision')],
    },
    help: [t('helpReceived'), t('helpReview'), t('helpProgress'), t('helpComplete')],
  };

  // Quick actions per group. First is the primary CTA.
  const ACTIONS = {
    client: [{ href: '/contact', label: t('quickAskConsultation'), solid: true }],
    pro: [{ href: '/international/refer-a-matter', label: t('quickReferMatter'), solid: true }, { href: '/international/partner-with-us', label: t('quickPartner'), solid: false }],
    org: [{ href: '/international/partner-with-us', label: t('quickPartner'), solid: true }, { href: '/contact', label: t('quickAskConsultation'), solid: false }],
  };
  const actions = ACTIONS[group];
  if (myMatters.length > 0) {
    actions.unshift({ href: '/account/matters', label: t('quickMyMatters'), solid: true });
  }

  const profileLabels = {
    profileHeading: t('profileHeading'), editProfile: t('editProfile'),
    save: t('saveProfile'), cancel: t('cancelEdit'), saving: t('savingProfile'),
    saved: t('savedProfile'), error: t('editErrorGeneric'),
    fieldName: t('fieldName'), fieldEmail: t('fieldEmail'), fieldPhone: t('fieldPhone'),
    fieldOrg: t('fieldOrg'), fieldLicense: t('fieldLicense'), emailLockedNote: t('emailLockedNote'),
  };

  const Row = ({ type, title, sub, stage, date }) => {
    const phases = timelineLabels.phases[type] || timelineLabels.phases.consultations;
    const safeStatus = phases[requestPhaseIndex(type, stage)];
    return (
      <article className={styles.requestCard}>
        <div className={styles.requestHead}>
          <div>
            <div className={styles.requestTitle}>{title}</div>
            {sub && <div className={styles.requestMeta}>{sub}</div>}
            <div className={styles.requestMeta}>{t('submittedLabel')} {new Date(date).toLocaleDateString(locale === 'ar' ? 'ar-KW' : 'en-GB')}</div>
          </div>
          <span className={styles.status}>{safeStatus}</span>
        </div>
        <RequestStatusTimeline type={type} stage={stage} labels={timelineLabels} />
      </article>
    );
  };

  function renderSection(key) {
    const s = sections[key];
    const isPrimary = key === cfg.primary;
    if (!s.items.length && !isPrimary) return null; // hide empty secondary sections
    return (
      <div key={key} className={styles.requestSection}>
        <h2 className="display d-3" style={{ marginBlockEnd: '.75rem', fontSize: '1.3rem' }}>{s.heading}</h2>
        {s.items.length ? (
          <div className={styles.requestList}>
            {s.items.map((it) => (
              <Row key={it.id} type={key} title={it.reference || s.label} sub={it.referring_firm_name || it.email} stage={it.stage} date={it.created_at} />
            ))}
          </div>
        ) : (
          <p className="body" style={{ color: 'var(--muted)' }}>{s.empty}</p>
        )}
      </div>
    );
  }

  return (
    <section className="on-white section">
      <div className="wrap-narrow wrap">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-start', justifyContent: 'space-between', marginBlockEnd: '.4rem' }}>
          <h1 className="display d-2" style={{ margin: 0 }}>{t('greeting', { name: member.display_name })}</h1>
          <form action={async () => { 'use server'; await signOutAction(locale); }}>
            <button type="submit" className="btn btn-ghost" style={{ fontSize: '.85rem', padding: '.55rem 1.1rem' }}>{locale === 'ar' ? 'تسجيل الخروج' : 'Sign Out'}</button>
          </form>
        </div>
        <p className="lead" style={{ marginBlockEnd: '2.5rem', maxWidth: '52ch' }}>{t('subtitle')}</p>

        <MemberProfileCard member={member} typeLabel={typeLabel} locale={locale} labels={profileLabels} />

        <div style={{ marginBlockEnd: '2.75rem' }}>
          <h2 className="display d-3" style={{ marginBlockEnd: '.9rem', fontSize: '1.2rem' }}>{t('quickActionsHeading')}</h2>
          <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}>
            {actions.map((a) => (
              <Link key={a.href} href={a.href} className={a.solid ? 'btn btn-solid' : 'btn btn-ghost'}>
                {a.label}<span className="arrow">→</span>
              </Link>
            ))}
          </div>
        </div>

        <h2 className="display d-2" style={{ fontSize: '1.5rem', marginBlockEnd: '1.5rem' }}>{t('requestsHeading')}</h2>
        {cfg.order.map((key) => renderSection(key))}
      </div>
    </section>
  );
}
