import { lazy, Suspense, useRef, useState } from 'react';
import { useContent, useLocale } from '@/i18n/content';
import { formatNumber, t } from '@/i18n/format';
import { Section } from '@/components/ui/Section';
import { useNearViewport } from '@/components/media/useNearViewport';
import { DUR, EASE, gsap, useGSAP } from '@/lib/gsap';
import { DrawSVGPlugin } from '@/lib/gsap-plugins';
import { media } from '../media';
import { UnitedSectionHeader } from '../UnitedSectionHeader';

gsap.registerPlugin(DrawSVGPlugin);
const JourneyArtwork = lazy(() => import('./JourneyArtwork'));
export function Journey() {
  const { journey } = useContent('united');
  const locale = useLocale();
  const root = useRef<HTMLElement>(null);
  const count = useRef<HTMLSpanElement>(null);
  const { root: mapRoot, near } = useNearViewport<HTMLDivElement>();
  const [ready, setReady] = useState(false);
  const distance = media('united.journey').distanceKm;
  const label = (value: number) =>
    t(journey.distanceLabel, { distance: formatNumber(Math.round(value), locale) });
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        { motion: '(prefers-reduced-motion: no-preference)', reduce: '(prefers-reduced-motion: reduce)' },
        (ctx) => {
          if (!ctx.conditions?.motion) return;
          const map = root.current?.querySelector('.journey-map');
          const route = root.current?.querySelector('.rm-route');
          if (!map || !route) return;
          gsap.from('.rm-country', {
            opacity: 0,
            duration: DUR.base,
            scrollTrigger: { trigger: map, start: 'top 85%', once: true },
          });
          gsap.set(route, { strokeDasharray: 'none' });
          gsap.fromTo(
            route,
            { drawSVG: '0%' },
            {
              drawSVG: '100%',
              ease: 'none',
              scrollTrigger: { trigger: map, start: 'top 80%', end: 'center 45%', scrub: true },
            },
          );
          gsap.fromTo(
            '.rm-halo',
            { scale: 1, opacity: 0.25, svgOrigin: '0 0' },
            {
              scale: 2,
              opacity: 0.65,
              repeat: 1,
              yoyo: true,
              duration: 0.65,
              ease: EASE.ambient,
              scrollTrigger: { trigger: map, start: 'center 65%', once: true },
            },
          );
          const counter = { value: 0 };
          gsap.to(counter, {
            value: distance,
            duration: DUR.slow,
            onUpdate: () => {
              if (count.current) count.current.textContent = label(counter.value);
            },
            scrollTrigger: { trigger: map, start: 'top 75%', once: true },
          });
          return () => {
            if (count.current) count.current.textContent = label(distance);
          };
        },
      );
      return () => mm.revert();
    },
    { scope: root, dependencies: [locale, ready], revertOnUpdate: true },
  );
  return (
    <Section ref={root} id="journey" tone="ink">
      <div className="ui-container">
        <UnitedSectionHeader
          id="journey-title"
          eyebrow={journey.eyebrow}
          title={journey.title}
          intro={journey.text}
        />
        {/* The composite graphic includes translated HTML city labels and an inline SVG. */}
        {/* oxlint-disable-next-line jsx-a11y/prefer-tag-over-role */}
        <div ref={mapRoot} className="journey-map" dir="ltr" role="img" aria-label={journey.mapAlt}>
          <Suspense fallback={null}>{near ? <JourneyArtwork onReady={setReady} /> : null}</Suspense>
          <span className="journey-city journey-tunis" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
            {journey.tunisLabel}
          </span>
          <span className="journey-city journey-manama" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
            {journey.manamaLabel}
          </span>
        </div>
        <p className="journey-distance">
          <span className="sr-only">{label(distance)}</span>
          <span ref={count} aria-hidden="true">
            {label(distance)}
          </span>
        </p>
      </div>
    </Section>
  );
}
