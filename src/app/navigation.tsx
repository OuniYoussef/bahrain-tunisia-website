import { useLayoutEffect, useRef } from 'react';
import { useLocation } from 'react-router';
import { ScrollTrigger } from '@/lib/gsap';
import { sameDeck } from './sameDeck';
export function NavigationEffects() {
  const { key, hash, pathname } = useLocation();
  const initialKey = useRef(key);
  const previousPath = useRef(pathname);
  useLayoutEffect(() => {
    const frame = requestAnimationFrame(() => {
      let id = '';
      try {
        id = decodeURIComponent(hash.slice(1));
      } catch {
        /* Malformed hash has no target. */
      }
      const target = id ? document.getElementById(id) : null;
      if (key !== initialKey.current && !sameDeck(previousPath.current, pathname))
        (previousPath.current === pathname && target
          ? target
          : document.querySelector<HTMLElement>('main h1')
        )?.focus({ preventScroll: true });
      previousPath.current = pathname;
      if (target) target.scrollIntoView({ block: 'start', behavior: 'instant' });
      ScrollTrigger.refresh();
    });
    let active = true;
    void document.fonts.ready.then(() => {
      if (active) ScrollTrigger.refresh();
    });
    return () => {
      active = false;
      cancelAnimationFrame(frame);
    };
  }, [key, hash, pathname]);
  return null;
}
