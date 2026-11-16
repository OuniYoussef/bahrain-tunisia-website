import { Flag } from '@/components/media/Flag';
import { ArchFrame } from '@/components/media/ArchFrame';
import { ResponsiveImage } from '@/components/media/ResponsiveImage';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { useContent, useLocale } from '@/i18n/content';
import { formatNumber } from '@/i18n/format';
import { COUNTRY, type Country } from '../country.config';
import type { CountryContent } from '../types';
import { media } from '../media';
import { FactList } from '../welcome/FactList';
import { WordTable } from '../welcome/WordTable';

export function CountryHero({ country, content }: { country: Country; content: CountryContent['welcome'] }) {
  const { ui } = useContent('common');
  const images = media(`${country}.welcome`).images;
  return (
    <div className="country-hero tone-ink" data-divider={COUNTRY[country].divider}>
      <div className="country-hero-photo">
        <ResponsiveImage id={images[0]!} alt="" priority mobileMaxWidth={1280} />
      </div>
      <div className="ui-container country-hero-inner">
        <div className="country-hero-copy">
          <Eyebrow>{content.eyebrow}</Eyebrow>
          <h1 className="text-display-xl" tabIndex={-1}>
            {content.headline}
          </h1>
          <p className="text-body-lg">{content.subheadline}</p>
          <span className="country-flag-chip">
            <Flag country={country} decorative />
            {ui[country]}
          </span>
        </div>
        {images[1] && (
          <ArchFrame className="country-hero-arch">
            <ResponsiveImage id={images[1]} alt="" sizes="(min-width: 1024px) 26vw, 45vw" />
          </ArchFrame>
        )}
      </div>
    </div>
  );
}
export function Welcome({ country, content }: { country: Country; content: CountryContent['welcome'] }) {
  const locale = useLocale();
  return (
    <div className="country-welcome ui-container">
      <p className="country-intro">{content.intro}</p>
      <div className="country-reference">
        <FactList country={country} title={content.factsTitle} facts={content.facts} />
        <WordTable content={content} />
      </div>
      {'nicknames' in content && (
        <section className="country-nicknames" aria-labelledby="nicknames-title">
          <h2 id="nicknames-title" className="text-h3">
            {content.nicknamesTitle}
          </h2>
          <div>
            {content.nicknames.map((item) => (
              <article key={item.id}>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
          <blockquote>{content.nameOrigin}</blockquote>
        </section>
      )}
      <section className="country-trivia" aria-labelledby="trivia-title">
        <h2 id="trivia-title" className="text-h3">
          {content.didYouKnowTitle}
        </h2>
        {/* The horizontal list needs a keyboard scroll target on mobile. */}
        {/* oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex */}
        <ol tabIndex={0} aria-labelledby="trivia-title">
          {content.didYouKnow.map((text, index) => (
            <li key={text}>
              <span aria-hidden="true">{formatNumber(index + 1, locale)}</span>
              <p>{text}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
