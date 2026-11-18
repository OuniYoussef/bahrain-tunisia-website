import { Link } from 'react-router';
import { lazy, Suspense } from 'react';
import { useContent, useLocale } from '@/i18n/content';
import { ResponsiveImage } from '@/components/media/ResponsiveImage';
import { Flag } from '@/components/media/Flag';
import { Ornament } from '@/components/media/Ornament';
import { PhotoSequence } from './PhotoSequence';
const VideoSlot = lazy(() => import('./VideoSlot').then((module) => ({ default: module.VideoSlot })));
import { slideMedia, type Slide } from './model';

export function SlideContent({ slide, active }: { slide: Slide; active: boolean }) {
  const { ui } = useContent('matrix');
  const locale = useLocale();
  const { media: images, video } = slideMedia(slide.id);
  return (
    <>
      <div className="matrix-halves">
        {(['tunisia', 'bahrain'] as const).map((country) => (
          <div className={`matrix-half matrix-${country}`} key={country}>
            <div className="matrix-photo">
              <ResponsiveImage
                id={images[country][0]!}
                priority={active}
                sizes="(min-width: 900px) 55vw, 100vw"
              />
            </div>
            <div className="matrix-country-copy">
              <span className="matrix-country-chip">
                <Flag country={country} decorative />
                {ui[country]}
              </span>
              <p>{slide.captions[country]}</p>
              {images[country].length > 1 && (
                <div className="matrix-thumbnails">
                  {images[country].slice(1).map((id, i, extra) => (
                    <PhotoSequence key={id} ids={[id, ...extra.filter((_, j) => j !== i)]} active={active} />
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      {video && (
        <Suspense fallback={null}>
          <VideoSlot video={video} fallback={images.tunisia[0]!} active={active} title={slide.title} />
        </Suspense>
      )}
      <div className="matrix-copy" data-inner-scroll>
        <span className="matrix-kicker">{slide.kicker}</span>
        <h2 tabIndex={-1}>{slide.title}</h2>
        <p>{slide.text}</p>
        {slide.pairs && (
          <div className="matrix-words">
            <table>
              <caption>{slide.pairsTitle}</caption>
              <thead>
                <tr>
                  <th>{ui.wordsMeaning}</th>
                  <th>{ui.tunisia}</th>
                  <th>{ui.bahrain}</th>
                </tr>
              </thead>
              <tbody>
                {slide.pairs.map((pair) => (
                  <tr key={pair.id}>
                    <th scope="row">{pair.meaning}</th>
                    <td>{pair.tunisia}</td>
                    <td>{pair.bahrain}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <h3>{ui.sharedWordsTitle}</h3>
            <ul>
              {slide.sharedWords?.map((word) => (
                <li key={word}>{word}</li>
              ))}
            </ul>
          </div>
        )}
        {slide.cta && (
          <>
            <div className="matrix-ornaments">
              <Ornament kind="jasmine" />
              <Ornament kind="razji" />
            </div>
            <Link className="matrix-button" to={`/${locale}/vault`}>
              {slide.cta}
            </Link>
          </>
        )}
      </div>
      {images.shared.length > 0 && (
        <div className="matrix-shared">
          <PhotoSequence ids={images.shared} active={active} />
          <span>{ui.shared}</span>
        </div>
      )}
    </>
  );
}
