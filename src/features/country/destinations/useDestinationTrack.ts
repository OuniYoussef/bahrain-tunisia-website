import { useLayoutEffect, useRef, useState } from 'react';
import { useLocale } from '@/i18n/content';
import { dirSign, gsap, ScrollTrigger, useGSAP } from '@/lib/gsap';

export function useDestinationTrack(count: number, onActive: (index: number) => void) {
  const root = useRef<HTMLDivElement>(null);
  const viewport = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const trigger = useRef<ScrollTrigger | null>(null);
  const restoringFocus = useRef(false);
  const onActiveRef = useRef(onActive);
  useLayoutEffect(() => {
    onActiveRef.current = onActive;
  }, [onActive]);
  const activeIndex = useRef(0);
  const [pinned, setPinned] = useState(false);
  const locale = useLocale();
  const report = (index: number) => {
    if (index === activeIndex.current) return;
    activeIndex.current = index;
    onActiveRef.current(index);
  };
  useGSAP(
    () => {
      if (!root.current || !viewport.current || !track.current) return;
      const panel = root.current;
      const windowEl = viewport.current;
      const strip = track.current;
      const mm = gsap.matchMedia();
      mm.add(
        {
          desktop:
            '(min-width: 1024px) and (min-height: 700px) and (hover: hover) and (pointer: fine) and (not (any-pointer: coarse))',
          motion: '(prefers-reduced-motion: no-preference)',
          reduce: '(prefers-reduced-motion: reduce)',
        },
        (ctx) => {
          const shouldPin = Boolean(ctx.conditions?.desktop && ctx.conditions.motion);
          setPinned(shouldPin);
          panel.dataset.pinned = String(shouldPin);
          if (!shouldPin) {
            const update = () => {
              const items = Array.from(strip.children);
              const origin = windowEl.getBoundingClientRect();
              let nearest = 0;
              let distance = Infinity;
              items.forEach((item, index) => {
                const box = item.getBoundingClientRect();
                const next = Math.abs(locale === 'ar' ? box.right - origin.right : box.left - origin.left);
                if (next < distance) {
                  distance = next;
                  nearest = index;
                }
              });
              report(nearest);
            };
            windowEl.addEventListener('scroll', update, { passive: true });
            return () => windowEl.removeEventListener('scroll', update);
          }
          windowEl.scrollLeft = 0;
          const distance = () => Math.max(0, strip.scrollWidth - windowEl.clientWidth);
          const tween = gsap.to(strip, {
            x: () => -distance() * dirSign(),
            ease: 'none',
            scrollTrigger: {
              trigger: panel,
              pin: panel,
              start: () =>
                `top ${parseFloat(getComputedStyle(panel).getPropertyValue('--country-sticky-offset'))}`,
              end: () => `+=${distance()}`,
              scrub: true,
              invalidateOnRefresh: true,
              onUpdate: (self) => report(Math.round(self.progress * (count - 1))),
            },
          });
          trigger.current = tween.scrollTrigger ?? null;
          return () => {
            trigger.current = null;
          };
        },
      );
      let mounted = true;
      const refresh = () => {
        if (!mounted) return;
        const focused =
          document.activeElement instanceof HTMLElement && panel.contains(document.activeElement)
            ? document.activeElement
            : null;
        ScrollTrigger.refresh();
        restoringFocus.current = true;
        focused?.focus({ preventScroll: true });
        restoringFocus.current = false;
      };
      void document.fonts.ready.then(refresh);
      panel.addEventListener('load', refresh, true);
      return () => {
        mounted = false;
        panel.removeEventListener('load', refresh, true);
        mm.revert();
        delete panel.dataset.pinned;
      };
    },
    { scope: root, dependencies: [locale, count], revertOnUpdate: true },
  );

  const select = (index: number, focus = false) => {
    const item = track.current?.children[index] as HTMLElement | undefined;
    if (!item) return;
    const currentTrigger = trigger.current;
    if (currentTrigger) {
      window.scrollTo({
        top:
          currentTrigger.start +
          ((currentTrigger.end - currentTrigger.start) * index) / Math.max(1, count - 1),
        behavior: 'instant',
      });
      ScrollTrigger.update();
    } else if (viewport.current) {
      const first = track.current?.firstElementChild as HTMLElement | null;
      viewport.current.scrollTo({ left: item.offsetLeft - (first?.offsetLeft ?? 0), behavior: 'instant' });
    }
    activeIndex.current = index;
    onActiveRef.current(index);
    if (focus && !currentTrigger) viewport.current?.scrollIntoView({ block: 'center', behavior: 'instant' });
    if (focus) item.querySelector('button')?.focus({ preventScroll: true });
  };
  const selectOnFocus = (index: number) => {
    if (!restoringFocus.current) select(index);
  };
  return { root, viewport, track, pinned, select, selectOnFocus };
}
