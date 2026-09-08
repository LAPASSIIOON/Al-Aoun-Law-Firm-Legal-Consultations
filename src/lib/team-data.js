/**
 * بيانات الفريق — مصدر واحد مشترك بين صفحة الفهرس وصفحة الملف الشخصي.
 * كل عضو جديد يُضاف هنا فقط.
 *
 * D5-A: تعميق الملفَّين إلى بنية مهنية موحّدة —
 *   creds (سطور الإثبات الرئيسة) · education · experience · leadership · registrations · works
 * كل حقل اختياري: القسم لا يُعرض إن لم توجد بيانات معتمَدة له، فلا صناديق فارغة ولا وعود.
 * الأرقام في العربية بالأرقام العربية‑الهندية اتساقًا مع بقية الموقع.
 * لا يُضاف هنا إلا ما اعتمده المالك نصًّا — لا استنتاج ولا صياغة ترويجية.
 */
export const TEAM = [
  {
    slug: 'haitham-al-aoun',
    isFounder: true,
    tier: 'founder',
    photoThumb: '/media/founder-haitham.jpg',
    photoFull: '/media/founder-haitham-full.jpg',
    ar: {
      /* الاسم العربي كما هو — الاسم الرباعي المعتمَد وردنا بالإنجليزية وحدها. */
      name: 'الدكتور هيثم أحمد العون',
      role: 'المؤسِّس ورئيس مجلس الإدارة',
      title: 'محامٍ بالتمييز والدستورية',
      bio: 'حاصل على دكتوراه القانون الدستوري من جامعة القاهرة بتقدير امتياز عام ٢٠١٧، ومقيّد للمرافعة أمام محكمتَي التمييز والدستورية. أسّس مجموعة AL OUN القانونية للاستشارات والتحكيم عام ٢٠٠٢ ويرأس مجلس إدارتها، ويرأس المجلس العلمي الاستشاري بجمعية المحامين الكويتية.',
      creds: [
        'دكتوراه في القانون الدستوري — جامعة القاهرة (امتياز، ٢٠١٧)',
        'مقيّد للمرافعة أمام محكمتَي التمييز والدستورية',
        'محكّم مسجَّل لدى جهات تحكيم في الكويت ودول مجلس التعاون',
      ],
      education: [
        'دكتوراه في القانون الدستوري — جامعة القاهرة (امتياز، ٢٠١٧)',
        'ماجستير في القانون الدستوري — جامعة طنطا (جيد جدًا، ٢٠١٠)',
        'دبلوم القانون العام — جامعة طنطا (٢٠٠٧)',
        /* D5-A مراجعة: اسم جامعة الليسانس متعارض بين المصدرين (القاهرة/طنطا) — يُحجب مؤقتًا
           حتى يعتمد المالك الجهة، ويبقى ما هو مؤكَّد: الدرجة والسنة. */
        'ليسانس الحقوق — ٢٠٠٠',
      ],
      leadership: [
        'المؤسِّس ورئيس مجلس الإدارة — مجموعة AL OUN القانونية للاستشارات والتحكيم (منذ ٢٠٠٢)',
        'رئيس المجلس العلمي الاستشاري — جمعية المحامين الكويتية',
      ],
      registrations: [
        'مركز التحكيم التجاري لدول مجلس التعاون',
        'مركز الكويت للتحكيم التجاري',
        'هيئة أسواق المال',
        'إدارة التحكيم القضائي — وزارة العدل، دولة الكويت',
      ],
      works: [
        'رسالة الدكتوراه في القانون الدستوري — جامعة القاهرة (٢٠١٧)',
        'رسالة الماجستير في القانون الدستوري — جامعة طنطا (٢٠١٠)',
        'أبحاث منشورة في القانون الدستوري',
      ],
    },
    en: {
      name: 'Dr. Haitham Ahmed Eissa Aloun',
      role: 'Founder & Chairman',
      title: 'Cassation & Constitutional Lawyer',
      bio: 'Holds a PhD in Constitutional Law from Cairo University (Excellent, 2017) and is admitted to plead before the Court of Cassation and the Constitutional Court. He founded AL OUN Legal Group for Consultations and Arbitration in 2002 and chairs its board, and chairs the Scientific Advisory Council at the Kuwait Lawyers Association.',
      creds: [
        'PhD in Constitutional Law — Cairo University (Excellent, 2017)',
        'Admitted before the Court of Cassation and the Constitutional Court',
        'Registered arbitrator with arbitration bodies in Kuwait and the GCC',
      ],
      education: [
        'PhD in Constitutional Law — Cairo University (Excellent, 2017)',
        'Master of Laws in Constitutional Law — Tanta University (Very Good, 2010)',
        'Diploma in Public Law — Tanta University (2007)',
        /* D5-A review: the LL.B. awarding university conflicts between sources — withheld
           until the owner confirms it; the verified degree and year remain. */
        'Bachelor of Laws — 2000',
      ],
      leadership: [
        'Founder & Chairman — AL OUN Legal Group for Consultations and Arbitration (since 2002)',
        'Chair, Scientific Advisory Council — Kuwait Lawyers Association',
      ],
      registrations: [
        'GCC Commercial Arbitration Centre',
        'Kuwait Commercial Arbitration Centre',
        'Capital Markets Authority',
        'Judicial Arbitration Department — Ministry of Justice, Kuwait',
      ],
      works: [
        'Doctoral thesis in constitutional law — Cairo University (2017)',
        "Master's thesis in constitutional law — Tanta University (2010)",
        'Published research in constitutional law',
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
      bio: 'محامٍ مرخّص لدى محكمة التمييز والمحكمة الدستورية في دولة الكويت، وله خبرة في المسائل التجارية والمدنية ذات البعد الدولي. محكّم تجاري دولي ووسيط قانوني دولي معتمد، ومدرب قانوني معتمد. يقدّم الاستشارات للشركات وقيادات الأعمال محليًا ودوليًا منذ عام ٢٠١٣.',
      creds: [
        'محامٍ أمام محكمة التمييز والمحكمة الدستورية — دولة الكويت',
        'خبرة في المسائل التجارية والمدنية ذات البعد الدولي',
        'محكّم تجاري دولي معتمد · وسيط قانوني دولي معتمد',
        'مدرب قانوني معتمد',
      ],
      education: [
        'بكالوريوس في القانون — جامعة الإسراء، المملكة الأردنية الهاشمية (٢٠١٣)',
        'دبلوم في تقنية المعلومات — معهد كامبردج',
      ],
      experience: [
        'مستشار قانوني — مجلس الأمة الكويتي، لجنة تنمية المناطق الحديثة والنائية (٢٠٢٣–٢٠٢٤)',
        'الأمانة العامة لمجلس الوزراء، دولة الكويت — الشؤون القانونية (٢٠١٣–٢٠١٦)',
        'استشارات قانونية للشركات وقيادات الأعمال محليًا ودوليًا (منذ ٢٠١٣)',
      ],
      leadership: [
        'المدير العام — مركز البروتوكولات والعقود الدولية، جمعية المحامين الكويتية',
        'محاضر قانوني — أكاديمية سعد العبدالله للعلوم الأمنية',
        'مدرب قانوني معتمد — جمعية المحامين الكويتية',
        'تدريب قانوني لجهات حكومية وخاصة',
      ],
    },
    en: {
      name: 'Bader Saif Abdullah Askar Al-Rashidi',
      role: 'Attorney & International Legal Consultant',
      title: 'Partner, AL OUN Group',
      bio: 'Attorney licensed before the Court of Cassation and the Constitutional Court in Kuwait, with experience in commercial and civil matters that carry an international dimension. Certified international commercial arbitrator and certified international legal mediator, and an accredited legal trainer. He has advised companies and business leaders locally and internationally since 2013.',
      creds: [
        'Attorney before the Court of Cassation and the Constitutional Court — Kuwait',
        'Experience in commercial and civil matters with an international dimension',
        'Certified International Commercial Arbitrator · Certified International Legal Mediator',
        'Accredited Legal Trainer',
      ],
      education: [
        'Bachelor of Laws (LL.B.) — Al-Esra University, Jordan (2013)',
        'Diploma in Information Technology — Cambridge Institute',
      ],
      experience: [
        'Legal Consultant — Kuwait National Assembly, Committee for the Development of Modern and Remote Areas (2023–2024)',
        'General Secretariat of the Council of Ministers, Kuwait — Legal Affairs (2013–2016)',
        'Advising companies and business leaders locally and internationally (since 2013)',
      ],
      leadership: [
        'Director General — Protocols & International Contracts Center, Kuwait Lawyers Association',
        'Legal Lecturer — Saad Al-Abdullah Academy for Security Sciences',
        'Accredited Legal Trainer — Kuwait Lawyers Association',
        'Legal training for government and private-sector bodies',
      ],
    },
  },
];

export function getTeamMember(slug) {
  return TEAM.find((m) => m.slug === slug) || null;
}
