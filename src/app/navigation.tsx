import { useLayoutEffect, useRef } from 'react';
import { useLocation } from 'react-router';
import { ScrollTrigger } from '@/lib/gsap';
export function NavigationEffects() {
  const { key, hash } = useLocation();
  const initialKey = useRef(key);
  useLayoutEffect(() => {
    const frame = requestAnimationFrame(() => {
      let id = '';
      try {
        id = decodeURIComponent(hash.slice(1));
      } catch {
        /* Malformed hash has no target. */
      }
      const target = id ? document.getElementById(id) : null;
      if (key !== initialKey.current)
        document.querySelector<HTMLElement>('main h1')?.focus({ preventScroll: true });
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
  }, [key, hash]);
  return null;
}
