import { lazy, Suspense, useEffect } from 'react';
import { env } from '@/lib/env';
const Turnstile = lazy(() => import('@marsidev/react-turnstile').then((m) => ({ default: m.Turnstile })));
export function Captcha({ onToken, label }: { onToken: (token: string) => void; label: string }) {
  const mock = env.vaultMode === 'mock';
  useEffect(() => {
    if (mock) onToken('mock-local-token');
  }, [mock, onToken]);
  if (mock) return null;
  const siteKey = env.VITE_TURNSTILE_SITE_KEY || (import.meta.env.DEV ? '1x00000000000000000000AA' : '');
  if (!siteKey) return <output>{label}</output>;
  return (
    <div aria-label={label}>
      <Suspense fallback={null}>
        <Turnstile
          siteKey={siteKey}
          onSuccess={onToken}
          onExpire={() => onToken('')}
          onError={() => onToken('')}
          options={{ size: 'flexible' }}
        />
      </Suspense>
    </div>
  );
}
