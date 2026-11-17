import { beforeEach, describe, expect, it } from 'vitest';
import { mockApi } from './mockApi';
import { readStored } from './storage';
import { VaultError, errorKey } from './types';
beforeEach(() => localStorage.clear());
describe('mock contract', () => {
  it('paginates without duplicates and applies both filters', async () => {
    const first = await mockApi.listStories({ limit: 2 });
    const second = await mockApi.listStories({ limit: 2, cursor: first.cursor });
    expect(new Set([...first.items, ...second.items].map((s) => s.id)).size).toBe(4);
    const filtered = await mockApi.listStories({ country: 'bahrain', category: 'photo' });
    expect(filtered.total).toBe(2);
  });
  it('keeps pending submissions out of public lists and details', async () => {
    const data = new FormData();
    for (const [key, value] of Object.entries({
      name: 'Visitor',
      country: 'both',
      category: 'story',
      title: 'Shared afternoon',
      body: 'A long and happy afternoon with new friends.',
      placeYear: '',
      consent: 'true',
      website: '',
      startedAt: String(Date.now() - 5000),
      turnstileToken: 'mock',
    }))
      data.set(key, value);
    await mockApi.submitStory(data);
    const pending = readStored<{ id: string; status: string }[]>('bt.vault.pending.v1', []);
    expect(pending).toHaveLength(1);
    expect(pending[0]?.status).toBe('pending');
    expect((await mockApi.listStories({})).total).toBe(6);
    expect(await mockApi.getStory(pending[0]!.id)).toBeNull();
  });
  it('makes repeat hearts idempotent', async () => {
    const id = '00000000-0000-4000-8000-000000000001';
    const device = crypto.randomUUID();
    expect((await mockApi.react(id, device)).hearts).toBe(1);
    expect((await mockApi.react(id, device)).hearts).toBe(1);
  });
  it('maps known server errors to translated message keys', () => {
    expect(errorKey(new VaultError('captcha_failed'))).toBe('captcha');
    expect(errorKey(new VaultError('rate_limited'))).toBe('rateLimited');
    expect(errorKey(new VaultError('payload_too_large'))).toBe('upload');
  });
});
