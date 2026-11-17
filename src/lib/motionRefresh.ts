import { ScrollTrigger } from './gsap';

let timer: ReturnType<typeof setTimeout> | undefined;
/** Coalesce font, image and deferred-content layout changes across the page. */
export function scheduleMotionRefresh() {
  clearTimeout(timer);
  timer = setTimeout(() => {
    timer = undefined;
    if (ScrollTrigger.getAll().length) ScrollTrigger.refresh();
  }, 120);
}
