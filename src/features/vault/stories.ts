import data from '@/content/vault/stories.json';
export type Country = 'tunisia' | 'bahrain' | 'both' | 'other';
export type Category = 'story' | 'photo' | 'diary' | 'anecdote';
export type Story = {
  id: string;
  author_name: string;
  country: Country;
  category: Category;
  title: string;
  body: string;
  excerpt: string;
  place_year: string | null;
  approved_at: string;
  is_sample: boolean;
  image_ids: string[];
};
export type Filters = { country?: Country; category?: Category };
const stories: Story[] = data.map((story) => ({
  ...story,
  country: story.country as Country,
  category: story.category as Category,
  excerpt: story.body.slice(0, 220),
}));
const PAGE_SIZE = 12;
export function listStories(filters: Filters = {}, page = 0) {
  const filtered = stories.filter(
    (story) =>
      (!filters.country || story.country === filters.country) &&
      (!filters.category || story.category === filters.category),
  );
  const start = Math.max(0, Math.floor(page)) * PAGE_SIZE;
  return {
    items: filtered.slice(start, start + PAGE_SIZE),
    total: filtered.length,
    hasMore: start + PAGE_SIZE < filtered.length,
  };
}
export function getStory(id: string) {
  return stories.find((story) => story.id === id) ?? null;
}
