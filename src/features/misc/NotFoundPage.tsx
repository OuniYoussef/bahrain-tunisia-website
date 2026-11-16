import { Link } from 'react-router';
import { useContent, useLocale } from '@/i18n/content';
import { PageHead } from '@/components/layout/PageHead';
import { ResponsiveImage } from '@/components/media/ResponsiveImage';
import { ArchFrame } from '@/components/media/ArchFrame';
export function Component() {
  const { notFound } = useContent('common');
  const locale = useLocale();
  return (
    <section className="not-found tone-ink">
      <PageHead title={notFound.metaTitle} description={notFound.text} page="404" noindex />
      <div className="ui-container not-found-inner">
        <div>
          <h1 className="text-display-lg" tabIndex={-1}>
            {notFound.title}
          </h1>
          <p className="text-body-lg">{notFound.text}</p>
          <Link className="ui-button ui-button-primary ui-button-lg" to={`/${locale}`}>
            {notFound.cta}
          </Link>
        </div>
        <ArchFrame>
          <ResponsiveImage id="tn-sbs-blue-door" priority sizes="(min-width:1024px) 30vw, 80vw" />
        </ArchFrame>
      </div>
    </section>
  );
}
