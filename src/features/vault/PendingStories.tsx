import { useQuery } from '@tanstack/react-query';
import { useContent } from '@/i18n/content';
import { env } from '@/lib/env';
import { readStored } from './api/storage';
export function PendingStories() {
  const { pending } = useContent('vault');
  const { data = [] } = useQuery({
    queryKey: ['pending'],
    queryFn: () => readStored<{ id: string; title: string }[]>('bt.vault.pending.v1', []),
    enabled: env.vaultMode === 'mock',
  });
  if (!data.length) return null;
  return (
    <aside className="vault-pending">
      <h3 className="text-h3">{pending.title}</h3>
      <p>{pending.note}</p>
      <ul>
        {data.map((story) => (
          <li key={story.id}>
            <span dir="auto">{story.title}</span> — {pending.status}
          </li>
        ))}
      </ul>
    </aside>
  );
}
