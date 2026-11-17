import { useEffect, useState } from 'react';
import { z } from 'zod';
import { useContent } from '@/i18n/content';
import { adminClient } from '../client';
type Factor = { id: string; qr?: string; secret?: string };
export function Mfa({ onSuccess }: { onSuccess: () => void }) {
  const { mfa, ui } = useContent('admin');
  const [factor, setFactor] = useState<Factor>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    void adminClient()
      .auth.mfa.listFactors()
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          setError(mfa.error);
          return;
        }
        const verified = data.totp.find((item) => item.status === 'verified');
        if (verified) setFactor({ id: verified.id });
        else setFactor({ id: '' });
      })
      .catch(() => {
        if (active) setError(mfa.error);
      });
    return () => {
      active = false;
    };
  }, [mfa.error]);
  async function enroll() {
    setBusy(true);
    setError('');
    try {
      const list = await adminClient().auth.mfa.listFactors();
      if (list.error) throw list.error;
      for (const old of list.data.all.filter((f) => f.factor_type === 'totp' && f.status === 'unverified')) {
        const removed = await adminClient().auth.mfa.unenroll({ factorId: old.id });
        if (removed.error) throw removed.error;
      }
      const { data, error } = await adminClient().auth.mfa.enroll({ factorType: 'totp' });
      if (error) throw error;
      setFactor({ id: data.id, qr: data.totp.qr_code, secret: data.totp.secret });
    } catch {
      setError(mfa.error);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="admin-form">
      <h2>{factor?.secret || !factor?.id ? mfa.enrollTitle : mfa.verifyTitle}</h2>
      <p>{factor?.secret || !factor?.id ? mfa.enrollIntro : mfa.verifyIntro}</p>
      {factor && !factor.id && (
        <button disabled={busy} onClick={() => void enroll()}>
          {mfa.enrollTitle}
        </button>
      )}
      {factor?.qr && (
        <>
          <img
            src={
              factor.qr.startsWith('data:image/svg+xml')
                ? factor.qr
                : `data:image/svg+xml;charset=utf-8,${encodeURIComponent(factor.qr)}`
            }
            width={240}
            height={240}
            alt={mfa.enrollTitle}
          />
          <label>
            {mfa.secretLabel}
            <code dir="ltr">{factor.secret}</code>
          </label>
        </>
      )}
      {factor?.id && (
        <form
          className="admin-form"
          onSubmit={async (event) => {
            event.preventDefault();
            setBusy(true);
            setError('');
            const code = new FormData(event.currentTarget).get('code');
            try {
              if (
                !z
                  .string()
                  .regex(/^\d{6}$/)
                  .safeParse(code).success
              )
                throw new Error();
              const result = await adminClient().auth.mfa.challengeAndVerify({
                factorId: factor.id,
                code: String(code),
              });
              if (result.error) throw result.error;
              setFactor(undefined);
              onSuccess();
            } catch {
              setError(mfa.error);
            } finally {
              setBusy(false);
            }
          }}
        >
          <label>
            {mfa.code}
            <input
              name="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              maxLength={6}
              required
            />
          </label>
          <button disabled={busy}>{busy ? ui.loading : mfa.verify}</button>
        </form>
      )}
      <p role="alert">{error}</p>
    </div>
  );
}
