import type { ReactNode, ComponentProps } from 'react';
import { CircleAlert } from 'lucide-react';
import { cn } from '@/lib/cn';

export type FieldProps = { label: ReactNode; hint?: string; error?: string };
export function Hint({ className, ...props }: ComponentProps<'p'>) {
  return <p {...props} className={cn('text-small text-muted', className)} />;
}
export function FieldError({ className, children, ...props }: ComponentProps<'p'>) {
  return (
    <p {...props} className={cn('flex items-start gap-2 text-small text-crimson', className)}>
      <CircleAlert aria-hidden="true" size={18} className="mt-0.5 shrink-0" />
      {children}
    </p>
  );
}
export function FieldFrame({
  id,
  label,
  hint,
  error,
  children,
}: FieldProps & { id: string; children: ReactNode }) {
  return (
    <div className="ui-field">
      <label htmlFor={id} className="font-medium">
        {label}
      </label>
      {children}
      {hint && <Hint id={`${id}-hint`}>{hint}</Hint>}
      {error && <FieldError id={`${id}-error`}>{error}</FieldError>}
    </div>
  );
}
