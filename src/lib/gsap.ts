import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);
gsap.defaults({ ease: 'expo.out', duration: 0.9 });
export const EASE = { reveal: 'expo.out', move: 'power3.inOut', ambient: 'sine.inOut' } as const;
export const DUR = { fast: 0.35, base: 0.8, slow: 1.4 } as const;
export const dirSign = () => (document.documentElement.dir === 'rtl' ? -1 : 1);
export { gsap, ScrollTrigger, useGSAP };
