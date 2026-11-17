import { ResponsiveImage } from '@/components/media/ResponsiveImage';
import { env } from '@/lib/env';
import type { ImageId } from '@/lib/images';
import type { Story } from './api/types';
export function StoryPhoto({
  story,
  index = 0,
  full = false,
}: {
  story: Story;
  index?: number;
  full?: boolean;
}) {
  if (story.sample_image_id)
    return (
      <ResponsiveImage
        id={story.sample_image_id as ImageId}
        sizes={
          full ? '(min-width: 800px) 740px, 90vw' : '(min-width: 1280px) 25vw, (min-width: 768px) 45vw, 90vw'
        }
        alt=""
        className="vault-photo"
      />
    );
  const photo = story.photos[index];
  if (!photo) return null;
  const path = full ? photo.path_full : photo.path_thumb;
  const src =
    env.VITE_SUPABASE_URL +
    '/storage/v1/object/public/vault-public/' +
    path.split('/').map(encodeURIComponent).join('/');
  return (
    <img
      className="vault-photo"
      src={src}
      alt={photo.alt ?? ''}
      width={photo.width}
      height={photo.height}
      loading="lazy"
    />
  );
}
