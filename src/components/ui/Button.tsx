import { useImperativeHandle, useRef, type ComponentProps, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { DUR, gsap, useGSAP } from '@/lib/gsap';

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
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        { motion: '(prefers-reduced-motion: no-preference)', reduce: '(prefers-reduced-motion: reduce)' },
        (ctx) => {
          const element = root.current;
          const icon = element?.querySelector('[data-reading-icon]');
          if (!ctx.conditions?.motion || !element || !icon) return;
          const tween = gsap.to(icon, { x: 3, duration: DUR.fast, paused: true });
          const enter = () => {
            if (!element.matches(':disabled, [aria-disabled="true"]')) tween.play();
          };
          const leave = () => {
            tween.reverse();
          };
          element.addEventListener('pointerenter', enter);
          element.addEventListener('pointerleave', leave);
          element.addEventListener('focusin', enter);
          element.addEventListener('focusout', leave);
          return () => {
            element.removeEventListener('pointerenter', enter);
            element.removeEventListener('pointerleave', leave);
            element.removeEventListener('focusin', enter);
            element.removeEventListener('focusout', leave);
          };
        },
      );
      return () => mm.revert();
    },
    { scope: root },
  );
  return root;
}

function ButtonIcon({ icon, direction }: { icon: ReactNode; direction: Appearance['iconDirection'] }) {
  return icon ? (
    <span
      aria-hidden="true"
      className={cn('inline-flex shrink-0', direction === 'reading' && 'rtl:-scale-x-100')}
    >
      <span className="inline-flex" data-reading-icon={direction === 'reading' ? '' : undefined}>
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
