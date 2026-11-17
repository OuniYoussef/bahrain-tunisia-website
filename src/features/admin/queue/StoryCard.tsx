import { useContent, useLocale } from '@/i18n/content';
import { formatDate, t, plural } from '@/i18n/format';
import type { Story } from '../data';
import { useModeration } from '../moderation-context';
import { Photos } from './Photos';
import type { KeyboardEventHandler } from 'react';
export function StoryCard({
  story,
  onShortcut,
}: {
  story: Story;
  onShortcut?: KeyboardEventHandler<HTMLButtonElement>;
}) {
  const c = useContent('admin');
  const locale = useLocale();
  const { request, busy } = useModeration();
  return (
    <article className="admin-story">
      {onShortcut && (
        <button
          className="admin-focus"
          data-story={story.id}
          onKeyDown={onShortcut}
          aria-label={c.ui.selectStory}
        >
          {c.ui.selectStory}
        </button>
      )}
      <header>
        <h3 dir="auto">{story.title}</h3>
        <span>{c.status[story.status]}</span>
        {story.is_sample && <span>{c.queue.markSample}</span>}
      </header>
      <p dir="auto">{story.author_name}</p>
      <p>
        {c.countries[story.country]} · {c.categories[story.category]} ·{' '}
        {c.languages[story.locale as keyof typeof c.languages]}
      </p>
      <p>{t(c.queue.submitted, { date: formatDate(new Date(story.created_at), locale) })}</p>
      <details>
        <summary>{plural(c.ui.body, story.body.trim().split(/\s+/u).length, locale)}</summary>
        <p className="admin-body" dir="auto">
          {story.body}
        </p>
        {story.place_year && <p dir="auto">{story.place_year}</p>}
        <Photos storyId={story.id} />
      </details>
      {story.moderation_note && !story.moderation_note.startsWith('[vault-operation:') && (
        <p dir="auto">{story.moderation_note}</p>
      )}
      <div className="admin-toolbar">
        {(story.status === 'pending'
          ? (['approve', 'reject'] as const)
          : story.status === 'approved'
            ? (['hide', 'delete'] as const)
            : story.status === 'hidden'
              ? (['restore', 'delete'] as const)
              : (['delete'] as const)
        ).map((action) => (
          <button key={action} disabled={busy} onClick={() => request({ action, storyId: story.id })}>
            {c.queue[action]}
          </button>
        ))}
      </div>
    </article>
  );
}
