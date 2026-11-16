import { useEffect, useRef, useState } from 'react';

/** Reserve layout in the caller; only fetch expensive artwork when it approaches the viewport. */
export function useNearViewport<T extends HTMLElement>(waitForContent = false) {
  const root = useRef<T>(null);
  const [near, setNear] = useState(false);
  useEffect(() => {
    if (!root.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (waitForContent && document.querySelector('main .page-skeleton')) return;
        if (entry?.isIntersecting) {
          setNear(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' },
    );
    const element = root.current;
    observer.observe(element);
    const pending = waitForContent && document.querySelector('main .page-skeleton');
    const contentObserver = pending
      ? new MutationObserver(() => {
          if (document.querySelector('main .page-skeleton')) return;
          observer.unobserve(element);
          observer.observe(element);
          contentObserver?.disconnect();
        })
      : null;
    contentObserver?.observe(document.querySelector('main')!, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      contentObserver?.disconnect();
    };
  }, [waitForContent]);
  return { root, near };
}
