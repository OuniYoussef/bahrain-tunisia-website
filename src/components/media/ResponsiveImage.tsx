import { useRef, useState, type CSSProperties } from 'react';
import { useContent, useLocale } from '@/i18n/content';
import { buildSrcSet, getImage, imageSrc, assetUrl, type ImageId } from '@/lib/images';
import { cn } from '@/lib/cn';
import { DUR, gsap, useGSAP } from '@/lib/gsap';
import { Ornament } from './Ornament';
import { Pattern } from './Pattern';

export type ResponsiveImageProps = {
  id: ImageId;
  sizes?: string;
  className?: string;
  alt?: string;
  priority?: boolean;
  credit?: boolean;
};

export function ResponsiveImage(props: ResponsiveImageProps) {
  // Reset load/error state when the source changes without remounting the parent's frame.
  return <ImageContent key={props.id} {...props} />;
}

function ImageContent({
  id,
  sizes = '100vw',
  className,
  alt,
  priority = false,
  credit = false,
}: ResponsiveImageProps) {
  const image = getImage(id);
  const labels = useContent('images');
  const { ui } = useContent('common');
  const locale = useLocale();
  const description = alt ?? labels[id];
  const root = useRef<HTMLDivElement>(null);
  const img = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const placeholder = !image || failed;

  useGSAP(
    () => {
      if (placeholder) return;
      const overlay = root.current?.querySelector('[data-lqip]');
      if (!overlay) return;
      const mm = gsap.matchMedia();
      mm.add(
        { motion: '(prefers-reduced-motion: no-preference)', reduce: '(prefers-reduced-motion: reduce)' },
        (ctx) => {
          if (!loaded && !img.current?.complete) return;
          if (ctx.conditions?.motion) gsap.to(overlay, { opacity: 0, duration: DUR.fast });
          else gsap.set(overlay, { opacity: 0 });
        },
      );
      return () => mm.revert();
    },
    { scope: root, dependencies: [loaded, placeholder], revertOnUpdate: true },
  );

  return (
    <figure>
      <div
        ref={root}
        className={cn('ui-image', placeholder && 'ui-image-placeholder', className)}
        style={{ '--image-aspect': image ? `${image.width} / ${image.height}` : '3 / 2' } as CSSProperties}
        role={placeholder && description ? 'img' : undefined}
        aria-label={placeholder && description ? description : undefined}
        aria-hidden={placeholder && !description ? true : undefined}
      >
        {placeholder ? (
          <>
            <Pattern kind="khatam" className="absolute inset-0 h-full w-full" />
            <Ornament kind={id.startsWith('bh-') ? 'razji' : 'jasmine'} />
          </>
        ) : (
          <>
            <img
              ref={img}
              src={imageSrc(image)}
              srcSet={buildSrcSet(image)}
              sizes={sizes}
              width={image.width}
              height={image.height}
              alt={description}
              loading={priority ? 'eager' : 'lazy'}
              fetchPriority={priority ? 'high' : undefined}
              decoding="async"
              style={{ objectPosition: image.focal }}
              onLoad={() => setLoaded(true)}
              onError={() => setFailed(true)}
            />
            <span
              data-lqip=""
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-cover"
              style={{
                backgroundColor: image.color,
                backgroundImage: `url("${image.lqip}")`,
                backgroundPosition: image.focal,
              }}
            />
          </>
        )}
      </div>
      {credit && image && (
        <figcaption className="mt-3 text-small text-(--secondary-text)">
          <a
            className="inline-flex min-h-11 items-center underline underline-offset-4"
            href={assetUrl(`${locale}/credits#${id}`)}
          >
            {ui.imageCredit
              .replace('{author}', image.credit.author)
              .replace('{license}', image.credit.license)}
          </a>
        </figcaption>
      )}
    </figure>
  );
}
