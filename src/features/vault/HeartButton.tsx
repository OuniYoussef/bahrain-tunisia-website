import { useRef } from 'react';
import { Heart } from 'lucide-react';
import { useContent, useLocale } from '@/i18n/content';
import { plural } from '@/i18n/format';
import { gsap, useGSAP } from '@/lib/gsap';
import { useHeart } from './hooks';
import type { Story } from './api/types';
export function HeartButton({ story }: { story: Story }) {
  const { wall, form } = useContent('vault');
  const locale = useLocale();
  const heart = useHeart(story);
  const root = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        { motion: '(prefers-reduced-motion: no-preference)', reduce: '(prefers-reduced-motion: reduce)' },
        (ctx) => {
          if (!ctx.conditions?.motion || !heart.isPending) return;
          gsap.fromTo('button', { scale: 0.86 }, { scale: 1, duration: 0.35 });
          gsap.fromTo(
            '.heart-pearl',
            { opacity: 1, x: 0, y: 0 },
            {
              opacity: 0,
              x: (i) => Math.cos((i * Math.PI) / 3) * 28,
              y: (i) => Math.sin((i * Math.PI) / 3) * 28,
              duration: 0.6,
            },
          );
        },
      );
      return () => mm.revert();
    },
    { scope: root, dependencies: [heart.isPending], revertOnUpdate: true },
  );
  return (
    <div ref={root} className="vault-heart">
      <button
        type="button"
        onClick={heart.send}
        disabled={heart.hearted || heart.isPending}
        aria-pressed={heart.hearted}
        aria-label={
          (heart.hearted ? wall.reacted : wall.react) + ': ' + plural(wall.hearts, story.heart_count, locale)
        }
      >
        <Heart size={18} fill={heart.hearted ? 'currentColor' : 'none'} />
        <span>{plural(wall.hearts, story.heart_count, locale)}</span>
      </button>
      {Array.from({ length: 6 }, (_, i) => (
        <i className="heart-pearl" key={i} aria-hidden="true" />
      ))}
      {heart.isError && <output>{form.errors.generic}</output>}
    </div>
  );
}
