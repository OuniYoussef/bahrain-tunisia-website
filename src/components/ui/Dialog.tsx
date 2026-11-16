import { createContext, use, useId, useLayoutEffect, useRef, type ReactNode, type RefObject } from 'react';
import { X } from 'lucide-react';
import { useContent } from '@/i18n/content';
import { cn } from '@/lib/cn';
import { dirSign, DUR, gsap, useGSAP } from '@/lib/gsap';
import { Button, type ButtonProps } from './Button';
import { lockScroll } from './scrollLock';

export type DialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: string;
  children: ReactNode;
  initialFocus?: RefObject<HTMLElement | null>;
  className?: string;
  slideFrom?: 'bottom' | 'end';
};
const DialogContext = createContext<(() => void) | null>(null);

function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  initialFocus,
  className,
  presentation,
  slideFrom = 'bottom',
}: DialogProps & { presentation: 'dialog' | 'sheet' }) {
  const root = useRef<HTMLDialogElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const id = useId();
  const { ui } = useContent('common');

  useLayoutEffect(() => {
    const dialog = root.current;
    if (!open || !dialog) return;
    const returnTo = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const unlock = lockScroll();
    if (!dialog.open) dialog.showModal();
    (initialFocus?.current ?? titleRef.current)?.focus({ preventScroll: true });
    return () => {
      if (dialog.open) dialog.close();
      unlock();
      if (returnTo?.isConnected) returnTo.focus({ preventScroll: true });
    };
  }, [open, initialFocus]);

  useGSAP(
    () => {
      if (!open) return;
      const mm = gsap.matchMedia();
      mm.add(
        {
          motion: '(prefers-reduced-motion: no-preference)',
          reduce: '(prefers-reduced-motion: reduce)',
          mobile: '(max-width: 639px)',
        },
        (ctx) => {
          if (!ctx.conditions?.motion) return;
          gsap.from(root.current, {
            y: slideFrom === 'end' ? 0 : ctx.conditions.mobile || presentation === 'sheet' ? 64 : 16,
            xPercent: slideFrom === 'end' ? 100 * dirSign() : 0,
            opacity: 0,
            duration: DUR.fast,
          });
        },
      );
      return () => mm.revert();
    },
    { scope: root, dependencies: [open, presentation, slideFrom], revertOnUpdate: true },
  );

  return (
    <DialogContext value={() => onOpenChange(false)}>
      <dialog
        ref={root}
        className={cn('ui-dialog', presentation === 'sheet' && 'ui-sheet', className)}
        aria-labelledby={`${id}-title`}
        aria-describedby={description ? `${id}-description` : undefined}
        onKeyDown={(event) => {
          if (event.key !== 'Tab') return;
          const controls = Array.from(
            event.currentTarget.querySelectorAll<HTMLElement>(
              'button, [href], input, select, textarea, [tabindex], [contenteditable="true"]',
            ),
          ).filter(
            (element) =>
              element.tabIndex >= 0 &&
              !element.matches(':disabled') &&
              !element.closest('[hidden], [inert]') &&
              element.getClientRects().length > 0,
          );
          const first = controls[0];
          const last = controls.at(-1);
          if (!first) {
            event.preventDefault();
            titleRef.current?.focus();
          } else if (
            event.shiftKey &&
            (document.activeElement === first || !controls.includes(document.activeElement as HTMLElement))
          ) {
            event.preventDefault();
            last?.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
          }
        }}
        onCancel={(event) => {
          event.preventDefault();
          onOpenChange(false);
        }}
        onClose={(event) => {
          if (open && !event.currentTarget.open) onOpenChange(false);
        }}
      >
        <div className="p-6 sm:p-10">
          <div className="mb-6 flex items-start justify-between gap-4">
            <h2 id={`${id}-title`} ref={titleRef} tabIndex={-1} className="text-h3">
              {title}
            </h2>
            <Button
              variant="ghost"
              size="icon"
              aria-label={ui.close}
              icon={<X size={20} />}
              onClick={() => onOpenChange(false)}
            />
          </div>
          {description && (
            <p id={`${id}-description`} className="mb-6 text-muted">
              {description}
            </p>
          )}
          {children}
        </div>
      </dialog>
    </DialogContext>
  );
}

export function Dialog(props: DialogProps) {
  return <Modal {...props} presentation="dialog" />;
}
export function Sheet(props: DialogProps) {
  return <Modal {...props} presentation="sheet" />;
}
export function DialogClose({ onClick, ...props }: ButtonProps) {
  const close = use(DialogContext);
  if (!close) throw new Error('DialogClose requires Dialog or Sheet');
  return (
    <Button
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) close();
      }}
    />
  );
}
