import { useState } from 'react';
import { z } from 'zod';
import { useContent } from '@/i18n/content';
import { adminClient } from '../client';
export function Login({ onSuccess }: { onSuccess: () => void }) {
  const { login } = useContent('admin');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  return (
    <form
      className="admin-form"
      onSubmit={async (event) => {
        event.preventDefault();
        setBusy(true);
        setError('');
        const data = Object.fromEntries(new FormData(event.currentTarget));
        const parsed = z
          .object({ email: z.email().max(254), password: z.string().min(1).max(1024) })
          .safeParse(data);
        try {
          if (!parsed.success) {
            setError(login.error);
            return;
          }
          const result = await adminClient().auth.signInWithPassword(parsed.data);
          if (result.error) {
            await new Promise((resolve) => setTimeout(resolve, 650));
            setError(result.error.status === 429 ? login.locked : login.error);
          } else {
            event.currentTarget?.reset();
            onSuccess();
          }
        } catch {
          setError(login.error);
        } finally {
          setBusy(false);
        }
      }}
    >
      <p>{login.intro}</p>
      <label>
        {login.email}
        <input
          name="email"
          type="email"
          autoComplete="username"
          spellCheck={false}
          required
          maxLength={254}
        />
      </label>
      <label>
        {login.password}
        <input name="password" type="password" autoComplete="current-password" required maxLength={1024} />
      </label>
      <button disabled={busy}>{busy ? login.submitting : login.submit}</button>
      <p role="alert">{error}</p>
    </form>
  );
}
