import { useState } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { useContent, useLocale } from '@/i18n/content';
import { t, formatDate } from '@/i18n/format';
import { getStory } from './stories';
import { StoryPhoto } from './StoryPhoto';
export function StoryDialog({ id, onClose }: { id: string; onClose: () => void }) {
  const { wall } = useContent('vault');
  const locale = useLocale();
  const story = getStory(id);
  const [index, setIndex] = useState(0);
  const count = story?.image_ids.length ?? 0;
  const move = (delta: number) => setIndex((i) => (i + delta + count) % count);
  return (
    <Dialog
      open
      onOpenChange={onClose}
      title={<span dir="auto">{story?.title ?? wall.error}</span>}
      className="vault-dialog"
    >
      {story ? (
        <>
          <div>
            <button
              className="vault-carousel-image"
              type="button"
              aria-label={wall.nextPhoto}
              disabled={count < 2}
              onClick={() => move(1)}
              onKeyDown={(e) => {
                if (count < 2) return;
                if (e.key === 'ArrowRight') {
                  e.preventDefault();
                  move(locale === 'ar' ? -1 : 1);
                }
                if (e.key === 'ArrowLeft') {
                  e.preventDefault();
                  move(locale === 'ar' ? 1 : -1);
                }
              }}
            >
              <StoryPhoto story={story} index={index} full />
            </button>
            {count > 1 && (
              <div className="vault-carousel">
                <button onClick={() => move(-1)}>{wall.previousPhoto}</button>
                <output>
                  {index + 1} / {count}
                </output>
                <button onClick={() => move(1)}>{wall.nextPhoto}</button>
              </div>
            )}
          </div>
          {story.is_sample && <p title={wall.sampleNote}>{wall.sampleBadge}</p>}
          <p dir="auto">{t(wall.by, { name: story.author_name })}</p>
          <p>
            {wall.countryNames[story.country]} · {wall.category[story.category]} ·{' '}
            {formatDate(new Date(story.approved_at), locale)}
          </p>
          <p dir="auto">{story.place_year}</p>
          <p className="story-body" dir="auto">
            {story.body}
          </p>
        </>
      ) : (
        <div aria-live="polite">
          <p>{wall.error}</p>
        </div>
      )}
    </Dialog>
  );
}
