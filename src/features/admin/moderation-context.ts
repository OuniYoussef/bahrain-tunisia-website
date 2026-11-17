import { createContext, use } from 'react';
export type Action = 'approve' | 'reject' | 'hide' | 'restore' | 'delete' | 'resolve-report';
export type Request = { action: Action; storyId?: string; reportId?: string };
export const ModerationContext = createContext<{ request: (r: Request) => void; busy: boolean } | null>(null);
export function useModeration() {
  const value = use(ModerationContext);
  if (!value) throw new Error('Missing moderation provider');
  return value;
}
