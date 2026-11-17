import { lazy, Suspense, useState } from 'react';
import { useContent, useLocale } from '@/i18n/content';
import { vaultApi, vaultAvailable } from '@/features/vault/api';
const Captcha = lazy(() => import('@/features/vault/Captcha').then((m) => ({ default: m.Captcha })));
export function NewsletterForm() {
  const { newsletter } = useContent('common').footer;
  const locale = useLocale();
  const [active, setActive] = useState(false);
  const [token, setToken] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  return (
    <section className="newsletter-panel" aria-labelledby="newsletter-title">
      <div>
        <h2 id="newsletter-title" className="text-h2">
          {newsletter.title}
        </h2>
        <p>{newsletter.text}</p>
      </div>
      <form
        aria-describedby="newsletter-status"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!token || busy) return;
          const data = new FormData(e.currentTarget);
          setBusy(true);
          setStatus('');
          try {
            const result = await vaultApi.subscribe({
              email: String(data.get('email')),
              locale,
              consent: true,
              turnstileToken: token,
            });
            setStatus(result.status === 'already' ? newsletter.already : newsletter.success);
          } catch {
            setStatus(newsletter.error);
          } finally {
            setBusy(false);
            setToken('');
            setAttempt((v) => v + 1);
          }
        }}
      >
        <fieldset disabled={!vaultAvailable || busy}>
          <legend className="sr-only">{newsletter.title}</legend>
          <label htmlFor="newsletter-email">{newsletter.emailLabel}</label>
          <div className="newsletter-input-row">
            <input
              id="newsletter-email"
              onFocus={() => setActive(true)}
              type="email"
              name="email"
              autoComplete="email"
              required
              maxLength={254}
            />
            <button type="submit" disabled={!token}>
              {busy ? newsletter.submitting : newsletter.button}
            </button>
          </div>
          <label className="newsletter-consent">
            <input type="checkbox" name="consent" required />
            <span>{newsletter.consent}</span>
          </label>
          {active && (
            <Suspense fallback={null}>
              <Captcha key={attempt} onToken={setToken} label={newsletter.captchaLabel} />
            </Suspense>
          )}
        </fieldset>
        <output id="newsletter-status" aria-live="polite">
          {!vaultAvailable ? newsletter.unavailable : status}
        </output>
      </form>
    </section>
  );
}
