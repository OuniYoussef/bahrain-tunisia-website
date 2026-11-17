import { useRef, type RefObject } from 'react';
import { gsap, useGSAP, dirSign } from '@/lib/gsap';
import { Observer } from '@/lib/gsap-observer';
import { motionQueries } from './model';
import { pauseOutside } from './ambient';

export function useDeckMotion(
  root: RefObject<HTMLElement | null>,
  index: number,
  open: boolean,
  go: (index: number) => void,
) {
  const previous = useRef(index);
  const cooldown = useRef(0);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(motionQueries, (ctx) => {
        const current = root.current?.querySelector<HTMLElement>(`[data-slide-index="${index}"]`);
        const outgoing = root.current?.querySelector<HTMLElement>(`[data-slide-index="${previous.current}"]`);
        if (!current) return;
        if (ctx.conditions?.motion) {
          const tl = gsap.timeline({ defaults: { duration: 0.65, ease: 'power3.inOut' } });
          if (outgoing && outgoing !== current)
            tl.fromTo(outgoing, { opacity: 1, scale: 1 }, { opacity: 0, scale: 0.96 }, 0);
          tl.fromTo(current, { opacity: 0 }, { opacity: 1 }, 0);
          current
            .querySelectorAll('.matrix-half')
            .forEach((half, i) =>
              tl.fromTo(half, { xPercent: (i ? 8 : -8) * dirSign() }, { xPercent: 0 }, 0),
            );
          tl.fromTo(
            current.querySelectorAll('.matrix-photo'),
            { scale: 1 },
            { scale: 1.08, duration: 10, ease: 'none' },
            0,
          );
          if (current.dataset.layout === 'split-merge') {
            tl.fromTo(
              current.querySelectorAll('.matrix-half'),
              { clipPath: 'inset(0 5% 0 5%)' },
              { clipPath: 'inset(0 0% 0 0%)', duration: 1.4 },
              1.2,
            ).fromTo(current.querySelector('.matrix-copy'), { opacity: 0 }, { opacity: 1 }, 1.2);
          }
          gsap.fromTo(
            root.current!.querySelector('[data-progress-current]'),
            { scaleX: 0 },
            { scaleX: 1, duration: 0.65 },
          );
          previous.current = index;
          return pauseOutside(root.current!, tl);
        }
        previous.current = index;
      });
      return () => mm.revert();
    },
    { scope: root, dependencies: [index], revertOnUpdate: true },
  );
  useGSAP(
    () => {
      if (open) return;
      const mm = gsap.matchMedia();
      mm.add({ ...motionQueries, mobile: '(max-width: 899px)' }, (ctx) => {
        const mobile = ctx.conditions?.mobile;
        const step = (direction: number) => {
          if (performance.now() < cooldown.current) return;
          cooldown.current = performance.now() + 850;
          go(index + direction);
        };
        const observer = Observer.create({
          target: root.current!,
          type: 'wheel,touch,pointer',
          tolerance: 12,
          preventDefault: !mobile,
          allowClicks: true,
          ignore: 'button, a, input, [data-inner-scroll], dialog',
          onWheel: (self) => {
            if (!mobile) step(self.deltaY > 0 ? 1 : -1);
          },
          onLeft: (self) => {
            if (self.event.type !== 'wheel') step(dirSign());
          },
          onRight: (self) => {
            if (self.event.type !== 'wheel') step(-dirSign());
          },
          onUp: (self) => {
            if (!mobile && self.event.type !== 'wheel') step(1);
          },
          onDown: (self) => {
            if (!mobile && self.event.type !== 'wheel') step(-1);
          },
        });
        const visible = new IntersectionObserver(
          ([entry]) => {
            if (entry?.isIntersecting) observer.enable();
            else observer.disable();
          },
          { threshold: 0.15 },
        );
        visible.observe(root.current!);
        return () => {
          observer.kill();
          visible.disconnect();
        };
      });
      return () => mm.revert();
    },
    { scope: root, dependencies: [index, open, go], revertOnUpdate: true },
  );
}
