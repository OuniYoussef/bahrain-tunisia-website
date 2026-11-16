import { createContext, use, useId, type ComponentProps, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
type TabsState = { value: string; onValueChange: (value: string) => void; id: string };
const TabsContext = createContext<TabsState | null>(null);
function useTabs() {
  const context = use(TabsContext);
  if (!context) throw new Error('Tabs components require Tabs');
  return context;
}
export function Tabs({ value, onValueChange, children }: Omit<TabsState, 'id'> & { children: ReactNode }) {
  const id = useId();
  return <TabsContext value={{ value, onValueChange, id }}>{children}</TabsContext>;
}
export function TabList({
  className,
  onKeyDown,
  ...props
}: ComponentProps<'div'> & { 'aria-label': string }) {
  return (
    <div
      {...props}
      role="tablist"
      tabIndex={-1}
      className={cn('flex flex-wrap gap-2', className)}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.defaultPrevented || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        const tabs = Array.from(
          event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]:not(:disabled)'),
        );
        const index = tabs.indexOf(document.activeElement as HTMLButtonElement);
        if (index < 0) return;
        const direction = getComputedStyle(event.currentTarget).direction === 'rtl' ? -1 : 1;
        const step = (event.key === 'ArrowRight' ? 1 : -1) * direction;
        const next =
          event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? tabs.length - 1
              : (index + step + tabs.length) % tabs.length;
        event.preventDefault();
        tabs[next]?.focus();
        tabs[next]?.click();
      }}
    />
  );
}
export function Tab({ value, className, onClick, ...props }: ComponentProps<'button'> & { value: string }) {
  const context = useTabs();
  const selected = context.value === value;
  const key = encodeURIComponent(value);
  return (
    <button
      {...props}
      type="button"
      role="tab"
      id={`${context.id}-tab-${key}`}
      aria-controls={`${context.id}-panel-${key}`}
      aria-selected={selected}
      tabIndex={selected ? 0 : -1}
      className={cn('ui-pill', className)}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) context.onValueChange(value);
      }}
    />
  );
}
export function TabPanel({ value, className, ...props }: ComponentProps<'div'> & { value: string }) {
  const context = useTabs();
  const key = encodeURIComponent(value);
  return (
    <div
      {...props}
      role="tabpanel"
      id={`${context.id}-panel-${key}`}
      aria-labelledby={`${context.id}-tab-${key}`}
      hidden={context.value !== value}
      tabIndex={0}
      className={cn('mt-6', className)}
    />
  );
}
