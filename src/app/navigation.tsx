import { useLayoutEffect, useRef } from 'react';
import { useLocation } from 'react-router';
import { scheduleMotionRefresh } from '@/lib/motionRefresh';
import { sameDeck } from './sameDeck';
export function NavigationEffects() {
  const { key, hash, pathname } = useLocation();
  const initialKey = useRef(key);
  const previousPath = useRef(pathname);
  useLayoutEffect(() => {
    let interacted = false;
    const markInteraction = () => {
      interacted = true;
    };
    const interactionEvents = ['wheel', 'touchstart', 'keydown'] as const;
    interactionEvents.forEach((event) => window.addEventListener(event, markInteraction, { passive: true }));
    const frame = requestAnimationFrame(() => {
      let id = '';
      try {
        id = decodeURIComponent(hash.slice(1));
      } catch {
        /* Malformed hash has no target. */
      }
      const target = id ? document.getElementById(id) : null;
      if (
        key !== initialKey.current &&
        (previousPath.current !== pathname || target) &&
        !sameDeck(previousPath.current, pathname)
      )
        (previousPath.current === pathname && target
          ? target
          : document.querySelector<HTMLElement>('main h1')
        )?.focus({ preventScroll: true });
      previousPath.current = pathname;
      if (target) target.scrollIntoView({ block: 'start', behavior: 'instant' });
      scheduleMotionRefresh();
    });
    let active = true;
    void document.fonts.ready.then(() => {
      if (!active) return;
      scheduleMotionRefresh();
      // Font wrapping above a deep link can move its target after the first frame.
      if (hash && !interacted) {
        try {
          document
            .getElementById(decodeURIComponent(hash.slice(1)))
            ?.scrollIntoView({ block: 'start', behavior: 'instant' });
        } catch {
          /* A malformed hash has no target. */
        }
      }
    });
    document.addEventListener('load', scheduleMotionRefresh, true);
    document.fonts.addEventListener('loadingdone', scheduleMotionRefresh);
    return () => {
      active = false;
      cancelAnimationFrame(frame);
      document.removeEventListener('load', scheduleMotionRefresh, true);
      document.fonts.removeEventListener('loadingdone', scheduleMotionRefresh);
      interactionEvents.forEach((event) => window.removeEventListener(event, markInteraction));
    };
  }, [key, hash, pathname]);
  return null;
}
