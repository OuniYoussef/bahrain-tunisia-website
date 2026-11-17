import type { Locale } from '@/i18n/config';
export type Country = 'tunisia' | 'bahrain' | 'both' | 'other';
export type Category = 'story' | 'photo' | 'diary' | 'anecdote';
export type Photo = {
  path_full: string;
  path_thumb: string;
  width: number;
  height: number;
  alt: string | null;
};
export type Story = {
  id: string;
  author_name: string;
  country: Country;
  category: Category;
  title: string;
  excerpt: string;
  body?: string;
  place_year: string | null;
  heart_count: number;
  is_sample: boolean;
  sample_image_id: string | null;
  approved_at: string;
  photos: Photo[];
};
export type Cursor = { id: string; approved_at: string };
export type Filters = { country?: Country; category?: Category };
export type StoryPage = { items: Story[]; cursor?: Cursor; total?: number };
export type SiteAlert = {
  id: string;
  level: 'info' | 'warning' | 'critical';
  message: Record<Locale, string>;
  createdAt: string;
  link?: { href: string; label: Record<Locale, string> };
};
export type ReportInput = {
  storyId: string;
  reason: 'not-owner' | 'offensive' | 'private' | 'spam' | 'other';
  details?: string;
  turnstileToken: string;
};
export type SubscribeInput = { email: string; locale: Locale; consent: true; turnstileToken: string };
export interface VaultApi {
  listStories(input: Filters & { cursor?: Cursor; limit?: number }): Promise<StoryPage>;
  getStory(id: string): Promise<Story | null>;
  submitStory(data: FormData): Promise<{ ok: true }>;
  react(storyId: string, deviceId: string): Promise<{ hearts: number; reacted: true }>;
  report(input: ReportInput): Promise<{ ok: true }>;
  subscribe(input: SubscribeInput): Promise<{ status: 'subscribed' | 'already' }>;
  getAlerts(): Promise<SiteAlert[]>;
}
export type AlertsApi = Pick<VaultApi, 'getAlerts'>;
export class VaultError extends Error {
  code: string;
  constructor(code: string) {
    super(code);
    this.code = code;
  }
}
export function errorKey(error: unknown): 'captcha' | 'rateLimited' | 'upload' | 'offline' | 'generic' {
  const code = error instanceof VaultError ? error.code : '';
  return code === 'captcha_failed'
    ? 'captcha'
    : code === 'rate_limited'
      ? 'rateLimited'
      : code === 'payload_too_large'
        ? 'upload'
        : code === 'offline' || !navigator.onLine
          ? 'offline'
          : 'generic';
}
