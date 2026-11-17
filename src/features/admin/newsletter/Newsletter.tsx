import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useContent, useLocale } from '@/i18n/content';
import { plural } from '@/i18n/format';
import { env } from '@/lib/env';
import { adminClient } from '../client';
import { csv } from './csv';
export function Newsletter() {
  const c = useContent('admin');
  const locale = useLocale();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const exporting = useRef<AbortController | null>(null);
  useEffect(() => {
    const current = exporting;
    return () => current.current?.abort();
  }, []);
  const count = useQuery({
    queryKey: ['admin', 'newsletter'],
    queryFn: async ({ signal }) => {
      const r = await adminClient()
        .from('newsletter_subscribers')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'active')
        .abortSignal(signal);
      if (r.error) throw r.error;
      return r.count ?? 0;
    },
  });
  async function download() {
    if (!window.confirm(c.newsletter.warning)) return;
    setBusy(true);
    setError('');
    const controller = new AbortController();
    exporting.current = controller;
    try {
      const rows: string[][] = [['email', 'locale', 'consented_at', 'unsubscribe']];
      let after: string | undefined;
      for (;;) {
        let q = adminClient()
          .from('newsletter_subscribers')
          .select('id,email,locale,consented_at,unsubscribe_token')
          .eq('status', 'active')
          .order('id')
          .limit(500);
        if (after) q = q.gt('id', after);
        const r = await q.abortSignal(controller.signal);
        if (r.error) throw r.error;
        for (const row of r.data)
          rows.push([
            row.email,
            row.locale,
            row.consented_at,
            `${env.VITE_SUPABASE_URL}/functions/v1/subscribe?unsubscribe=${encodeURIComponent(row.unsubscribe_token)}`,
          ]);
        if (r.data.length < 500) break;
        after = r.data.at(-1)?.id;
      }
      if (controller.signal.aborted) return;
      const url = URL.createObjectURL(new Blob([csv(rows)], { type: 'text/csv;charset=utf-8' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = 'newsletter.csv';
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      setError(c.queue.error);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section>
      <h2>{c.newsletter.title}</h2>
      {count.isPending ? (
        <output>{c.ui.loading}</output>
      ) : (
        <p>{plural(c.newsletter.count, count.data ?? 0, locale)}</p>
      )}
      <p>{c.newsletter.warning}</p>
      <button disabled={busy || !count.data} onClick={() => void download()}>
        {busy ? c.ui.loading : c.newsletter.export}
      </button>
      <p role="alert">{error || (count.isError ? c.queue.error : '')}</p>
    </section>
  );
}
