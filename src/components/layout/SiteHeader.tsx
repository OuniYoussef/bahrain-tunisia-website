import { lazy, Suspense, useRef, useState } from 'react';
import { Menu } from 'lucide-react';
import { useLocation } from 'react-router';
import { useContent } from '@/i18n/content';
import { gsap, useGSAP } from '@/lib/gsap';
import { SiteIdentifier } from './SiteIdentifier';
import { IeeeMasterBrand } from './IeeeMasterBrand';
import { MainNav } from './MainNav';
import { LanguageSwitcher } from './LanguageSwitcher';
const MobileNav = lazy(() => import('./MobileNav').then((module) => ({ default: module.MobileNav })));
export function SiteHeader({ hero = false }: { hero?: boolean }) {
  const { a11y } = useContent('common');
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [solid, setSolid] = useState(!hero || window.scrollY > 24);
  const root = useRef<HTMLElement>(null);
  const previousSolid = useRef(solid);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        { motion: '(prefers-reduced-motion: no-preference)', reduce: '(prefers-reduced-motion: reduce)' },
        (ctx) => {
          const surface = root.current?.querySelector('.header-surface');
          if (surface && ctx.conditions?.motion && previousSolid.current !== solid) {
            gsap.fromTo(surface, { opacity: solid ? 0 : 1 }, { opacity: solid ? 1 : 0, duration: 0.25 });
          }
          previousSolid.current = solid;
        },
      );
      return () => mm.revert();
    },
    { scope: root, dependencies: [solid], revertOnUpdate: true },
  );
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        { motion: '(prefers-reduced-motion: no-preference)', reduce: '(prefers-reduced-motion: reduce)' },
        (ctx) => {
          let previous = window.scrollY;
          let hidden = false;
          const tween = gsap.to(root.current, {
            yPercent: -110,
            duration: ctx.conditions?.motion ? 0.25 : 0,
            paused: true,
          });
          const show = () => {
            hidden = false;
            tween.reverse();
          };
          const update = () => {
            const y = window.scrollY;
            setSolid(!hero || y > 24);
            const next = Boolean(
              ctx.conditions?.motion &&
              y > 400 &&
              y > previous &&
              !open &&
              !root.current?.contains(document.activeElement),
            );
            if (Math.abs(y - previous) > 4 || y < 400) {
              if (next !== hidden) {
                hidden = next;
                if (hidden) tween.play();
                else tween.reverse();
              }
              previous = y;
            }
          };
          update();
          window.addEventListener('scroll', update, { passive: true });
          root.current?.addEventListener('focusin', show);
          const element = root.current;
          return () => {
            window.removeEventListener('scroll', update);
            element?.removeEventListener('focusin', show);
          };
        },
      );
      return () => mm.revert();
    },
    { scope: root, dependencies: [hero, pathname, open], revertOnUpdate: true },
  );
  return (
    <>
      <header
        ref={root}
        className={`site-header ${solid ? 'is-solid' : 'is-overlay'}`}
        data-hero={hero || undefined}
      >
        <span className="header-surface" aria-hidden="true" />
        <div className="header-inner">
          <SiteIdentifier />
          <div className="desktop-navigation">
            <MainNav />
          </div>
          <div className="desktop-language">
            <LanguageSwitcher />
          </div>
          <IeeeMasterBrand tone={solid ? 'light' : 'dark'} />
          <button
            type="button"
            className="menu-button"
            aria-label={open ? a11y.closeMenu : a11y.openMenu}
            aria-expanded={open}
            onClick={() => setOpen(true)}
          >
            <Menu aria-hidden="true" size={22} />
          </button>
        </div>
      </header>
      {open && (
        <Suspense>
          <MobileNav open={open} onOpenChange={setOpen} />
        </Suspense>
      )}
    </>
  );
}
