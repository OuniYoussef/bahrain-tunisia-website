import { useLocation } from 'react-router';
import { useContent } from '@/i18n/content';
import { PageHead } from '@/components/layout/PageHead';
export function Component() {
  const country = useLocation().pathname.split('/')[2] === 'bahrain' ? 'bahrain' : 'tunisia';
  const { welcome, meta } = useContent(country);
  return (
    <section className="route-intro tone-ink" data-theme={country}>
      <PageHead {...meta} page={country} />
      <div className="ui-container">
        <h1 className="text-display-xl" tabIndex={-1}>
          {welcome.headline}
        </h1>
      </div>
    </section>
  );
}
