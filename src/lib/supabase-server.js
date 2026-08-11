import { createClient } from '@supabase/supabase-js';

/**
 * عميل Supabase للخادم فقط. لا يُستورَد في أي مكوّن عميل.
 * مفتاح الخدمة سرّي ولا يُكشف للمتصفح إطلاقًا (§ أمان Supabase).
 * @returns {import('@supabase/supabase-js').SupabaseClient}
 */
export function createServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error('Missing Supabase server environment variables.');
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * عميل عام (anon) للقراءات العامة الخاضعة لـ RLS.
 * @returns {import('@supabase/supabase-js').SupabaseClient}
 */
export function createAnonClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error('Missing Supabase anon environment variables.');
  }
  return createClient(url, anonKey, {
    auth: { persistSession: false },
  });
}
