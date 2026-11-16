import { useLocation } from 'react-router';
import { useContent, useLocale } from '@/i18n/content';
import { PageHead } from '@/components/layout/PageHead';
import { ImageCatalogContext } from '@/components/media/ImageCatalog';
import tunisiaHero from '@/content/generated/tunisia-hero.generated.json';
import bahrainHero from '@/content/generated/bahrain-hero.generated.json';
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
        <CountryHero country={country} content={content.welcome} />
      </div>
      <SectionNav labels={content.sectionNav} sections={sections} />
      <Welcome country={country} content={content.welcome} />
      <CountryImages country={country}>
        <Destinations country={country} content={content.destinations} />
      </CountryImages>
      <DeferredDetails country={country} />
      <ContinueJourney country={country} />
    </div>
  );
}
export function Component() {
  const country = useLocation().pathname.split('/')[2] === 'bahrain' ? 'bahrain' : 'tunisia';
  const locale = useLocale();
  return (
    <ImageCatalogContext value={country === 'tunisia' ? tunisiaHero : bahrainHero}>
      <CountryPage key={`${locale}-${country}`} country={country} />
    </ImageCatalogContext>
  );
}
