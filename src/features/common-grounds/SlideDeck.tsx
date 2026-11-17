/* oxlint-disable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex, jsx-a11y/prefer-tag-over-role -- The specified carousel region is keyboard navigable; its slides use the WAI carousel group pattern, not form fieldsets. */
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Maximize, Minimize, Pause, Play, Grid2X2 } from 'lucide-react';
import { useContent, useLocale } from '@/i18n/content';
import { t } from '@/i18n/format';
import { assetUrl, buildSrcSet } from '@/lib/images';
import type { PreloadImage } from './content';
import { SlideContent } from './SlideContent';
const SlideIndex = lazy(() => import('./SlideIndex').then((module) => ({ default: module.SlideIndex })));
import { slideMedia } from './model';
import { useDeckMotion } from './useDeckMotion';

export function SlideDeck({
  index,
  go: navigate,
  preloads,
  startFocus,
}: {
  index: number;
  go: (index: number) => void;
  preloads: PreloadImage[];
  startFocus: boolean;
}) {
  const { slides, intro, ui } = useContent('matrix');
  const locale = useLocale();
  const initialStartFocus = useRef(startFocus);
  const root = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(document.hidden);
  const [fullscreen, setFullscreen] = useState(false);
  const [hint, setHint] = useState(true);
  const [history, setHistory] = useState({
    current: index,
    outgoing: index,
    slide: slides[index]!,
    previousSlide: slides[index]!,
  });
  if (history.current !== index)
    setHistory({
      current: index,
      outgoing: history.current,
      slide: slides[index]!,
      previousSlide: history.slide,
    });
  const outgoing = history.current !== index ? history.current : history.outgoing;
  const go = useCallback(
    (target: number) => {
      if (target === slides.length - 1) setPlaying(false);
      navigate(target);
    },
    [navigate, slides.length],
  );
  useDeckMotion(root, index, open, go);
  useEffect(() => {
    // Warm adjacent responsive candidates without link-preload's unused-resource warnings.
    for (const source of preloads) {
      if (!source.widths.length) continue;
      const image = new Image();
      image.sizes = '(min-width: 900px) 55vw, 100vw';
      image.srcset = buildSrcSet(source);
      image.src = assetUrl(`${source.src}-${Math.max(...source.widths)}.webp`);
    }
  }, [preloads]);
  useEffect(() => {
    const started = initialStartFocus.current;
    (started ? root.current : root.current?.querySelector<HTMLElement>('h1'))?.focus({ preventScroll: true });
  }, []);
  useEffect(() => {
    const visibility = () => setHidden(document.hidden);
    const full = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('visibilitychange', visibility);
    document.addEventListener('fullscreenchange', full);
    return () => {
      document.removeEventListener('visibilitychange', visibility);
      document.removeEventListener('fullscreenchange', full);
    };
  }, []);
  useEffect(() => {
    if (index === slides.length - 1) return;
    if (!playing || hovered || focused || hidden || open) return;
    const timer = window.setTimeout(() => {
      if (index < slides.length - 1) go(index + 1);
      else setPlaying(false);
    }, 9000);
    return () => clearTimeout(timer);
  }, [playing, hovered, focused, hidden, open, index, slides.length, go]);
  const label = t(ui.slideLabel, { current: index + 1, total: slides.length });
  return (
    <section
      ref={root}
      className="matrix-deck tone-ink"
      aria-roledescription="carousel"
      aria-label={ui.regionLabel}
      tabIndex={0}
      onPointerEnter={(e) => {
        if (e.pointerType === 'mouse') setHovered(true);
      }}
      onPointerLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false);
      }}
      onKeyDown={(e) => {
        if (open || (e.target instanceof Element && e.target.closest('button, a, input, textarea, select')))
          return;
        const nextKey = locale === 'ar' ? 'ArrowLeft' : 'ArrowRight';
        const prevKey = locale === 'ar' ? 'ArrowRight' : 'ArrowLeft';
        let target: number | undefined;
        if (e.key === nextKey || e.key === 'PageDown' || (e.key === ' ' && e.target === e.currentTarget))
          target = index + 1;
        if (e.key === prevKey || e.key === 'PageUp') target = index - 1;
        if (e.key === 'Home') target = 0;
        if (e.key === 'End') target = slides.length - 1;
        if (target !== undefined) {
          e.preventDefault();
          setHint(false);
          go(target);
        }
      }}
    >
      <h1 className="sr-only" tabIndex={-1}>
        {intro.title}
      </h1>
      <div className="matrix-stage">
        {slides.map((slide, i) => (
          <div
            key={slide.id}
            className="matrix-slide"
            data-layout={slideMedia(slide.id).media.layout}
            data-slide-index={i}
            data-active={i === index}
            role="group"
            aria-roledescription="slide"
            aria-label={t(ui.slideLabel, { current: i + 1, total: slides.length })}
            inert={i !== index}
            aria-hidden={i !== index}
          >
            {(i === index || i === outgoing) && (
              <SlideContent
                slide={i === index ? slide : history.previousSlide}
                active={i === index && !hidden}
              />
            )}
          </div>
        ))}
      </div>
      <div className="matrix-chrome">
        <div className="matrix-progress" aria-hidden="true">
          {slides.map((slide, i) => (
            <span key={slide.id}>
              <i
                data-progress-current={i === index ? '' : undefined}
                style={{ opacity: i <= index ? 1 : 0 }}
              />
            </span>
          ))}
        </div>
        <div className="matrix-controls">
          <span className="matrix-counter">{label}</span>
          <button aria-label={ui.previous} disabled={index === 0} onClick={() => go(index - 1)}>
            <ChevronLeft className="rtl:-scale-x-100" />
          </button>
          <button aria-label={ui.next} disabled={index === slides.length - 1} onClick={() => go(index + 1)}>
            <ChevronRight className="rtl:-scale-x-100" />
          </button>
          <button
            aria-label={playing ? ui.pause : ui.play}
            aria-pressed={playing}
            disabled={index === slides.length - 1}
            onClick={() => setPlaying(!playing)}
          >
            {playing ? <Pause /> : <Play />}
          </button>
          <button aria-label={ui.allSlides} onClick={() => setOpen(true)}>
            <Grid2X2 />
          </button>
          {document.fullscreenEnabled && (
            <button
              aria-label={fullscreen ? ui.exitFullscreen : ui.fullscreen}
              onClick={() => {
                void (fullscreen ? document.exitFullscreen() : root.current?.requestFullscreen())?.catch(
                  () => {},
                );
              }}
            >
              {fullscreen ? <Minimize /> : <Maximize />}
            </button>
          )}
        </div>
        {hint && <p className="matrix-hint">{ui.hint}</p>}
      </div>
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {label}: {slides[index]!.title}
      </p>
      {open && (
        <Suspense fallback={null}>
          <SlideIndex open={open} onOpenChange={setOpen} current={index} go={go} />
        </Suspense>
      )}
    </section>
  );
}
