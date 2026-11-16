import { gsap } from './gsap';
import { SplitText } from 'gsap/SplitText';
import { Flip } from 'gsap/Flip';
import { Observer } from 'gsap/Observer';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
// Route features opt into the additional plugins; the global shell only needs ScrollTrigger.
gsap.registerPlugin(SplitText, Flip, Observer, DrawSVGPlugin);
export { SplitText, Flip, Observer, DrawSVGPlugin };
