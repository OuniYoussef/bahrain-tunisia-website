import type { CountryContent } from '../types';
import type { Country } from '../country.config';
import { media } from '../detail-media';
import { Timeline } from './Timeline';

export function FigureGrid({ figures }: { figures: CountryContent['history']['figures'] }) {
  return (
    <div className="figure-grid">
      {figures.map((figure) => (
        <article key={figure.id} data-item-id={figure.id}>
          <h4 className="text-h3">{figure.name}</h4>
          {figure.years && <p className="figure-years">{figure.years}</p>}
          {figure.text && <p>{figure.text}</p>}
        </article>
      ))}
    </div>
  );
}
export function History({ country, content }: { country: Country; content: CountryContent['history'] }) {
  return (
    <>
      <p className="history-pullquote">{content.intro}</p>
      <Timeline
        title={content.timelineTitle}
        events={content.timeline.map((event) => ({
          ...event,
          media: media(`${country}.history.timeline`, event.id),
        }))}
      />
      <section className="history-figures" aria-labelledby="figures-title">
        <h3 id="figures-title" className="text-h3">
          {content.figuresTitle}
        </h3>
        <FigureGrid figures={content.figures} />
      </section>
    </>
  );
}
