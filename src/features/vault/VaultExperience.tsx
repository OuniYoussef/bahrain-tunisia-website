import { lazy, Suspense } from 'react';
import { useSearchParams } from 'react-router';
import { useContent } from '@/i18n/content';
import { StoryWall } from './StoryWall';
const StoryDialog = lazy(() => import('./StoryDialog').then((m) => ({ default: m.StoryDialog })));
export default function VaultExperience() {
  const [params, setParams] = useSearchParams();
  const { wall } = useContent('vault');
  function close() {
    const next = new URLSearchParams(params);
    next.delete('story');
    setParams(next, { replace: true, preventScrollReset: true });
  }
  return (
    <>
      <StoryWall />
      <Suspense fallback={<output>{wall.loading}</output>}>
        {params.get('story') && (
          <StoryDialog key={params.get('story')} id={params.get('story')!} onClose={close} />
        )}
      </Suspense>
    </>
  );
}
