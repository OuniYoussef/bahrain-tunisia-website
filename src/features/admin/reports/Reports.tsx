import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useContent, useLocale } from '@/i18n/content';
import { plural } from '@/i18n/format';
import { adminClient } from '../client';
import { storyColumns } from '../data';
import { useModeration } from '../moderation-context';
import { StoryCard } from '../queue/StoryCard';
export function Reports() {
  const c = useContent('admin');
  const locale = useLocale();
  const { request, busy } = useModeration();
  const [page, setPage] = useState(0);
  const result = useQuery({
    queryKey: ['admin', 'reports'],
    queryFn: async ({ signal }) => {
      const fetchPage = (offset: number) =>
        adminClient()
          .from('reports')
          .select(`id,story_id,reason,details,stories(${storyColumns})`, { count: 'exact' })
          .eq('status', 'open')
          .order('story_id')
          .order('id')
          .range(offset, offset + 99)
          .abortSignal(signal);
      const r = await fetchPage(0);
      if (r.error) throw r.error;
      for (let offset = 100; offset < (r.count ?? 0); offset += 100) {
        const next = await fetchPage(offset);
        if (next.error) throw next.error;
        r.data.push(...next.data);
      }
      return r;
    },
  });
  const groups = new Map<string, NonNullable<typeof result.data>['data']>();
  for (const report of result.data?.data ?? []) {
    const group = groups.get(report.story_id) ?? [];
    group.push(report);
    groups.set(report.story_id, group);
  }
  return (
    <section>
      <h2>{c.reports.title}</h2>
      {result.isPending && <output>{c.ui.loading}</output>}
      {result.isError && <p role="alert">{c.queue.error}</p>}
      {result.data?.count === 0 && <p>{c.reports.empty}</p>}
      {Array.from(groups)
        .slice(page * 20, page * 20 + 20)
        .map(([id, reports]) => (
          <article className="admin-story" key={id}>
            <h3 dir="auto">{reports[0]?.stories?.title}</h3>
            <p>{plural(c.reports.count, reports.length, locale)}</p>
            {reports[0]?.stories?.status === 'hidden' && <p>{c.reports.autoHidden}</p>}
            <details>
              <summary>{c.reports.viewPost}</summary>
              {reports[0]?.stories && <StoryCard story={reports[0].stories} />}
            </details>
            {reports.map((r) => (
              <div className="admin-report" key={r.id}>
                <strong>{c.reasons[r.reason]}</strong>
                <p dir="auto">{r.details}</p>
                <button disabled={busy} onClick={() => request({ action: 'resolve-report', reportId: r.id })}>
                  {c.reports.resolve}
                </button>
              </div>
            ))}
          </article>
        ))}
      <div className="admin-toolbar">
        <button disabled={!page || result.isFetching} onClick={() => setPage(page - 1)}>
          {c.ui.previous}
        </button>
        <button
          disabled={(page + 1) * 20 >= groups.size || result.isFetching}
          onClick={() => setPage(page + 1)}
        >
          {c.ui.next}
        </button>
      </div>
    </section>
  );
}
