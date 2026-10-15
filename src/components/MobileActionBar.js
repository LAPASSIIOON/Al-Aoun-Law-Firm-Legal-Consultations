'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation.js';
import { whatsappHref } from '@/lib/whatsapp.js';
import s from './MobileActionBar.module.css';

/**
 * شريط الهاتف السفلي — واتساب + «اطلب استشارة» (من قالب صفحة الخدمة المعتمد).
 *
 * على الهاتف فقط (≤767px، نفس حدّ إخفاء زرّ واتساب العائم وزرّ التمرير لأعلى، فلا يجتمعان).
 * يظهر بعد أول تمرير حقيقي كي لا يغطي الهيرو عند الدخول، ولا يظهر:
 *  - في الحساب ولوحة الإدارة وصفحات النماذج (التواصل، إحالة ملف، الشراكة) — لا يغطي حقولها؛
 *  - أثناء مقدمة الرئيسية؛
 *  - وأثناء الكتابة في أي حقل (لوحة المفاتيح مفتوحة) — مثل حقل النشرة في التذييل.
 * أخضر واتساب يظهر عند الضغط فقط، كبقية استخدامه في الموقع.
 */
const HIDDEN = ['/account', '/admin', '/auth', '/contact', '/international/refer-a-matter', '/international/partner-with-us'];
const SHOW_AFTER = 160;

export default function MobileActionBar({ locale }) {
  const pathname = usePathname();
  const t = useTranslations('nav');
  const [scrolled, setScrolled] = useState(false);
  const [typing, setTyping] = useState(false);
  const hidden = HIDDEN.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  useEffect(() => {
    if (hidden) return undefined;
    const html = document.documentElement;
    html.setAttribute('data-actionbar', 'on');
    const onScroll = () => setScrolled(window.scrollY > SHOW_AFTER);
    const isField = (el) => el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable);
    const onFocusIn = (e) => { if (isField(e.target)) setTyping(true); };
    const onFocusOut = (e) => { if (isField(e.target)) setTyping(false); };
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('focusin', onFocusIn);
    document.addEventListener('focusout', onFocusOut);
    onScroll();
    return () => {
      html.removeAttribute('data-actionbar');
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('focusin', onFocusIn);
      document.removeEventListener('focusout', onFocusOut);
    };
  }, [hidden]);

  if (hidden) return null;

  const from = `/${locale}${pathname === '/' ? '' : pathname}`;
  const shown = scrolled && !typing;

  return (
    <nav
      className={`no-print ${s.bar} ${shown ? s.shown : ''}`}
      aria-label={locale === 'ar' ? 'تواصل سريع' : 'Quick contact'}
      inert={!shown}
    >
      <a href={whatsappHref(locale)} target="_blank" rel="noopener noreferrer" className={s.wa}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 12a8.5 8.5 0 0 1-12.4 7.6L3.5 21l1.4-4.9A8.5 8.5 0 1 1 21 12z" />
        </svg>
        {locale === 'ar' ? 'واتساب' : 'WhatsApp'}
      </a>
      <Link href={`/contact?from=${encodeURIComponent(from)}`} className={s.consult}>{t('consult')}</Link>
    </nav>
  );
}
