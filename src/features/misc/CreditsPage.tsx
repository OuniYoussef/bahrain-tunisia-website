import { useContent } from '@/i18n/content';
import { PageHead } from '@/components/layout/PageHead';
import { ResponsiveImage } from '@/components/media/ResponsiveImage';
import generated from '@/content/generated/images.generated.json';
import type { ImageId } from '@/lib/images';
export function Component() {
  const { credits } = useContent('common');
  const alt = useContent('images');
  const entries = Object.entries(generated.images);
  return (
    <section className="ui-container simple-page credits-page">
      <PageHead title={credits.metaTitle} description={credits.metaDescription} page="credits" />
      <h1 className="text-display-lg" tabIndex={-1}>
        {credits.title}
      </h1>
      <p className="text-body-lg">{credits.intro}</p>
      <p className="text-muted">{credits.maps}</p>
      {entries.length ? (
        <div className="credits-grid">
          {entries.map(([id, image]) => (
            <article key={id} id={id} className="credit-card" data-scroll-target>
              <ResponsiveImage id={id as ImageId} sizes="160px" alt="" />
              <div>
                <h2 className="text-h4">{alt[id as ImageId]}</h2>
                <dl>
                  <div>
                    <dt>{credits.columns.author}</dt>
                    <dd dir="auto">{image.credit.author}</dd>
                  </div>
                  <div>
                    <dt>{credits.columns.license}</dt>
                    <dd>
                      <a href={image.credit.licenseUrl}>{image.credit.license}</a>
                    </dd>
                  </div>
                </dl>
                <a href={image.credit.sourceUrl}>{credits.viewSource}</a>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p>{credits.empty}</p>
      )}
    </section>
  );
}
