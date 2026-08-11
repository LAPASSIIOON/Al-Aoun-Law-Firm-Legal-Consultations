import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing.js';

export default createMiddleware(routing);

export const config = {
  // يستثني ملفات API والأصول الثابتة وملفات Next الداخلية
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
