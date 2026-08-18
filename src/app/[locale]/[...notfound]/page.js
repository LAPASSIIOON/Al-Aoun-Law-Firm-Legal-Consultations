import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';

// Any path under /[locale]/ that does not match a real route lands here and
// renders the localized, styled 404 (src/app/[locale]/not-found.js) inside the
// site layout — instead of falling through to Next.js's bare default 404.
export const dynamic = 'force-dynamic';

/** @param {{ params: Promise<{ locale: string }> }} props */
export default async function CatchAllNotFound({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  notFound();
}
