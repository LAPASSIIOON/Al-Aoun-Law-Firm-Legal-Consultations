/**
 * بوابة المقدمة السينمائية للرئيسية.
 *
 * سكربت صغير يعمل أثناء تحليل الصفحة، قبل أول رسم وقبل React: يقرّر هل تُعرض المقدمة، ويكتب
 * القرار على <html data-intro="play">. كل ما يُخفى أو يُظهَر للمقدمة معلّق بهذه السمة في CSS،
 * فلا وميض للصفحة قبل المقدمة، ولا وميض للمقدمة حين لا تُعرض.
 *
 * لا تُعرض إلا: في الرئيسية (/ar أو /en)، أول مرة في الجلسة، ودون طلب «تقليل الحركة».
 * المفتاح نفسه الذي تستعمله شاشة الافتتاح (SiteLoader) — الافتتاح يُرى مرة واحدة في الجلسة أيًّا كان.
 */
export const INTRO_SESSION_KEY = 'aloun-intro-seen';

export const INTL_SESSION_KEY = 'aloun-intl-seen';

/* الصفحة الدولية تستعمل البوابة نفسها: data-intl="play" يطوي مسارات الخريطة قبل أول رسم
   كي يرسمها المشهد بدل أن تظهر مرسومة ثم تختفي (IntlMap.module.css). */
export const INTRO_GATE_SCRIPT = `(function(){try{var d=document.documentElement,p=location.pathname,s=window.sessionStorage;if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;if(/^\\/(ar|en)\\/?$/.test(p)){if(s.getItem('${INTRO_SESSION_KEY}')!=='1')d.setAttribute('data-intro','play');return;}if(/^\\/(ar|en)\\/international\\/?$/.test(p)&&s.getItem('${INTL_SESSION_KEY}')!=='1')d.setAttribute('data-intl','play');}catch(e){}})();`;
