import { useContent } from '@/i18n/content';
import { PageHead } from '@/components/layout/PageHead';
export function Component() {
  const { hero, meta } = useContent('vault');
  return (
    <section className="route-intro tone-ink">
      <PageHead {...meta} page="vault" />
      <div className="ui-container">
        <h1 className="text-display-xl" tabIndex={-1}>
          {hero.headline}
        </h1>
      </div>
    </section>
  );
}
