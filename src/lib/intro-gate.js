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

export const INTRO_GATE_SCRIPT = `(function(){try{var d=document.documentElement;if(!/^\\/(ar|en)\\/?$/.test(location.pathname))return;if(window.sessionStorage.getItem('${INTRO_SESSION_KEY}')==='1')return;if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;d.setAttribute('data-intro','play');}catch(e){}})();`;
