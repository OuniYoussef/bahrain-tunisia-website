import type { ReactNode } from 'react';
import { ContentContext, type ContentContextValue } from './content';

/** Small provider for P1 primitives; routing and persistence are owned by the future app shell. */
export function ContentProvider({
  locale,
  content,
  children,
}: ContentContextValue & { children: ReactNode }) {
  return <ContentContext value={{ locale, content }}>{children}</ContentContext>;
}
