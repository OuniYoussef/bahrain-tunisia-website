import { useRef } from 'react';
import { NavLink, useLocation } from 'react-router';
import { useContent, useLocale } from '@/i18n/content';
import { DUR, EASE, dirSign, gsap, useGSAP } from '@/lib/gsap';
const mainLinks = [
  ['united', ''],
  ['tunisia', '/tunisia'],
  ['bahrain', '/bahrain'],
  ['commonGrounds', '/common-grounds'],
  ['vault', '/vault'],
] as const;
export function MainNav({ mobile = false, onNavigate }: { mobile?: boolean; onNavigate?: () => void }) {
  const { a11y, nav } = useContent('common');
  const locale = useLocale();
  const { pathname } = useLocation();
  const root = useRef<HTMLElement>(null);
  const previous = useRef<{ x: number; width: number } | null>(null);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        { motion: '(prefers-reduced-motion: no-preference)', reduce: '(prefers-reduced-motion: reduce)' },
        (ctx) => {
          if (mobile || !root.current) return;
          const cleanups: (() => void)[] = [];
          if (ctx.conditions?.motion) {
            for (const link of root.current.querySelectorAll('a:not([aria-current="page"])')) {
              const line = link.querySelector('.nav-underline');
              const tween = gsap.fromTo(
                line,
                { scaleX: 0 },
                {
                  scaleX: 1,
                  duration: DUR.fast,
                  ease: EASE.move,
                  paused: true,
                  transformOrigin: dirSign() === -1 ? '100% 50%' : '0% 50%',
                },
              );
              const enter = () => {
                tween.play();
              };
              const leave = () => {
                tween.reverse();
              };
              link.addEventListener('pointerenter', enter);
              link.addEventListener('pointerleave', leave);
              link.addEventListener('focus', enter);
              link.addEventListener('blur', leave);
              cleanups.push(() => {
                link.removeEventListener('pointerenter', enter);
                link.removeEventListener('pointerleave', leave);
                link.removeEventListener('focus', enter);
                link.removeEventListener('blur', leave);
              });
            }
          }
          const active = root.current?.querySelector<HTMLElement>('[aria-current="page"]');
          if (!active) return () => cleanups.forEach((cleanup) => cleanup());
          // Store reading-direction coordinates; convert back to physical translation once.
          const next = { x: active.offsetLeft * dirSign(), width: active.offsetWidth };
          const before = previous.current;
          previous.current = next;
          if (ctx.conditions?.motion && before)
            gsap.from(active.querySelector('.nav-underline'), {
              x: (before.x - next.x) * dirSign(),
              scaleX: before.width / next.width,
              transformOrigin: '0 50%',
              duration: DUR.fast,
              ease: EASE.move,
            });
          return () => cleanups.forEach((cleanup) => cleanup());
        },
      );
      return () => mm.revert();
    },
    { scope: root, dependencies: [pathname, mobile, locale], revertOnUpdate: true },
  );
  return (
    <nav ref={root} aria-label={a11y.mainNav} className={mobile ? 'mobile-main-nav' : 'main-nav'}>
      {mainLinks.map(([key, path], index) => (
        <NavLink key={key} to={`/${locale}${path}`} end={!path} onClick={onNavigate}>
          {mobile && (
            <span className="nav-index" aria-hidden="true">
              {String(index + 1).padStart(2, '0')}
            </span>
          )}
          {nav[key]}
          {!mobile && <span className="nav-underline" aria-hidden="true" />}
        </NavLink>
      ))}
    </nav>
  );
}
