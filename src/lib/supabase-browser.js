'use client';
import { createBrowserClient } from '@supabase/ssr';

/** عميل Supabase واعٍ بالجلسة من جانب المتصفح — يُستخدم لرفع الملفات مباشرة إلى Storage. */
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
