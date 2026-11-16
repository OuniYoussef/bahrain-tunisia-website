import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { useLocale } from '@/i18n/content';
import type { CountrySection } from './country.config';
export function SectionNav({
  labels,
  sections,
}: {
  labels: Record<CountrySection, string> & { label: string };
  sections: readonly CountrySection[];
}) {
  const root = useRef<HTMLElement>(null);
  const locale = useLocale();
  const { search } = useLocation();
  const [active, setActive] = useState<CountrySection>('welcome');
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const boundary = (root.current?.getBoundingClientRect().bottom ?? 140) + 32;
      let current = sections[0];
      for (const section of sections) {
        if ((document.getElementById(section)?.getBoundingClientRect().top ?? Infinity) <= boundary)
          current = section;
      }
      if (current) setActive(current);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [sections]);
  useEffect(() => {
    const link = root.current?.querySelector<HTMLElement>('[aria-current]');
    // Scroll the bar only: scrollIntoView would pull the page back to the sticky navigation.
    if (link && root.current) {
      const bar = root.current.getBoundingClientRect();
      const box = link.getBoundingClientRect();
      if (box.left < bar.left || box.right > bar.right)
        root.current.scrollBy({ left: box.left - bar.left - 16, behavior: 'instant' });
    }
  }, [active]);
  return (
    <nav ref={root} className="country-section-nav" aria-label={labels.label}>
      {sections.map((id, index) => (
        <Link
          key={id}
          to={{ hash: `#${id}`, search }}
          preventScrollReset
          aria-current={active === id ? 'location' : undefined}
          onClick={() => {
            document.getElementById(id)?.focus({ preventScroll: true });
          }}
          onKeyDown={(event) => {
            const sign = locale === 'ar' ? -1 : 1;
            const next =
              event.key === 'Home'
                ? 0
                : event.key === 'End'
                  ? sections.length - 1
                  : event.key === 'ArrowRight'
                    ? index + sign
                    : event.key === 'ArrowLeft'
                      ? index - sign
                      : null;
            if (next === null) return;
            event.preventDefault();
            root.current?.querySelectorAll('a')[(next + sections.length) % sections.length]?.focus();
          }}
        >
          {labels[id]}
        </Link>
      ))}
    </nav>
  );
}
