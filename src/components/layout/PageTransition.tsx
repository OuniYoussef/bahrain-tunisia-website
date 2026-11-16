import { useRef, type ReactNode } from 'react';
import { useBlocker, useLocation } from 'react-router';
import { gsap, useGSAP } from '@/lib/gsap';
export function PageTransition({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const { key, pathname } = useLocation();
  const previousKey = useRef(key);
  const previousPath = useRef(pathname);
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      currentLocation.pathname !== nextLocation.pathname &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        { motion: '(prefers-reduced-motion: no-preference)', reduce: '(prefers-reduced-motion: reduce)' },
        (ctx) => {
          if (!ctx.conditions?.motion) {
            if (blocker.state === 'blocked') blocker.proceed();
            previousKey.current = key;
            previousPath.current = pathname;
            return;
          }
          const panel = root.current?.querySelector('.page-wipe');
          if (!panel) return;
          if (blocker.state === 'blocked') {
            gsap.fromTo(
              panel,
              { clipPath: 'inset(100% 0% 0% 0% round 50% 50% 0% 0%)' },
              {
                clipPath: 'inset(0% 0% 0% 0% round 0% 0% 0% 0%)',
                duration: 0.25,
                ease: 'power3.inOut',
                onComplete: () => blocker.proceed(),
              },
            );
          } else if (blocker.state === 'proceeding') {
            gsap.set(panel, { clipPath: 'inset(0% 0% 0% 0%)' });
          } else if (previousKey.current !== key) {
            previousKey.current = key;
            if (previousPath.current === pathname) return;
            previousPath.current = pathname;
            gsap.fromTo(
              panel,
              { clipPath: 'inset(0% 0% 0% 0% round 0% 0% 0% 0%)' },
              { clipPath: 'inset(0% 0% 100% 0% round 0% 0% 50% 50%)', duration: 0.25, ease: 'power3.inOut' },
            );
          }
        },
      );
      return () => mm.revert();
    },
    {
      scope: root,
      dependencies: [key, pathname, blocker.state, blocker.location?.key],
      revertOnUpdate: true,
    },
  );
  return (
    <div ref={root}>
      {children}
      <div className="page-wipe" aria-hidden="true" />
    </div>
  );
}
