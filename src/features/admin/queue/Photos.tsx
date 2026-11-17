import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog } from '@/components/ui/Dialog';
import { useContent } from '@/i18n/content';
import { adminClient } from '../client';
export function Photos({ storyId }: { storyId: string }) {
  const c = useContent('admin');
  const [zoom, setZoom] = useState<string>();
  const photos = useQuery({
    queryKey: ['admin', 'photos', storyId],
    staleTime: 240_000,
    refetchInterval: 240_000,
    queryFn: async ({ signal }) => {
      const r = await adminClient()
        .from('story_photos')
        .select('id,bucket,path_full,width,height,alt')
        .eq('story_id', storyId)
        .order('position')
        .abortSignal(signal);
      if (r.error) throw r.error;
      return Promise.all(
        r.data.map(async (photo) => {
          const signed = await adminClient().storage.from(photo.bucket).createSignedUrl(photo.path_full, 300);
          if (signed.error) throw signed.error;
          return { ...photo, src: signed.data.signedUrl };
        }),
      );
    },
  });
  const selected = photos.data?.find((p) => p.id === zoom);
  return (
    <>
      <div className="admin-photos">
        {photos.isError && <p role="alert">{c.queue.error}</p>}
        {photos.data?.map((photo) => (
          <button key={photo.id} onClick={() => setZoom(photo.id)} aria-label={c.ui.zoom}>
            <img
              src={photo.src}
              alt={photo.alt ?? ''}
              width={photo.width}
              height={photo.height}
              loading="lazy"
            />
          </button>
        ))}
      </div>
      <Dialog open={!!selected} onOpenChange={() => setZoom(undefined)} title={c.ui.zoom}>
        {selected && (
          <img src={selected.src} alt={selected.alt ?? ''} width={selected.width} height={selected.height} />
        )}
      </Dialog>
    </>
  );
}
