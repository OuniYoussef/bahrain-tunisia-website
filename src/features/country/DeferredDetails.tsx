import { lazy, Suspense } from 'react';
import { useLocation } from 'react-router';
import { useNearViewport } from '@/components/media/useNearViewport';
import { useContent } from '@/i18n/content';
import { COUNTRY, type Country } from './country.config';

const CountryDetails = lazy(() => import('./CountryDetails'));
const detailSections = COUNTRY.tunisia.sectionOrder.filter((id) => id !== 'welcome' && id !== 'destinations');

export function DeferredDetails({ country }: { country: Country }) {
  const { root, near } = useNearViewport<HTMLDivElement>(false, '1600px');
  const { hash } = useLocation();
  const content = useContent(country, 'overview');
  const { ui } = useContent('common');
  const requested = detailSections.some((id) => hash === `#${id}`);
  const fallback = (
    <div aria-busy="true" aria-label={ui.loading}>
      {detailSections.map((id) => (
        <section key={id} id={id} tabIndex={-1} className="country-placeholder ui-container">
          <h2 className="text-h2">{content[id].title}</h2>
        </section>
      ))}
    </div>
  );
  return (
    <div ref={root}>
      <Suspense fallback={fallback}>
        {near || requested ? <CountryDetails country={country} /> : fallback}
      </Suspense>
    </div>
  );
}
