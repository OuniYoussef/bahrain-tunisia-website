/** Ambient imagery never spends frames in a hidden tab or outside the viewport. */
export function pauseOutside(element: Element, timeline: gsap.core.Timeline) {
  let visible = true;
  const sync = () => {
    if (visible && !document.hidden) timeline.resume();
    else timeline.pause();
  };
  const observer = new IntersectionObserver(([entry]) => {
    visible = Boolean(entry?.isIntersecting);
    sync();
  });
  observer.observe(element);
  document.addEventListener('visibilitychange', sync);
  sync();
  return () => {
    observer.disconnect();
    document.removeEventListener('visibilitychange', sync);
  };
}
