import { useRef } from 'react';
import { NavLink, useLocation } from 'react-router';
import { useContent, useLocale } from '@/i18n/content';
import { gsap, useGSAP } from '@/lib/gsap';
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
          const active = root.current?.querySelector<HTMLElement>('[aria-current="page"]');
          if (!active || mobile) return;
          const next = { x: active.offsetLeft, width: active.offsetWidth };
          const before = previous.current;
          previous.current = next;
          if (ctx.conditions?.motion && before)
            gsap.from(active.querySelector('.nav-underline'), {
              x: before.x - next.x,
              scaleX: before.width / next.width,
              transformOrigin: '0 50%',
              duration: 0.35,
            });
        },
      );
      return () => mm.revert();
    },
    { scope: root, dependencies: [pathname, mobile], revertOnUpdate: true },
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
