import { ScrollTrigger } from './gsap';

/** Ambient work runs only while its section is on screen and the tab is visible. */
export function pauseOutside(element: Element, animation: gsap.core.Animation) {
  const sync = () => animation.paused(!trigger.isActive || document.hidden);
  const trigger = ScrollTrigger.create({
    trigger: element,
    start: 'top bottom',
    end: 'bottom top',
    onToggle: (self) => animation.paused(!self.isActive || document.hidden),
  });
  sync();
  document.addEventListener('visibilitychange', sync);
  return () => {
    trigger.kill();
    document.removeEventListener('visibilitychange', sync);
  };
}
