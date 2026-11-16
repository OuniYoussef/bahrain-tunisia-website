import { useState, type ComponentProps } from 'react';
import { cn } from '@/lib/cn';
import { useLocale } from '@/i18n/content';
import { FieldFrame, type FieldProps } from './Field';
import { useField } from './useField';
export function Textarea({
  label,
  hint,
  error,
  id,
  className,
  maxLength,
  value,
  defaultValue,
  onChange,
  'aria-describedby': describedBy,
  ...props
}: ComponentProps<'textarea'> & FieldProps) {
  const [length, setLength] = useState(String(defaultValue ?? '').length);
  const field = useField(id, describedBy, hint, error);
  const locale = useLocale();
  const format = new Intl.NumberFormat(locale === 'ar' ? 'ar-u-nu-latn' : locale);
  const count = value === undefined ? length : String(value).length;
  return (
    <FieldFrame {...{ id: field.id, label, hint, error }}>
      <textarea
        {...props}
        {...field}
        rows={props.rows ?? 4}
        value={value}
        defaultValue={defaultValue}
        maxLength={maxLength}
        className={cn('ui-control resize-y', className)}
        aria-describedby={cn(field['aria-describedby'], maxLength !== undefined && `${field.id}-counter`)}
        onChange={(event) => {
          setLength(event.currentTarget.value.length);
          onChange?.(event);
        }}
      />
      {maxLength !== undefined && (
        <span id={`${field.id}-counter`} className="text-end text-small text-muted tabular-nums">
          <bdi>
            {format.format(count)} / {format.format(maxLength)}
          </bdi>
        </span>
      )}
    </FieldFrame>
  );
}
