'use client';

import { useEffect } from 'react';

/**
 * Supabase returns failed recovery links to the configured site URL with the
 * error in the URL fragment. Fragments never reach the server, so move this
 * specific failure to the existing reset page where the visitor sees the
 * localized expired-link message and can request a new link.
 */
export default function AuthRecoveryErrorRedirect({ locale }) {
  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.slice(1));
    const code = params.get('error_code');
    const description = params.get('error_description') || '';
    const expired = code === 'otp_expired'
      || (params.get('error') === 'access_denied' && /invalid|expired/i.test(description));

    if (expired) window.location.replace(`/${locale}/account/reset-password?expired=1`);
  }, [locale]);

  return null;
}
