import { beforeEach, expect, it, vi } from 'vitest';
const { createClient, settings } = vi.hoisted(() => ({
  createClient: vi.fn(() => ({ configured: true })),
  settings: {
    vaultMode: 'mock',
    VITE_SUPABASE_URL: undefined as string | undefined,
    VITE_SUPABASE_PUBLISHABLE_KEY: undefined as string | undefined,
  },
}));
vi.mock('@supabase/supabase-js', () => ({ createClient }));
vi.mock('./env', () => ({ env: settings }));
beforeEach(() => {
  vi.resetModules();
  createClient.mockClear();
  settings.vaultMode = 'mock';
  settings.VITE_SUPABASE_URL = undefined;
  settings.VITE_SUPABASE_PUBLISHABLE_KEY = undefined;
});
it('does not initialize a client without backend configuration', async () => {
  expect((await import('./supabase')).supabase).toBeNull();
  expect(createClient).not.toHaveBeenCalled();
});
it('keeps explicit mock mode offline even when keys exist', async () => {
  settings.VITE_SUPABASE_URL = 'https://example.supabase.co';
  settings.VITE_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_test';
  expect((await import('./supabase')).supabase).toBeNull();
  expect(createClient).not.toHaveBeenCalled();
});
it('initializes the configured client with the publishable key', async () => {
  settings.vaultMode = 'supabase';
  settings.VITE_SUPABASE_URL = 'https://example.supabase.co';
  settings.VITE_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_test';
  expect((await import('./supabase')).supabase).not.toBeNull();
  expect(createClient).toHaveBeenCalledExactlyOnceWith(settings.VITE_SUPABASE_URL, 'sb_publishable_test', {
    auth: { persistSession: false, detectSessionInUrl: false },
  });
});
