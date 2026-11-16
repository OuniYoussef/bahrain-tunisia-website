import { useId, type ReactNode } from 'react';
import { FieldError, Hint } from './Field';
type Option<T> = { value: T; label: string; description?: ReactNode; disabled?: boolean };
export function RadioCards<T extends string>({
  label,
  name,
  value,
  onValueChange,
  options,
  error,
  hint,
}: {
  label: string;
  name?: string;
  value: T;
  onValueChange: (value: T) => void;
  options: readonly Option<T>[];
  error?: string;
  hint?: string;
}) {
  const id = useId();
  return (
    <fieldset
      className="ui-field"
      aria-describedby={[hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined}
      aria-invalid={error ? true : undefined}
    >
      <legend className="mb-2 font-medium">{label}</legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((option) => (
          <label key={option.value} className="ui-choice ui-radio-card has-disabled:opacity-55">
            <input
              type="radio"
              name={name ?? id}
              value={option.value}
              checked={value === option.value}
              disabled={option.disabled}
              onChange={() => onValueChange(option.value)}
            />
            <span>
              {option.label}
              {option.description && (
                <span className="mt-1 block text-small text-muted">{option.description}</span>
              )}
            </span>
          </label>
        ))}
      </div>
      {hint && <Hint id={`${id}-hint`}>{hint}</Hint>}
      {error && <FieldError id={`${id}-error`}>{error}</FieldError>}
    </fieldset>
  );
}
