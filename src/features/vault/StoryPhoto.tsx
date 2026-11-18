import { ResponsiveImage } from '@/components/media/ResponsiveImage';
import type { ImageId } from '@/lib/images';
import type { Story } from './stories';
export function StoryPhoto({
  story,
  index = 0,
  full = false,
}: {
  story: Story;
  index?: number;
  full?: boolean;
}) {
  const id = story.image_ids[index];
  if (!id) return null;
  return (
    <ResponsiveImage
      id={id as ImageId}
      sizes={
        full ? '(min-width: 800px) 740px, 90vw' : '(min-width: 1280px) 25vw, (min-width: 768px) 45vw, 90vw'
      }
      className="vault-photo"
    />
  );
}
