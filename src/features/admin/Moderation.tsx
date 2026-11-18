import { useState, type ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { useContent, useLocale } from '@/i18n/content';
import { formatDate } from '@/i18n/format';
import { Dialog, Sheet } from '@/components/ui/Dialog';
import { adminClient } from './client';
import { ModerationContext as Context, type Request } from './moderation-context';
export function Moderation({ children }: { children: ReactNode }) {
  const c = useContent('admin');
  const locale = useLocale();
  const cache = useQueryClient();
  const [pending, setPending] = useState<Request>();
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [log, setLog] = useState(false);
  const logs = useQuery({
    queryKey: ['admin', 'log'],
    enabled: log,
    queryFn: async ({ signal }) => {
      const r = await adminClient()
        .from('moderation_log')
        .select('*')
        .order('id', { ascending: false })
        .limit(50)
        .abortSignal(signal);
      if (r.error) throw r.error;
      return r.data;
    },
  });
  async function execute(r: Request) {
    setBusy(true);
    setMessage('');
    try {
      const value = z.string().trim().max(500).safeParse(note);
      if (!value.success || (r.action === 'reject' && !value.data)) throw new Error();
      const result = await adminClient().functions.invoke('moderate', {
        body: { ...r, note: value.data || undefined },
      });
      if (result.error) throw result.error;
      setPending(undefined);
      setNote('');
      setMessage(
        r.action === 'approve' ? c.queue.approved : r.action === 'reject' ? c.queue.rejected : c.ui.saved,
      );
      await cache.invalidateQueries({ queryKey: ['admin'] });
      setLog(true);
    } catch {
      setMessage(c.queue.error);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Context
      value={{
        busy,
        request: (r) => {
          if (!busy) {
            setNote('');
            setPending(r);
          }
        },
      }}
    >
      <div className="admin-toolbar">
        <button onClick={() => setLog(true)}>{c.ui.log}</button>
        <output>{message}</output>
      </div>
      {children}
      <Dialog
        open={!!pending}
        onOpenChange={(open) => {
          if (!open && !busy) setPending(undefined);
        }}
        title={
          pending?.action === 'delete' ? c.queue.confirmDelete : pending ? c.actions[pending.action] : ''
        }
      >
        <form
          className="admin-form"
          onSubmit={(event) => {
            event.preventDefault();
            if (pending && !busy) void execute(pending);
          }}
        >
          {pending?.action === 'reject' && (
            <label>
              {c.queue.rejectReason}
              <textarea
                name="rejectionNote"
                autoComplete="off"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                required
                maxLength={500}
              />
            </label>
          )}
          <p role="alert">{message === c.queue.error ? message : ''}</p>
          <button disabled={busy}>{busy ? c.ui.loading : c.ui.confirm}</button>
          <button type="button" disabled={busy} onClick={() => setPending(undefined)}>
            {c.ui.cancel}
          </button>
        </form>
      </Dialog>
      <Sheet open={log} onOpenChange={setLog} title={c.ui.log} slideFrom="end">
        {logs.isPending && <output>{c.ui.loading}</output>}
        {logs.isError && <p role="alert">{c.queue.error}</p>}
        <ol className="admin-log">
          {logs.data?.map((entry) => (
            <li key={entry.id}>
              <strong>{c.actions[entry.action as keyof typeof c.actions] ?? c.ui.log}</strong>
              <p>
                {formatDate(new Date(entry.created_at), locale, { dateStyle: 'short', timeStyle: 'short' })}
              </p>
              <p dir="auto">{entry.note}</p>
              <code>{entry.story_id ?? entry.report_id}</code>
            </li>
          ))}
        </ol>
      </Sheet>
    </Context>
  );
}
