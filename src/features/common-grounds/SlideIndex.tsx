import { Dialog } from '@/components/ui/Dialog';
import { ResponsiveImage } from '@/components/media/ResponsiveImage';
import { ContentContext, loadNamespace, useContent } from '@/i18n/content';
import { slideMedia } from './model';
import { use } from 'react';
import { ImageCatalogContext } from '@/components/media/ImageCatalog';
import { loadMatrixCatalog } from './catalog';

export function SlideIndex({
  open,
  onOpenChange,
  current,
  go,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  current: number;
  go: (index: number) => void;
}) {
  const parent = use(ContentContext)!;
  const matrix = use(loadNamespace(parent.locale, 'matrix'));
  return (
    <ContentContext value={{ ...parent, content: { ...parent.content, matrix } }}>
      <IndexContent open={open} onOpenChange={onOpenChange} current={current} go={go} />
    </ContentContext>
  );
}
function IndexContent({
  open,
  onOpenChange,
  current,
  go,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  current: number;
  go: (index: number) => void;
}) {
  const { slides, ui } = useContent('matrix');
  const catalog = use(loadMatrixCatalog(['index']));
  return (
    <Dialog open={open} onOpenChange={onOpenChange} title={ui.allSlides} className="matrix-index">
      <ImageCatalogContext value={catalog}>
        <div className="matrix-index-grid">
          {slides.map((slide, i) => (
            <button
              key={slide.id}
              aria-current={current === i ? 'true' : undefined}
              onClick={() => {
                onOpenChange(false);
                go(i);
              }}
            >
              <ResponsiveImage
                id={slideMedia(slide.id).media.tunisia[0]!}
                sizes="(min-width: 900px) 20vw, 40vw"
                alt=""
              />
              <span>{slide.kicker}</span>
              <strong>{slide.title}</strong>
            </button>
          ))}
        </div>
      </ImageCatalogContext>
    </Dialog>
  );
}
