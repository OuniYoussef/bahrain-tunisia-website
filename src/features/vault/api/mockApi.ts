import { sampleStories } from './samples';
import { VaultError, type VaultApi, type Story, type Country, type Category } from './types';
import { readStored, store } from './storage';

const delay = () => new Promise((resolve) => setTimeout(resolve, 240));
const samples = (): Story[] =>
  sampleStories
    .map((s) => ({
      ...s,
      country: s.country as Country,
      category: s.category as Category,
      heart_count: readStored<Record<string, number>>('bt.vault.counts.v1', {})[s.id] ?? 0,
    }))
    .reverse();
function limit(action: string, max: number, window = 3600000) {
  const key = 'bt.vault.rate.' + action;
  const times = readStored<number[]>(key, []).filter((t) => t > Date.now() - window);
  if (times.length >= max) throw new VaultError('rate_limited');
  store(key, [...times, Date.now()]);
}
export const mockApi: VaultApi = {
  async listStories({ country, category, cursor, limit: count = 12 }) {
    await delay();
    const all = samples().filter(
      (s) => (!country || s.country === country) && (!category || s.category === category),
    );
    const remaining = cursor
      ? all.filter(
          (s) =>
            s.approved_at < cursor.approved_at || (s.approved_at === cursor.approved_at && s.id < cursor.id),
        )
      : all;
    const pageSize = Math.min(24, Math.max(1, count));
    const items = remaining.slice(0, pageSize);
    return { items, total: all.length, cursor: remaining.length > pageSize ? items.at(-1) : undefined };
  },
  async getStory(id) {
    await delay();
    return samples().find((s) => s.id === id) ?? null;
  },
  async submitStory(data) {
    await delay();
    const start = Number(data.get('startedAt'));
    if (data.get('website') || !Number.isFinite(start) || start <= 0 || Date.now() - start < 4000)
      return { ok: true };
    const values = Object.fromEntries(data);
    const photoCount = [...data.keys()].filter((k) => /^photo_\d_full$/.test(k)).length;
    const { storySchema } = await import('../schemas');
    if (!storySchema.safeParse({ ...values, consent: data.get('consent') === 'true', photoCount }).success)
      throw new VaultError('invalid_input');
    if (!data.get('turnstileToken')) throw new VaultError('captcha_failed');
    for (const [key, file] of data) {
      if (
        file instanceof File &&
        (!file.type.includes('webp') || file.size > (key.endsWith('thumb') ? 150 : 900) * 1024)
      )
        throw new VaultError('payload_too_large');
    }
    limit('submit', 3);
    limit('submit-day', 10, 86400000);
    const pending = readStored<unknown[]>('bt.vault.pending.v1', []);
    store('bt.vault.pending.v1', [
      ...pending,
      {
        id: crypto.randomUUID(),
        status: 'pending',
        ...Object.fromEntries([...data].filter(([k, v]) => typeof v === 'string' && k !== 'turnstileToken')),
      },
    ]);
    return { ok: true };
  },
  async react(id, device) {
    await delay();
    if (!samples().some((s) => s.id === id)) throw new VaultError('not_found');
    limit('react', 60);
    const key = 'bt.vault.reactions.' + device;
    const reacted = readStored<string[]>(key, []);
    const counts = readStored<Record<string, number>>('bt.vault.counts.v1', {});
    if (!reacted.includes(id)) {
      counts[id] = (counts[id] ?? 0) + 1;
      store(key, [...reacted, id]);
      store('bt.vault.counts.v1', counts);
    }
    return { hearts: counts[id] ?? 0, reacted: true };
  },
  async report(input) {
    await delay();
    const { reportSchema } = await import('../schemas');
    if (!reportSchema.safeParse(input).success) throw new VaultError('invalid_input');
    if (!samples().some((s) => s.id === input.storyId)) throw new VaultError('not_found');
    limit('report', 10);
    store('bt.vault.reports.v1', { ...readStored('bt.vault.reports.v1', {}), [input.storyId]: input.reason });
    return { ok: true };
  },
  async subscribe(input) {
    await delay();
    const { subscribeSchema } = await import('../schemas');
    if (!subscribeSchema.safeParse(input).success) throw new VaultError('invalid_input');
    limit('subscribe', 5);
    const emails = readStored<string[]>('bt.vault.subscriptions.v1', []);
    const email = input.email.toLowerCase();
    const status = emails.includes(email) ? 'already' : 'subscribed';
    store('bt.vault.subscriptions.v1', [...new Set([...emails, email])]);
    return { status };
  },
  async getAlerts() {
    return [];
  },
};
export const mockAlertsApi = mockApi;
