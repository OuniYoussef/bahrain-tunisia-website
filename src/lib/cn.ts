/** Join optional class names. Callers own utility precedence; no hidden class merging. */
export function cn(...values: (string | false | null | undefined)[]) {
  return values.filter(Boolean).join(' ');
}
