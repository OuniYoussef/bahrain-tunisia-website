import { useState } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { useContent, useLocale } from '@/i18n/content';
import { t, formatDate } from '@/i18n/format';
import { useStory } from './hooks';
import { StoryPhoto } from './StoryPhoto';
import { HeartButton } from './HeartButton';
import { ReportDialog } from './ReportDialog';
export function StoryDialog({ id, onClose }: { id: string; onClose: () => void }) {
  const { wall, report, form } = useContent('vault');
  const locale = useLocale();
  const query = useStory(id);
  const [index, setIndex] = useState(0);
  const [reporting, setReporting] = useState(false);
  const story = query.data;
  const count = story?.photos.length ?? 0;
  const move = (delta: number) => setIndex((i) => (i + delta + count) % count);
  return (
    <Dialog
      open
      onOpenChange={onClose}
      title={<span dir="auto">{story?.title ?? wall.loading}</span>}
      className="vault-dialog"
    >
      {query.isPending ? (
        <output>{wall.loading}</output>
      ) : story ? (
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
            {form.fields.country.options[story.country]} · {wall.category[story.category]} ·{' '}
            {formatDate(new Date(story.approved_at), locale)}
          </p>
          <p dir="auto">{story.place_year}</p>
          <p className="story-body" dir="auto">
            {story.body}
          </p>
          <HeartButton story={story} />
          <button onClick={() => setReporting(true)}>{report.button}</button>
          {reporting && <ReportDialog id={id} onClose={() => setReporting(false)} />}
        </>
      ) : (
        <div aria-live="polite">
          <p>{wall.error}</p>
          <button onClick={() => void query.refetch()}>{wall.retry}</button>
        </div>
      )}
    </Dialog>
  );
}
