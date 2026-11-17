import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useContent } from '@/i18n/content';
import { adminClient } from '../client';
import { schema, empty } from './schema';
import { Preview } from './Preview';
export function Alerts() {
  const c = useContent('admin');
  const cache = useQueryClient();
  const [draft, setDraft] = useState(empty);
  const [id, setId] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const result = useQuery({
    queryKey: ['admin', 'alerts'],
    queryFn: async ({ signal }) => {
      const r = await adminClient()
        .from('site_alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .abortSignal(signal);
      if (r.error) throw r.error;
      return r.data;
    },
  });
  async function save() {
    setBusy(true);
    setMessage('');
    try {
      const value = schema.parse(draft);
      const body = {
        ...value,
        link_url: value.link_url || null,
        expires_at: value.expires_at ? new Date(value.expires_at).toISOString() : null,
      };
      const r = id
        ? await adminClient().from('site_alerts').update(body).eq('id', id).select('id').single()
        : await adminClient().from('site_alerts').insert(body).select('id').single();
      if (r.error) throw r.error;
      setDraft(empty);
      setId(undefined);
      setMessage(c.ui.saved);
      await cache.invalidateQueries({ queryKey: ['admin', 'alerts'] });
    } catch {
      setMessage(c.queue.error);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section>
      <h2>{c.alerts.title}</h2>
      <p>{c.alerts.intro}</p>
      <form
        className="admin-form"
        onSubmit={(e) => {
          e.preventDefault();
          void save();
        }}
      >
        {(['en', 'fr', 'ar'] as const).map((lang) => (
          <label key={lang}>
            {c.alerts.message} — {c.languages[lang]}
            <textarea
              lang={lang}
              dir={lang === 'ar' ? 'rtl' : 'ltr'}
              required
              maxLength={280}
              value={draft[`message_${lang}`]}
              onChange={(e) => setDraft({ ...draft, [`message_${lang}`]: e.target.value })}
            />
          </label>
        ))}
        <label>
          {c.alerts.level}
          <select
            value={draft.level}
            onChange={(e) => setDraft({ ...draft, level: e.target.value as typeof draft.level })}
          >
            {(['info', 'warning', 'critical'] as const).map((level) => (
              <option key={level} value={level}>
                {c.alerts.levels[level]}
              </option>
            ))}
          </select>
        </label>
        <label>
          {c.alerts.link}
          <input
            type="url"
            value={draft.link_url}
            onChange={(e) => setDraft({ ...draft, link_url: e.target.value })}
          />
        </label>
        <label>
          {c.alerts.expires}
          <input
            type="datetime-local"
            value={draft.expires_at}
            onChange={(e) => setDraft({ ...draft, expires_at: e.target.value })}
          />
        </label>
        <label className="admin-check">
          <input
            type="checkbox"
            checked={draft.active}
            onChange={(e) => setDraft({ ...draft, active: e.target.checked })}
          />
          {c.alerts.active}
        </label>
        <Preview draft={draft} />
        <div className="admin-toolbar">
          <button disabled={busy}>{c.alerts.save}</button>
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              setDraft(empty);
              setId(undefined);
            }}
          >
            {c.ui.new}
          </button>
        </div>
        <output>{message}</output>
      </form>
      {result.isError && <p role="alert">{c.queue.error}</p>}
      {result.isPending && <output>{c.ui.loading}</output>}
      {result.data?.map((alert) => (
        <article className="admin-story" key={alert.id}>
          <p dir="auto">{alert.message_en}</p>
          <div className="admin-toolbar">
            <button
              disabled={busy}
              onClick={() => {
                setId(alert.id);
                setDraft({
                  ...alert,
                  link_url: alert.link_url ?? '',
                  expires_at: alert.expires_at
                    ? new Date(
                        new Date(alert.expires_at).getTime() -
                          new Date(alert.expires_at).getTimezoneOffset() * 60000,
                      )
                        .toISOString()
                        .slice(0, 16)
                    : '',
                });
              }}
            >
              {c.ui.edit}
            </button>
            <button
              disabled={busy}
              onClick={async () => {
                if (!window.confirm(c.alerts.confirmRemove)) return;
                setBusy(true);
                try {
                  const r = await adminClient()
                    .from('site_alerts')
                    .delete()
                    .eq('id', alert.id)
                    .select('id')
                    .single();
                  if (r.error) throw r.error;
                  if (id === alert.id) {
                    setId(undefined);
                    setDraft(empty);
                  }
                  await cache.invalidateQueries({ queryKey: ['admin', 'alerts'] });
                  setMessage(c.ui.saved);
                } catch {
                  setMessage(c.queue.error);
                } finally {
                  setBusy(false);
                }
              }}
            >
              {c.alerts.remove}
            </button>
          </div>
        </article>
      ))}
    </section>
  );
}
