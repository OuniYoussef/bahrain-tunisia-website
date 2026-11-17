import { lazy, Suspense } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { useSearchParams } from 'react-router';
import { useContent } from '@/i18n/content';
import { vaultQueryClient } from './hooks';
import { StoryWall } from './StoryWall';
import type { Category } from './api/types';
const StoryDialog = lazy(() => import('./StoryDialog').then((m) => ({ default: m.StoryDialog })));
const ShareStoryForm = lazy(() => import('./ShareStoryForm').then((m) => ({ default: m.ShareStoryForm })));
export default function VaultExperience() {
  const [params, setParams] = useSearchParams();
  const { wall } = useContent('vault');
  function close(key: string) {
    const next = new URLSearchParams(params);
    next.delete(key);
    if (key === 'share') next.delete('shareCategory');
    setParams(next, { replace: true, preventScrollReset: true });
  }
  const selected = params.get('shareCategory');
  const category =
    selected && ['story', 'photo', 'diary', 'anecdote'].includes(selected)
      ? (selected as Category)
      : undefined;
  return (
    <QueryClientProvider client={vaultQueryClient}>
      <StoryWall />
      <Suspense fallback={<output>{wall.loading}</output>}>
        {params.get('story') && (
          <StoryDialog key={params.get('story')} id={params.get('story')!} onClose={() => close('story')} />
        )}
        {params.get('share') === '1' && <ShareStoryForm category={category} onClose={() => close('share')} />}
      </Suspense>
    </QueryClientProvider>
  );
}
