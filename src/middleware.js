import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing.js';
import { createServerClient } from '@supabase/ssr';

const intlMiddleware = createMiddleware(routing);

/**
 * يدمج توجيه next-intl مع تحديث جلسة Supabase (كوكيز التوثيق) في نفس الاستجابة.
 * @param {import('next/server').NextRequest} request
 */
export default async function middleware(request) {
  const response = intlMiddleware(request);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );
  await supabase.auth.getUser();

  return response;
}

export const config = {
  // matcher صريح موصى به من next-intl لـVercel:
  // - يطابق الجذر '/' صراحةً
  // - يطابق كل المسارات ما عدا api و_next و_vercel والملفات الثابتة (اللي فيها نقطة)
  matcher: [
    '/',
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
};
