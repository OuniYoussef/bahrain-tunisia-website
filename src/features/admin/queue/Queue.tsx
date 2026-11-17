import { useRef, useState, type KeyboardEvent } from 'react';
import { useContent } from '@/i18n/content';
import { useStories, type Story } from '../data';
import { useModeration } from '../moderation-context';
import { StoryCard } from './StoryCard';
export function Queue({ status }: { status: Story['status'] }) {
  const c = useContent('admin');
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const list = useStories(status, page, search);
  const root = useRef<HTMLDivElement>(null);
  const { request } = useModeration();
  function shortcut(event: KeyboardEvent<HTMLButtonElement>) {
    if (
      status !== 'pending' ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      (event.target instanceof HTMLElement &&
        event.target.closest('input,textarea,select,button:not([data-story]),a,summary,[contenteditable]'))
    )
      return;
    const cards = Array.from(root.current?.querySelectorAll<HTMLElement>('[data-story]') ?? []);
    const index = cards.findIndex((card) => card === document.activeElement);
    if (index < 0) return;
    const key = event.key.toLowerCase();
    if (key === 'j' || key === 'k') {
      event.preventDefault();
      cards[Math.max(0, Math.min(cards.length - 1, index + (key === 'j' ? 1 : -1)))]?.focus();
    }
    if (key === 'a' || key === 'r') {
      event.preventDefault();
      request({ action: key === 'a' ? 'approve' : 'reject', storyId: cards[index]?.dataset.story });
    }
  }
  return (
    <section aria-label={c.queue.title} ref={root}>
      <h2>{c.status[status]}</h2>
      {status === 'pending' && <p>{c.ui.shortcuts}</p>}
      {status === 'approved' && (
        <label>
          {c.ui.search}
          <input
            type="search"
            maxLength={80}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
          />
        </label>
      )}
      {list.isPending && <output>{c.ui.loading}</output>}
      {list.isError && <p role="alert">{c.queue.error}</p>}
      {list.data?.rows.length === 0 && <p>{c.queue.empty}</p>}
      {list.data?.rows.map((story) => (
        <StoryCard key={story.id} story={story} onShortcut={shortcut} />
      ))}
      <div className="admin-toolbar">
        <button disabled={page === 0 || list.isFetching} onClick={() => setPage(page - 1)}>
          {c.ui.previous}
        </button>
        <button
          disabled={!list.data || (page + 1) * 20 >= list.data.count || list.isFetching}
          onClick={() => setPage(page + 1)}
        >
          {c.ui.next}
        </button>
      </div>
    </section>
  );
}
