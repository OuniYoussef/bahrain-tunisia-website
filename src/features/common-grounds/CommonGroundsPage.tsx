import { Navigate, useLocation, useParams } from 'react-router';
import { useContent, useLocale } from '@/i18n/content';
import { PageHead } from '@/components/layout/PageHead';
export function Component() {
  const { intro, meta, slides } = useContent('matrix');
  const { slideId } = useParams();
  const locale = useLocale();
  const { search, hash } = useLocation();
  if (slideId && !slides.some((slide) => slide.id === slideId))
    return <Navigate replace to={`/${locale}/common-grounds/${slides[0]!.id}${search}${hash}`} />;
  return (
    <section className="route-intro tone-ink">
      <PageHead {...meta} page="common-grounds" />
      <div className="ui-container">
        <h1 className="text-display-xl" tabIndex={-1}>
          {intro.title}
        </h1>
      </div>
    </section>
  );
}
