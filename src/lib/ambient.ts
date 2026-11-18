import { ScrollTrigger } from './gsap';
import { motionPaused, subscribeMotion } from './motionPreference';

/** Ambient work runs only while its section is on screen and the tab is visible. */
export function pauseOutside(element: Element, animation: gsap.core.Animation) {
  const sync = () => animation.paused(!trigger.isActive || document.hidden || motionPaused());
  const trigger = ScrollTrigger.create({
    trigger: element,
    start: 'top bottom',
    end: 'bottom top',
    onToggle: (self) => animation.paused(!self.isActive || document.hidden || motionPaused()),
  });
  sync();
  document.addEventListener('visibilitychange', sync);
  const unsubscribe = subscribeMotion(sync);
  return () => {
    trigger.kill();
    unsubscribe();
    document.removeEventListener('visibilitychange', sync);
  };
}
