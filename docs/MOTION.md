# Motion (GSAP)

## Principles
Motion supports reading and wayfinding; it never blocks content. Slow, confident, editorial: elements arrive
once, then stay still. One signature moment per section at most. Everything has a reduced-motion version
where content is simply visible.

## Setup — `src/lib/gsap.ts`
```ts
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
export const dirSign = () => (document.documentElement.dir === 'rtl' ? -1 : 1); // flip x for RTL
export { gsap, ScrollTrigger, SplitText, Flip, Observer, useGSAP };
```
Import gsap only from this module. Register once.

## Pattern for every animated component
```tsx
const root = useRef<HTMLElement>(null);
useGSAP(() => {
  const mm = gsap.matchMedia();
  mm.add({ motion: '(prefers-reduced-motion: no-preference)', desktop: '(min-width: 1024px)' }, (ctx) => {
    const { motion, desktop } = ctx.conditions!;
    if (!motion) return;                     // reduced motion: nothing animates, nothing hidden
    gsap.from('.js-reveal', { y: 32, autoAlpha: 0, stagger: 0.08,
      scrollTrigger: { trigger: root.current, start: 'top 80%', once: true } });
    if (desktop) { /* pinned / horizontal variants */ }
  });
}, { scope: root, dependencies: [locale] });  // re-run on language change (text and direction change)
```
Rules:
- Never hide content in CSS waiting for JS. Use `gsap.from(..., { autoAlpha: 0 })` inside the motion branch,
  or `gsap.set` immediately before the tween. With JS disabled or reduced motion everything is visible.
- SplitText: create inside the effect, `split.revert()` in cleanup (useGSAP reverts the context automatically
  when created inside it). Use `type: 'lines,words'` with `mask: 'lines'`. **Arabic: split by lines only**
  (never chars or words: cursive letters must stay joined). Re-split on resize via `autoSplit: true`.
- ScrollTrigger: `once: true` for reveals; call `ScrollTrigger.refresh()` after fonts load
  (`document.fonts.ready`) and after images in pinned sections load. Kill all triggers on route change
  (useGSAP context does this when the page unmounts).
- RTL: any horizontal `x` / `xPercent` must be multiplied by `dirSign()`. Horizontal scroll sections move
  toward the reading end (negative x in LTR, positive in RTL). Geographic visuals (maps, skyline, hero halves) do not flip.
- Animate only `transform`, `opacity`, `clip-path`, SVG `strokeDashoffset` (DrawSVG). No `top/left/width/height`.
- `will-change` only during the tween (GSAP handles force3D). No scroll-jacking libraries; native scroll.
- Ambient loops (WTC turbines, pins pulsing) pause when off-screen (`ScrollTrigger` `onToggle`) and never run with reduced motion.

## Tokens
Durations: fast 0.35s (hover, UI), base 0.8s (reveals), slow 1.4s (hero, maps). Stagger 0.06–0.12s.
Eases: reveals `expo.out`; moves/transitions `power3.inOut`; ambient `sine.inOut`. Hover via CSS transitions (200ms).

## Signature animations
| Where | Animation |
|---|---|
| Page transitions | `PageTransition`: on route change an ink panel with a round-arch top wipes up (clip-path) 0.5s, content swaps, panel wipes away; focus moves to the new `<h1>`; skipped with reduced motion. |
| United hero | The two photo halves open from the gold seam outward (`clip-path: inset()`), jasmine and razji line art draw along the seam (DrawSVG), headline lines rise with mask (SplitText), CTAs fade in. Desktop hover on a half → that half grows to 58% (Flip or flex-grow tween), the other dims. |
| Journey map (United) | Countries fade in, `#route` arc draws with scroll scrub, city halos pulse once, distance counter counts up (`3,970` with Intl formatting). |
| Section headers | Eyebrow rule draws (scaleX from start), heading lines reveal, intro fades up. |
| Destinations (country) | Desktop: section pins and the cards track moves horizontally (scrub) while the matching map pin lights up (`data-place`). Mobile: native horizontal scroll-snap carousel, no pin. |
| Timeline | The vertical line draws with scroll (scaleY scrub), dots pop as they enter, thumbnails parallax slightly. |
| Images | Subtle parallax inside frames (`yPercent: -6 → 6`, scrub) for large images only. Cards: scale 1.04 on hover (CSS). |
| Bahrain pearl heritage | Gold numerals count up; pearl-type grade bar fills. |
| Footer skyline | Landmarks rise from the ground with stagger from the centre outward (palm first); WTC turbines rotate slowly (infinite, off-screen paused). |
| Common Grounds deck | Observer (wheel/touch/keys) → slide timeline: outgoing slide fades/scales 0.96, incoming split halves slide in from their sides, Ken Burns on images (scale 1.0→1.08 over 10s), `split-merge` slides clip the two halves into one. Progress bar width tween. |
| Vault | Filter changes animate cards with `Flip` (fade/scale entering, reflow). New page of cards staggers in. Heart button: small scale pop + 6 tiny pearl particles. |
| Counters | Numbers in facts/hero use a count-up only once, formatted with Intl for the current locale. |

## Performance checklist
- Lazy-create heavy timelines with `ScrollTrigger.create({ onEnter })` when far below the fold.
- Use `gsap.quickTo` for pointer-follow effects (if any).
- Test on a throttled mobile profile: no long tasks > 50ms caused by animation setup.
