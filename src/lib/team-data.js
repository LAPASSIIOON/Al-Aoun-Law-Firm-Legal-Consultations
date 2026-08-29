/**
 * بيانات الفريق — مصدر واحد مشترك بين صفحة الفهرس وصفحة الملف الشخصي.
 * كل عضو جديد يُضاف هنا فقط.
 */
export const TEAM = [
  {
    slug: 'haitham-al-aoun',
    isFounder: true,
    tier: 'founder',
    photoThumb: '/media/founder-haitham.jpg',
    photoFull: '/media/founder-haitham-full.jpg',
    ar: {
      name: 'الدكتور هيثم أحمد العون',
      role: 'المؤسِّس ورئيس مجلس الإدارة',
      title: 'محامٍ بالتمييز والدستورية',
      bio: 'حاصل على دكتوراه القانون الدستوري من جامعة القاهرة بتقدير امتياز، ومقيّد للمرافعة أمام محكمتَي التمييز والدستورية. أسّس مجموعة العون، ويرأس المجلس العلمي الاستشاري بجمعية المحامين الكويتية.',
      creds: [
        'دكتوراه في القانون الدستوري — جامعة القاهرة (امتياز)',
        'مقيّد للمرافعة أمام محكمتَي التمييز والدستورية',
        'رئيس المجلس العلمي الاستشاري — جمعية المحامين الكويتية',
        'مؤسِّس مجموعة العون للمحاماة والاستشارات القانونية',
      ],
    },
    en: {
      name: 'Dr. Haitham Ahmed Al Oun',
      role: 'Founder & Chairman',
      title: 'Cassation & Constitutional Lawyer',
      bio: 'Holds a PhD in Constitutional Law from Cairo University (Excellent), admitted before the Cassation and Constitutional courts. Founder of Al Oun, and Chair of the Scientific Advisory Council at the Kuwait Lawyers Association.',
      creds: [
        'PhD in Constitutional Law — Cairo University (Excellent)',
        'Admitted before the Cassation and Constitutional courts',
        'Chair, Scientific Advisory Council — Kuwait Lawyers Association',
        'Founder of Al Oun Law Firm & Legal Consultations',
      ],
    },
  },
  {
    slug: 'bader-saif-al-rashidi',
    isFounder: false,
    tier: 'partner',
    photoThumb: '/media/team-bader-saif.jpg',
    photoFull: '/media/team-bader-saif-full.jpg',
    ar: {
      name: 'بدر سيف عبدالله عسكر الرشيدي',
      role: 'محامٍ ومستشار قانوني دولي',
      title: 'شريك في المجموعة',
      bio: 'محامٍ مرخّص لدى محكمة التمييز والمحكمة الدستورية في دولة الكويت، ومحامٍ للقضايا الدولية في القضايا التجارية والمدنية، ووسيط قانوني ومحكّم تجاري معتمد دوليًا، يتمتع بخبرة مهنية في تسوية المنازعات والتحكيم والوساطة القانونية. يعمل كمدرب قانوني معتمد لدى جمعية المحامين الكويتية، وله إسهامات في تطوير القدرات القانونية وبناء الكفاءات المهنية.',
      creds: [
        'محامٍ أمام محكمة التمييز والمحكمة الدستورية — دولة الكويت',
        'محامٍ أمام المحاكم الدولية في القضايا التجارية والمدنية',
        'محكّم تجاري دولي معتمد · وسيط قانوني دولي معتمد',
        'المدير العام — مركز البروتوكولات والعقود الدولية، جمعية المحامين الكويتية',
        'مدرب قانوني معتمد لدى جمعية المحامين الكويتية',
      ],
      education: [
        'بكالوريوس في القانون — جامعة الإسراء، المملكة الأردنية الهاشمية (2013)',
        'باحث ماجستير في القانون الخاص — جامعة البحرين، مملكة البحرين (متوقَّع 2026)',
        'دبلوم في تقنية المعلومات — معهد كامبردج',
      ],
      experience: [
        'مستشار قانوني — مجلس الأمة الكويتي، لجنة تنمية المناطق الحديثة والنائية (2023–2024)',
        'الأمانة العامة لمجلس الوزراء، دولة الكويت — الشؤون القانونية (2013–2016)',
        'مستشار قانوني دولي لعدد من الشركات وقيادات الأعمال محليًا ودوليًا (منذ 2013)',
      ],
    },
    en: {
      name: 'Bader Saif Abdullah Askar Al-Rashidi',
      role: 'Attorney & International Legal Consultant',
      title: 'Partner, AL OUN Group',
      bio: 'Attorney licensed before the Court of Cassation and the Constitutional Court in Kuwait, with extensive experience in international commercial and civil litigation. Certified international commercial arbitrator and legal mediator, with a strong background in legal consultancy, arbitration, protocol management, and legal training. Actively involved in advising corporations, business leaders, and governmental bodies locally and internationally since 2013.',
      creds: [
        'Attorney before the Court of Cassation and Constitutional Court — Kuwait',
        'Attorney before international courts (commercial & civil cases)',
        'Certified International Commercial Arbitrator · Certified International Legal Mediator',
        'Director General — Protocols & International Contracts Center, Kuwait Lawyers Association',
        'Accredited Legal Trainer, Kuwait Lawyers Association',
      ],
      education: [
        'Bachelor of Laws (LL.B.) — Al-Esra University, Jordan (2013)',
        "Master's Researcher in Private Law — Bahrain University, Bahrain (Expected 2026)",
        'Diploma in Information Technology — Cambridge Institute',
      ],
      experience: [
        'Legal Consultant — Kuwait National Assembly, Committee for the Development of Modern and Remote Areas (2023–2024)',
        'General Secretariat of the Council of Ministers, Kuwait — Legal Affairs (2013–2016)',
        'International Legal Consultant advising companies and business leaders locally and internationally (since 2013)',
      ],
    },
  },
];

export function getTeamMember(slug) {
  return TEAM.find((m) => m.slug === slug) || null;
}
