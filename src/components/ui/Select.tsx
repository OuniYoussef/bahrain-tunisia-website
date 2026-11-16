import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';
import { FieldFrame, type FieldProps } from './Field';
import { useField } from './useField';
export function Select({
  label,
  hint,
  error,
  id,
  className,
  'aria-describedby': describedBy,
  ...props
}: ComponentProps<'select'> & FieldProps) {
  const field = useField(id, describedBy, hint, error);
  return (
    <FieldFrame {...{ id: field.id, label, hint, error }}>
      <select {...props} {...field} className={cn('ui-control', className)} />
    </FieldFrame>
  );
}
