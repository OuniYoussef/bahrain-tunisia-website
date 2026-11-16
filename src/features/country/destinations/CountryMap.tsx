import { useMemo, useRef, useState } from 'react';
import { SvgArtwork } from '@/components/media/SvgArtwork';
import { useLocale } from '@/i18n/content';
import { MapPin } from 'lucide-react';
import { gsap, useGSAP } from '@/lib/gsap';
import tunisia from '/images/svg/maps/map-tunisia.svg?raw';
import bahrain from '/images/svg/maps/map-bahrain.svg?raw';
import type { Country } from '../country.config';
import type { MappedPlace } from '../details/PlaceMap';

/** Controlled highlight API: activePlace is the media pin id, onSelect returns the linked content id. */
export default function CountryMap({
  country,
  items,
  label,
  activePlace,
  onSelect,
  cardPrefix = 'destination-',
}: {
  country: Country;
  items: MappedPlace[];
  label: string;
  activePlace?: string;
  onSelect: (id: string) => void;
  cardPrefix?: string;
}) {
  const root = useRef<HTMLFieldSetElement>(null);
  const locale = useLocale();
  const [hideLabel, setHideLabel] = useState(false);
  const source = country === 'tunisia' ? tunisia : bahrain;
  const geometry = useMemo(() => {
    const svg = new DOMParser().parseFromString(source, 'image/svg+xml');
    const viewBox = svg.documentElement.getAttribute('viewBox') ?? '0 0 600 1000';
    const [, , width = 600, height = 1000] = viewBox.split(' ').map(Number);
    return {
      viewBox,
      width,
      height,
      points: new Map(
        Array.from(svg.querySelectorAll('[data-place]')).map((pin) => {
          const [x = 0, y = 0] =
            pin
              .getAttribute('transform')
              ?.match(/[\d.]+/g)
              ?.map(Number) ?? [];
          return [pin.getAttribute('data-place'), { x, y }];
        }),
      ),
    };
  }, [source]);
  useGSAP(
    () => {
      const pins = root.current?.querySelectorAll<SVGGElement>('.cm-pin');
      pins?.forEach((pin) => pin.classList.toggle('is-active', pin.dataset.place === activePlace));
      const mm = gsap.matchMedia();
      mm.add(
        { motion: '(prefers-reduced-motion: no-preference)', reduce: '(prefers-reduced-motion: reduce)' },
        (ctx) => {
          const halo = Array.from(pins ?? [])
            .find((pin) => pin.dataset.place === activePlace)
            ?.querySelector('.cm-pin-halo');
          if (halo && ctx.conditions?.motion)
            gsap.fromTo(
              halo,
              { scale: 1, opacity: 0.7, svgOrigin: '0 0' },
              { scale: 2.5, opacity: 0.15, duration: 0.7, repeat: 1, yoyo: true },
            );
        },
      );
      return () => mm.revert();
    },
    { scope: root, dependencies: [activePlace, source], revertOnUpdate: true },
  );
  return (
    <fieldset ref={root} className="country-map">
      <legend className="sr-only">{label}</legend>
      <div
        className="country-map-art"
        dir="ltr"
        style={{ aspectRatio: `${geometry.width} / ${geometry.height}` }}
      >
        <SvgArtwork source={source} />
        <svg className="country-map-leaders" viewBox={geometry.viewBox} aria-hidden="true">
          {items.map((item, index) => {
            const point = geometry.points.get(item.media.place ?? null);
            const x = (index % 2 ? 0.92 : 0.08) * geometry.width;
            const y = (0.1 + Math.floor(index / 2) * 0.15) * geometry.height;
            return (
              point && (
                <line
                  key={item.id}
                  x1={point.x}
                  y1={point.y}
                  x2={x}
                  y2={y}
                  className={activePlace === item.media.place ? 'is-active' : ''}
                />
              )
            );
          })}
        </svg>
        {items.map((item, index) => (
          <button
            key={item.id}
            type="button"
            className="country-map-pin"
            data-map-place={item.media.place}
            style={{
              insetInlineStart: `${index % 2 ? 92 : 8}%`,
              insetBlockStart: `${10 + Math.floor(index / 2) * 15}%`,
            }}
            aria-label={item.title}
            aria-pressed={activePlace === item.media.place}
            aria-controls={`${cardPrefix}${item.id}`}
            data-label-hidden={hideLabel}
            onPointerEnter={() => setHideLabel(false)}
            onFocus={() => setHideLabel(false)}
            onKeyDown={(event) => {
              if (event.key === 'Escape') setHideLabel(true);
            }}
            onClick={() => onSelect(item.id)}
          >
            <MapPin size={18} aria-hidden="true" />
            <span className="country-pin-label" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
              {item.title}
            </span>
          </button>
        ))}
      </div>
      <p className="country-map-caption">
        {items.find((item) => item.media.place === activePlace)?.title ?? label}
      </p>
    </fieldset>
  );
}
