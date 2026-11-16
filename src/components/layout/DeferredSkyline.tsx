import { lazy, Suspense } from 'react';
import { useNearViewport } from '@/components/media/useNearViewport';
const Skyline = lazy(() => import('./Skyline').then((module) => ({ default: module.Skyline })));
export function DeferredSkyline() {
  const { root, near } = useNearViewport<HTMLDivElement>(true);
  return (
    <div ref={root}>
      <Suspense fallback={null}>{near ? <Skyline /> : null}</Suspense>
    </div>
  );
}
