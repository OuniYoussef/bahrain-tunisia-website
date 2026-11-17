import { useImperativeHandle, useRef, type ComponentProps, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { dirSign, DUR, EASE, gsap, useGSAP } from '@/lib/gsap';
import { useLocale } from '@/i18n/content';

type Appearance = {
  variant?: 'primary' | 'accent' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  icon?: ReactNode;
  iconDirection?: 'static' | 'reading';
};
export type ButtonProps = ComponentProps<'button'> & Appearance;
export type ButtonLinkProps = ComponentProps<'a'> & Appearance;

function useButtonMotion<T extends HTMLElement>() {
  const root = useRef<T>(null);
  const locale = useLocale();
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        { motion: '(prefers-reduced-motion: no-preference)', reduce: '(prefers-reduced-motion: reduce)' },
        (ctx) => {
          const element = root.current;
          const icon = element?.querySelector('[data-reading-icon-wrap]');
          if (!ctx.conditions?.motion || !element) return;
          const tween = icon
            ? gsap.to(icon, {
                x: 3 * dirSign(),
                duration: DUR.fast,
                ease: EASE.move,
                paused: true,
              })
            : null;
          const press = gsap.to(element, { scale: 0.98, duration: DUR.fast, paused: true, ease: EASE.move });
          const down = () => {
            if (!element.matches(':disabled, [aria-disabled="true"]')) press.play();
          };
          const up = () => {
            press.reverse();
          };
          const enter = () => {
            if (!element.matches(':disabled, [aria-disabled="true"]')) tween?.play();
          };
          const leave = () => {
            tween?.reverse();
            up();
          };
          element.addEventListener('pointerdown', down);
          element.addEventListener('pointerup', up);
          element.addEventListener('pointercancel', up);
          element.addEventListener('pointerenter', enter);
          element.addEventListener('pointerleave', leave);
          element.addEventListener('focusin', enter);
          element.addEventListener('focusout', leave);
          return () => {
            element.removeEventListener('pointerdown', down);
            element.removeEventListener('pointerup', up);
            element.removeEventListener('pointercancel', up);
            element.removeEventListener('pointerenter', enter);
            element.removeEventListener('pointerleave', leave);
            element.removeEventListener('focusin', enter);
            element.removeEventListener('focusout', leave);
          };
        },
      );
      return () => mm.revert();
    },
    { scope: root, dependencies: [locale], revertOnUpdate: true },
  );
  return root;
}

function ButtonIcon({ icon, direction }: { icon: ReactNode; direction: Appearance['iconDirection'] }) {
  return icon ? (
    <span
      aria-hidden="true"
      className="inline-flex shrink-0"
      data-reading-icon-wrap={direction === 'reading' ? '' : undefined}
    >
      <span
        className={cn('inline-flex', direction === 'reading' && 'rtl:-scale-x-100')}
        data-reading-icon={direction === 'reading' ? '' : undefined}
      >
        {icon}
      </span>
    </span>
  ) : null;
}

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  iconDirection = 'static',
  className,
  children,
  type = 'button',
  ref,
  ...props
}: ButtonProps) {
  const root = useButtonMotion<HTMLButtonElement>();
  useImperativeHandle(ref, () => root.current!, [root]);
  return (
    <button
      {...props}
      type={type}
      ref={root}
      className={cn('ui-button', `ui-button-${variant}`, `ui-button-${size}`, className)}
    >
      {children}
      <ButtonIcon icon={icon} direction={iconDirection} />
    </button>
  );
}

export function ButtonLink({
  variant = 'primary',
  size = 'md',
  icon,
  iconDirection = 'static',
  className,
  children,
  ref,
  ...props
}: ButtonLinkProps) {
  const root = useButtonMotion<HTMLAnchorElement>();
  useImperativeHandle(ref, () => root.current!, [root]);
  return (
    <a
      {...props}
      ref={root}
      className={cn('ui-button', `ui-button-${variant}`, `ui-button-${size}`, className)}
    >
      {children}
      <ButtonIcon icon={icon} direction={iconDirection} />
    </a>
  );
}
