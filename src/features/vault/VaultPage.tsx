import { lazy, Suspense } from 'react';
import { Link, useSearchParams } from 'react-router';
import { Feather, Camera, Map, MessagesSquare } from 'lucide-react';
import { useContent, useLocale } from '@/i18n/content';
import { PageHead } from '@/components/layout/PageHead';
import { ResponsiveImage } from '@/components/media/ResponsiveImage';
import { Flag } from '@/components/media/Flag';
import { Pattern } from '@/components/media/Pattern';
import { useNearViewport } from '@/components/media/useNearViewport';
import { media } from '@/lib/media';
import type { ImageId } from '@/lib/images';
import './vault.css';
import { ImageCatalogContext } from '@/components/media/ImageCatalog';
import catalog from '@/content/generated/vault.generated.json';
const VaultExperience = lazy(() => import('./VaultExperience'));
const icons = [Feather, Camera, Map, MessagesSquare];
export function Component() {
  const content = useContent('vault');
  const { hero, categories, meta } = content;
  const [params] = useSearchParams();
  const locale = useLocale();
  const photos = media('vault.hero');
  const { root, near } = useNearViewport<HTMLDivElement>(false, '0px');
  return (
    <ImageCatalogContext value={catalog}>
      <div className="vault-page">
        <PageHead {...meta} page="vault" />
        <section className="vault-hero">
          <Pattern kind="khatam" className="vault-texture" />
          <div className="ui-container vault-hero-layout">
            <div>
              <p>{hero.eyebrow}</p>
              <h1 className="text-display-lg" tabIndex={-1}>
                {hero.headline}
              </h1>
              <p className="vault-subtitle">{hero.subheadline}</p>
              <p className="vault-intro">{hero.intro}</p>
              <div className="vault-actions">
                <Link to={`/${locale}/contact`}>{hero.ctaShare}</Link>
                <a href="#wall">{hero.ctaBrowse}</a>
              </div>
            </div>
            <div className="vault-polaroids" aria-hidden="true">
              {[photos.image, photos.imageSecondary as ImageId].map((id, i) => (
                <div className="vault-polaroid" key={id}>
                  <ResponsiveImage id={id} alt="" priority sizes="(min-width: 1024px) 28vw, 65vw" />
                  <Flag country={i === 0 ? 'tunisia' : 'bahrain'} decorative />
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="ui-container vault-categories">
          <h2 className="text-h2">{categories.title}</h2>
          <div>
            {categories.items.map((item, i) => {
              const Icon = icons[i]!;
              return (
                <Link key={item.id} to={`/${locale}/contact`}>
                  <Icon aria-hidden="true" />
                  <h3 className="text-h3">{item.title}</h3>
                  <p>{item.text}</p>
                  <p>
                    <em>{item.prompt}</em>
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
        <div id="wall" ref={root} className="vault-wall-slot">
          <Suspense
            fallback={
              <div className="vault-wall-loading" aria-busy="true">
                {content.wall.loading}
              </div>
            }
          >
            {near || params.has('story') ? (
              <VaultExperience />
            ) : (
              <div className="vault-wall-loading">
                <h2 className="text-h2">{content.wall.title}</h2>
              </div>
            )}
          </Suspense>
        </div>
        <section className="ui-container vault-guidelines">
          <h2 className="text-h2">{content.guidelines.title}</h2>
          <ul>
            {content.guidelines.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </div>
    </ImageCatalogContext>
  );
}
