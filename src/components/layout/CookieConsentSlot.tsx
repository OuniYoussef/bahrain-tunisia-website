import { useEffect } from 'react';
import { env } from '@/lib/env';
export function CookieConsentSlot() {
  useEffect(() => {
    if (!env.VITE_IEEE_COOKIE_SCRIPT_URL || document.getElementById('ieee-cookie-script')) return;
    const script = document.createElement('script');
    script.id = 'ieee-cookie-script';
    script.src = env.VITE_IEEE_COOKIE_SCRIPT_URL;
    script.async = true;
    document.head.append(script);
  }, []);
  return null;
}
