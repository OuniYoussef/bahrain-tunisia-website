import { gsap } from './gsap';
import { SplitText } from 'gsap/SplitText';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
// Route features opt into the additional plugins; the global shell only needs ScrollTrigger.
gsap.registerPlugin(SplitText, DrawSVGPlugin);
export { SplitText, DrawSVGPlugin };
export { Flip } from 'gsap/Flip';
export { Observer } from 'gsap/Observer';
