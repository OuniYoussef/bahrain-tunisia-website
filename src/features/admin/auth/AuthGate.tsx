import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useContent } from '@/i18n/content';
import { adminClient } from '../client';
import { checkGuard, type GuardState } from './guard';
import { Login } from './Login';
import { Mfa } from './Mfa';
import { AuthContext } from './context';
export function AuthGate({ children }: { children: ReactNode }) {
  const c = useContent('admin');
  const cache = useQueryClient();
  const [state, setState] = useState<GuardState | 'loading'>('loading');
  const [notice, setNotice] = useState('');
  const generation = useRef(0);
  const lastActivity = useRef(0);
  const signOut = useCallback(() => {
    generation.current++;
    setState('login');
    cache.clear();
    void adminClient()
      .auth.signOut({ scope: 'local' })
      .catch(() => undefined);
  }, [cache]);
  const check = useCallback(async () => {
    const version = ++generation.current;
    setState('loading');
    try {
      const client = adminClient();
      const next = await checkGuard({
        session: async () => {
          const r = await client.auth.getSession();
          if (r.error) throw r.error;
          return !!r.data.session;
        },
        assurance: async () => {
          const r = await client.auth.mfa.getAuthenticatorAssuranceLevel();
          if (r.error) throw r.error;
          return r.data.currentLevel;
        },
        membership: async () => {
          const r = await client.rpc('is_admin');
          if (r.error) throw r.error;
          return r.data === true;
        },
      });
      if (version !== generation.current) return;
      if (next === 'denied') {
        signOut();
        setNotice(c.ui.denied);
      } else setState(next);
    } catch {
      if (version === generation.current) {
        signOut();
        setNotice(c.queue.error);
      }
    }
  }, [c.ui.denied, c.queue.error, signOut]);
  useEffect(() => {
    let active = true;
    if (!lastActivity.current) lastActivity.current = Date.now();
    const invalidate = () => {
      generation.current++;
    };
    queueMicrotask(() => {
      if (active) void check();
    });
    const { data } = adminClient().auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        generation.current++;
        cache.clear();
        setState('login');
      }
      if (event === 'TOKEN_REFRESHED') setTimeout(() => void check(), 0);
    });
    return () => {
      active = false;
      invalidate();
      data.subscription.unsubscribe();
      cache.clear();
    };
  }, [check, cache]);
  useEffect(() => {
    if (state !== 'ready' && state !== 'mfa') return;
    const timeout = 30 * 60 * 1000;
    const expired = () => {
      if (Date.now() - lastActivity.current >= timeout) {
        setNotice(c.ui.idle);
        signOut();
        return true;
      }
      return false;
    };
    const activity = () => {
      if (!expired()) lastActivity.current = Date.now();
    };
    const timer = setInterval(expired, 1000);
    window.addEventListener('pointerdown', activity);
    window.addEventListener('keydown', activity);
    document.addEventListener('visibilitychange', expired);
    return () => {
      clearInterval(timer);
      window.removeEventListener('pointerdown', activity);
      window.removeEventListener('keydown', activity);
      document.removeEventListener('visibilitychange', expired);
    };
  }, [state, signOut, c.ui.idle]);
  if (state === 'ready') return <AuthContext value={signOut}>{children}</AuthContext>;
  return (
    <div className="admin-auth">
      <h1 tabIndex={-1}>{c.login.title}</h1>
      <output>{notice}</output>
      {state === 'loading' ? (
        <output>{c.ui.loading}</output>
      ) : state === 'mfa' ? (
        <>
          <Mfa onSuccess={() => void check()} />
          <button onClick={signOut}>{c.nav.signOut}</button>
        </>
      ) : (
        <Login
          onSuccess={() => {
            lastActivity.current = Date.now();
            void check();
          }}
        />
      )}
    </div>
  );
}
