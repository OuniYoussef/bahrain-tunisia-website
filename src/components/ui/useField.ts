import { useId } from 'react';
import { cn } from '@/lib/cn';
export function useField(id?: string, describedBy?: string, hint?: string, error?: string) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  return {
    id: fieldId,
    'aria-describedby': cn(describedBy, hint && `${fieldId}-hint`, error && `${fieldId}-error`) || undefined,
    'aria-invalid': error ? true : undefined,
  } as const;
}
