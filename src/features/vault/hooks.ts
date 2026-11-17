import {
  QueryClient,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
  type InfiniteData,
} from '@tanstack/react-query';
import { vaultApi } from './api';
import type { Cursor, Filters, Story, StoryPage } from './api/types';
import { deviceId, readStored, store } from './api/storage';
export const vaultQueryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 60000 } },
});
export const storyOptions = (id: string) => ({
  queryKey: ['story', id],
  queryFn: () => vaultApi.getStory(id),
  staleTime: 60000,
});
export const useStory = (id: string) => useQuery(storyOptions(id));
export const useStories = (filters: Filters) =>
  useInfiniteQuery({
    queryKey: ['stories', filters.country, filters.category],
    queryFn: ({ pageParam }) => vaultApi.listStories({ ...filters, cursor: pageParam }),
    initialPageParam: undefined as Cursor | undefined,
    getNextPageParam: (page) => page.cursor,
    placeholderData: keepPreviousData,
  });
export function useHeart(story: Story) {
  const client = useQueryClient();
  const key = ['hearted', story.id];
  const { data: hearted = false } = useQuery({
    queryKey: key,
    queryFn: () => readStored<string[]>('bt.vault.hearted.v1', []).includes(story.id),
    staleTime: Infinity,
  });
  const update = (hearts: number) => {
    client.setQueriesData<InfiniteData<StoryPage>>({ queryKey: ['stories'] }, (old) =>
      old
        ? {
            ...old,
            pages: old.pages.map((p) => ({
              ...p,
              items: p.items.map((s) => (s.id === story.id ? { ...s, heart_count: hearts } : s)),
            })),
          }
        : old,
    );
    client.setQueryData<Story | null>(['story', story.id], (old) =>
      old ? { ...old, heart_count: hearts } : old,
    );
  };
  const mutation = useMutation({
    mutationKey: ['heart', story.id],
    mutationFn: () => vaultApi.react(story.id, deviceId()),
    onMutate: async () => {
      await Promise.all([
        client.cancelQueries({ queryKey: ['stories'] }),
        client.cancelQueries({ queryKey: ['story', story.id] }),
      ]);
      client.setQueryData(key, true);
      update(story.heart_count + 1);
      return story.heart_count;
    },
    onError: (_e, _v, previous) => {
      client.setQueryData(key, false);
      update(previous ?? story.heart_count);
    },
    onSuccess: (result) => {
      update(result.hearts);
      store('bt.vault.hearted.v1', [
        ...new Set([...readStored<string[]>('bt.vault.hearted.v1', []), story.id]),
      ]);
    },
  });
  return {
    ...mutation,
    hearted,
    send: () => {
      if (!hearted && !mutation.isPending) mutation.mutate();
    },
  };
}
export function useSubmitStory() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: vaultApi.submitStory,
    onSuccess: () => void client.invalidateQueries({ queryKey: ['pending'] }),
  });
}
export const useReport = () => useMutation({ mutationFn: vaultApi.report });
