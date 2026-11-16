import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { Flip } from 'gsap/Flip';
import { Observer } from 'gsap/Observer';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, SplitText, Flip, Observer, DrawSVGPlugin, useGSAP);
gsap.defaults({ ease: 'expo.out', duration: 0.9 });
export const EASE = { reveal: 'expo.out', move: 'power3.inOut', ambient: 'sine.inOut' } as const;
export const DUR = { fast: 0.35, base: 0.8, slow: 1.4 } as const;
export const dirSign = () => (document.documentElement.dir === 'rtl' ? -1 : 1);
export { gsap, ScrollTrigger, SplitText, Flip, Observer, useGSAP };
