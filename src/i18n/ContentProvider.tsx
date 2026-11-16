import type { ReactNode } from 'react';
import { ContentContext, type ContentContextValue } from './content';

/** Shared context; explicit content overrides support isolated specimens and component tests. */
export function ContentProvider({
  locale,
  content,
  children,
}: ContentContextValue & { children: ReactNode }) {
  return <ContentContext value={{ locale, content }}>{children}</ContentContext>;
}
