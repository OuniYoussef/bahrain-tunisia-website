import { useLayoutEffect, useRef, useState } from 'react';
import { SvgArtwork } from '@/components/media/SvgArtwork';
import artwork from '/images/svg/skyline/skyline-tunisia-bahrain.svg?raw';
import { useContent, useLocale } from '@/i18n/content';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap';
type Landmark = { id: string; x: number; width: number; y: number };
export function Skyline() {
  const { skyline } = useContent('common').footer;
  const locale = useLocale();
  const root = useRef<HTMLDivElement>(null);
  const [landmarks, setLandmarks] = useState<Landmark[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const names: Record<string, string> = skyline.landmarks;
  useLayoutEffect(() => {
    const svg = root.current?.querySelector('svg');
    if (!svg) return;
    setLandmarks(
      Array.from(svg.querySelectorAll<SVGGraphicsElement>('[data-landmark]')).map((element) => {
        const box = element.getBBox();
        return {
          id: element.dataset.landmark!,
          x: (box.x / svg.viewBox.baseVal.width) * 100,
          width: (box.width / svg.viewBox.baseVal.width) * 100,
          y: (box.y / svg.viewBox.baseVal.height) * 100,
        };
      }),
    );
  }, []);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        { motion: '(prefers-reduced-motion: no-preference)', reduce: '(prefers-reduced-motion: reduce)' },
        (ctx) => {
          if (!ctx.conditions?.motion || !root.current) return;
          const buildings = Array.from(root.current.querySelectorAll<SVGGraphicsElement>('[data-landmark]'));
          const ordered = buildings.sort(
            (a, b) =>
              Math.abs(a.getBBox().x + a.getBBox().width / 2 - 1499) -
              Math.abs(b.getBBox().x + b.getBBox().width / 2 - 1499),
          );
          gsap.from(ordered, {
            y: 310,
            duration: 1.1,
            stagger: 0.07,
            scrollTrigger: { trigger: root.current, start: 'top 95%', once: true },
          });
          const turbines = root.current.querySelectorAll<SVGElement>('.turbine');
          const rotation = gsap.timeline({ paused: true, repeat: -1 });
          turbines.forEach((turbine) =>
            rotation.to(
              turbine,
              {
                rotation: 360,
                svgOrigin: `${turbine.dataset.cx} ${turbine.dataset.cy}`,
                duration: 24,
                ease: 'none',
              },
              0,
            ),
          );
          gsap.from(root.current.querySelector('.turbines'), {
            opacity: 0,
            duration: 0.5,
            scrollTrigger: { trigger: root.current, start: 'top 95%', once: true },
            delay: 1.3,
          });
          const trigger = ScrollTrigger.create({
            trigger: root.current,
            start: 'top bottom',
            end: 'bottom top',
            onToggle: (self) => {
              rotation.paused(!self.isActive || document.hidden);
            },
          });
          const visibility = () => {
            rotation.paused(!trigger.isActive || document.hidden);
          };
          visibility();
          document.addEventListener('visibilitychange', visibility);
          return () => document.removeEventListener('visibilitychange', visibility);
        },
      );
      return () => mm.revert();
    },
    { scope: root, dependencies: [locale], revertOnUpdate: true },
  );
  return (
    <div className="skyline" ref={root} dir="ltr">
      <SvgArtwork source={artwork} />
      <div className="skyline-hotspots">
        {landmarks.map(({ id, x, y, width }) => (
          <div
            key={id}
            className="skyline-hotspot"
            style={{ insetInlineStart: `${x}%`, inlineSize: `${width}%`, insetBlockStart: `${y}%` }}
            onPointerEnter={() => setActive(id)}
            onPointerLeave={() => setActive(null)}
          >
            <button
              type="button"
              aria-label={names[id]}
              aria-describedby={active === id ? `landmark-${id}` : undefined}
              onFocus={() => setActive(id)}
              onBlur={() => setActive(null)}
              onClick={() => setActive(active === id ? null : id)}
              onKeyDown={(event) => {
                if (event.key === 'Escape') setActive(null);
              }}
            />
            {active === id && (
              <span
                id={`landmark-${id}`}
                role="tooltip"
                className="skyline-tooltip"
                lang={locale}
                dir={locale === 'ar' ? 'rtl' : 'ltr'}
              >
                {names[id]}
              </span>
            )}
          </div>
        ))}
      </div>
      <ul className="sr-only" aria-label={skyline.label}>
        {Object.entries(names).map(([id, name]) => (
          <li key={id}>{name}</li>
        ))}
      </ul>
    </div>
  );
}
