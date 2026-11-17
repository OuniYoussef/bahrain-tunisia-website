import { useContent } from '@/i18n/content';
import { PhotoSequence } from './PhotoSequence';
import { slideMedia } from './model';

export function MatrixIntro({ onStart }: { onStart: () => void }) {
  const { intro } = useContent('matrix');
  const groups = ['welcome', 'sea', 'dates-sweets'].map((id) => slideMedia(id).media);
  const photos = groups.flatMap((group) => [group.tunisia[0]!, group.bahrain[0]!]);
  return (
    <section className="matrix-intro tone-ink">
      <div className="matrix-mosaic" aria-hidden="true">
        {photos.map((id, i) => (
          <PhotoSequence
            key={id}
            ids={[id, photos[(i + 1) % photos.length]!]}
            sizes="(min-width: 900px) 34vw, 50vw"
            active
            priority={i === 0}
          />
        ))}
      </div>
      <div className="matrix-intro-copy">
        <p>{intro.eyebrow}</p>
        <h1 tabIndex={-1}>{intro.title}</h1>
        <p>{intro.text}</p>
        <button className="matrix-button" onClick={onStart}>
          {intro.start}
        </button>
      </div>
    </section>
  );
}
