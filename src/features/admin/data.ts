import { useQuery } from '@tanstack/react-query';
import type { Database } from '@/lib/database.types';
import { adminClient } from './client';
export type Row<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Story = Omit<Row<'stories'>, 'ip_hash'>;
export const storyColumns =
  'id,status,author_name,body,category,country,created_at,excerpt,heart_count,is_sample,locale,moderated_by,moderation_note,photo_count,place_year,sample_image_id,title,updated_at,approved_at';
export function useStories(status: Story['status'], page: number, search: string) {
  return useQuery({
    queryKey: ['admin', 'stories', status, page, search],
    queryFn: async ({ signal }) => {
      let q = adminClient().from('stories').select(storyColumns, { count: 'exact' }).eq('status', status);
      const safe = search
        .replace(/[%_(),.\\"']/g, ' ')
        .trim()
        .slice(0, 80);
      if (safe) q = q.or(`title.ilike.%${safe}%,author_name.ilike.%${safe}%`);
      const r = await q
        .order('created_at', { ascending: status === 'pending' })
        .order('id')
        .range(page * 20, page * 20 + 19)
        .abortSignal(signal);
      if (r.error) throw r.error;
      return { rows: r.data, count: r.count ?? 0 };
    },
  });
}
