import { useSyncExternalStore } from 'react';
import { useContent } from '@/i18n/content';
import { motionPaused, subscribeMotion, toggleMotion } from '@/lib/motionPreference';

export function MotionToggle({ className }: { className?: string }) {
  const paused = useSyncExternalStore(subscribeMotion, motionPaused);
  const { a11y } = useContent('common');
  return (
    <button type="button" className={className} onClick={toggleMotion}>
      {paused ? a11y.resumeMotion : a11y.pauseMotion}
    </button>
  );
}
