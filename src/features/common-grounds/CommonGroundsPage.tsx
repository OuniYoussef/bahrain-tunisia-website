import { lazy, use, useCallback } from 'react';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router';
import { ContentContext, useContent, useLocale } from '@/i18n/content';
import { PageHead } from '@/components/layout/PageHead';
const MatrixIntro = lazy(() => import('./MatrixIntro').then((module) => ({ default: module.MatrixIntro })));
import { SlideDeck } from './SlideDeck';
import './matrix.css';
import { ImageCatalogContext } from '@/components/media/ImageCatalog';
import { loadMatrixCatalog } from './catalog';
import { loadMatrixView, type PreloadImage } from './content';
export function Component() {
  const parent = use(ContentContext)!;
  const { slideId } = useParams();
  const view = use(loadMatrixView(parent.locale, slideId ?? 'intro'));
  return (
    <ContentContext value={{ ...parent, content: { ...parent.content, ...view } }}>
      <MatrixPage preloads={view.preloads} />
    </ContentContext>
  );
}
function MatrixPage({ preloads }: { preloads: PreloadImage[] }) {
  const { meta, slides } = useContent('matrix');
  const { slideId } = useParams();
  const locale = useLocale();
  const { search, hash, state: routeState } = useLocation();
  const state: unknown = routeState;
  const startFocus = Boolean(
    state && typeof state === 'object' && 'matrixStarted' in state && state.matrixStarted,
  );
  const navigate = useNavigate();
  const index = slides.findIndex((slide) => slide.id === slideId);
  const catalog = use(loadMatrixCatalog(slideId && index >= 0 ? [slideId] : ['intro']));
  const go = useCallback(
    (index: number) => {
      const slide = slides[index];
      if (!slide) return;
      void navigate(`/${locale}/common-grounds/${slide.id}${search}${hash}`, {
        replace: true,
        preventScrollReset: true,
        state: { matrixStarted: true },
      });
    },
    [slides, locale, search, hash, navigate],
  );
  if (slideId && !slides.some((slide) => slide.id === slideId))
    return <Navigate replace to={`/${locale}/common-grounds/${slides[0]!.id}${search}${hash}`} />;
  return (
    <ImageCatalogContext value={catalog}>
      <PageHead {...meta} page="common-grounds" />
      <div className="matrix-page tone-ink">
        {slideId ? (
          <SlideDeck
            startFocus={startFocus}
            preloads={preloads}
            key={locale}
            index={Math.max(
              0,
              slides.findIndex((slide) => slide.id === slideId),
            )}
            go={go}
          />
        ) : (
          <MatrixIntro onStart={() => go(0)} />
        )}
      </div>
    </ImageCatalogContext>
  );
}
