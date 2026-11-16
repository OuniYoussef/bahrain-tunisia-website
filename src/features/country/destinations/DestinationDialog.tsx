import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { UnescoBadge } from '@/components/ui/Badge';
import { ResponsiveImage } from '@/components/media/ResponsiveImage';
import { MapPin } from 'lucide-react';
import { useContent } from '@/i18n/content';
import type { Destination } from '../types';
export function DestinationDialog({
  item,
  onClose,
  onMap,
}: {
  item: Destination;
  onClose: () => void;
  onMap: (item: Destination) => void;
}) {
  const { ui } = useContent('common');
  return (
    <Dialog
      open
      title={item.title}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      className="destination-dialog"
    >
      <ResponsiveImage
        id={item.media.image}
        sizes="(min-width: 768px) 640px, 90vw"
        className="aspect-[3/2]"
      />
      {item.media.unesco && <UnescoBadge className="mt-6" />}
      <p className="mt-6">{item.text}</p>
      {item.tip && (
        <aside className="destination-tip">
          <strong>{ui.tip}</strong>
          <p>{item.tip}</p>
        </aside>
      )}
      {item.media.place && (
        <Button className="mt-6" onClick={() => onMap(item)} icon={<MapPin size={18} />}>
          {ui.viewOnMap}
        </Button>
      )}
    </Dialog>
  );
}
