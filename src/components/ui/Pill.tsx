import { useId, type ComponentProps } from 'react';
import { cn } from '@/lib/cn';
export function Pill({ className, type = 'button', ...props }: ComponentProps<'button'>) {
  return <button {...props} type={type} className={cn('ui-pill', className)} />;
}
type Option<T extends string> = { value: T; label: string; disabled?: boolean };
export function SegmentedControl<T extends string>({
  label,
  value,
  onValueChange,
  options,
  name,
  className,
}: {
  label: string;
  value: T;
  onValueChange: (value: T) => void;
  options: readonly Option<T>[];
  name?: string;
  className?: string;
}) {
  const id = useId();
  return (
    <fieldset className={cn('flex flex-wrap gap-2', className)}>
      <legend className="sr-only">{label}</legend>
      {options.map((option) => (
        <label
          key={option.value}
          className="ui-pill ui-segment relative cursor-pointer has-focus-visible:outline-2 has-focus-visible:outline-offset-3 has-focus-visible:outline-(--focus) has-disabled:opacity-55"
        >
          <input
            className="sr-only"
            type="radio"
            name={name ?? id}
            value={option.value}
            checked={value === option.value}
            disabled={option.disabled}
            onChange={() => onValueChange(option.value)}
          />
          {option.label}
        </label>
      ))}
    </fieldset>
  );
}
