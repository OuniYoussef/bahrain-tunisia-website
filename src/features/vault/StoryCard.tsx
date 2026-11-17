import { useSearchParams } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import { useContent, useLocale } from '@/i18n/content';
import { t, formatDate } from '@/i18n/format';
import { Flag } from '@/components/media/Flag';
import { StoryPhoto } from './StoryPhoto';
import { HeartButton } from './HeartButton';
import { storyOptions } from './hooks';
import type { Story } from './api/types';
export function StoryCard({ story }: { story: Story }) {
  const { wall, form } = useContent('vault');
  const locale = useLocale();
  const [params, setParams] = useSearchParams();
  const client = useQueryClient();
  return (
    <article className="story-card" data-flip-id={story.id}>
      <button
        className="story-open"
        onMouseEnter={() => void client.prefetchQuery(storyOptions(story.id))}
        onFocus={() => void client.prefetchQuery(storyOptions(story.id))}
        onClick={() => {
          const next = new URLSearchParams(params);
          next.set('story', story.id);
          setParams(next, { preventScrollReset: true });
        }}
      >
        <StoryPhoto story={story} />
        {!story.sample_image_id && !story.photos.length && (
          <span className="story-quote" aria-hidden="true">
            “
          </span>
        )}
        <div className="story-copy">
          {story.is_sample && (
            <span className="sample-badge" title={wall.sampleNote}>
              {wall.sampleBadge}
            </span>
          )}
          <h3 className="text-h3" dir="auto">
            {story.title}
          </h3>
          <p dir="auto">{story.excerpt}</p>
          <p dir="auto">{t(wall.by, { name: story.author_name })}</p>
          <div className="story-stamp">
            {story.country !== 'other' && (
              <Flag country={story.country === 'both' ? 'tunisia' : story.country} decorative />
            )}
            {story.country === 'both' && <Flag country="bahrain" decorative />}
            {form.fields.country.options[story.country]}
          </div>
          <p className="text-small">
            {wall.category[story.category]} ·{' '}
            <time dateTime={story.approved_at}>{formatDate(new Date(story.approved_at), locale)}</time>
          </p>
        </div>
      </button>
      <HeartButton story={story} />
    </article>
  );
}
