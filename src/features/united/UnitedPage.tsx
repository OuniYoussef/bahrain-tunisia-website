import { useContent } from '@/i18n/content';
import { PageHead } from '@/components/layout/PageHead';
import { Hero } from './sections/Hero';
import { Welcome } from './sections/Welcome';
import { Journey } from './sections/Journey';
import { Glance } from './sections/Glance';
import { Connecting } from './sections/Connecting';
import { Teasers } from './sections/Teasers';
import './united.css';
import { ImageCatalogContext } from '@/components/media/ImageCatalog';
import catalog from '@/content/generated/united-hero.generated.json';
import { DeferredImages } from './DeferredImages';
export function Component() {
  const { meta } = useContent('united');
  return (
    <ImageCatalogContext value={catalog}>
      <div data-theme="united" className="united-page">
        <PageHead description={meta.description} />
        <Hero />
        <Welcome />
        <Journey />
        <Glance />
        <DeferredImages>
          <Connecting />
          <Teasers />
        </DeferredImages>
      </div>
    </ImageCatalogContext>
  );
}
