import { useLocation } from 'react-router';
import { useContent, useLocale } from '@/i18n/content';
import { PageHead } from '@/components/layout/PageHead';
import { ImageCatalogContext } from '@/components/media/ImageCatalog';
import heroCatalog from '@/content/generated/tunisia-hero.generated.json';
import { COUNTRY, type Country } from './country.config';
import { SectionNav } from './SectionNav';
import { CountryHero, Welcome } from './sections/Welcome';
import { Destinations } from './sections/Destinations';
import { CountryImages } from './CountryImages';
import { DeferredDetails } from './DeferredDetails';
import { ContinueJourney } from './ContinueJourney';
import './country.css';

export function CountryPage({ country }: { country: Country }) {
  const content = useContent(country, 'overview');
  const config = COUNTRY[country];
  const sections = config.sectionOrder.filter((id) => id in content);
  return (
    <div className="country-page" data-theme={config.theme}>
      <PageHead {...content.meta} page={country} />
      <div id="welcome" tabIndex={-1}>
        {country === 'tunisia' ? (
          <CountryHero country={country} content={content.welcome} />
        ) : (
          <section className="route-intro tone-ink">
            <div className="ui-container">
              <h1 className="text-display-xl" tabIndex={-1}>
                {content.welcome.headline}
              </h1>
            </div>
          </section>
        )}
      </div>
      <SectionNav labels={content.sectionNav} sections={sections} />
      {country === 'tunisia' && (
        <>
          <Welcome country={country} content={content.welcome} />
          <CountryImages>
            <Destinations country={country} content={content.destinations} />
          </CountryImages>
          <DeferredDetails country={country} />
        </>
      )}
      {country === 'bahrain' &&
        sections.map((id) =>
          id !== 'welcome' ? (
            <section
              key={id}
              id={id}
              tabIndex={-1}
              className="country-placeholder ui-container"
              aria-labelledby={`${id}-title`}
            >
              <h2 id={`${id}-title`} className="text-h2">
                {content[id].title}
              </h2>
            </section>
          ) : null,
        )}
      <ContinueJourney country={country} />
    </div>
  );
}
export function Component() {
  const country = useLocation().pathname.split('/')[2] === 'bahrain' ? 'bahrain' : 'tunisia';
  const locale = useLocale();
  return (
    <ImageCatalogContext value={heroCatalog}>
      <CountryPage key={`${locale}-${country}`} country={country} />
    </ImageCatalogContext>
  );
}
