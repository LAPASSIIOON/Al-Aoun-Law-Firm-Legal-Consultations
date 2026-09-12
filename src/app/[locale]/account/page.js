import { redirect } from 'next/navigation';
import { getCurrentMember } from '@/lib/supabase-auth-server.js';

// هذا المدخل يعتمد على جلسة المستخدم في كل طلب، فلا يُخزَّن كصفحة ثابتة.
export const dynamic = 'force-dynamic';

/** @param {{ params: Promise<{ locale: string }> }} props */
export default async function AccountGateway({ params }) {
  const { locale } = await params;
  const member = await getCurrentMember();

  if (!member) redirect(`/${locale}/account/sign-in`);
  if (member.role === 'admin' && member.is_active) redirect(`/${locale}/admin`);
  redirect(`/${locale}/account/my-requests`);
}
