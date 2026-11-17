import { useRef } from 'react';
import { ResponsiveImage } from '@/components/media/ResponsiveImage';
import { EASE, gsap, useGSAP } from '@/lib/gsap';
import type { ImageId } from '@/lib/images';
import { motionQueries } from './model';
import { pauseOutside } from '@/lib/ambient';

export function PhotoSequence({
  ids,
  active,
  className = '',
  priority = false,
  sizes = '(min-width: 900px) 50vw, 100vw',
}: {
  ids: ImageId[];
  active: boolean;
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      if (!active || ids.length < 2) return;
      const mm = gsap.matchMedia();
      mm.add(motionQueries, (ctx) => {
        if (!ctx.conditions?.motion) return;
        const frames = root.current!.children;
        const tl = gsap.timeline({
          paused: true,
          repeat: -1,
          defaults: { duration: 1.2, ease: EASE.ambient },
        });
        for (let i = 0; i < frames.length; i++) {
          tl.to(frames[i]!, { opacity: 0 }, (i + 1) * 4).to(
            frames[(i + 1) % frames.length]!,
            { opacity: 1 },
            '<',
          );
        }
        return pauseOutside(root.current!, tl);
      });
      return () => mm.revert();
    },
    { scope: root, dependencies: [active, ids.join(',')], revertOnUpdate: true },
  );
  return (
    <div ref={root} className={`matrix-sequence ${className}`}>
      {ids.map((id, i) => (
        <div key={id} style={{ opacity: i === 0 ? 1 : 0 }}>
          <ResponsiveImage id={id} sizes={sizes} priority={priority && i === 0} />
        </div>
      ))}
    </div>
  );
}
