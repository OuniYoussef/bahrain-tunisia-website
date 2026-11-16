import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';
import { FieldError, Hint, type FieldProps } from './Field';
import { useField } from './useField';
export function Checkbox({
  label,
  hint,
  error,
  id,
  className,
  'aria-describedby': describedBy,
  ...props
}: Omit<ComponentProps<'input'>, 'type'> & FieldProps) {
  const field = useField(id, describedBy, hint, error);
  return (
    <div className="ui-field">
      <label htmlFor={field.id} className={cn('ui-choice', className)}>
        <input {...props} {...field} type="checkbox" />
        {label}
      </label>
      {hint && <Hint id={`${field.id}-hint`}>{hint}</Hint>}
      {error && <FieldError id={`${field.id}-error`}>{error}</FieldError>}
    </div>
  );
}
