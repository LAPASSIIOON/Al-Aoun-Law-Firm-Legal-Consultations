import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

/**
 * مسار استقبال روابط البريد (استعادة كلمة المرور / تأكيد الحساب).
 * يبادل رمز PKCE بجلسة، يكتب كوكيز الجلسة على الاستجابة، ثم يوجّه إلى `next`.
 * الكتابة على كائن الاستجابة مباشرةً (لا next/headers) لضمان بقاء الكوكيز مع التحويل.
 * @param {import('next/server').NextRequest} request
 */
export async function GET(request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const nextParam = url.searchParams.get('next') || '/';
  // منع open-redirect: مسارات داخلية فقط.
  const safeNext = nextParam.startsWith('/') && !nextParam.startsWith('//') ? nextParam : '/';

  if (!code) return NextResponse.redirect(new URL('/', url.origin));

  const response = NextResponse.redirect(new URL(safeNext, url.origin));
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(new URL(safeNext, url.origin));
  return response;
}
