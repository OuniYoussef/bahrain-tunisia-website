import { useEffect, type RefObject } from 'react';
import { useLocation } from 'react-router';
import { useLocale } from '@/i18n/content';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap';

export function useDetailLayout(root: RefObject<HTMLDivElement | null>) {
  const locale = useLocale();
  const { hash } = useLocation();
  useEffect(() => {
    const target = hash ? document.getElementById(hash.slice(1)) : null;
    if (target && root.current?.contains(target)) {
      target.scrollIntoView({ block: 'start', behavior: 'instant' });
      target.focus({ preventScroll: true });
    }
  }, [hash, root]);
  useEffect(() => {
    let frame = 0;
    let mounted = true;
    const refresh = () => {
      if (!mounted) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => ScrollTrigger.refresh());
    };
    const observer = new ResizeObserver(refresh);
    if (root.current) observer.observe(root.current);
    void document.fonts?.ready.then(refresh);
    return () => {
      mounted = false;
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [root]);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        {
          motion: '(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)',
          reduce: '(prefers-reduced-motion: reduce)',
        },
        (ctx) => {
          if (!ctx.conditions?.motion || !root.current) return;
          const element = root.current;
          const animate = (event: PointerEvent, entering: boolean) => {
            const card =
              event.target instanceof Element ? event.target.closest('.info-card, .dish-card') : null;
            if (!card || (event.relatedTarget instanceof Node && card.contains(event.relatedTarget))) return;
            gsap.to(card, { y: entering ? -4 : 0, duration: 0.25, overwrite: 'auto' });
            const image = card.querySelector('img');
            if (image) gsap.to(image, { scale: entering ? 1.04 : 1, duration: 0.35, overwrite: 'auto' });
          };
          // Record interaction tweens in the preference context, including live reduced-motion cleanup.
          const enter = (event: PointerEvent) => {
            ctx.add(() => animate(event, true));
          };
          const leave = (event: PointerEvent) => {
            ctx.add(() => animate(event, false));
          };
          element.addEventListener('pointerover', enter);
          element.addEventListener('pointerout', leave);
          return () => {
            element.removeEventListener('pointerover', enter);
            element.removeEventListener('pointerout', leave);
          };
        },
      );
      return () => mm.revert();
    },
    { scope: root, dependencies: [locale], revertOnUpdate: true },
  );
}
