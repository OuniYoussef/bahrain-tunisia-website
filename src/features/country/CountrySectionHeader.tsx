import { lazy, Suspense, type ComponentProps } from 'react';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useNearViewport } from '@/components/media/useNearViewport';
const HeaderMotion = lazy(() => import('./HeaderMotion'));
export function CountrySectionHeader(props: ComponentProps<typeof SectionHeader>) {
  const { root, near } = useNearViewport<HTMLDivElement>();
  return (
    <div ref={root}>
      <span className="section-header-rule" aria-hidden="true" />
      <SectionHeader {...props} />
      <Suspense>{near && <HeaderMotion root={root} hasIntro={Boolean(props.intro)} />}</Suspense>
    </div>
  );
}
